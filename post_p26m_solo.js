const { chromium } = require('playwright');

const p26mComment = `Demos always look clean until the first real network outage hits.

It's easy to show off smart routing when every bank is fast and green. But when an acquirer stalls for 10 seconds, drops the connection, and the webhook callback is lost, basic setups freeze balances or bill the customer twice. Auditing those discrepancies in spreadsheets costs days of operational fire-fighting.

Testing failure states under pressure is the only demo that actually matters.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('--- 3. POSTING ON P26M ---');
    await page.goto('https://www.linkedin.com/search/results/content/?keywords=payment%20orchestration', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('p, span, div'));
      const match = all.find(el => el.innerText && el.innerText.includes('Payment orchestration software can look impressive'));
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

    console.log('Clicked comment button on P26M post:', clicked);
    if (!clicked.found) throw new Error(clicked.reason);

    await page.waitForTimeout(2500);

    const editor = await page.$('div.ProseMirror[contenteditable="true"]');
    if (editor) {
      const box = await editor.boundingBox();
      if (box) {
        await page.mouse.click(box.x + 20, box.y + 20);
        await page.waitForTimeout(500);
        await page.keyboard.insertText(p26mComment);
        await page.waitForTimeout(1500);

        const posted = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const postBtn = btns.find(b => b.innerText.trim() === 'Comment' && !b.disabled && b.getAttribute('aria-label') !== 'Comment');
          if (postBtn) {
            postBtn.click();
            return true;
          }
          return false;
        });

        console.log('P26M comment submitted:', posted);
        await page.waitForTimeout(3000);

        const verified = await page.evaluate(() => {
          return document.body.innerText.includes('Demos always look clean until the first real network outage hits');
        });
        console.log('Verified live on P26M post?', verified);
      }
    }

  } catch (err) {
    console.error('Error on P26M post:', err);
  } finally {
    process.exit(0);
  }
})();
