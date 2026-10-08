const { chromium } = require('playwright');

const searchQueries = [
  'https://www.linkedin.com/search/results/content/?keywords=%22payment%20rails%22%20OR%20%22core%20banking%22%20OR%20%22payment%20gateway%22&sortBy=%22date_posted%22',
  'https://www.linkedin.com/search/results/content/?keywords=%22technical%20product%20manager%22%20OR%20%22solutions%20architect%22%20fintech&sortBy=%22date_posted%22'
];

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    const discoveredPosts = [];

    for (const searchUrl of searchQueries) {
      console.log('\nSearching URL:', searchUrl);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);

      const items = await page.evaluate(() => {
        const updates = Array.from(document.querySelectorAll('div.feed-shared-update-v2, div[data-urn*="activity"]'));
        return updates.slice(0, 8).map(u => {
          const author = u.querySelector('.update-components-actor__name, .feed-shared-actor__name')?.innerText?.trim() || 'Unknown';
          const title = u.querySelector('.update-components-actor__description, .feed-shared-actor__description')?.innerText?.trim() || '';
          const text = u.querySelector('.feed-shared-update-v2__description, .update-components-text')?.innerText?.replace(/\s+/g, ' ')?.trim() || '';
          const reactions = u.querySelector('.social-details-social-counts')?.innerText?.replace(/\s+/g, ' ')?.trim() || '';
          const link = u.querySelector('a[href*="/activity/"], a[href*="/feed/update/"]')?.getAttribute('href') || '';
          return {
            author,
            title,
            reactions,
            link,
            snippet: text.slice(0, 350)
          };
        }).filter(item => item.snippet.length > 80 && !item.snippet.includes('Promoted') && !item.snippet.includes('hiring'));
      });

      console.log(`Found ${items.length} candidates from query`);
      discoveredPosts.push(...items);
      await page.waitForTimeout(2000);
    }

    console.log('\n=== DISCOVERED CANDIDATES ===');
    console.log(JSON.stringify(discoveredPosts.slice(0, 8), null, 2));

  } catch (err) {
    console.error('Search error:', err);
  } finally {
    process.exit(0);
  }
})();
