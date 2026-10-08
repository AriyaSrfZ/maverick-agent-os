const { chromium } = require('playwright');
const fs = require('fs');

const mahmoudComment = `That KD 2.6 billion corridor tells the whole story.

WAMD is blazing fast. It's a closed loop. The Central Bank clears dinars between local banks in 3 seconds flat. But the minute money heads toward Cairo, Dhaka, or Manila, speed dies. Why? You aren't just moving bytes between accounts. You're dealing with pre-funded nostro balances, FX conversion spreads, and physical cash pickup spots across local exchange houses.

APIs can link up tomorrow. Without joint bilateral liquidity pools, local exchange branches will keep owning 70% of that flow.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('--- POSTING ON MAHMOUD ISMAIL ---');
    await page.goto('https://www.linkedin.com/in/mahmoudismailo/recent-activity/all/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('p, span, div'));
      const match = all.find(el => el.innerText && el.innerText.includes('WAMD real-time payment system'));
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
    const editor = await page.waitForSelector('div[aria-label="Text editor for creating comment"], div.ProseMirror', { timeout: 10000 });
    if (editor) {
      const box = await editor.boundingBox();
      if (box) {
        await page.mouse.click(box.x + 20, box.y + 20);
        await page.waitForTimeout(1000);
        await page.keyboard.insertText(mahmoudComment);
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

        console.log('Mahmoud comment submitted:', posted);
        await page.waitForTimeout(4000);

        const verified = await page.evaluate(() => {
          return document.body.innerText.includes('That KD 2.6 billion corridor tells the whole story');
        });
        console.log('Verified live on Mahmoud Ismail post:', verified);

        if (verified) {
          const record = {
            target: 'Mahmoud Ismail',
            topic: 'Kuwait WAMD vs Cross-Border Remittances',
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
    console.error('Error on Mahmoud post:', err);
  } finally {
    process.exit(0);
  }
})();
