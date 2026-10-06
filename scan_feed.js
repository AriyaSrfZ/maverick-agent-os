const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('Navigating to LinkedIn Feed...');
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Extract top 5 posts from feed
  const feedPosts = await page.evaluate(() => {
    const postElements = Array.from(document.querySelectorAll('div.feed-shared-update-v2, div[data-urn*="urn:li:activity:"]'));
    return postElements.slice(0, 5).map((el, idx) => {
      const author = el.querySelector('.update-components-actor__name, .feed-shared-actor__name')?.innerText.trim() || 'Unknown';
      const headline = el.querySelector('.update-components-actor__description, .feed-shared-actor__description')?.innerText.trim() || '';
      const text = el.querySelector('.feed-shared-update-v2__description, .update-components-text')?.innerText.trim() || '';
      const urn = el.getAttribute('data-urn') || '';
      return { idx: idx + 1, author, headline, urn, text: text.slice(0, 600) };
    }).filter(p => p.text);
  });

  console.log('FEED POSTS SCANNED:', feedPosts.length);
  console.log(JSON.stringify(feedPosts, null, 2));

  // Check notifications
  await page.goto('https://www.linkedin.com/notifications/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  const notifs = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('article.nt-card, .notification-item'));
    return items.slice(0, 5).map(el => el.innerText.trim().replace(/\n+/g, ' '));
  });
  console.log('RECENT NOTIFICATIONS:', JSON.stringify(notifs, null, 2));

  process.exit(0);
})();
