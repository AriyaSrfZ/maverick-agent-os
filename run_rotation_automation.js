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

// Curated rotation pool: warm, friendly, peer-to-peer tone (no stiff academic jargon, no em dashes, zero narcissism)
const ROTATION_CANDIDATES = [
  {
    id: 'ali_khangholi_senior_promotion',
    targetUrl: 'https://www.linkedin.com/in/alikhangholi/recent-activity/all/',
    matchText: 'promoted to Senior Frontend Engineer at DigiPay',
    author: 'Ali Khangholi (DigiPay)',
    comment: `Well deserved, Ali.

Keeping checkout latency under 200ms across 40 million transactions on DigiPay is no small feat. That's why your work on frontend state resilience matters so much when unreliable 3G connections drop in the middle of a payment.

Huge congrats. You've earned this win, so make sure you celebrate properly with the Tehran team.`
  },
  {
    id: 'maharaj_singh_3ds_verification',
    targetUrl: 'https://www.linkedin.com/in/ma-raj/recent-activity/all/',
    matchText: '3DS Verification Flow',
    author: 'Maharaj Singh',
    comment: `Spot on, Maharaj.

Balancing authentication friction against checkout drop-off is where payment engineering gets messy.

If you push 100% of checkouts through challenge screens, conversion plummets 15% immediately while customers abandon their carts. Dial back the fraud thresholds too far, and chargeback disputes spike 30 days later across your merchant accounts.

That's why dynamic risk checks before invoking the SDK save so many headaches. Really sharp breakdown.`
  },
  {
    id: 'ehsan_farahani_blubank_emv',
    targetUrl: 'https://www.linkedin.com/in/ehsan-farahani-asil-706a364b/recent-activity/all/',
    matchText: 'شاید بد نباشه گاهی وسط این همه دویدن',
    author: 'Ehsan Farahani Asil (blu Bank)',
    comment: `Spot on, Ehsan.

Moving card issuing from legacy core banking systems to modern ledger services completely transforms checkout speed.

When 50,000 customers tap their cards during peak holiday hours in Tehran, real-time balance reservation prevents overdrafts before the 24-hour clearing batch ever lands. You've got to protect both the merchant and the cardholder simultaneously, and that's never simple when regional telecom pipes drop.

Terrific work from the blu team.`
  },
  {
    id: 'karthik_j_cross_border_orchestration',
    targetUrl: 'https://www.linkedin.com/feed/',
    matchText: 'Cross-border payments are not a money movement problem',
    author: 'Karthik J. (ProgressSoft)',
    comment: `Layer 5 is definitely the headache.

Fast messaging is great. But when an asynchronous SWIFT or ISO 20022 callback drops, that's where teams hit a wall. If a regional clearing switch stalls for just 3 seconds, your ops folks end up reconciling unmatched lines by hand over coffee for 2 hours the next morning.

Connecting pipes looks neat on paper. Smoothing out those messy edge cases is where you actually win customer trust.`
  },
  {
    id: 'sidharth_kumar_airwallex_dubai',
    targetUrl: 'https://www.linkedin.com/search/results/content/?keywords=fintech%20dubai&sortBy=%22relevance%22',
    matchText: 'Airwallex is growing in the UAE and we\'re looking for a Risk Manager',
    author: 'Sidharth Kumar (Airwallex)',
    comment: `Exciting expansion for Dubai.

Watching Airwallex scale local settlement infrastructure across the UAE is huge. Managing multi-currency liquidity while staying aligned with CBUAE rules takes real grit, especially when daily transaction volume spikes 40% over holidays. That's never an easy balancing act.

Hope you land someone stellar for the team, Sidharth.`
  },
  {
    id: 'gcc_embedded_finance_warm',
    targetUrl: 'https://www.linkedin.com/search/results/content/?keywords=%22embedded%20finance%22%20OR%20%22BaaS%22%20GCC&sortBy=%22relevance%22',
    matchText: 'embedded finance',
    author: 'GCC FinTech Discussion',
    comment: `Embedded finance looks so simple on the surface.

You drop in a slick SDK and checkout feels seamless. But when non-bank platforms start moving volume, handling 24-hour settlement reconciliations across legacy core banking ledgers gets tricky fast. Without automated line-item reconciliation, teams end up spending half their day matching discrepancies.

Always love seeing more builders tackle the back-office side of this in the region.`
  },
  {
    id: 'payment_gateway_retries_friendly',
    targetUrl: 'https://www.linkedin.com/search/results/content/?keywords=%22payment%20gateway%22%20timeout%20retries&sortBy=%22relevance%22',
    matchText: 'payment',
    author: 'Payment Systems Engineering',
    comment: `Overly eager retry logic can really bite you.

When an upstream card switch takes 4 seconds to respond, an impatient gateway timeout fires off a duplicate payment request. If the first charge went through, the poor customer wakes up to two debits. Handling edge-case network drops with smart request deduplication saves far more headaches than chasing raw latency numbers.

Curious how your team handles gateway timeouts during regional traffic spikes?`
  },
  {
    id: 'open_banking_uae_aani',
    targetUrl: 'https://www.linkedin.com/search/results/content/?keywords=Aani%20Jaywan%20UAE%20payments&sortBy=%22relevance%22',
    matchText: 'Aani',
    author: 'UAE Instant Payments Discussion',
    comment: `Aani and Jaywan are genuinely transforming local payments in the UAE.

Settling funds in 3 seconds between local bank accounts is fantastic for everyday consumers. The exciting next phase is watching merchant POS terminals and online checkouts adopt it as a default rail instead of expensive card rails.

Really exciting times for the UAE payments landscape.`
  },
  {
    id: 'fintech_risk_fraud_prevention',
    targetUrl: 'https://www.linkedin.com/search/results/content/?keywords=%22fraud%20prevention%22%20fintech%20payments&sortBy=%22relevance%22',
    matchText: 'fraud',
    author: 'FinTech Risk & Fraud Community',
    comment: `Balancing friction against fraud prevention is always an art.

Toughen up rules too much, and legitimate buyers abandon cart after 3 failed OTPs. Loosen them up, and chargeback disputes start rolling in 30 days later. Giving fraud teams real-time behavioral context without slowing checkout response times is where the real craft shows.

Always great to see discussions around keeping customers safe without killing conversion.`
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
      stdio: 'ignore'
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
