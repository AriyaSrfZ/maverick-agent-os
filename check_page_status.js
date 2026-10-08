const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('--- CHECKING NOTIFICATIONS ---');
    await page.goto('https://www.linkedin.com/notifications/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const notifs = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('article.nt-card, div.notification-item, li.artdeco-list__item, div[data-ch-notification-action]'));
      return items.slice(0, 15).map(el => el.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean);
    });

    notifs.forEach((n, idx) => console.log(`[Notif ${idx + 1}] ${n}`));

    console.log('\n--- CHECKING MESSAGING ---');
    await page.goto('https://www.linkedin.com/messaging/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const convos = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('li.msg-conversation-listitem, div.msg-conversation-card, div.msg-conversations-container__convo-item'));
      return items.slice(0, 15).map(el => el.innerText.replace(/\s+/g, ' ').trim()).filter(Boolean);
    });

    convos.forEach((c, idx) => console.log(`[Convo ${idx + 1}] ${c}`));

    console.log('\n--- CHECKING RECENT POSTS / ACTIVITY ---');
    await page.goto('https://www.linkedin.com/in/ariya-sarrafzadeh/recent-activity/all/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const posts = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('div.feed-shared-update-v2, div[data-urn*="activity"]'));
      return items.slice(0, 3).map(el => {
        const text = el.innerText.replace(/\s+/g, ' ').trim();
        return text.slice(0, 250);
      });
    });

    posts.forEach((p, idx) => console.log(`[Post ${idx + 1}] ${p}`));

  } catch (err) {
    console.error('Error during check:', err);
  } finally {
    process.exit(0);
  }
})();
