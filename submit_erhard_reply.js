const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  const editor = page.locator('div.tiptap.ProseMirror[role="textbox"]').last();
  if (await editor.count() === 0) {
    console.error('Editor not found. Opening reply box first...');
    const replyBtn = page.locator('button[aria-label="Reply"], button:has-text("Reply")').first();
    await replyBtn.click();
    await page.waitForTimeout(1500);
  }

  await editor.click();
  await page.waitForTimeout(500);

  const commentText = "Spot on, Michael. CareerBuilder data showed over 60% of qualified candidates abandon applications the second an ATS asks them to re-type their resume into 10 separate fields.\n\nWhenever our teams treated hiring like an automated ticket queue, we lost the exact seniors who had the most options. A 30-second human scan of a clean CV beats 3 weeks of algorithmic keyword filtering every single time.";

  await page.keyboard.insertText(commentText);
  await page.waitForTimeout(1500);

  // Find the submit button
  const submitBtn = page.locator('button:has-text("Reply"):not([aria-label="Reply"]), button:has-text("Comment"):not([aria-label="Comment"]), button[type="submit"]').last();
  console.log('Submit button count:', await submitBtn.count());
  if (await submitBtn.count() > 0) {
    console.log('Submit button text:', await submitBtn.innerText());
    await submitBtn.click();
    await page.waitForTimeout(4000);
    console.log('VERIFIED: Reply to Michael Erhard successfully submitted!');
  } else {
    console.error('Could not find submit button.');
  }

  process.exit(0);
})();
