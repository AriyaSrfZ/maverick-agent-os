const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('Navigating to feed...');
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Take screenshot of feed top
  await page.screenshot({ path: '/home/aria/Downloads/CV/Linkdin files/feed_debug.png' });

  // Look for any comment button in the first post
  const result = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const commentBtn = btns.find(b => {
      const aria = b.getAttribute('aria-label') || '';
      return aria.toLowerCase().includes('comment') && !aria.toLowerCase().includes('notifications');
    });
    if (!commentBtn) return 'No comment button found';

    commentBtn.click();
    return { clicked: true, text: commentBtn.innerText, aria: commentBtn.getAttribute('aria-label') };
  });

  console.log('Comment button result:', result);
  await page.waitForTimeout(2000);

  // Take screenshot after click
  await page.screenshot({ path: '/home/aria/Downloads/CV/Linkdin files/feed_after_comment_click.png' });
  
  // Find what editable areas appeared
  const editables = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[contenteditable="true"], .ProseMirror, textarea'));
    return els.map(e => ({
      tag: e.tagName,
      className: e.className,
      ariaLabel: e.getAttribute('aria-label')
    }));
  });
  console.log('Editables after comment click:', JSON.stringify(editables, null, 2));

  process.exit(0);
})();
