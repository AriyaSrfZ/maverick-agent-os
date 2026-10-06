const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('Searching for Nikki Siapno post...');
  const searchUrl = 'https://www.linkedin.com/search/results/content/?keywords=Nikki%20Siapno%20%22The%20Evolution%20of%20HTTP%22&origin=GLOBAL_SEARCH_HEADER';
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click Comment button on Siapno post
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
    const editor = document.querySelector('div[contenteditable="true"], div.ProseMirror, div.tiptap, textarea');
    if (editor) {
      editor.focus();
      return 'focused_editor';
    }
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

  const commentText = "One critical operational difference worth highlighting: Head-of-Line (HoL) blocking on unstable mobile connections.\n\nHTTP/2 multiplexing cut connection bloat dramatically, but a single dropped packet still stalled all streams on that TCP connection. Running HTTP/3 over QUIC finally decouples independent streams over UDP.. night and day difference for p99 tail latency on spotty mobile networks.";

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

  console.log('Siapno submission result:', submitted);
  await page.waitForTimeout(3000);
  console.log('FINISHED SIAPNO COMMENT!');
  process.exit(0);
})();
