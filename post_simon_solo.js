const { chromium } = require('playwright');

const simonComment = `Catalog discovery over OAuth is straightforward. The real test is letting an automated buyer trigger a live transaction on Shopify.

When a checkout page freezes, people pause. Automated agents retry. If a connection drops right as the gateway attempts a charge, you easily end up with duplicate authorizations and customer disputes.

Standard protocols are a great first step, but preventing accidental double-charges is where the hard engineering sits.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('--- 1. POSTING ON SIMON TAYLOR ---');
    await page.goto('https://www.linkedin.com/in/sytaylor/recent-activity/all/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const simonPostFound = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('p, span, div'));
      const match = all.find(el => el.innerText && (el.innerText.includes('Personal Agent Protocol') || el.innerText.includes('Meta and Sierra just published')));
      if (!match) return { found: false };

      let container = match;
      while (container && container.parentElement && !container.querySelector('button[aria-label="Comment"]')) {
        container = container.parentElement;
      }

      const commentBtn = container.querySelector('button[aria-label="Comment"]');
      if (!commentBtn) return { found: false, reason: 'No comment btn' };

      commentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      commentBtn.click();
      return { found: true };
    });

    console.log('Simon post clicked comment:', simonPostFound);
    if (simonPostFound.found) {
      await page.waitForTimeout(2500);

      const editor = await page.$('div.ProseMirror[contenteditable="true"]');
      if (editor) {
        const box = await editor.boundingBox();
        if (box) {
          await page.mouse.click(box.x + 20, box.y + 20);
          await page.waitForTimeout(500);
          await page.keyboard.insertText(simonComment);
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
          console.log('Simon comment submitted:', posted);
          await page.waitForTimeout(3000);
        }
      }
    }

  } catch (err) {
    console.error('Error on Simon post:', err);
  } finally {
    process.exit(0);
  }
})();
