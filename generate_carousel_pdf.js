const { chromium } = require('playwright');
const fs = require('fs');

const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  @page {
    size: 1080px 1350px;
    margin: 0;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #0d1117;
    color: #e6edf3;
  }
  .slide {
    width: 1080px;
    height: 1350px;
    box-sizing: border-box;
    padding: 100px 90px;
    position: relative;
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #0d1117;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #21262d;
    padding-bottom: 30px;
  }
  .author {
    font-size: 26px;
    font-weight: 600;
    color: #58a6ff;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .tag {
    font-size: 20px;
    color: #8b949e;
    background: #161b22;
    padding: 8px 18px;
    border-radius: 20px;
    border: 1px solid #30363d;
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .hook-badge {
    color: #f85149;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-bottom: 24px;
  }
  h1 {
    font-size: 64px;
    line-height: 1.18;
    margin: 0 0 32px 0;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -1px;
  }
  p {
    font-size: 34px;
    line-height: 1.5;
    color: #c9d1d9;
    margin: 0 0 28px 0;
  }
  .card {
    background: #161b22;
    border: 2px solid #30363d;
    border-radius: 16px;
    padding: 40px;
    margin-top: 30px;
  }
  .card-title {
    font-size: 32px;
    font-weight: 700;
    color: #3fb950;
    margin-bottom: 16px;
  }
  .card-body {
    font-size: 28px;
    line-height: 1.45;
    color: #8b949e;
  }
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 2px solid #21262d;
    padding-top: 30px;
    font-size: 22px;
    color: #8b949e;
  }
  .highlight {
    color: #58a6ff;
    font-weight: 700;
  }
</style>
</head>
<body>

<!-- SLIDE 1 -->
<div class="slide">
  <div class="header">
    <div class="author">Ariya Sarrafzadeh</div>
    <div class="tag">Systems Architecture</div>
  </div>
  <div class="content">
    <div class="hook-badge">Distributed Systems Reality</div>
    <h1>The Midnight Ledger Leak</h1>
    <p>At 23:59:58 on settlement night, a 0.03% discrepancy is not an accounting glitch.</p>
    <p class="highlight">It is a distributed systems failure.</p>
    <div class="card">
      <div class="card-title">What 15 Years in Payments Taught Me:</div>
      <div class="card-body">How to stop capital bleeding between upstream banking switches and internal wallets. (Swipe ->)</div>
    </div>
  </div>
  <div class="footer">
    <div>Slide 1 / 7</div>
    <div>Swipe Next -></div>
  </div>
</div>

<!-- SLIDE 2 -->
<div class="slide">
  <div class="header">
    <div class="author">Ariya Sarrafzadeh</div>
    <div class="tag">Root Cause</div>
  </div>
  <div class="content">
    <div class="hook-badge">The Vulnerability Window</div>
    <h1>The Upstream Black Hole</h1>
    <p>Most fintech platforms break at the boundary between banking switches and internal databases.</p>
    <p>When an upstream core host drops an ISO 8583 acknowledgement or an SMS gateway silently throttles a callback:</p>
    <div class="card">
      <div class="card-title">The Failure Cascade:</div>
      <div class="card-body">Naive ledgers write double balances. Operations then spends 40 hours auditing spreadsheets manually.</div>
    </div>
  </div>
  <div class="footer">
    <div>Slide 2 / 7</div>
    <div>Swipe Next -></div>
  </div>
</div>

<!-- SLIDE 3 -->
<div class="slide">
  <div class="header">
    <div class="author">Ariya Sarrafzadeh</div>
    <div class="tag">Step 1</div>
  </div>
  <div class="content">
    <div class="hook-badge">Protocol Rule 1</div>
    <h1>Kill Batch Comparisons</h1>
    <p>Periodic midnight batch sweeps leave a 24-hour vulnerability window where fraud syndicates drain funds.</p>
    <div class="card">
      <div class="card-title">The Engineering Shift:</div>
      <div class="card-body">Replace end-of-day SQL comparisons with real-time transactional state locks. Capture discrepancies the second the network drops, not 24 hours later.</div>
    </div>
  </div>
  <div class="footer">
    <div>Slide 3 / 7</div>
    <div>Swipe Next -></div>
  </div>
