const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];
  
  console.log('Searching for Usman Anzaar post...');
  const searchUrl = 'https://www.linkedin.com/search/results/content/?keywords=Usman%20Anzaar%20%22The%20biggest%20AI-security%20mistake%22&origin=GLOBAL_SEARCH_HEADER';
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  // Click Comment button
  const clicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const commentBtn = btns.find(b => {
      const aria = (b.getAttribute('aria-label') || '').toLowerCase();
      return aria === 'comment' || b.innerText.trim().toLowerCase() === 'comment';
    });
    if (commentBtn) {
      commentBtn.click();
      return true;
    }
    return false;
  });

  console.log('Clicked comment button:', clicked);
  await page.waitForTimeout(2000);

  // Focus editor
  await page.evaluate(() => {
    const editor = document.querySelector('div.tiptap.ProseMirror, div[contenteditable="true"]');
    if (editor) editor.focus();
  });
  await page.waitForTimeout(500);

  const commentText = "The biggest failure mode in programmatic payments has always been idempotency and state locks.. giving an AI agent access to payment APIs without deterministic two-phase commit boundaries is an invitation for balance drain. In high-scale wallets, we treated every automated caller as inherently unreliable: hard velocity ceilings, isolated reconciliation pools, and mandatory human authorization for any state mutation above a strict threshold. Authority without automated audit tracing isn't autonomy; it's an unmitigated liability.";

  await page.keyboard.insertText(commentText);
  await page.waitForTimeout(1000);

  // Submit via DOM click
  const submitted = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const submitBtn = btns.reverse().find(b => {
      const text = b.innerText.trim();
      const aria = b.getAttribute('aria-label') || '';
      return (text === 'Comment' || text === 'Post' || text === 'Reply') && !aria.includes('Open');
    });
    if (submitBtn) {
      submitBtn.click();
      return { success: true, text: submitBtn.innerText };
    }
    return { success: false };
  });

  console.log('Submission result on Anzaar post:', submitted);
  await page.waitForTimeout(3000);
  console.log('FINISHED ANZAAR COMMENT!');
  process.exit(0);
})();
