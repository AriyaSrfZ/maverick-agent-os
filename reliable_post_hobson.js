const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('Searching for Darryl Hobson post...');
  const searchUrl = 'https://www.linkedin.com/search/results/content/?keywords=Darryl%20Hobson%20%22Every%20Project%20Manager%20needs%20a%20PMP%22&origin=GLOBAL_SEARCH_HEADER';
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click Comment button on Hobson post
  const clickedComment = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const commentBtn = btns.find(b => {
      const aria = b.getAttribute('aria-label') || '';
      return aria.toLowerCase().includes('comment') && !aria.toLowerCase().includes('open');
    });
    if (commentBtn) {
      commentBtn.click();
      return true;
    }
    return false;
  });

  console.log('Comment button clicked:', clickedComment);
  await page.waitForTimeout(2000);

  // Focus comment editor or reply
  const editorFocused = await page.evaluate(() => {
    // Look for comment editor or reply button
    const editor = document.querySelector('div[contenteditable="true"], div.ProseMirror, div.tiptap, textarea');
    if (editor) {
      editor.focus();
      return 'focused_editor';
    }
    // Or reply button
    const replyBtn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Reply' || b.innerText.trim() === 'Reply');
    if (replyBtn) {
      replyBtn.click();
      return 'clicked_reply';
    }
    return 'none';
  });

  console.log('Editor focus status:', editorFocused);
  await page.waitForTimeout(1000);

  // Ensure focused
  await page.evaluate(() => {
    const editor = document.querySelector('div[contenteditable="true"], div.ProseMirror, div.tiptap');
    if (editor) editor.focus();
  });
  await page.waitForTimeout(500);

  const commentText = "Hits uncomfortably close to home, Darryl. Research shows ATS filters toss out up to 75% of qualified resumes purely on missing keyword tags, and turning the PMP into a binary filter is the laziest shortcut in modern hiring.\n\nFrameworks give teams a shared vocabulary, but composure when a production outage hits or stakeholders start pointing fingers is 100% muscle memory. You cannot study your way into crisis judgment.";

  await page.keyboard.insertText(commentText);
  await page.waitForTimeout(1000);

  // Submit via DOM click
  const submitted = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.reverse().find(b => {
      const text = b.innerText.trim();
      const aria = b.getAttribute('aria-label') || '';
      return (text === 'Comment' || text === 'Reply' || text === 'Post') && !aria.includes('Open');
    });
    if (submitBtn) {
      submitBtn.click();
      return { success: true, text: submitBtn.innerText };
    }
    return { success: false };
  });

  console.log('Hobson submission result:', submitted);
  await page.waitForTimeout(3000);
  console.log('FINISHED HOBSON COMMENT!');
  process.exit(0);
})();
