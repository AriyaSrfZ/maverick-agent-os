const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('=== 1. CHECKING NOTIFICATIONS ===');
    await page.goto('https://www.linkedin.com/notifications/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3500);

    const notifs = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('article.nt-card, div.notification-item, li.artdeco-list__item'));
      return items.slice(0, 10).map(el => el.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean);
    });
    console.log('Notifications:', JSON.stringify(notifs, null, 2));

    console.log('\n=== 2. CHECKING MESSAGING ===');
    await page.goto('https://www.linkedin.com/messaging/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3500);

    const convos = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('li.msg-conversation-listitem, div.msg-conversation-card'));
      return items.slice(0, 8).map(el => el.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean);
    });
    console.log('Conversations:', JSON.stringify(convos, null, 2));

    console.log('\n=== 3. SCANNING FEED FOR HIGH-IMPRESSION POSTS ===');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    // Scroll slightly to load posts
    await page.evaluate(() => window.scrollBy(0, 1200));
    await page.waitForTimeout(3000);

    const posts = await page.evaluate(() => {
      const updates = Array.from(document.querySelectorAll('div.feed-shared-update-v2, div[data-urn*="activity"]'));
      return updates.slice(0, 10).map((u, idx) => {
        const actorName = u.querySelector('.update-components-actor__name, .feed-shared-actor__name')?.innerText?.trim() || 'Unknown';
        const actorDesc = u.querySelector('.update-components-actor__description, .feed-shared-actor__description')?.innerText?.trim() || '';
        const postText = u.querySelector('.feed-shared-update-v2__description, .update-components-text')?.innerText?.replace(/\s+/g, ' ')?.trim() || '';
        const socialCounts = u.querySelector('.social-details-social-counts')?.innerText?.replace(/\s+/g, ' ')?.trim() || '';
        const urn = u.getAttribute('data-urn') || '';
        const link = u.querySelector('a[href*="/activity/"], a[href*="/feed/update/"]')?.getAttribute('href') || '';
        return {
          idx: idx + 1,
          author: actorName,
          title: actorDesc,
          socialCounts,
          urn,
          link,
          text: postText.slice(0, 400)
        };
      }).filter(p => p.text.length > 50);
    });

    console.log('Scanned Feed Posts:', JSON.stringify(posts, null, 2));

  } catch (err) {
    console.error('Check error:', err);
  } finally {
    process.exit(0);
  }
})();
