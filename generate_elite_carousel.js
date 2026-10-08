const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

  @page {
    size: 1080px 1350px;
    margin: 0;
  }
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    background: #080C15;
    color: #F1F5F9;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .slide {
    width: 1080px;
    height: 1350px;
    padding: 90px 80px;
    position: relative;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.12) 0%, rgba(8, 12, 21, 1) 70%);
    overflow: hidden;
  }
  /* Decorative background grid */
  .slide::before {
    content: "";
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    z-index: 0;
  }
  .header, .content, .footer {
    position: relative;
    z-index: 1;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 24px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .brand-badge {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: linear-gradient(135deg, #0284C7, #06B6D4);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 20px;
    color: #FFFFFF;
  }
  .brand-name {
    font-size: 22px;
    font-weight: 700;
    color: #F8FAFC;
    letter-spacing: -0.3px;
  }
  .brand-title {
    font-size: 15px;
    color: #94A3B8;
  }
  .slide-counter {
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px;
    color: #38BDF8;
    background: rgba(56, 189, 248, 0.1);
    border: 1px solid rgba(56, 189, 248, 0.25);
    padding: 6px 16px;
    border-radius: 20px;
    font-weight: 700;
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 30px 0;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #38BDF8;
    margin-bottom: 20px;
  }
  .tag.danger {
    color: #F43F5E;
  }
  .tag.success {
    color: #10B981;
  }
  h1 {
    font-size: 58px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -1.5px;
    color: #FFFFFF;
    margin-bottom: 24px;
  }
  h1 span.highlight {
    background: linear-gradient(135deg, #38BDF8, #818CF8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  h1 span.danger-text {
    background: linear-gradient(135deg, #FB7185, #F43F5E);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  p.lead {
    font-size: 26px;
    line-height: 1.45;
    color: #94A3B8;
    margin-bottom: 32px;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 24px;
  }
  .handle {
    font-size: 18px;
    color: #64748B;
    font-family: 'JetBrains Mono', monospace;
  }
  .action-hint {
    font-size: 18px;
    color: #38BDF8;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* DIAGRAM & CARD COMPONENTS */
  .diagram-box {
    background: #0F172A;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 32px;
    margin: 20px 0;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  }
  .flow-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }
  .node {
    background: #1E293B;
    border: 1px solid #334155;
    border-radius: 14px;
    padding: 20px 24px;
    flex: 1;
    text-align: center;
  }
  .node.danger {
    background: rgba(244, 63, 94, 0.1);
    border-color: #F43F5E;
  }
  .node.success {
    background: rgba(16, 185, 129, 0.1);
    border-color: #10B981;
  }
  .node.active {
    background: rgba(56, 189, 248, 0.1);
    border-color: #38BDF8;
  }
  .node-title {
    font-size: 20px;
    font-weight: 700;
    color: #F8FAFC;
    margin-bottom: 6px;
  }
  .node-desc {
    font-size: 14px;
    color: #94A3B8;
    font-family: 'JetBrains Mono', monospace;
  }
  .arrow {
    color: #64748B;
    font-size: 28px;
    font-weight: bold;
  }
  .arrow.danger {
    color: #F43F5E;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-top: 24px;
  }
  .stat-card {
    background: #1E293B;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 28px;
  }
  .stat-num {
    font-size: 44px;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    color: #38BDF8;
    margin-bottom: 6px;
  }
  .stat-num.danger {
    color: #F43F5E;
  }
  .stat-num.success {
    color: #10B981;
  }
  .stat-label {
    font-size: 18px;
    font-weight: 600;
    color: #E2E8F0;
  }
  .stat-sub {
    font-size: 14px;
    color: #64748B;
    margin-top: 4px;
  }

  .code-terminal {
    background: #020617;
    border: 1px solid #1E293B;
    border-radius: 14px;
    padding: 24px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    line-height: 1.6;
    color: #CBD5E1;
  }
  .code-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #1E293B;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .dot.red { background: #EF4444; }
  .dot.yellow { background: #F59E0B; }
  .dot.green { background: #10B981; }

  .check-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 20px;
  }
  .check-item {
    display: flex;
    align-items: flex-start;
    gap: 18px;
    background: #0F172A;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 20px 24px;
  }
  .check-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: rgba(16, 185, 129, 0.2);
    color: #10B981;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
    flex-shrink: 0;
  }
  .check-text h4 {
    font-size: 20px;
    font-weight: 700;
    color: #F8FAFC;
    margin-bottom: 4px;
  }
  .check-text p {
    font-size: 16px;
    color: #94A3B8;
    line-height: 1.4;
  }
</style>
</head>
<body>

<!-- SLIDE 1: COVER -->
<div class="slide" style="background: radial-gradient(circle at 70% 30%, rgba(2, 132, 199, 0.25) 0%, rgba(8, 12, 21, 1) 75%);">
  <div class="header">
    <div class="brand">
      <div class="brand-badge">AS</div>
      <div>
        <div class="brand-name">Ariya Sarrafzadeh</div>
        <div class="brand-title">High-Scale Payments Architecture</div>
      </div>
    </div>
    <div class="slide-counter">DECK // 01</div>
  </div>

  <div class="content">
    <div class="tag danger">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.5L20.3 19H3.7L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/></svg>
      SYSTEM RECONCILIATION AT 45M SCALE
    </div>
    <h1 style="font-size: 68px; line-height: 1.1; margin-bottom: 28px;">
      The Midnight<br>
      <span class="danger-text">Ledger Leak</span>
    </h1>
    <p class="lead" style="font-size: 28px; color: #E2E8F0; max-width: 850px;">
      At 23:59:58, a 0.03% discrepancy is not an accounting glitch.<br>
      <strong style="color: #38BDF8;">It is a distributed consensus collapse.</strong>
    </p>

    <!-- Visual Schematic Cover Asset -->
    <div class="diagram-box" style="margin-top: 36px; border-color: rgba(56, 189, 248, 0.3); background: rgba(15, 23, 42, 0.85);">
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 15px; color: #94A3B8; margin-bottom: 16px; display: flex; justify-content: space-between;">
        <span>TRANSACTION ARBITRATION TIMELINE</span>
        <span style="color: #F43F5E;">ERROR: ISO_8583_DROPPED</span>
      </div>
      <div class="flow-row" style="margin-bottom: 0;">
        <div class="node active">
          <div class="node-title">Wallet Client</div>
          <div class="node-desc">State: DEBIT_SENT</div>
        </div>
        <div class="arrow danger">→</div>
        <div class="node danger">
          <div class="node-title">Bank Switch</div>
          <div class="node-desc">Drop Timeout (3000ms)</div>
        </div>
        <div class="arrow danger">⚡</div>
        <div class="node" style="border-color: #64748B;">
          <div class="node-title">Core Ledger</div>
          <div class="node-desc">Unreconciled State</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="handle">github.com/ariya • linkedin/in/ariya-sarrafzadeh</div>
    <div class="action-hint">Swipe to inspect architecture →</div>
  </div>
</div>

<!-- SLIDE 2: THE STAKE -->
<div class="slide">
  <div class="header">
    <div class="brand">
      <div class="brand-badge">AS</div>
      <div>
        <div class="brand-name">Ariya Sarrafzadeh</div>
        <div class="brand-title">High-Scale Payments Architecture</div>
      </div>
    </div>
    <div class="slide-counter">02 / 08</div>
  </div>

  <div class="content">
    <div class="tag danger">THE REALITY AT SCALE</div>
    <h1>The Scale Illusion:<br><span class="highlight">0.03% Destroys Capital</span></h1>
    <p class="lead">
      In small web apps, 99.97% success is celebrated as "four nines".<br>
      In high-volume financial switches, it is a catastrophic operational hemorrhage.
    </p>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-num">45M+</div>
        <div class="stat-label">User Accounts</div>
        <div class="stat-sub">High concurrency transaction load</div>
      </div>
      <div class="stat-card">
        <div class="stat-num danger">0.03%</div>
        <div class="stat-label">Daily Slip Rate</div>
        <div class="stat-sub">13,500 stranded transactions/day</div>
      </div>
      <div class="stat-card">
        <div class="stat-num danger">40 Hrs</div>
        <div class="stat-label">Manual Audit Waste</div>
        <div class="stat-sub">Ops team trapped in Excel reconciliation</div>
      </div>
      <div class="stat-card">
        <div class="stat-num success">&lt; 0.001%</div>
        <div class="stat-label">Target Standard</div>
        <div class="stat-sub">Guaranteed by 3D state locks</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="handle">@ariya-sarrafzadeh</div>
    <div class="action-hint">The Failure Cascade →</div>
  </div>
</div>

<!-- SLIDE 3: ROOT CAUSE DIAGRAM -->
<div class="slide">
  <div class="header">
    <div class="brand">
      <div class="brand-badge">AS</div>
      <div>
        <div class="brand-name">Ariya Sarrafzadeh</div>
        <div class="brand-title">High-Scale Payments Architecture</div>
      </div>
    </div>
    <div class="slide-counter">03 / 08</div>
  </div>

  <div class="content">
    <div class="tag">ROOT CAUSE ANATOMY</div>
    <h1>The Upstream<br><span class="danger-text">Black Hole Cascade</span></h1>
    <p class="lead">
      Where does money vanish? Exactly at the boundary where the core banking switch silently drops a network callback.
    </p>

    <div class="diagram-box">
      <div style="font-size: 15px; color: #94A3B8; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace;">
        FAILURE SEQUENCE: ASYNCHRONOUS CALLBACK TIMEOUT
      </div>
      
      <div class="flow-row">
        <div class="node active">
          <div class="node-title">1. Initiate Debit</div>
          <div class="node-desc">Client Wallet locks balance</div>
        </div>
        <div class="arrow">→</div>
        <div class="node active">
          <div class="node-title">2. Forward ISO 8583</div>
          <div class="node-desc">Banking Switch validates PIN</div>
        </div>
      </div>

      <div class="flow-row">
        <div class="node danger" style="flex: 2;">
          <div class="node-title">3. Packet Drop / Network Throttling</div>
          <div class="node-desc">Upstream host executes charge, but drops ACK packet.</div>
        </div>
      </div>

      <div class="flow-row" style="margin-bottom: 0;">
        <div class="node danger">
          <div class="node-title">Local System Thinks:</div>
          <div class="node-desc" style="color: #F87171;">"FAILED TRANSACTION"</div>
        </div>
        <div class="arrow danger">VS</div>
        <div class="node danger">
          <div class="node-title">Upstream Bank Thinks:</div>
          <div class="node-desc" style="color: #4ADE80;">"FUNDS SETTLED"</div>
        </div>
      </div>
    </div>

    <p style="font-size: 18px; color: #EF4444; font-family: 'JetBrains Mono', monospace; margin-top: 10px;">
      ⚠ RESULT: Double-entry mismatch. User is charged twice or merchant loses capital.
    </p>
  </div>

  <div class="footer">
    <div class="handle">@ariya-sarrafzadeh</div>
    <div class="action-hint">The Solution Architecture →</div>
  </div>
</div>

<!-- SLIDE 4: THE 3D STATE LOCK ARCHITECTURE -->
<div class="slide">
  <div class="header">
    <div class="brand">
      <div class="brand-badge">AS</div>
      <div>
        <div class="brand-name">Ariya Sarrafzadeh</div>
        <div class="brand-title">High-Scale Payments Architecture</div>
      </div>
    </div>
    <div class="slide-counter">04 / 08</div>
  </div>

  <div class="content">
    <div class="tag success">CORE ARCHITECTURE</div>
    <h1>The Solution:<br><span class="highlight">3D Consensus Triad</span></h1>
    <p class="lead">
      Never mark a transaction finalized based on a single confirmation.<br>
      Every transaction requires mathematical consensus across 3 isolated planes.
    </p>

    <!-- Visual Architecture Diagram -->
    <div class="diagram-box" style="padding: 36px;">
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div class="node active" style="text-align: left; padding: 22px 28px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="node-title" style="color: #38BDF8;">Plane 1: Upstream Switch Cryptography</div>
            <span class="slide-counter" style="font-size: 14px;">MAC VERIFIED</span>
          </div>
          <div class="node-desc" style="font-size: 15px; margin-top: 6px;">
            Cryptographic MAC block match + ISO 8583 RRN validation directly from the central switch.
          </div>
        </div>

        <div class="node success" style="text-align: left; padding: 22px 28px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="node-title" style="color: #10B981;">Plane 2: Double-Entry Immutable Ledger</div>
            <span class="slide-counter" style="font-size: 14px; background: rgba(16,185,129,0.1); border-color: #10B981; color: #10B981;">SUM = 0</span>
          </div>
          <div class="node-desc" style="font-size: 15px; margin-top: 6px;">
            Strict debit-credit balance preservation. No balances updated in-place; append-only ledger entries.
          </div>
        </div>

        <div class="node" style="text-align: left; padding: 22px 28px; border-color: #818CF8; background: rgba(129, 140, 248, 0.1);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div class="node-title" style="color: #818CF8;">Plane 3: Real-Time Clearing State Lock</div>
            <span class="slide-counter" style="font-size: 14px; background: rgba(129,140,248,0.1); border-color: #818CF8; color: #818CF8;">RECONCILED</span>
          </div>
          <div class="node-desc" style="font-size: 15px; margin-top: 6px;">
            Distributed lock released ONLY when both planes agree. If one desyncs, automated auto-reversal triggers.
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="handle">@ariya-sarrafzadeh</div>
    <div class="action-hint">Observability Engine →</div>
  </div>
</div>

<!-- SLIDE 5: OBSERVABILITY & GROK PATTERNS -->
<div class="slide">
  <div class="header">
    <div class="brand">
      <div class="brand-badge">AS</div>
      <div>
        <div class="brand-name">Ariya Sarrafzadeh</div>
        <div class="brand-title">High-Scale Payments Architecture</div>
      </div>
    </div>
    <div class="slide-counter">05 / 08</div>
  </div>

  <div class="content">
    <div class="tag">REAL-TIME TELEMETRY</div>
    <h1>Kill Noise Alerts.<br><span class="highlight">Trace Financial States</span></h1>
    <p class="lead">
      1,200 Slack alerts a day means nobody is watching.<br>
      We parsed raw socket logs to detect orphaned transactions in under 3 minutes.
    </p>

    <div class="code-terminal">
      <div class="code-header">
        <div class="dot red"></div>
        <div class="dot yellow"></div>
        <div class="dot green"></div>
        <span style="font-size: 13px; color: #64748B; margin-left: 10px;">switch-telemetry-pipeline.log</span>
      </div>
      <div style="color: #64748B;"># Raw Switch Log Ingestion (Prometheus + Custom Grok)</div>
      <div style="color: #38BDF8;">[23:59:58.102] SWITCH_INGEST: RRN=9021884401 TX_TYPE=PURCHASE</div>
      <div style="color: #CBD5E1;">[23:59:58.210] HOST_CALLBACK: TIMEOUT after 3000ms</div>
      <div style="color: #F43F5E; font-weight: bold;">[23:59:58.212] ! ALERT_TRIGGER: RECON_STATE_LOCK_DESYNC</div>
      <div style="color: #10B981;">[23:59:58.215] &gt; EXECUTING AUTO-REMEDIATION: ReverseLedgerHold(RRN)</div>
      <div style="color: #10B981; font-weight: bold;">[23:59:58.240] ✓ RESOLVED: Balance restored in 28ms. Zero human ticket.</div>
    </div>

    <div class="stat-grid" style="margin-top: 24px;">
      <div class="stat-card" style="padding: 20px;">
        <div class="stat-num danger" style="font-size: 32px;">3 Days</div>
        <div class="stat-label" style="font-size: 16px;">Old Latency</div>
        <div class="stat-sub">Waiting for bank statement file</div>
      </div>
      <div class="stat-card" style="padding: 20px;">
        <div class="stat-num success" style="font-size: 32px;">&lt; 3 Mins</div>
        <div class="stat-label" style="font-size: 16px;">New Detection</div>
        <div class="stat-sub">Real-time log parsing at source</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="handle">@ariya-sarrafzadeh</div>
    <div class="action-hint">Forensics & Compliance →</div>
  </div>
</div>

<!-- SLIDE 6: FORENSICS & COMPLIANCE -->
<div class="slide">
  <div class="header">
    <div class="brand">
      <div class="brand-badge">AS</div>
      <div>
        <div class="brand-name">Ariya Sarrafzadeh</div>
        <div class="brand-title">High-Scale Payments Architecture</div>
      </div>
    </div>
    <div class="slide-counter">06 / 08</div>
  </div>

  <div class="content">
    <div class="tag success">REGULATORY RESILIENCE</div>
    <h1>The Judicial<br><span class="highlight">Golden Record</span></h1>
    <p class="lead">
      Handling 30,000 Cyber Police & judicial inquiries taught me one truth:<br>
      Regulators do not accept opinions. They demand immutable cryptographic proof.
    </p>

    <div class="check-list">
      <div class="check-item">
        <div class="check-icon">✓</div>
        <div class="check-text">
          <h4>Cryptographic State Snapshots</h4>
          <p>Every transaction packages its request payload, switch MAC token, and database delta into an immutable verification block.</p>
        </div>
      </div>
      <div class="check-item">
        <div class="check-icon">✓</div>
        <div class="check-text">
          <h4>Sub-Second Audit Retrieval</h4>
          <p>Slashed judicial subpoena turnaround from 14 business days down to under 30 seconds using indexed time-series smart storage.</p>
        </div>
      </div>
      <div class="check-item">
        <div class="check-icon">✓</div>
        <div class="check-text">
          <h4>0.01% Fraud Threshold</h4>
          <p>Instantaneous AML and account-freeze triggers prevented carding fraud syndicates from draining balances across bank switches.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="handle">@ariya-sarrafzadeh</div>
    <div class="action-hint">The Executive Cheat Sheet →</div>
  </div>
</div>

<!-- SLIDE 7: STANDALONE RECAP (THE SCREENSHOT SLIDE) -->
<div class="slide" style="background: radial-gradient(circle at 50% 50%, rgba(2, 132, 199, 0.15) 0%, rgba(8, 12, 21, 1) 85%);">
  <div class="header">
    <div class="brand">
      <div class="brand-badge">AS</div>
      <div>
        <div class="brand-name">Ariya Sarrafzadeh</div>
        <div class="brand-title">High-Scale Payments Architecture</div>
      </div>
    </div>
    <div class="slide-counter" style="background: #10B981; color: #FFFFFF; border-color: #10B981;">SCREENSHOT CHEAT SHEET</div>
  </div>

  <div class="content">
    <div class="tag success">EXECUTIVE BLUEPRINT</div>
    <h1 style="font-size: 50px;">The 4 Invariants of<br><span class="highlight">Zero-Leak Payment Systems</span></h1>

    <div class="check-list" style="margin-top: 10px;">
      <div class="check-item" style="border-left: 4px solid #38BDF8;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 800; color: #38BDF8; width: 36px;">01</div>
        <div class="check-text">
          <h4>Kill Periodic Batch Sweeps</h4>
          <p>Batch comparisons leave a 24h vulnerability window. Implement real-time state locking at the switch boundary.</p>
        </div>
      </div>

      <div class="check-item" style="border-left: 4px solid #10B981;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 800; color: #10B981; width: 36px;">02</div>
        <div class="check-text">
          <h4>Enforce the 3D Consensus Triad</h4>
          <p>No transaction finalizes without Switch MAC block + Ledger balance + Settlement queue agreement.</p>
        </div>
      </div>

      <div class="check-item" style="border-left: 4px solid #818CF8;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 800; color: #818CF8; width: 36px;">03</div>
        <div class="check-text">
          <h4>Parse Switch Logs, Ignore CPU Alerts</h4>
          <p>Monitor financial states, not server metrics. Slashed discrepancy detection from 3 days to under 3 minutes.</p>
        </div>
      </div>

      <div class="check-item" style="border-left: 4px solid #F59E0B;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 800; color: #F59E0B; width: 36px;">04</div>
        <div class="check-text">
          <h4>Cryptographic Judicial Golden Records</h4>
          <p>Automate court-ready immutable audit blocks. Reduced regulatory compliance latency by 96%.</p>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="handle">Save & share for architecture reviews</div>
    <div class="action-hint">Final takeaway →</div>
  </div>
</div>

<!-- SLIDE 8: CTA & CONNECT -->
<div class="slide" style="text-align: center; justify-content: center; align-items: center; background: radial-gradient(circle at 50% 40%, rgba(56, 189, 248, 0.2) 0%, rgba(8, 12, 21, 1) 75%);">
  <div style="max-width: 820px; display: flex; flex-direction: column; align-items: center;">
    <div class="brand-badge" style="width: 80px; height: 80px; font-size: 36px; border-radius: 20px; margin-bottom: 24px;">AS</div>
    
    <div class="tag success" style="margin-bottom: 16px;">SYSTEM ARCHITECT // DUBAI & GLOBAL FINTECH</div>
    
    <h1 style="font-size: 56px; margin-bottom: 24px;">
      How does your platform handle<br>
      <span class="highlight">silent switch drops?</span>
    </h1>

    <p class="lead" style="font-size: 24px; margin-bottom: 40px; color: #CBD5E1;">
      I help high-scale fintechs, digital banks, and payment gateways architect zero-leak ledger systems and high-throughput transaction switches.
    </p>

    <div style="background: #0F172A; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 28px 40px; width: 100%; text-align: left; margin-bottom: 36px;">
      <div style="font-size: 15px; color: #94A3B8; font-family: 'JetBrains Mono', monospace; margin-bottom: 8px;">GET IN TOUCH:</div>
      <div style="font-size: 22px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px;">Ariya Sarrafzadeh</div>
      <div style="font-size: 16px; color: #38BDF8;">Senior Technical Product Manager & Systems Architect</div>
      <div style="font-size: 14px; color: #64748B; margin-top: 8px; font-family: 'JetBrains Mono', monospace;">
        Tehran → Relocating to Dubai (Open to Visa Sponsorship & Executive Technical Roles)
      </div>
    </div>

    <div style="display: flex; gap: 16px; font-family: 'JetBrains Mono', monospace; font-size: 16px; color: #94A3B8;">
      <span>💬 Drop your thoughts below</span>
      <span>•</span>
      <span>🔄 Repost to help an engineering team</span>
    </div>
  </div>
</div>

</body>
</html>
`;

(async () => {
  console.log('Connecting to browser over CDP to render elite PDF carousel...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  await page.setViewportSize({ width: 1080, height: 1350 });

  await page.setContent(htmlContent, { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  // Output paths
  const outputPdf = path.join(__dirname, 'Linkdin files', 'the-midnight-ledger-leak-v2.pdf');
  const slide1Img = path.join(__dirname, 'Linkdin files', 'carousel-preview-slide1.png');
  const slide4Img = path.join(__dirname, 'Linkdin files', 'carousel-preview-slide4.png');

  console.log('Generating PDF: ' + outputPdf);
  await page.pdf({
    path: outputPdf,
    width: '1080px',
    height: '1350px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  // Take preview screenshots of slide 1 and slide 4
  const slides = await page.$$('.slide');
  if (slides.length > 0) {
    console.log('Capturing Slide 1 preview...');
    await slides[0].screenshot({ path: slide1Img });
  }
  if (slides.length > 3) {
    console.log('Capturing Slide 4 (Architecture Triad) preview...');
    await slides[3].screenshot({ path: slide4Img });
  }

  await page.close();
  console.log('SUCCESS! Generated:');
  console.log('- PDF: ' + outputPdf);
  console.log('- Slide 1 Preview: ' + slide1Img);
  console.log('- Slide 4 Preview: ' + slide4Img);
  process.exit(0);
})();
