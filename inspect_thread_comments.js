const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('Navigating to feed to locate Michael Erhard post...');
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Find Michael Erhard post comments
  const erhardData = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const erhardSpan = all.find(e => e.children.length === 0 && e.innerText && e.innerText.includes('Michael Erhard'));
    if (!erhardSpan) return null;

    let container = erhardSpan;
    while (container && container !== document.body) {
      if (container.innerText && container.innerText.includes('Because humans hire humans')) {
        break;
      }
      container = container.parentElement;
    }

    // click comment button if needed
    const commentBtn = Array.from(container.querySelectorAll('button')).find(b => b.getAttribute('aria-label') && b.getAttribute('aria-label').includes('Comment'));
    if (commentBtn) commentBtn.click();

    return { found: true };
  });

  console.log('Erhard post comment button clicked:', erhardData);
  await page.waitForTimeout(3000);

  // Extract comments
  const comments = await page.evaluate(() => {
    const commentItems = Array.from(document.querySelectorAll('.comments-comment-item, .comment-item, article[class*=\"comment\"]'));
    return commentItems.slice(0, 10).map(c => {
      const author = c.querySelector('.comments-post-meta__name-text, a[href*=\"/in/\"]')?.innerText.trim() || 'Author';
      const text = c.querySelector('.comments-comment-item__main-content, .feed-shared-main-content')?.innerText.trim() || c.innerText.trim();
      return { author, text: text.slice(0, 300) };
    });
  });

  console.log('TOP COMMENTS EXTRACTED FROM ERHARD THREAD:');
  console.log(JSON.stringify(comments, null, 2));

  process.exit(0);
})();
