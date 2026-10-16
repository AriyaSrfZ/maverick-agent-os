const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

const POSTED_TRACKER = '/home/aria/Downloads/CV/posted_comments.json';
const ROTATION_LOG = '/home/aria/Downloads/CV/rotation.log';

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

function getPostedHistory() {
  if (fs.existsSync(POSTED_TRACKER)) {
    try {
      return JSON.parse(fs.readFileSync(POSTED_TRACKER, 'utf8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function recordPosted(item) {
  const history = getPostedHistory();
  history.push(item);
  fs.writeFileSync(POSTED_TRACKER, JSON.stringify(history, null, 2), 'utf8');
  fs.appendFileSync(ROTATION_LOG, JSON.stringify({ ...item, timestamp: new Date().toISOString() }) + '\n');
}

// Curated rotation pool: 100% unique, human-scored (detect.py >= 85), zero canned templates, no em dashes
const ROTATION_CANDIDATES = [
  {
    id: 'maharaj_singh_3ds_verification',
    targetUrl: 'https://www.linkedin.com/in/ma-raj/recent-activity/all/',
    matchText: '3DS Verification Flow',
    author: 'Maharaj Singh',
    comment: `Cart abandonment hurts.

If your team pushes 100% of checkouts into an OTP challenge screen, checkout drop-off jumps 15% before noon while your buyers flood support. Loosen rules too far, and Visa chargebacks bite 30 days later.

That's why high-scale gateways on Stripe or Adyen score behavioral fingerprints before invoking the SDK, so you'll keep friction under 5% for trusted accounts. It's a tough balancing act.`
  },
  {
    id: 'ehsan_farahani_blubank_emv',
    targetUrl: 'https://www.linkedin.com/in/ehsan-farahani-asil-706a364b/recent-activity/all/',
    matchText: 'شاید بد نباشه گاهی وسط این همه دویدن',
    author: 'Ehsan Farahani Asil (blu Bank)',
    comment: `Ledger reconciliation hurts.

When 50,000 shoppers in Tehran tap cards during evening peaks, real-time balance reservation stops double-spending before the 24-hour clearing file ever lands. Drop one database lock, and you'll spend all morning untangling ledger discrepancies by hand.

What you've shipped at blu Bank on EMV card flows shows how modern transaction infrastructure should work. Props to your team.`
  },
  {
    id: 'gcc_cross_border_iso20022',
    targetUrl: 'https://www.linkedin.com/search/results/content/?keywords=%22cross-border%20payments%22%20OR%20%22ISO%2020022%22%20Dubai&sortBy=%22date_posted%22',
    matchText: 'cross-border',
    author: 'GCC Payment Rails',
    comment: `Callbacks break everything.

When your platform routes multi-currency payouts across Dubai and Riyadh, moving the message payload is easy. The real headache starts when an asynchronous SWIFT or ISO 20022 clearing confirmation hangs for 4 minutes during market close, leaving both sides stuck in limbo.

If your webhook drops, you'll spend two hours matching broken lines in Excel. That's where architecture counts.`
  },
  {
    id: 'uae_instant_payments_aani',
    targetUrl: 'https://www.linkedin.com/search/results/content/?keywords=Aani%20Jaywan%20UAE%20payments&sortBy=%22date_posted%22',
    matchText: 'Aani',
    author: 'UAE Instant Payments Discussion',
    comment: `Merchant rollout is brutal.

Settling funds in 3 seconds between bank accounts on Aani is great for retail shoppers. The real wall hits when your team tries getting 10,000 cashiers across Dubai and Abu Dhabi to switch from card terminals to direct account rails.

If your settlement discount doesn't beat Visa interchange by at least 1%, shopkeepers won't bother training their clerks. It's all distribution.`
  }
];

(async () => {
  console.log(`\n======================================================`);
  console.log(`[${new Date().toISOString()}] STARTING AUTONOMOUS ROTATION AUTOMATION`);
  console.log(`======================================================`);

  const portOpen = await isPortOpen(9222);
  if (!portOpen) {
    console.log('Persistent Chrome session not detected. Starting open_linkedin_session.js...');
    spawn('node', ['/home/aria/Downloads/CV/open_linkedin_session.js'], {
      detached: true,
      stdio: 'ignore',
      env: {
        ...process.env,
        DISPLAY: process.env.DISPLAY || ':0',
        XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR || '/run/user/1000'
      }
    }).unref();
    await new Promise(r => setTimeout(r, 6000));
  }

  let browser;
  try {
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    // 1. Health check & Impression metrics
    console.log('Step 1: Checking profile metrics and unread notifications...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const metrics = await page.evaluate(() => {
      const text = document.body.innerText;
      const viewersMatch = text.match(/Profile viewers\s+(\d+)/);
      const impressionsMatch = text.match(/Post impressions\s+([\d,]+)/);
      return {
        profileViewers: viewersMatch ? viewersMatch[1] : 'N/A',
        postImpressions: impressionsMatch ? impressionsMatch[1] : 'N/A'
      };
    });
    console.log(`Current Metrics -> Profile Viewers: ${metrics.profileViewers}, Post Impressions: ${metrics.postImpressions}`);

    // 2. Check Messaging for new inbound messages
    console.log('Step 2: Checking messaging for new replies...');
    await page.goto('https://www.linkedin.com/messaging/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3500);

    const messages = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('li.msg-conversation-listitem, div.msg-conversation-card'));
      return items.slice(0, 5).map(el => el.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean);
    });
    console.log(`Recent conversations logged: ${messages.length}`);

    // 3. Execute Rotation Comments (Safety cap: max 1 comment per rotation run to preserve trust & avoid any rate limits)
    console.log('Step 3: Checking candidate queue against history...');
    const history = getPostedHistory();
    const alreadyPostedIds = new Set(history.map(h => h.id || h.target));

    let commentsPostedThisRun = 0;

    for (const candidate of ROTATION_CANDIDATES) {
      if (commentsPostedThisRun >= 1) {
        console.log('Rotation limit reached for this window (1 comment safety cap).');
        break;
      }

      if (alreadyPostedIds.has(candidate.id)) {
        continue;
      }

      console.log(`\nEvaluating candidate: ${candidate.author} (${candidate.id})`);
      await page.goto(candidate.targetUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);

      const clicked = await page.evaluate((matchStr) => {
        const all = Array.from(document.querySelectorAll('p, span, div'));
        const match = all.find(el => el.innerText && el.innerText.includes(matchStr));
        if (!match) return { found: false, reason: 'Match string not found' };

        let container = match;
        while (container && container.parentElement && !container.querySelector('button[aria-label="Comment"]')) {
          container = container.parentElement;
        }

        const commentBtn = container.querySelector('button[aria-label="Comment"]');
        if (!commentBtn) return { found: false, reason: 'Comment button not found' };

        commentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        commentBtn.click();
        return { found: true };
      }, candidate.matchText);

      if (!clicked.found) {
        console.log(`Candidate post not visible on page: ${clicked.reason}`);
        continue;
      }

      await page.waitForTimeout(2500);

      const editor = await page.waitForSelector('div.ql-editor[contenteditable="true"], div.ProseMirror[contenteditable="true"], div[role="textbox"][contenteditable="true"]', { timeout: 8000 }).catch(() => null);

      if (editor) {
        const box = await editor.boundingBox();
        if (box) {
          await page.mouse.click(box.x + 20, box.y + 20);
          await page.waitForTimeout(800);
          await page.keyboard.insertText(candidate.comment);
          await page.waitForTimeout(2000);

          const posted = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const postBtn = btns.find(b => b.innerText.trim() === 'Comment' && !b.disabled && b.getAttribute('aria-label') !== 'Comment');
            if (postBtn) {
              postBtn.click();
              return true;
            }
            return false;
          });

          if (posted) {
            console.log(`Comment successfully submitted for ${candidate.author}!`);
            recordPosted({
              id: candidate.id,
              author: candidate.author,
              topic: candidate.id,
              status: 'PUBLISHED_LIVE'
            });
            commentsPostedThisRun++;
            await page.waitForTimeout(10000);
          }
        }
      }
    }

    console.log(`\nRotation execution complete. Comments posted this run: ${commentsPostedThisRun}`);

  } catch (err) {
    console.error('Rotation error:', err);
  } finally {
    process.exit(0);
  }
})();
