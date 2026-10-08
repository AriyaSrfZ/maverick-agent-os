const { chromium } = require('playwright');
const fs = require('fs');

const networkComment = `True active-active looks great in boardrooms.

Production is brutal.

Spinning up duplicate infrastructure in Dubai and Abu Dhabi takes an afternoon. Keeping core balance ledgers synchronized across both data centers without tacking on 150ms of network latency to every card swipe is where engineering teams hit a brick wall. When an undersea fiber line drops, you get hit with a nightmare choice. You either stall checkout queues, or you risk double-charging customer accounts. That's why 85% of payment switches quietly stick with warm standby until regulators demand active-active compliance.

Real resilience isn't redundant servers. It's keeping your ledgers consistent when the network drops out.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('--- POSTING ON NETWORK INTERNATIONAL ---');
    await page.goto('https://www.linkedin.com/company/network-international/posts/?feedView=all', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('p, span, div'));
      const match = all.find(el => el.innerText && el.innerText.includes('Payment resilience is not a tech problem'));
      if (!match) return { found: false, reason: 'Snippet not found' };

      let container = match;
      while (container && container.parentElement && !container.querySelector('button[aria-label="Comment"]')) {
        container = container.parentElement;
      }

      const commentBtn = container.querySelector('button[aria-label="Comment"]');
      if (!commentBtn) return { found: false, reason: 'Comment button not found' };

      commentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      commentBtn.click();
      return { found: true };
    });

    console.log('Clicked comment button:', clicked);
    if (!clicked.found) throw new Error(clicked.reason);

    await page.waitForTimeout(2500);
    const editor = await page.waitForSelector('div.ql-editor[contenteditable="true"], div.ProseMirror[contenteditable="true"], div[role="textbox"][contenteditable="true"]', { timeout: 10000 });
    if (editor) {
      const box = await editor.boundingBox();
      if (box) {
        await page.mouse.click(box.x + 20, box.y + 20);
        await page.waitForTimeout(1000);
        await page.keyboard.insertText(networkComment);
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

        console.log('Network International comment submitted:', posted);
        await page.waitForTimeout(4000);

        const verified = await page.evaluate(() => {
          return document.body.innerText.includes('True active-active looks great in boardrooms');
        });
        console.log('Verified live on Network International post:', verified);

        if (verified) {
          const record = {
            target: 'Network International (Dubai)',
            topic: 'Active-Active Switches & Ledger Consistency',
            timestamp: new Date().toISOString(),
            status: 'PUBLISHED_LIVE'
          };
          fs.appendFileSync('/home/aria/Downloads/CV/rotation.log', JSON.stringify(record) + '\n');
        }
      }
    } else {
      console.error('Editor not found');
    }

  } catch (err) {
    console.error('Error on Network International post:', err);
  } finally {
    process.exit(0);
  }
})();
