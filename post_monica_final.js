const { chromium } = require('playwright');

const commentText = `The real shift isn’t just that complexity moved out of sight—it’s that failure handling moved from the physical world into code.

Back in the analogue days, if a line dropped, there was still an imprint and a paper trail. Today, making that single 'Approved' look effortless means an entire web of routing and settlement has to resolve in milliseconds behind the scenes.

It’s remarkable how much invisible engineering it takes just to make trust feel instant.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('Locating Comment button...');
    const clickedComment = await page.evaluate(() => {
      const p = Array.from(document.querySelectorAll('p')).find(el => el.innerText.includes('Payments did not become simpler'));
      if (!p) return { success: false, reason: 'P not found' };

      let container = p;
      while (container && container.parentElement && !container.querySelector('button[aria-label="Comment"]')) {
        container = container.parentElement;
      }

      const commentBtn = container.querySelector('button[aria-label="Comment"]');
      if (!commentBtn) return { success: false, reason: 'Comment button not found' };

      commentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      commentBtn.click();
      return { success: true };
    });

    console.log('Clicked comment button:', clickedComment);
    if (!clickedComment.success) throw new Error(clickedComment.reason);

    await page.waitForTimeout(2500);

    console.log('Locating comment editor...');
    const filled = await page.evaluate(async (text) => {
      // Find comment input
      const editor = document.querySelector('div.ql-editor, div[contenteditable="true"][role="textbox"], div[aria-label*="Add a comment"], div.comments-comment-box__editor');
      if (!editor) return { success: false, reason: 'Editor not found' };

      editor.focus();
      document.execCommand('insertText', false, text);
      return { success: true };
    }, commentText);

    console.log('Filled editor:', filled);
    if (!filled.success) throw new Error(filled.reason);

    await page.waitForTimeout(2000);

    console.log('Clicking submit/post button...');
    const submitted = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const postBtn = btns.find(b => {
        const t = b.innerText.trim();
        const a = b.getAttribute('aria-label') || '';
        return (t === 'Post' || t === 'Comment' || a.includes('Post comment')) && !b.disabled && b.getAttribute('aria-label') !== 'Comment';
      });

      if (postBtn && !postBtn.disabled) {
        postBtn.click();
        return { success: true, text: postBtn.innerText.trim() };
      }
      return { success: false, available: btns.map(b => b.innerText.trim()).filter(Boolean).slice(0, 10) };
    });

    console.log('Submitted result:', submitted);
    await page.waitForTimeout(4000);

    // Verify comment is on the page
    const verified = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('The real shift isn’t just that complexity moved out of sight');
    });

    console.log('Comment verified live on post?', verified);

  } catch (err) {
    console.error('Execution error:', err);
  } finally {
    process.exit(0);
  }
})();
