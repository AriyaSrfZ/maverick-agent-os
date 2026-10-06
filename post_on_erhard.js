const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('Searching for Michael Erhard post...');
  await page.goto('https://www.linkedin.com/search/results/content/?keywords=Michael%20Erhard%20%22Because%20humans%20hire%20humans%22&origin=GLOBAL_SEARCH_HEADER', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Find the Comment button on Michael Erhard's post
  const clicked = await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const commentBtn = allBtns.find(b => {
      const aria = b.getAttribute('aria-label') || '';
      return (aria.toLowerCase().includes('comment') || b.innerText.toLowerCase().includes('comment')) && !aria.toLowerCase().includes('open');
    });
    if (commentBtn) {
      commentBtn.click();
      return true;
    }
    return false;
  });

  console.log('Comment button clicked:', clicked);
  await page.waitForTimeout(2000);

  // Look for the editor that opened
  const editor = page.locator('div[contenteditable="true"], div.ProseMirror, div.editor-content, div[role="textbox"]').last();
  const editorCount = await editor.count();
  console.log('Editor count:', editorCount);

  if (editorCount > 0) {
    await editor.click();
    await page.waitForTimeout(500);

    const commentText = `Spot on, Michael. CareerBuilder data showed over 60% of qualified candidates abandon applications the second an ATS asks them to re-type their resume into 10 separate fields.

Whenever our teams treated hiring like an automated ticket queue, we lost the exact seniors who had the most options. A 30-second human scan of a clean CV beats 3 weeks of algorithmic keyword filtering every single time.`;

    await page.keyboard.insertText(commentText);
    await page.waitForTimeout(1000);

    // Look for submit button
    const submitBtn = page.locator('button.comments-comment-box__submit-button, button:has-text("Comment"):not([aria-label*="Open"])').last();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      console.log('Submitted comment successfully!');
      await page.waitForTimeout(3000);
    } else {
      console.log('Submit button not found');
    }
  } else {
    console.log('No comment editor found after clicking Comment button');
  }

  process.exit(0);
})();
