const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

const PUBLISHED_TRACKER = '/home/aria/Downloads/CV/Linkdin files/published_posts.json';

const POSTS_QUEUE = [
  {
    id: 'post_4_monitoring_alerts',
    content: `1,200 automated Slack alerts a day. Exactly zero of them caught our 0.03% ledger discrepancy.

When you scale transactional systems to 45 million accounts, naive alerting kills operational readiness.

Engineers start muting channels. PagerDuty notifications get acknowledged while people are half-asleep. The dashboard turns green, but customer complaints are already piling up at frontline support.

The mistake most teams make is monitoring infrastructure metrics instead of financial state boundaries.

CPU utilization, memory spikes, and HTTP 500 error rates tell you a server is struggling. They tell you nothing about whether an upstream banking switch silently dropped an asynchronous settlement callback.

We fixed our monitoring by deleting 70% of our noise alerts and enforcing three invariants:

1. Alert on state lock timeouts, not CPU load.
2. Parse raw transaction logs using custom Grok patterns to flag unmatched settlement states in under 3 minutes.
3. Every high-priority page must map to an automated remediation script or an exact 5-step incident SOP.

If an alert does not require an immediate, predefined operational decision, it belongs in a daily log summary, not a pager.

How does your team distinguish between harmless traffic spikes and silent settlement failures?`
  },
  {
    id: 'post_5_payment_ingress_resilience',
    content: `Upstream banking switches will drop packets without warning. Core payment gateways will throttle your webhooks during evening peak spikes.

The question isn't whether your payment rails face network failure. It's whether your architecture allows those failures to turn into duplicate charges.

When an upstream switch hangs mid-flight, naive payment systems do one of two things: they fail silently leaving customers charged without credits, or they trigger unmetered client retries that hit the banking API twice.

We eliminated duplicate charges across 45 million accounts by enforcing three ingress patterns:

1. Distributed Idempotency Locks: Every checkout request carries a unique UUID enforced via Redis SETNX before any downstream routing begins. If a mobile app retries mid-timeout, it hits the lock and waits.

2. Asynchronous State Fallbacks: If an upstream banking host takes longer than 3,500ms to return an ISO 8583 settlement code, we reject early and queue an automated reverse query rather than hanging client threads.

3. Automated Ingress Circuit Breakers: When an acquirer error rate exceeds 2% over a 60-second sliding window, our gateway dynamically diverts transaction volume to our backup PSP switch in under 200ms.

Resilience is not hoping upstream partners never fail. It is architecting your system so their downtime never becomes your balance discrepancy.

How does your gateway handle upstream banking timeouts during peak traffic?`
  },
  {
    id: 'post_6_elasticsearch_telemetry',
    content: `We queried 4.2 petabytes of transactional logs in 840 milliseconds. It almost killed our cluster first.

When your team indexes 50 million messages a month for customer segmentation, naive queries choke fast. Memory spikes. Garbage collection freezes worker nodes. Suddenly, query threads back up until your dashboard crashes before noon.

It's a brutal operational wall.

The mistake most teams make is treating Elasticsearch like an SQL database with a search box.

If you don't design your shard layout around write velocity, queries will scan cold historical chunks while live ingestion chokes on index locks. That's how outages start.

Here is how we stabilized our search cluster:

1. Time-based lifecycle management. Hot data sits on NVMe SSD nodes with aggressive write buffers. Anything older than 30 days rolls over to compressed warm storage automatically.

2. Routing by tenant hash. We route queries by account ID rather than broadcasting requests across 40 shards. That cut CPU utilization by 64% during peak runs.

3. Inverted index pruning. We stripped full-text analyzers from immutable fields like phone hashes and transaction timestamps. Plain keyword filters took over.

Your search cluster should never fight live transactional writes for disk I/O. It's that simple.

Are you querying high-scale telemetry directly from relational tables or running dedicated document clusters?`
  },
  {
    id: 'post_7_fraud_investigations_sla',
    content: `In July 2019, our fraud reporting backlog sat at 3 working days per case.

That's an eternity.

When organized fraud syndicates hit an e-commerce platform with 45 million registered users, stolen balances wash through multi-tier mule cards in 15 minutes. By the time an investigator opens a spreadsheet, the cash is gone.

I spent seven years handling technical liaison across 30,000 judicial fraud investigations. Sitting across the table from investigators taught me what standard Product Management books never cover.

Regulatory inquiries don't get resolved by writing longer SOPs. They get resolved by giving frontline teams real-time forensic telemetry.

We tore down the manual paper trail:

1. Automated database log extraction. Instead of filing tickets with DBAs, our engine compiled card hops automatically.

2. Court-ready audit chains. Rule-based tracing produced forensic golden records in under 180 seconds.

3. Slashing inquiry latency by 96%. We dropped response times from 3 business days down to under 3 hours per incident.

Our platform fraud rate held below 0.01% while resolving over 98% of inquiries. It kept our rails clean.

When an incident hits your payment rails, what's your team's actual time to first evidence?`
  }
];

function getPublishedPosts() {
  if (fs.existsSync(PUBLISHED_TRACKER)) {
    try {
      return JSON.parse(fs.readFileSync(PUBLISHED_TRACKER, 'utf8'));
    } catch (e) {
      return [];
    }
  }
  return [];
}

function recordPublishedPost(id) {
  const history = getPublishedPosts();
  if (!history.includes(id)) {
    history.push(id);
    fs.writeFileSync(PUBLISHED_TRACKER, JSON.stringify(history, null, 2), 'utf8');
  }
}

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
      stdio: 'ignore',
      env: {
        ...process.env,
        DISPLAY: process.env.DISPLAY || ':0',
        XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR || '/run/user/1000'
      }
    }).unref();
    // Wait 5 seconds for browser to initialize
    await new Promise(r => setTimeout(r, 5000));
  }

  let browser;
  try {
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    // 1. Publish Next Scheduled Post
    const published = getPublishedPosts();
    const candidate = POSTS_QUEUE.find(p => !published.includes(p.id));

    if (!candidate) {
      console.log('All scheduled queue posts have already been published. Skipping publication step.');
    } else {
      console.log(`Step 1: Navigating to feed to publish ${candidate.id}...`);
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

      console.log(`Typing ${candidate.id} content...`);
      await page.keyboard.insertText(candidate.content);
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
      if (postClicked) {
        recordPublishedPost(candidate.id);
        const logPath = '/home/aria/Downloads/CV/Linkdin files/daily_run_audit.log';
        fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] ${candidate.id} published: true\n`);
      }
      await page.waitForTimeout(5000);
    }

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
