const { chromium } = require('playwright');

const commentText = `The real shift isn’t just that complexity moved out of sight—it’s that failure handling moved from the physical world into code.

Back in the analogue days, if a line dropped, there was still an imprint and a paper trail. Today, making that single 'Approved' look effortless means an entire web of routing and settlement has to resolve in milliseconds behind the scenes.

It’s remarkable how much invisible engineering it takes just to make trust feel instant.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    // Find the element containing the snippet
    const success = await page.evaluate(async (textToPost) => {
      // Find element containing snippet
      const allElements = Array.from(document.querySelectorAll('*'));
      const textNode = allElements.find(el => el.children.length === 0 && el.innerText && el.innerText.includes('Payments did not become simpler'));
      if (!textNode) return { ok: false, reason: 'Text node not found' };

      // Find ancestor container that has comment button
      let container = textNode;
      let commentBtn = null;
      for (let i = 0; i < 20; i++) {
        if (!container.parentElement) break;
        container = container.parentElement;
        const btns = Array.from(container.querySelectorAll('button'));
        commentBtn = btns.find(b => b.innerText.trim() === 'Comment' || b.getAttribute('aria-label')?.includes('Comment'));
        if (commentBtn) break;
      }

      if (!commentBtn) return { ok: false, reason: 'Comment button not found' };

      // Scroll into view
      commentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      commentBtn.click();

      // Wait a moment for comment box
      await new Promise(r => setTimeout(r, 2000));

      // Find comment input
      const editor = container.querySelector('div.ql-editor, div[contenteditable="true"][role="textbox"], div.comments-comment-box__editor');
      if (!editor) {
        // Search globally if inside container failed
        const globalEditor = document.querySelector('div.comments-comment-box__editor div[contenteditable="true"], div.ql-editor[contenteditable="true"]');
        if (!globalEditor) return { ok: false, reason: 'Comment editor not found' };
        globalEditor.focus();
        document.execCommand('insertText', false, textToPost);
      } else {
        editor.focus();
        document.execCommand('insertText', false, textToPost);
      }

      await new Promise(r => setTimeout(r, 1500));

      // Find and click the submit button
      const submitBtns = Array.from(container.querySelectorAll('button') || document.querySelectorAll('button'));
      const submitBtn = submitBtns.find(b => {
        const t = b.innerText.trim();
        const a = b.getAttribute('aria-label') || '';
        return (t === 'Comment' || t === 'Post' || a.includes('Post comment')) && !b.disabled && b !== commentBtn;
      });

      if (!submitBtn) {
        // Try broader search
        const globalSubmit = Array.from(document.querySelectorAll('button.comments-comment-box__submit-button, button[type="submit"]')).find(b => !b.disabled);
        if (globalSubmit) {
          globalSubmit.click();
          return { ok: true, via: 'globalSubmit' };
        }
        return { ok: false, reason: 'Submit button not found or disabled' };
      }

      submitBtn.click();
      return { ok: true, via: 'containerSubmit' };
    }, commentText);

    console.log('Post comment result:', success);
    await page.waitForTimeout(4000);

  } catch (err) {
    console.error('Error posting comment:', err);
  } finally {
    process.exit(0);
  }
})();
