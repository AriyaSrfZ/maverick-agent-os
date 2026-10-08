const { chromium } = require('playwright');

const alexComment = `Network timeouts are brutal on automated payments.

If checkout stalls, a person waits a few seconds. A script hits a 504 and fires off three retries immediately. If the card processor was just running slow, that one order suddenly turns into multiple pending charges.

Writing the protocol spec is the fun part. Handling flaky connections so a customer is never billed twice is where things get messy.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('--- 2. POSTING ON ALEX XU ---');
    await page.goto('https://www.linkedin.com/in/alex-xu-a8131b11/recent-activity/all/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('p, span, div'));
      const match = all.find(el => el.innerText && el.innerText.includes('How AI Agents Pay'));
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

    console.log('Clicked comment button on Alex Xu post:', clicked);
    if (!clicked.found) throw new Error(clicked.reason);

    await page.waitForTimeout(2500);

    const editor = await page.$('div.ProseMirror[contenteditable="true"]');
    if (editor) {
      const box = await editor.boundingBox();
      if (box) {
        await page.mouse.click(box.x + 20, box.y + 20);
        await page.waitForTimeout(500);
        await page.keyboard.insertText(alexComment);
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

        console.log('Alex Xu comment submitted:', posted);
        await page.waitForTimeout(3000);

        const verified = await page.evaluate(() => {
          return document.body.innerText.includes('Network timeouts are brutal on automated payments');
        });
        console.log('Verified live on Alex Xu post:', verified);
      }
    }

  } catch (err) {
    console.error('Error on Alex Xu post:', err);
  } finally {
    process.exit(0);
  }
})();
