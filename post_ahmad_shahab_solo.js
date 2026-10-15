const { chromium } = require('playwright');
const fs = require('fs');

const commentText = `Spot on.

That gap between authorization and settlement trips up so many new engineers.

You see a green approved signal on the terminal, but that only means Visa or Mastercard locked a hold on the buyer line. The real cash does not settle until the 24-hour clearing batch runs and interchange gets deducted. If your backend triggers an automatic refund while that 48-hour hold is still pending, you'll end up paying the customer twice out of your own reserve.

Clean breakdown, Ahmad.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('--- POSTING ON AHMAD SHAHAB (RECENT ACTIVITY) ---');
    await page.goto('https://www.linkedin.com/in/ahmadshahab-/recent-activity/all/', { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(4000);

    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('div, article, p, span'));
      const match = all.find(el => el.innerText && el.innerText.includes('A payment that says “approved” has not been paid'));
      if (!match) return { found: false, reason: 'Post snippet not found' };

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
        await page.waitForTimeout(800);
        await page.keyboard.insertText(commentText);
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

        console.log('Ahmad Shahab comment submitted:', posted);
        await page.waitForTimeout(4000);

        const verified = await page.evaluate(() => {
          return document.body.innerText.includes('Spot on.\n\nThat gap between authorization and settlement');
        });
        console.log('Verified live on Ahmad Shahab post:', verified);

        if (verified) {
          const record = {
            id: 'ahmad_shahab_auth_vs_settlement',
            author: 'Ahmad Shahab (Core Banking / Payments)',
            topic: 'Authorization vs settlement latency & double-refund risk',
            timestamp: new Date().toISOString(),
            status: 'PUBLISHED_LIVE'
          };
          fs.appendFileSync('/home/aria/Downloads/CV/rotation.log', JSON.stringify(record) + '\n');
          
          const historyPath = '/home/aria/Downloads/CV/posted_comments.json';
          const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
          history.push(record);
          fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
        }
      }
    } else {
      console.error('Editor not found');
    }

  } catch (err) {
    console.error('Error on Ahmad Shahab post:', err);
  } finally {
    process.exit(0);
  }
})();