</div>

<!-- SLIDE 4 -->
<div class="slide">
  <div class="header">
    <div class="author">Ariya Sarrafzadeh</div>
    <div class="tag">Step 2</div>
  </div>
  <div class="content">
    <div class="hook-badge">Protocol Rule 2</div>
    <h1>3-Dimensional State Locks</h1>
    <p>A transaction is never complete until three independent states reach mathematical consensus:</p>
    <div class="card">
      <div class="card-title">The Triad Lock:</div>
      <div class="card-body">
        1. Upstream Switch Acknowledgement (MAC block)<br>
        2. Internal Double-Entry Wallet Ledger<br>
        3. Settlement Clearing Queue<br>
        If any dimension desyncs, trigger automated state lock immediately.
      </div>
    </div>
  </div>
  <div class="footer">
    <div>Slide 4 / 7</div>
    <div>Swipe Next -></div>
  </div>
</div>

<!-- SLIDE 5 -->
<div class="slide">
  <div class="header">
    <div class="author">Ariya Sarrafzadeh</div>
    <div class="tag">Step 3</div>
  </div>
  <div class="content">
    <div class="hook-badge">Protocol Rule 3</div>
    <h1>Automated Log Telemetry</h1>
    <p>Stop waiting for customer support tickets to report payment failures.</p>
    <div class="card">
      <div class="card-title">Deep-Log Tracing:</div>
      <div class="card-body">Parse raw switch events via custom Grok patterns in Prometheus & ELK. Slashed investigation latency from 3 business days down to under 3 minutes per flagged record.</div>
    </div>
  </div>
  <div class="footer">
    <div>Slide 5 / 7</div>
    <div>Swipe Next -></div>
  </div>
</div>

<!-- SLIDE 6 -->
<div class="slide">
  <div class="header">
    <div class="author">Ariya Sarrafzadeh</div>
    <div class="tag">Step 4</div>
  </div>
  <div class="content">
    <div class="hook-badge">Protocol Rule 4</div>
    <h1>The Judicial Golden Record</h1>
    <p>In 30,000 regulatory investigations, law enforcement demands proof, not opinions.</p>
    <div class="card">
      <div class="card-title">Forensic Invariants:</div>
      <div class="card-body">Every transaction must generate an immutable, court-ready cryptographic snapshot. Reduced judicial response time by 96% while keeping fraud rate below 0.01%.</div>
    </div>
  </div>
  <div class="footer">
    <div>Slide 6 / 7</div>
    <div>Swipe Next -></div>
  </div>
</div>

<!-- SLIDE 7 -->
<div class="slide">
  <div class="header">
    <div class="author">Ariya Sarrafzadeh</div>
    <div class="tag">Summary & Contact</div>
  </div>
  <div class="content">
    <div class="hook-badge">Summary</div>
    <h1>Zero-Defect Financial Integrity</h1>
    <p>Reliability in payments is not magic. It is rigorous operational boundaries and continuous telemetry.</p>
    <div class="card">
      <div class="card-title">Let's Connect:</div>
      <div class="card-body">
        <strong>Ariya Sarrafzadeh</strong><br>
        Senior Technical Product Manager & Systems Operator<br>
        15+ Years • 45M+ Users • Payment Switches & Reconciliation<br><br>
        <span class="highlight">ariasg2002@gmail.com</span> • linkedin.com/in/ariya-sarrafzadeh
      </div>
    </div>
  </div>
  <div class="footer">
    <div>Slide 7 / 7</div>
    <div>Follow for more Systems Architecture insights</div>
  </div>
</div>

</body>
</html>`;

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const context = browser.contexts()[0];
  const page = await context.newPage();
  await page.setContent(htmlContent, { waitUntil: 'load' });

  const pdfPath = '/home/aria/Downloads/CV/Linkdin files/the-midnight-ledger-leak-carousel.pdf';
  console.log('Rendering carousel PDF to:', pdfPath);

  await page.pdf({
    path: pdfPath,
    width: '1080px',
    height: '1350px',
    printBackground: true
  });

  await page.close();
  console.log('Carousel PDF successfully created!');
  console.log('File size:', fs.statSync(pdfPath).size, 'bytes');
  process.exit(0);
})();
