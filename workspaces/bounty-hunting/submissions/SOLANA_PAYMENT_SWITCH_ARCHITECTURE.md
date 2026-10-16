# Solana Payment Switch & Point of Sale Integration Architecture
## Production Blueprint & Technical Specification (Superteam Earn Bounty Submission)
**Author:** Ariya Sarrafzadeh (HaroSS) | Solutions Architect & Principal Technical Product Manager  
**Target Bounty:** Solana Payment Switch & Point of Sale Integration Architecture ($2,500 USDC)  
**Platform:** Superteam Earn (earn.superteam.fun)  
**Payout Asset:** USDC (Solana SPL Token)  

***

## 1. System Overview & Architecture Topology

This architecture delivers a sub-second, enterprise-grade payment switch connecting physical Point-of-Sale (POS) terminals and e-commerce checkouts directly to the Solana blockchain. It achieves off-chain double-entry ledger safety with on-chain settlement finality.

```
+-----------------------------------------------------------------------------------+
|                              Client Ingress Layer                                 |
|  +------------------------+                     +-------------------------------+  |
|  | Physical POS Terminal  |                     |  E-Commerce Web Checkout      |  |
|  +------------------------+                     +-------------------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                        HTTPS (Mutual TLS / HMAC Signature)
                                          v
+-----------------------------------------------------------------------------------+
|                          Solana Payment Gateway Core                              |
|                                                                                   |
|  +-----------------------+   Reference Key Map   +-----------------------------+  |
|  |   POS QR Generator    | --------------------> | Redis Idempotency Engine    |  |
|  | (Solana Pay Spec v1)  |                       | (TTL 180s, In-Flight Guard) |  |
|  +-----------------------+                       +-----------------------------+  |
|              |                                                  |                 |
|              v                                                  v                 |
|  +-----------------------------------------------------------------------------+  |
|  |                   Kafka Event Bus (Partitioned by Merchant ID)              |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
                                          |
                +-------------------------+-------------------------+
                |                                                   |
                v                                                   v
+-------------------------------+                   +-------------------------------+
|  RPC Confirmation Sentinel    |                   | Double-Entry Ledger Service   |
|                               |                   |                               |
| - Primary: Helius Webhook     |                   | - Off-Chain PostgreSQL 16     |
| - Secondary: Triton Geyser WS |                   | - Debit/Credit Balanced Pairs |
| - Fallback: Polling RPC Array |                   | - Sub-200ms State Transition  |
+-------------------------------+                   +-------------------------------+
                |                                                   |
                +-------------------------+-------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                        Settlement & Reconciliation Engine                         |
|                                                                                   |
| - Real-time slot confirmation matching reference public keys                      |
| - Merchant Omnibus SPL USDC account allocation                                    |
| - Continuous discrepancy scanner (Zero-drift ledger reconciliation)               |
+-----------------------------------------------------------------------------------+
```

***

## 2. Ingress & Solana Pay Specification Implementation

### 2.1 Dynamic Solana Pay QR Generation
When a merchant initiates a checkout at a terminal, the gateway constructs an industry-standard Solana Pay URL:

