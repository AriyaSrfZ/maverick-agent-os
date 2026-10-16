# Bounty Hunting & Technical Contract Memory Ledger
**Workspace:** `workspaces/bounty-hunting/`  
**Operator:** Ariya Sarrafzadeh (HaroSS)  
**Established:** 2026-10-16  

***

## Architectural Decisions & Constraints
* **Settlement Rail:** 100% Zero-KYC stablecoin payouts. Solana USDC for Superteam Earn; Arbitrum/Base/OP USDC for Bountycaster; USDT for direct contracts.
* **Wallet Destination:** Non-custodial self-custody wallets only. Funds transfer directly into Phantom/Solflare or MetaMask, with Nobitex functioning exclusively as a fiat off-ramp.
* **50% Deposit Rule:** Every pseudonymous contract originating from Reddit (r/forhire, r/CryptoCurrencyJobs) requires 50% upfront USDT deposit prior to drafting PRDs or architecture blueprints.
* **Bounty Selection Rule:** Focus strictly on high-impact technical architecture, competitive teardowns, and system state machine specifications commanding > $500 USDC per submission.
* **Active Submissions:**
  - `workspaces/bounty-hunting/submissions/SOLANA_PAYMENT_SWITCH_ARCHITECTURE.md`: Targeted at Superteam Earn Solana Payment Switch & Point of Sale Integration Architecture ($2,500 USDC). Status: Drafted, verified, copy-ready.
