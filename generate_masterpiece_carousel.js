const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=IBM+Plex+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

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
    background: #090D16;
    color: #E2E8F0;
    font-family: 'IBM Plex Sans', -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .slide {
    width: 1080px;
    height: 1350px;
    padding: 80px 75px;
    position: relative;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #090D16;
    overflow: hidden;
  }

  /* Structural blueprint background texture */
  .slide::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: 
      radial-gradient(circle at 50% 0%, rgba(217, 119, 6, 0.08) 0%, transparent 60%),
      linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px);
    background-size: 100% 100%, 40px 40px, 40px 40px;
    pointer-events: none;
    z-index: 0;
  }

  /* Noise grain effect */
  .slide::after {
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 100% 100%, rgba(14, 165, 233, 0.06) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }

  .header, .main, .footer {
    position: relative;
    z-index: 2;
  }

  /* TOP HEADER */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 22px;
  }
  .pub-mark {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .pub-glyph {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    color: #F59E0B;
    background: rgba(245, 158, 11, 0.12);
    border: 1px solid rgba(245, 158, 11, 0.3);
    padding: 6px 12px;
    border-radius: 4px;
    letter-spacing: 1px;
  }
  .pub-meta {
    font-size: 15px;
    font-weight: 600;
    color: #94A3B8;
    letter-spacing: 0.5px;
  }
  .pub-meta strong {
    color: #F8FAFC;
    font-weight: 700;
  }
  .slide-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 15px;
    color: #64748B;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    padding: 6px 14px;
    border-radius: 4px;
  }

  /* MAIN CONTENT */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 24px 0;
  }

  .topic-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 2px;
    color: #F59E0B;
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 18px;
  }
  .topic-tag.danger { color: #F43F5E; }
  .topic-tag.blue { color: #38BDF8; }
  .topic-tag.emerald { color: #10B981; }

  h1.editorial-title {
    font-family: 'Newsreader', serif;
    font-size: 64px;
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -1px;
    color: #FFFFFF;
    margin-bottom: 22px;
  }
  h1.editorial-title em {
    font-style: italic;
    color: #F59E0B;
    font-weight: 400;
  }
  h1.editorial-title .highlight-red {
    color: #FB7185;
    font-style: italic;
  }

  p.thesis {
    font-size: 24px;
    line-height: 1.5;
    color: #94A3B8;
    margin-bottom: 28px;
    max-width: 900px;
  }
  p.thesis strong {
    color: #F1F5F9;
    font-weight: 600;
  }

  /* SCHEMATIC & TECHNICAL CARDS */
  .blueprint-card {
    background: #0E1422;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 28px;
    position: relative;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5);
  }
  .blueprint-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
    margin-bottom: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    color: #64748B;
  }

  /* FOOTER */
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    color: #64748B;
  }
  .author-sig {
    color: #94A3B8;
  }
  .author-sig strong {
    color: #F8FAFC;
  }
  .swipe-cta {
    color: #F59E0B;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* DATA TABLES & T-ACCOUNTS */
  .t-account-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 16px;
  }
  .ledger-box {
    background: #090E1A;
    border: 1px solid #1E293B;
    border-radius: 8px;
    padding: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
  }
  .ledger-box.unbalanced {
    border-color: #EF4444;
    background: rgba(239, 68, 68, 0.04);
  }
  .ledger-title {
    font-weight: 700;
    color: #F8FAFC;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px solid #1E293B;
    padding-bottom: 8px;
  }
  .ledger-row {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    color: #94A3B8;
  }
  .ledger-row.danger {
    color: #F87171;
    font-weight: 700;
  }
  .ledger-row.sum {
    border-top: 1px dashed #334155;
    margin-top: 8px;
    padding-top: 8px;
    font-weight: 700;
    color: #F8FAFC;
  }

  /* PROTOCOL FIELD BADGES */
  .field-table {
    width: 100%;
    border-collapse: collapse;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    margin-top: 12px;
  }
  .field-table th {
    text-align: left;
    color: #64748B;
    padding: 10px 12px;
    border-bottom: 1px solid #1E293B;
    font-size: 12px;
    text-transform: uppercase;
  }
  .field-table td {
    padding: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    color: #CBD5E1;
  }
  .field-table tr:last-child td {
    border-bottom: none;
  }
  .badge-field {
    background: #1E293B;
    color: #38BDF8;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
  }
  .status-err {
    color: #F87171;
    font-weight: 700;
  }
  .status-ok {
    color: #34D399;
    font-weight: 700;
  }

  /* ARCHITECTURE NODES */
  .arch-pipeline {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-top: 16px;
  }
  .pipeline-node {
    display: flex;
    align-items: center;
    background: #090E1A;
    border: 1px solid #1E293B;
    border-radius: 8px;
    padding: 18px 22px;
    gap: 20px;
  }
  .pipeline-node.plane-1 { border-left: 5px solid #F59E0B; }
  .pipeline-node.plane-2 { border-left: 5px solid #10B981; }
  .pipeline-node.plane-3 { border-left: 5px solid #0284C7; }
  .pipeline-index {
    font-family: 'JetBrains Mono', monospace;
    font-size: 20px;
    font-weight: 800;
    color: #64748B;
    width: 32px;
  }
  .pipeline-info {
    flex: 1;
  }
  .pipeline-title {
    font-size: 18px;
    font-weight: 700;
    color: #F8FAFC;
    margin-bottom: 4px;
  }
  .pipeline-desc {
    font-size: 14px;
    color: #94A3B8;
    line-height: 1.4;
  }
  .pipeline-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    padding: 4px 10px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.06);
    color: #CBD5E1;
  }

  /* CODE TELEMETRY */
  .telemetry-block {
    background: #040711;
    border: 1px solid #1E293B;
    border-radius: 8px;
    padding: 22px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13.5px;
    line-height: 1.6;
    color: #94A3B8;
  }
  .telemetry-block .comment { color: #475569; }
  .telemetry-block .gold { color: #F59E0B; }
  .telemetry-block .cyan { color: #38BDF8; }
  .telemetry-block .green { color: #34D399; }
  .telemetry-block .red { color: #F87171; font-weight: 700; }

  /* MATRIX / CHEAT SHEET */
  .matrix-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 15px;
  }
  .matrix-table th {
    text-align: left;
    padding: 14px;
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 2px solid #334155;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    text-transform: uppercase;
    color: #CBD5E1;
  }
  .matrix-table td {
    padding: 16px 14px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    vertical-align: top;
    line-height: 1.4;
  }
  .matrix-table tr:hover td {
    background: rgba(255, 255, 255, 0.02);
  }
  .naive-col {
    color: #F87171;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13.5px;
  }
  .scale-col {
    color: #34D399;
    font-weight: 600;
  }
</style>
</head>
<body>

<!-- SLIDE 1: COVER -->
<div class="slide">
  <div class="header">
    <div class="pub-mark">
      <div class="pub-glyph">SYS//045M</div>
      <div class="pub-meta">DISTRIBUTED FINANCIAL ARCHITECTURE</div>
    </div>
    <div class="slide-num">PLATE 01 / 08</div>
  </div>

  <div class="main">
    <div class="topic-tag danger">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L2 22h20L12 2zm0 6v6m0 4v.01"/></svg>
      SYSTEM RECONCILIATION TEARDOWN
    </div>

    <h1 class="editorial-title" style="font-size: 68px; margin-bottom: 20px;">
      The Midnight<br>
      <em>Ledger Leak</em>
    </h1>

    <p class="thesis" style="font-size: 25px; line-height: 1.5; margin-bottom: 32px;">
      Why a 0.03% discrepancy drains millions at 45-million scale, and why <strong>2-Phase Commit will never save you</strong> across non-cooperative banking switches.
    </p>

    <!-- Visual ISO 8583 Packet Failure Breakdown -->
    <div class="blueprint-card">
      <div class="blueprint-header">
        <span>PACKET TELEMETRY: 23:59:58.214</span>
        <span style="color: #F87171;">MTI 0200 → 0210 PARTITION</span>
      </div>

      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items: center;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 13.5px; line-height: 1.7; color: #94A3B8;">
          <div><span style="color: #64748B;">[00:00:00]</span> MTI: <span style="color: #F59E0B;">0200 (FINANCIAL REQ)</span></div>
          <div><span style="color: #64748B;">[00:00:01]</span> F04: <span style="color: #F8FAFC;">500,000,000 IRR</span></div>
          <div><span style="color: #64748B;">[00:00:02]</span> F37: <span style="color: #38BDF8;">RRN-9921008472</span></div>
          <div><span style="color: #64748B;">[00:00:03]</span> F48: <span style="color: #34D399;">MAC-VALIDATED</span></div>
          <div style="color: #F87171; font-weight: 700; margin-top: 6px;">[00:00:05] SOCKET: DROP (NO 0210 ACK)</div>
        </div>

        <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 18px; text-align: center;">
          <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; color: #F87171; letter-spacing: 1px; font-weight: 700; margin-bottom: 6px;">ASYNCHRONOUS SPLIT-BRAIN</div>
          <div style="font-size: 15px; color: #F8FAFC; line-height: 1.4;">Bank Switch debited.<br>Internal Wallet timed out.<br><strong style="color: #F59E0B;">The ledger is now uncalibrated.</strong></div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="author-sig">Engineering Whitepaper by <strong>Ariya Sarrafzadeh</strong></div>
    <div class="swipe-cta">Inspect Anatomy →</div>
  </div>
</div>

<!-- SLIDE 2: THE BYZANTINE SWITCH BOUNDARY -->
<div class="slide">
  <div class="header">
    <div class="pub-mark">
      <div class="pub-glyph">PROTOCOL</div>
      <div class="pub-meta">DISTRIBUTED CONSENSUS LIMITS</div>
    </div>
    <div class="slide-num">PLATE 02 / 08</div>
  </div>

  <div class="main">
    <div class="topic-tag">SYSTEMS REALITY</div>
    <h1 class="editorial-title">
      The Core Banking<br>
      <em>Two-General Problem</em>
    </h1>
    <p class="thesis">
      In database textbooks, transactions are protected by <strong>2-Phase Commit (XA)</strong>. In production fintech, external bank switches <strong>never participate in your coordinator</strong>.
    </p>

    <!-- Visual Architecture of the Boundary -->
    <div class="blueprint-card">
      <div class="blueprint-header">
        <span>NETWORK ARBITRATION BOUNDARY</span>
        <span>ZERO ROLLBACK SUPPORT</span>
      </div>

      <!-- Flow SVG Diagram -->
      <svg width="100%" height="220" viewBox="0 0 920 220" style="overflow: visible;">
        <!-- Left Box: Internal Cluster -->
        <rect x="10" y="30" width="360" height="160" rx="8" fill="#090E1A" stroke="#1E293B" stroke-width="1.5"/>
        <text x="30" y="60" fill="#38BDF8" font-family="'JetBrains Mono'" font-size="14" font-weight="700">INTERNAL PLATFORM</text>
        <text x="30" y="85" fill="#64748B" font-family="'JetBrains Mono'" font-size="12">ACID Compliant Postgres / Smart DB</text>
        <rect x="30" y="110" width="140" height="55" rx="6" fill="#1E293B"/>
        <text x="45" y="135" fill="#F8FAFC" font-family="'IBM Plex Sans'" font-size="13" font-weight="600">Wallet Service</text>
        <text x="45" y="152" fill="#34D399" font-family="'JetBrains Mono'" font-size="11">State: RESERVED</text>
        <rect x="190" y="110" width="160" height="55" rx="6" fill="#1E293B"/>
        <text x="205" y="135" fill="#F8FAFC" font-family="'IBM Plex Sans'" font-size="13" font-weight="600">Outbox Queue</text>
        <text x="205" y="152" fill="#F59E0B" font-family="'JetBrains Mono'" font-size="11">Kafka Partitions</text>

        <!-- Boundary Wall -->
        <line x1="460" y1="15" x2="460" y2="205" stroke="#EF4444" stroke-width="2" stroke-dasharray="6 6"/>
        <text x="460" y="25" fill="#EF4444" font-family="'JetBrains Mono'" font-size="11" text-anchor="middle" font-weight="700">UNRELIABLE FIBER</text>

        <!-- Right Box: Upstream Central Bank -->
        <rect x="550" y="30" width="360" height="160" rx="8" fill="#090E1A" stroke="#1E293B" stroke-width="1.5"/>
        <text x="570" y="60" fill="#F59E0B" font-family="'JetBrains Mono'" font-size="14" font-weight="700">CENTRAL BANK SWITCH</text>
        <text x="570" y="85" fill="#64748B" font-family="'JetBrains Mono'" font-size="12">ISO 8583 / AS2805 Switch Engine</text>
        <rect x="570" y="110" width="150" height="55" rx="6" fill="#1E293B"/>
        <text x="585" y="135" fill="#F8FAFC" font-family="'IBM Plex Sans'" font-size="13" font-weight="600">Core Banking Host</text>
        <text x="585" y="152" fill="#34D399" font-family="'JetBrains Mono'" font-size="11">State: CHARGED</text>
        <rect x="740" y="110" width="150" height="55" rx="6" fill="#1E293B"/>
        <text x="755" y="135" fill="#F8FAFC" font-family="'IBM Plex Sans'" font-size="13" font-weight="600">Switch HSM</text>
        <text x="755" y="152" fill="#64748B" font-family="'JetBrains Mono'" font-size="11">PIN Block Valid</text>

        <!-- Arrow Forward -->
        <path d="M 370 125 L 530 125" stroke="#38BDF8" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
        <text x="450" y="118" fill="#38BDF8" font-family="'JetBrains Mono'" font-size="11" text-anchor="middle">0200 REQ →</text>

        <!-- Arrow Dropped Backward -->
        <path d="M 550 155 L 470 155" stroke="#EF4444" stroke-width="2" fill="none"/>
        <line x1="465" y1="145" x2="475" y2="165" stroke="#EF4444" stroke-width="3"/>
        <line x1="475" y1="145" x2="465" y2="165" stroke="#EF4444" stroke-width="3"/>
        <text x="450" y="180" fill="#EF4444" font-family="'JetBrains Mono'" font-size="11" text-anchor="middle">⚡ 0210 DROPPED</text>
      </svg>
    </div>

    <p style="font-size: 16px; color: #94A3B8; font-family: 'JetBrains Mono', monospace; margin-top: 18px;">
      Because the banking switch won't rollback automatically on dropped sockets, any timeout forces your system to choose: <strong>assume failure and risk double-credit</strong>, or <strong>assume success and freeze user capital</strong>.
    </p>
  </div>

  <div class="footer">
    <div class="author-sig">Ariya Sarrafzadeh • Head of Payments Architecture</div>
    <div class="swipe-cta">The T-Account Collapse →</div>
  </div>
</div>

<!-- SLIDE 3: THE ASYMMETRIC T-ACCOUNT DISCREPANCY -->
<div class="slide">
  <div class="header">
    <div class="pub-mark">
      <div class="pub-glyph">ACCOUNTING</div>
      <div class="pub-meta">DOUBLE-ENTRY MATHEMATICAL PROOF</div>
    </div>
    <div class="slide-num">PLATE 03 / 08</div>
  </div>

  <div class="main">
    <div class="topic-tag danger">MATHEMATICAL IMBALANCE</div>
    <h1 class="editorial-title">
      The Asymmetric<br>
      <span class="highlight-red">T-Account Rupture</span>
    </h1>
    <p class="thesis">
      When a callback drops, the mathematical invariant <code>∑Debits - ∑Credits = 0</code> shatters between the settlement clearing account and customer ledger.
    </p>

    <!-- Side-by-Side Ledgers -->
    <div class="t-account-grid">
      <div class="ledger-box">
        <div class="ledger-title">
          <span>CENTRAL SWITCH RECORD</span>
          <span style="color: #34D399;">SETTLED</span>
        </div>
        <div class="ledger-row">
          <span>Dr. Interbank Settlement</span>
          <span>$1,000,000</span>
        </div>
        <div class="ledger-row">
          <span>Cr. Acquirer Clearing Acct</span>
          <span>$1,000,000</span>
        </div>
        <div class="ledger-row sum">
          <span>BALANCE DELTA</span>
          <span style="color: #34D399;">$0.00 (BALANCED)</span>
        </div>
        <div style="font-size: 12px; color: #64748B; margin-top: 12px; line-height: 1.4;">
          The central clearing engine considers this transaction legally binding and finalized.
        </div>
      </div>

      <div class="ledger-box unbalanced">
        <div class="ledger-title">
          <span>INTERNAL PLATFORM LEDGER</span>
          <span style="color: #F87171;">ORPHANED</span>
        </div>
        <div class="ledger-row">
          <span>Dr. Customer Wallet (Held)</span>
          <span>$1,000,000</span>
        </div>
        <div class="ledger-row danger">
          <span>Cr. Settlement Payable</span>
          <span>$0.00 (TIMEOUT)</span>
        </div>
        <div class="ledger-row sum danger">
          <span>BALANCE DELTA</span>
          <span>+$1,000,000 (LEAK)</span>
        </div>
        <div style="font-size: 12px; color: #F87171; margin-top: 12px; line-height: 1.4;">
          Internal timeout rolled back customer balance hold. Merchant was paid; platform absorbed the loss.
        </div>
      </div>
    </div>

    <div style="background: rgba(245, 158, 11, 0.08); border-left: 4px solid #F59E0B; padding: 18px 22px; border-radius: 4px; margin-top: 24px;">
      <div style="font-size: 16px; font-weight: 700; color: #F59E0B; font-family: 'JetBrains Mono', monospace; margin-bottom: 4px;">THE 45M SCALE MULTIPLIER:</div>
      <div style="font-size: 15px; color: #CBD5E1; line-height: 1.5;">
        At 4.2 million daily transactions, 0.03% means <strong>1,260 orphaned ledgers every single day</strong>. Without automated 3D reconciliation, that requires a dedicated squad of 15 accountants manually reconciling CSV logs in Excel.
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="author-sig">Ariya Sarrafzadeh • Engineering Whitepaper</div>
    <div class="swipe-cta">The Triad Architecture →</div>
  </div>
</div>

<!-- SLIDE 4: THE 3D CONSENSUS TRIAD -->
<div class="slide">
  <div class="header">
    <div class="pub-mark">
      <div class="pub-glyph">SOLUTION</div>
      <div class="pub-meta">DISTRIBUTED ARBITRATION PATTERN</div>
    </div>
    <div class="slide-num">PLATE 04 / 08</div>
  </div>

  <div class="main">
    <div class="topic-tag emerald">THE SOLUTION</div>
    <h1 class="editorial-title">
      The 3-Dimensional<br>
      <em>Consensus Triad</em>
    </h1>
    <p class="thesis">
      Never update account balances based on a single callback. Every financial state requires <strong>triangular consensus</strong> across three isolated planes:
    </p>

    <div class="arch-pipeline">
      <div class="pipeline-node plane-1">
        <div class="pipeline-index">01</div>
        <div class="pipeline-info">
          <div class="pipeline-title">Plane 1: Hardware-Anchored Switch Proof</div>
          <div class="pipeline-desc">Validation of raw cryptographic MAC block + ISO 8583 RRN directly from central switch socket. Zero dependence on HTTP webhooks.</div>
        </div>
        <div class="pipeline-tag" style="color: #F59E0B; border: 1px solid rgba(245,158,11,0.3);">MAC MATCHED</div>
      </div>

      <div class="pipeline-node plane-2">
        <div class="pipeline-index">02</div>
        <div class="pipeline-info">
          <div class="pipeline-title">Plane 2: Append-Only Immutable Double-Entry Ledger</div>
          <div class="pipeline-desc">Zero in-place balance updates (<code>UPDATE accounts SET balance = balance - 100</code> is forbidden). Strictly append-only debit/credit line pairs.</div>
        </div>
        <div class="pipeline-tag" style="color: #10B981; border: 1px solid rgba(16,185,129,0.3);">∑DR = ∑CR</div>
      </div>

      <div class="pipeline-node plane-3">
        <div class="pipeline-index">03</div>
        <div class="pipeline-info">
          <div class="pipeline-title">Plane 3: Real-Time Arbitration State Machine</div>
          <div class="pipeline-desc">Distributed lock held in Redis cluster with Redlock. Lock releases ONLY when Plane 1 and Plane 2 match. If desynced, triggers auto-reversal in 28ms.</div>
        </div>
        <div class="pipeline-tag" style="color: #38BDF8; border: 1px solid rgba(56,189,248,0.3);">LOCK RELEASED</div>
      </div>
    </div>

    <p style="font-size: 15px; color: #64748B; font-family: 'JetBrains Mono', monospace; margin-top: 18px;">
      Result: Eliminates the window of vulnerability. Even during complete banking host dropouts, state remains provably isolated.
    </p>
  </div>

  <div class="footer">
    <div class="author-sig">Ariya Sarrafzadeh • Systems Architecture</div>
    <div class="swipe-cta">Observability Telemetry →</div>
  </div>
</div>

<!-- SLIDE 5: LOW-LEVEL LOG INGESTION -->
<div class="slide">
  <div class="header">
    <div class="pub-mark">
      <div class="pub-glyph">TELEMETRY</div>
      <div class="pub-meta">HIGH-THROUGHPUT OBSERVABILITY</div>
    </div>
    <div class="slide-num">PLATE 05 / 08</div>
  </div>

  <div class="main">
    <div class="topic-tag blue">OBSERVABILITY ENGINE</div>
    <h1 class="editorial-title">
      Parsing Switch Sockets<br>
      <em>In Under 180ms</em>
    </h1>
    <p class="thesis">
      CPU and HTTP 500 alerts tell you nothing about payment health. We built a <strong>custom Grok & Prometheus ingestion pipeline</strong> parsing switch frames in memory.
    </p>

    <!-- Visual Code / Telemetry Log -->
    <div class="telemetry-block">
      <div class="comment">// 1. Raw Socket Ingestion via Custom Daemon</div>
      <div><span class="cyan">INGEST</span> socket=0x7f9a2 <span class="gold">MTI=0200</span> RRN=9018274401 PAN=6037********1920</div>
      <div><span class="comment">// 2. Hardware Security Module (HSM) Verification</span></div>
      <div><span class="green">HSM_AUTH</span> PIN_BLOCK=VALID <span class="gold">MAC_STATUS=PASSED</span> (0.014ms)</div>
      <div><span class="comment">// 3. Banking Switch Response Timeout Trap</span></div>
      <div><span class="red">TIMEOUT_DETECTED</span> elapsed=3002ms threshold=3000ms</div>
      <div><span class="comment">// 4. Automated Arbitration Engine (No Human Ticket)</span></div>
      <div><span class="gold">DISPATCH</span> action=AutoReverseHold target_user=UUID-8841</div>
      <div><span class="green">LEDGER_STATE</span> reverse_tx=REV-9018274401 delta=+500,000,000 <span class="green">BALANCED [28ms]</span></div>
    </div>

    <!-- Comparative Metrics -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 22px;">
      <div style="background: #090E1A; border: 1px solid #1E293B; border-radius: 8px; padding: 20px;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 32px; color: #F87171; font-weight: 700;">3 Business Days</div>
        <div style="font-size: 14px; color: #94A3B8; margin-top: 4px;">Legacy Settlement Delay (Manual CSV Audit)</div>
      </div>
      <div style="background: #090E1A; border: 1px solid #10B981; border-radius: 8px; padding: 20px;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 32px; color: #10B981; font-weight: 700;">&lt; 180 Milliseconds</div>
        <div style="font-size: 14px; color: #94A3B8; margin-top: 4px;">Real-Time Socket State Detection & Reversal</div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="author-sig">Ariya Sarrafzadeh • Head of Payments Architecture</div>
    <div class="swipe-cta">Forensic Golden Records →</div>
  </div>
</div>

<!-- SLIDE 6: THE JUDICIAL GOLDEN RECORD -->
<div class="slide">
  <div class="header">
    <div class="pub-mark">
      <div class="pub-glyph">COMPLIANCE</div>
      <div class="pub-meta">REGULATORY & JUDICIAL AUDITING</div>
    </div>
    <div class="slide-num">PLATE 06 / 08</div>
  </div>

  <div class="main">
    <div class="topic-tag emerald">REGULATORY HARDENING</div>
    <h1 class="editorial-title">
      The Court-Ready<br>
      <em>Golden Record</em>
    </h1>
    <p class="thesis">
      Across 30,000 Cyber Police & judicial inquiries, prosecutors do not accept database rows. They require <strong>cryptographic provenance</strong> that proves zero tampering.
    </p>

    <!-- Judicial Block Diagram -->
    <div class="blueprint-card">
      <div class="blueprint-header">
        <span>CRYPTOGRAPHIC INVARIANT STRUCTURE</span>
        <span style="color: #34D399;">SHA-256 MERKLE ROOT</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; gap: 16px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <span class="badge-field">BLOCK A</span>
          <div>
            <div style="font-weight: 700; color: #F8FAFC; font-size: 16px;">Ingress Network Snapshot</div>
            <div style="font-size: 14px; color: #94A3B8; margin-top: 2px;">Raw TCP payload, client TLS fingerprint, terminal ID, and base-switch timestamp.</div>
          </div>
        </div>

        <div style="display: flex; gap: 16px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <span class="badge-field">BLOCK B</span>
          <div>
            <div style="font-weight: 700; color: #F8FAFC; font-size: 16px;">Switch MAC Verification Token</div>
            <div style="font-size: 14px; color: #94A3B8; margin-top: 2px;">Signed cryptographic proof from central switch HSM establishing state consensus.</div>
          </div>
        </div>

        <div style="display: flex; gap: 16px; align-items: flex-start; padding: 10px 0;">
          <span class="badge-field">BLOCK C</span>
          <div>
            <div style="font-weight: 700; color: #F8FAFC; font-size: 16px;">Immutable Smart Storage Partition</div>
            <div style="font-size: 14px; color: #94A3B8; margin-top: 2px;">Indexed time-series smart DB holding multi-petabyte transactional proof for 10+ years.</div>
          </div>
        </div>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; font-family: 'JetBrains Mono', monospace; font-size: 14px; color: #34D399; background: rgba(16,185,129,0.08); padding: 14px 20px; border-radius: 6px;">
      <span>SUBPOENA TURNAROUND TIME:</span>
      <span style="font-weight: 700;">REDUCED FROM 14 DAYS TO 30 SECONDS</span>
    </div>
  </div>

  <div class="footer">
    <div class="author-sig">Ariya Sarrafzadeh • Engineering Whitepaper</div>
    <div class="swipe-cta">The Architecture Matrix →</div>
  </div>
</div>

<!-- SLIDE 7: STANDALONE SCREENSHOT CHEAT SHEET -->
<div class="slide" style="background: #060911;">
  <div class="header">
    <div class="pub-mark">
      <div class="pub-glyph" style="background: #10B981; color: #041209; border: none;">EXECUTIVE MATRIX</div>
      <div class="pub-meta">ARCHITECTURAL INVARIANTS</div>
    </div>
    <div class="slide-num">PLATE 07 / 08</div>
  </div>

  <div class="main">
    <div class="topic-tag emerald">SCREENSHOT BLUEPRINT</div>
    <h1 class="editorial-title" style="font-size: 50px;">
      Naive Fintech vs.<br>
      <em>45M Scale Architecture</em>
    </h1>

    <table class="matrix-table">
      <thead>
        <tr>
          <th style="width: 25%;">DIMENSION</th>
          <th style="width: 35%;">NAIVE IMPLEMENTATION</th>
          <th style="width: 40%; color: #34D399;">SCALE ARCHITECTURE</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-weight: 700; color: #CBD5E1;">Reconciliation</td>
          <td class="naive-col">Midnight batch sweeps via daily CSV file import</td>
          <td class="scale-col">Real-time socket state locks; &lt; 180ms discrepancy capture</td>
        </tr>
        <tr>
          <td style="font-weight: 700; color: #CBD5E1;">Database Writes</td>
          <td class="naive-col">In-place updates:<br><code>UPDATE balances SET val = val - X</code></td>
          <td class="scale-col">Strict double-entry append-only immutable ledger (∑Dr = ∑Cr)</td>
        </tr>
        <tr>
          <td style="font-weight: 700; color: #CBD5E1;">Switch Drops</td>
          <td class="naive-col">Wait for customer support tickets to report missing funds</td>
          <td class="scale-col">Automated socket arbitration daemon with 28ms auto-reversal</td>
        </tr>
        <tr>
          <td style="font-weight: 700; color: #CBD5E1;">Alerting Strategy</td>
          <td class="naive-col">1,200 noisy Slack alerts on CPU/Memory utilization</td>
          <td class="scale-col">Financial state boundary alerts only; zero noise pages</td>
        </tr>
        <tr>
          <td style="font-weight: 700; color: #CBD5E1;">Judicial Audit</td>
          <td class="naive-col">14-day manual SQL queries on unindexed log backups</td>
          <td class="scale-col">Sub-second court-ready cryptographic snapshot retrieval</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <div class="author-sig" style="color: #10B981;">Save this plate for your technical reviews</div>
    <div class="swipe-cta">Executive Discussion →</div>
  </div>
</div>

<!-- SLIDE 8: AUTHOR & CALL TO ACTION -->
<div class="slide" style="justify-content: center; align-items: center; text-align: center; background: radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.08) 0%, #090D16 80%);">
  <div style="max-width: 860px; display: flex; flex-direction: column; align-items: center;">
    <div class="pub-glyph" style="font-size: 20px; padding: 10px 24px; border-radius: 6px; margin-bottom: 28px;">
      ARIA // SYSTEMS LEADERSHIP
    </div>

    <h1 class="editorial-title" style="font-size: 58px; margin-bottom: 24px; line-height: 1.15;">
      How does your platform handle<br>
      <em>asymmetric switch drops?</em>
    </h1>

    <p class="thesis" style="font-size: 22px; max-width: 760px; margin-bottom: 40px; color: #CBD5E1;">
      15+ years in the technical trenches architecting, operating, and debugging high-throughput transaction switches, smart databases, and fraud engines for 45M+ users.
    </p>

    <!-- Profile Dossier Card -->
    <div style="background: #0E1422; border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 32px 40px; width: 100%; text-align: left; margin-bottom: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
        <div>
          <div style="font-size: 24px; font-weight: 700; color: #FFFFFF;">Ariya Sarrafzadeh</div>
          <div style="font-size: 16px; color: #F59E0B; font-weight: 600; margin-top: 2px;">Senior Technical Product Manager & Systems Architect</div>
        </div>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 12px; background: rgba(56,189,248,0.1); color: #38BDF8; padding: 6px 12px; border-radius: 4px; border: 1px solid rgba(56,189,248,0.3);">
          OPEN TO UAE RELOCATION
        </div>
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 13.5px; color: #94A3B8; line-height: 1.6; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 14px;">
        Core Focus: High-Scale Payment Rails • Double-Entry Ledgers • API Gateways • Smart Multi-Petabyte Databases • Fintech Security & Compliance
      </div>
    </div>

    <div style="font-family: 'JetBrains Mono', monospace; font-size: 15px; color: #64748B; display: flex; gap: 20px;">
      <span>💬 Share your system failure war stories below</span>
      <span>•</span>
      <span>🔄 Repost for your engineering team</span>
    </div>
  </div>
</div>

</body>
</html>
`;

(async () => {
  console.log('Connecting to browser over CDP to render masterpiece carousel...');
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  await page.setViewportSize({ width: 1080, height: 1350 });

  await page.setContent(htmlContent, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  // Output paths
  const outputPdf = path.join(__dirname, 'Linkdin files', 'the-midnight-ledger-leak-v3-masterpiece.pdf');
  const slide1Img = path.join(__dirname, 'Linkdin files', 'masterpiece-slide1.png');
  const slide2Img = path.join(__dirname, 'Linkdin files', 'masterpiece-slide2.png');
  const slide3Img = path.join(__dirname, 'Linkdin files', 'masterpiece-slide3.png');
  const slide7Img = path.join(__dirname, 'Linkdin files', 'masterpiece-slide7.png');

  console.log('Generating PDF: ' + outputPdf);
  await page.pdf({
    path: outputPdf,
    width: '1080px',
    height: '1350px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  const slides = await page.$$('.slide');
  console.log(`Captured ${slides.length} slides.`);
  if (slides.length >= 1) await slides[0].screenshot({ path: slide1Img });
  if (slides.length >= 2) await slides[1].screenshot({ path: slide2Img });
  if (slides.length >= 3) await slides[2].screenshot({ path: slide3Img });
  if (slides.length >= 7) await slides[6].screenshot({ path: slide7Img });

  await page.close();
  console.log('SUCCESS! Masterpiece generated.');
  process.exit(0);
})();