```text
solana:https://pay.gateway.internal/api/v1/pay/req?reference=8Fv4n...&amount=49.99&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

1. **Reference Public Key:** The gateway generates a fresh, disposable Ed25519 keypair for every order. The public key is embedded in the transaction as a non-signing account. This allows the backend to locate the exact transaction on-chain via `getSignaturesForAddress` without polling or indexing the entire blockchain.
2. **Idempotency Key:** The POS terminal attaches an `X-Idempotency-Key` (UUIDv4) to prevent double charge submissions on network retries.

### 2.2 Redis In-Flight Guard
1. The ingress gateway checks Redis for the `idempotency_key`.
2. If found with status `CONFIRMED`, the cached confirmation payload returns immediately.
3. If found with status `PENDING`, the request returns HTTP 409 (Request In Progress).
4. If not found, a key is written with `SETNX` and a 180-second TTL.

***

## 3. Dual-Layer Confirmation Sentinel

Relying on a single public RPC node causes dropped transactions and false timeouts during network congestion. The system uses a multi-tiered ingestion sentinel:

1. **Tier 1 (Push):** Dedicated Geyser WebSocket streaming from a co-located validator RPC node.
2. **Tier 2 (Webhook):** Helius / Triton enhanced webhook streaming transaction events matching gateway reference keys.
3. **Tier 3 (Pull Fallback):** Exponential backoff polling across 3 distinct RPC providers (Triton, Helius, QuickNode) triggered if no push event arrives within 15 seconds.

### 3.1 Commitment Gating
* **Processed Commitment:** Terminal shows "Processing Payment..." to the customer (latency < 400ms).
* **Confirmed Commitment:** Terminal marks the transaction as successful and prints the customer receipt.
* **Finalized Commitment (32+ confirmations):** Funds are committed to merchant settled balances.

***

## 4. Double-Entry Accounting State Machine

Off-chain accounting enforces complete ledger balance at every step. Money is never created or destroyed.

### 4.1 Ledger Invariant
$$\sum \text{Debits} - \sum \text{Credits} = 0$$

### 4.2 Account Hierarchy
* `1001: Solana Settlement Omnibus (Asset)`
* `1002: Network Fee Expense (Expense)`
* `2001: Merchant Available Balance (Liability)`
* `2002: Merchant Pending Clearing (Liability)`
* `4001: Gateway Processing Revenue (Revenue)`

### 4.3 Transaction State Flow
1. **PENDING:** Order initiated. No ledger movements.
2. **CONFIRMED:** Event received on confirmed commitment.
   * Debit: `1001 (Solana Settlement Omnibus)` -> Amount: `$49.99`
   * Credit: `2002 (Merchant Pending Clearing)` -> Amount: `$49.49`
   * Credit: `4001 (Gateway Processing Fee)` -> Amount: `$0.50`
3. **FINALIZED:** Transaction reaches slot finality.
   * Debit: `2002 (Merchant Pending Clearing)` -> Amount: `$49.49`
   * Credit: `2001 (Merchant Available Balance)` -> Amount: `$49.49`
4. **FAILED / REORG:**
   * If a confirmed slot is dropped (reorg), a compensating reversal entry fires immediately, locking the terminal and notifying the merchant console.

***

## 5. Automated Reconciliation Engine

The reconciliation worker runs every 60 seconds and verifies three distinct sources of truth:
1. **POS Terminal Journal:** Local receipt logs generated by the hardware terminal.
2. **Internal Postgres Ledger:** System of record for merchant balances.
3. **Solana Blockchain State:** Cryptographic proof of SPL USDC transfers confirmed on-chain.

Discrepancies exceeding 0.000001 USDC trigger an automated circuit breaker on the affected merchant account, halting automated withdrawals until operator review.

***

## 6. Failure Recovery & Edge Case Protections

| Failure Mode | Impact | Mitigation Architecture |
| :--- | :--- | :--- |
| **RPC Node Outage** | Missed transaction confirmations | Tri-redundant RPC failover with automated circuit breaker |
| **Customer Overpayment / Underpayment** | SPL transfer amount mismatch | State machine flags order as `PARTIAL_SETTLEMENT`; terminal prompts for delta |
| **Customer Sends Wrong SPL Token** | Wallet sends unapproved mint | Reference key monitoring rejects non-USDC token accounts; returns fund recovery instruction |
| **POS Network Dropout** | Terminal loses internet during scan | Cloud gateway retains reference key; prints receipt upon terminal reconnection |

***

## 7. Ready-to-Submit Pitch for Superteam Earn

**Submission Summary (Copy-Paste Block for Superteam Form):**

```text
Title: Solana Payment Switch & Point of Sale Integration Architecture
Author: Ariya Sarrafzadeh (HaroSS)

Overview:
We present a complete, production-ready system architecture for an enterprise-grade Solana Payment Switch and Point-of-Sale (POS) integration engine. The architecture solves the friction points of crypto point-of-sale adoption: sub-second customer feedback, RPC failover reliability, double-entry financial accounting, and zero-drift ledger reconciliation.

Core Innovations:
1. Dynamic Reference Key Routing: Implements Solana Pay v1 specification using disposable Ed25519 reference keypairs for deterministic zero-polling transaction discovery.
2. Tri-Tier Confirmation Sentinel: Couples low-latency Geyser WebSockets with webhook feeds and a multi-provider fallback array, guaranteeing zero dropped checkout events.
3. Strict Double-Entry State Machine: Ensures that every on-chain SPL USDC transfer is matched to balanced off-chain debit/credit records, protecting merchants from reorgs and payment drift.
4. Production SLA: Designed for sustained 5,000 TPS ingestion with sub-400ms visual payment feedback at physical terminals.

Repository Documentation: workspaces/bounty-hunting/submissions/SOLANA_PAYMENT_SWITCH_ARCHITECTURE.md
```
