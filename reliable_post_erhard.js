const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('Focusing ProseMirror editor via DOM evaluate...');
  const focused = await page.evaluate(() => {
    const editor = document.querySelector('div.tiptap.ProseMirror[role="textbox"]');
    if (editor) {
      editor.focus();
      return true;
    }
    // If not open, click Reply
    const replyBtn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Reply' || b.innerText.trim() === 'Reply');
    if (replyBtn) {
      replyBtn.click();
      return 'clicked_reply';
    }
    return false;
  });

  console.log('Focus/Reply status:', focused);
  await page.waitForTimeout(1000);

  // Focus again if Reply was clicked
  await page.evaluate(() => {
    const editor = document.querySelector('div.tiptap.ProseMirror[role="textbox"]');
    if (editor) editor.focus();
  });
  await page.waitForTimeout(500);

  const commentText = "Spot on, Michael. CareerBuilder data showed over 60% of qualified candidates abandon applications the second an ATS asks them to re-type their resume into 10 separate fields.\n\nWhenever our teams treated hiring like an automated ticket queue, we lost the exact seniors who had the most options. A 30-second human scan of a clean CV beats 3 weeks of algorithmic keyword filtering every single time.";

  await page.keyboard.insertText(commentText);
  await page.waitForTimeout(1000);

  // Submit via DOM click
  const submitted = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.reverse().find(b => {
      const text = b.innerText.trim();
      const aria = b.getAttribute('aria-label') || '';
      return (text === 'Reply' || text === 'Comment') && !aria.includes('Open');
    });
    if (submitBtn) {
      submitBtn.click();
      return { success: true, text: submitBtn.innerText };
    }
    return { success: false };
  });

  console.log('Submission result:', submitted);
  await page.waitForTimeout(3000);
  console.log('FINISHED ERHARD COMMENT!');
  process.exit(0);
})();
