const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('Navigating to feed...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);

    const info = await page.evaluate(() => {
      // Find classes of major containers
      const divs = Array.from(document.querySelectorAll('main div'));
      const sampleClasses = divs.slice(0, 30).map(d => d.className).filter(Boolean);

      // Check for feed updates
      const posts = Array.from(document.querySelectorAll('[data-urn], [data-id], .feed-shared-update-v2, .feed-shared-update'));
      
      // Look for text snippets in main
      const mainText = document.querySelector('main')?.innerText?.slice(0, 1000) || '';

      return {
        url: window.location.href,
        title: document.title,
        postCount: posts.length,
        postUrns: posts.slice(0, 5).map(p => p.getAttribute('data-urn') || p.getAttribute('data-id') || p.className),
        mainTextSnippet: mainText
      };
    });

    console.log('DOM Info:', JSON.stringify(info, null, 2));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit(0);
  }
})();
