const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

const POST_4_CONTENT = `1,200 automated Slack alerts a day. Exactly zero of them caught our 0.03% ledger discrepancy.

When you scale transactional systems to 45 million accounts, naive alerting kills operational readiness.

Engineers start muting channels. PagerDuty notifications get acknowledged while people are half-asleep. The dashboard turns green, but customer complaints are already piling up at frontline support.

The mistake most teams make is monitoring infrastructure metrics instead of financial state boundaries.

CPU utilization, memory spikes, and HTTP 500 error rates tell you a server is struggling. They tell you nothing about whether an upstream banking switch silently dropped an asynchronous settlement callback.

We fixed our monitoring by deleting 70% of our noise alerts and enforcing three invariants:

1. Alert on state lock timeouts, not CPU load.
2. Parse raw transaction logs using custom Grok patterns to flag unmatched settlement states in under 3 minutes.
3. Every high-priority page must map to an automated remediation script or an exact 5-step incident SOP.

If an alert does not require an immediate, predefined operational decision, it belongs in a daily log summary, not a pager.

How does your team distinguish between harmless traffic spikes and silent settlement failures?`;

function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/json/version`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

(async () => {
  console.log(`\n======================================================`);
  console.log(`[${new Date().toISOString()}] STARTING MORNING LINKEDIN AUTOMATION FLOW`);
  console.log(`======================================================`);

  const portOpen = await isPortOpen(9222);
  if (!portOpen) {
    console.log('Chrome debugging session on port 9222 not detected. Starting persistent session...');
    spawn('node', ['/home/aria/Downloads/CV/open_linkedin_session.js'], {
      detached: true,
      stdio: 'ignore'
    }).unref();
    // Wait 5 seconds for browser to initialize
    await new Promise(r => setTimeout(r, 5000));
  }

  let browser;
  try {
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    // 1. Publish Post 4
    console.log('Step 1: Navigating to feed to publish Post 4...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const clickedStartPost = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button, div[role="button"]'));
      const btn = btns.find(b => b.innerText.trim().toLowerCase() === 'start a post' || (b.getAttribute('aria-label') || '').toLowerCase().includes('start a post'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Start a post:', clickedStartPost);
    await page.waitForTimeout(3000);

    const editor = await page.locator('div.editor-content[contenteditable="true"], div.ql-editor[contenteditable="true"], div[role="textbox"][contenteditable="true"]').first();
    await editor.focus();
    await page.waitForTimeout(500);

    console.log('Typing Post 4 content...');
    await page.keyboard.insertText(POST_4_CONTENT);
    await page.waitForTimeout(2000);

    const postClicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const postBtn = btns.reverse().find(b => {
        const text = b.innerText.trim();
        return text === 'Post' && !b.disabled;
      });
      if (postBtn) {
        postBtn.click();
        return true;
      }
      return false;
    });
    console.log('Clicked Post button:', postClicked);
    await page.waitForTimeout(5000);

    // 2. Check Inbox and log new messages
    console.log('\nStep 2: Checking inbox for new inbound conversations...');
    await page.goto('https://www.linkedin.com/messaging/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const inboxLog = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.msg-conversation-listitem, .msg-conversation-card'));
      return items.slice(0, 5).map(el => el.innerText.trim().replace(/\n+/g, ' '));
    });

    console.log('Top 5 inbox threads:\n', JSON.stringify(inboxLog, null, 2));

    const logPath = '/home/aria/Downloads/CV/Linkdin files/daily_run_audit.log';
    const logEntry = `\n[${new Date().toISOString()}] Post 4 published: ${postClicked} | Inbox checked: ${inboxLog.length} threads\n`;
    fs.appendFileSync(logPath, logEntry);

    console.log('Morning automation flow completed successfully!');
  } catch (err) {
    console.error('Error in morning automation flow:', err.message);
  } finally {
    process.exit(0);
  }
})();
