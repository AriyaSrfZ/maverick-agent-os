const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Scroll down a bit to load 10 posts
  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => window.scrollBy(0, 1000));
    await page.waitForTimeout(1000);
  }

  const posts = await page.evaluate(() => {
    const text = document.body.innerText;
    return text.split('Feed post').slice(1, 8).map(chunk => {
      const lines = chunk.trim().split('\n').filter(l => l.trim().length > 0);
      return {
        header: lines.slice(0, 5).join(' | '),
        preview: lines.slice(5, 18).join('\n')
      };
    });
  });

  console.log('EXTRACTED ENGLISH FEED POSTS:');
  console.log(JSON.stringify(posts, null, 2));

  process.exit(0);
})();
