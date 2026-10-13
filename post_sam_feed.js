const { chromium } = require('playwright');
const fs = require('fs');

const samComment = `That 400ms window is where the real engineering lives.

Querying a fiat ledger in real time is a solved problem. But USDC balance sits on-chain, and the processor can't just read it and move on. During those 400 milliseconds, it also needs to lock an FX conversion rate, deduct the fee, and settle the merchant in a different denomination, all without touching the cardholder experience. What Rain and Reap built is essentially a live bridge for that entire stack.

The next pressure point? Running all of that reliably when transaction throughput jumps 5x during a volatility spike. That's where you'll really see who built it properly.

Great breakdown, Sam.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('--- POSTING ON SAM BOBOEV FROM FEED ---');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    for (let i = 0; i < 4; i++) {
      await page.evaluate(() => window.scrollBy(0, 1000));
      await page.waitForTimeout(1500);
    }

    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('p, span, div'));
      const match = all.find(el => el.innerText && el.innerText.includes('How stablecoin cards are turning a crypto-native asset'));
      if (!match) return { found: false, reason: 'Snippet not found on feed' };

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

    console.log('Clicked comment button on feed:', clicked);
    if (!clicked.found) throw new Error(clicked.reason);

    await page.waitForTimeout(2500);

    const editor = await page.waitForSelector('div.ql-editor[contenteditable="true"], div.ProseMirror[contenteditable="true"], div[role="textbox"][contenteditable="true"]', { timeout: 10000 });
    if (editor) {
      const box = await editor.boundingBox();
      if (box) {
        await page.mouse.click(box.x + 20, box.y + 20);
        await page.waitForTimeout(800);
        await page.keyboard.insertText(samComment);
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

        console.log('Sam Boboev comment submitted:', posted);
        await page.waitForTimeout(4000);

        const verified = await page.evaluate(() => {
          return document.body.innerText.includes('That 400ms window is where the real engineering lives');
        });
        console.log('Verified live on Sam Boboev post:', verified);

        if (verified) {
          const record = {
            id: 'sam_boboev_stablecoin_cards',
            author: 'Sam Boboev (Fintech Wrap Up)',
            topic: 'Stablecoin card authorization latency & FX settlement bridge',
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
    console.error('Error on Sam Boboev post:', err);
  } finally {
    process.exit(0);
  }
})();
