const { chromium } = require('playwright');
const fs = require('fs');

const sidharthComment = `Exciting expansion for Dubai.

Watching Airwallex scale local settlement infrastructure across the UAE is huge. Managing multi-currency liquidity while staying aligned with CBUAE rules takes real grit, especially when daily transaction volume spikes 40% over holidays. That's never an easy balancing act.

Hope you land someone stellar for the team, Sidharth.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('--- POSTING ON SIDHARTH KUMAR ---');
    await page.goto('https://www.linkedin.com/search/results/content/?keywords=fintech%20dubai&sortBy=%22relevance%22', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('p, span, div'));
      const match = all.find(el => el.innerText && el.innerText.includes('Airwallex is growing in the UAE and we\'re looking for a Risk Manager'));
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
        await page.waitForTimeout(800);
        await page.keyboard.insertText(sidharthComment);
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

        console.log('Sidharth comment submitted:', posted);
        await page.waitForTimeout(4000);

        const verified = await page.evaluate(() => {
          return document.body.innerText.includes('Exciting expansion for Dubai');
        });
        console.log('Verified live on Sidharth Kumar post:', verified);

        if (verified) {
          const record = {
            id: 'sidharth_kumar_airwallex_dubai',
            author: 'Sidharth Kumar (Airwallex)',
            topic: 'Airwallex expansion in Dubai & UAE risk/settlement rails',
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
    console.error('Error on Sidharth post:', err);
  } finally {
    process.exit(0);
  }
})();
