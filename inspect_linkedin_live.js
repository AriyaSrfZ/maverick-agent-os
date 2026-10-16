const { chromium } = require('playwright');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const context = browser.contexts()[0];
    const page = context.pages()[0] || await context.newPage();

    // 1. Extract Metrics & Notifications
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const feedData = await page.evaluate(() => {
      // Find analytics widgets
      const text = document.body.innerText;
      const viewersMatch = text.match(/(\d+)\s+profile views?/i) || text.match(/who viewed your profile\s*(\d+)/i);
      const impressionsMatch = text.match(/([\d,]+)\s+post impressions?/i);

      // Notification badge
      const notifBadge = document.querySelector('a[href*="/notifications"] .notification-badge__count, span.notification-badge-count');
      const unreadNotifs = notifBadge ? notifBadge.innerText.trim() : '0';

      return {
        viewers: viewersMatch ? viewersMatch[1] : null,
        impressions: impressionsMatch ? impressionsMatch[1] : null,
        unreadNotifs
      };
    });

    // 2. Fetch Notifications List
    await page.goto('https://www.linkedin.com/notifications/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const notifications = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('article.nt-item, div.nt-card-content, div.nt-item'));
      return items.slice(0, 7).map(item => {
        const text = item.innerText.replace(/\s+/g, ' ').trim();
        const time = item.querySelector('time')?.innerText || '';
        return { text: text.slice(0, 200), time };
      }).filter(n => n.text.length > 0);
    });

    // 3. Fetch Messaging threads
    await page.goto('https://www.linkedin.com/messaging/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const conversations = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('li.msg-conversation-listitem, div.msg-conversation-card'));
      return items.slice(0, 5).map(item => {
        const text = item.innerText.replace(/\s+/g, ' ').trim();
        const unread = !!item.querySelector('.msg-conversation-card__unread-count, .msg-unread-badge');
        return { preview: text.slice(0, 220), isUnread: unread };
      });
    });

    console.log(JSON.stringify({
      feedData,
      notifications,
      conversations
    }, null, 2));

  } catch (err) {
    console.error('Inspection error:', err.message);
  }
})();
