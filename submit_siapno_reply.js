const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('Clicking Reply button on Siapno thread...');
  const replyClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const replyBtn = btns.find(b => b.getAttribute('aria-label') === 'Reply' || b.innerText.trim() === 'Reply');
    if (replyBtn) {
      replyBtn.click();
      return true;
    }
    return false;
  });

  console.log('Reply clicked status:', replyClicked);
  await page.waitForTimeout(2000);

  // Focus editor
  await page.evaluate(() => {
    const editor = document.querySelector('div.tiptap.ProseMirror[role="textbox"]');
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
      return (text === 'Reply' || text === 'Comment') && !aria.includes('Open');
    });
    if (submitBtn) {
      submitBtn.click();
      return { success: true, text: submitBtn.innerText };
    }
    return { success: false };
  });

  console.log('Siapno reply submission result:', submitted);
  await page.waitForTimeout(3000);
  console.log('FINISHED SIAPNO REPLY!');
  process.exit(0);
})();
