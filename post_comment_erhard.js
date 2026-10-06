const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('Navigating to LinkedIn feed to find Michael Erhard post...');
  await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Scroll to locate Michael Erhard
  let found = false;
  for (let i = 0; i < 6; i++) {
    const hasPost = await page.evaluate(() => document.body.innerText.includes('Michael Erhard'));
    if (hasPost) {
      found = true;
      break;
    }
    await page.evaluate(() => window.scrollBy(0, 800));
    await page.waitForTimeout(1000);
  }

  if (!found) {
    console.error('Could not find Michael Erhard post in feed.');
    process.exit(1);
  }

  console.log('Found Michael Erhard post. Locating comment box...');
  
  // Find container
  const postLocated = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('*'));
    const authorSpan = all.find(e => e.children.length === 0 && e.innerText && e.innerText.includes('Michael Erhard'));
    if (!authorSpan) return null;

    let cur = authorSpan;
    while (cur && cur !== document.body) {
      const commentBtn = Array.from(cur.querySelectorAll('button')).find(b => {
        const aria = b.getAttribute('aria-label') || '';
        return aria.toLowerCase().includes('comment') || b.innerText.toLowerCase().includes('comment');
      });
      if (commentBtn && cur.innerText.includes('Because humans hire humans')) {
        commentBtn.click();
        return true;
      }
      cur = cur.parentElement;
    }
    return false;
  });

  console.log('Clicked comment button:', postLocated);
  await page.waitForTimeout(2000);

  // Look for the active comment box
  const commentBox = page.locator('div.editor-content div.ProseMirror, div.tiptap.ProseMirror, div.comments-comment-box__editor div[contenteditable="true"], div[role="textbox"][aria-label*="comment" i]').first();
  await commentBox.scrollIntoViewIfNeeded();
  await commentBox.click();
  await page.waitForTimeout(500);

  const textToInsert = `Spot on, Michael. CareerBuilder data showed over 60% of qualified candidates abandon applications the second an ATS asks them to re-type their resume into 10 separate fields.

Whenever our teams treated hiring like an automated ticket queue, we lost the exact seniors who had the most options. A 30-second human scan of a clean CV beats 3 weeks of algorithmic keyword filtering every single time.`;

  await page.keyboard.insertText(textToInsert);
  await page.waitForTimeout(1000);

  // Submit comment
  console.log('Finding submit button...');
  const submitBtn = page.locator('button.comments-comment-box__submit-button, button:has-text("Comment"):not([aria-label*="Open"])').last();
  await submitBtn.click();
  await page.waitForTimeout(4000);

  console.log('Successfully posted comment on Michael Erhard post!');
  process.exit(0);
})();
