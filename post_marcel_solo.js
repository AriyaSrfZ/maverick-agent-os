const { chromium } = require('playwright');
const fs = require('fs');

const marcelComment = `Flipping a toggle inside Coinbase or Yuno takes 5 minutes. That's the easy part.

When you look downstream, the real bottleneck is treasury reconciliation. If you pull in 15% of your volume in USDC, your ERP like SAP or NetSuite still has to match every single ticket against a fiat bank statement. When currency conversion rates fluctuate by even 0.5% between settlement and accounting close, your finance team won't just let it slide. They get stuck doing manual adjustments for hours.

Until back-office ledgers automate line-item matching out of the box, CFOs won't treat this as a standard checkout option.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('--- POSTING ON MARCEL VAN OOST ---');
    await page.goto('https://www.linkedin.com/in/marcelvanoost/recent-activity/all/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('p, span, div'));
      const match = all.find(el => el.innerText && el.innerText.includes('Yuno just made stablecoin checkout'));
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

    await page.waitForTimeout(3000);
    const editor = await page.waitForSelector('div[aria-label="Text editor for creating comment"], div.ProseMirror', { timeout: 10000 });
    if (editor) {
      const box = await editor.boundingBox();
      if (box) {
        await page.mouse.click(box.x + 20, box.y + 20);
        await page.waitForTimeout(1000);
        await page.keyboard.insertText(marcelComment);
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

        console.log('Marcel comment submitted:', posted);
        await page.waitForTimeout(4000);

        const verified = await page.evaluate(() => {
          return document.body.innerText.includes('Until back-office ledgers automate line-item matching');
        });
        console.log('Verified live on Marcel van Oost post:', verified);

        if (verified) {
          const record = {
            target: 'Marcel van Oost',
            topic: 'Stablecoin Checkout & Treasury Reconciliation',
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
    console.error('Error on Marcel post:', err);
  } finally {
    process.exit(0);
  }
})();
