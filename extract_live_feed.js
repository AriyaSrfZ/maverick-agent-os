const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    const posts = await page.evaluate(() => {
      const commentBtns = Array.from(document.querySelectorAll('button[aria-label="Comment"], button[aria-label*="Comment"]'));
      
      return commentBtns.map((btn, idx) => {
        // Find parent container that represents the full post card
        let container = btn;
        let count = 0;
        while (container && container.parentElement && count < 15) {
          container = container.parentElement;
          count++;
          // A post container typically has substantial text
          if (container.innerText && container.innerText.length > 200 && container.querySelector('button[aria-label="Like"], button[aria-label*="Like"]')) {
            break;
          }
        }

        const text = container ? container.innerText.replace(/\s+/g, ' ').trim() : '';
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

        return {
          idx: idx + 1,
          fullSnippet: text.slice(0, 500),
          length: text.length
        };
      });
    });

    console.log(`Found ${posts.length} feed posts:`);
    posts.forEach(p => {
      console.log(`\n--- Post #${p.idx} (length ${p.length}) ---`);
      console.log(p.fullSnippet);
    });

  } catch (err) {
    console.error('Extraction error:', err);
  } finally {
    process.exit(0);
  }
})();
