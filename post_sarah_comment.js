const { chromium } = require('playwright');

const commentText = `معمولاً با بالا رفتن سابقه در مدیریت محصول به این نتیجه می‌رسی که ارزش واقعی در "نه گفتن" و محافظت از پایداری سیستم اصلیه.

ساخت فیچر جدید اغلب فقط بدهی فنی و سربار نگهداری اضافه می‌کنه، در حالی که راه‌حل منطقی‌تر، تعامل برای اصلاح فرآیند و بیزینس‌لاجیک موجوده.

البته در عمل، فشار و انتظارات ذی‌نفعان معمولاً انقدر غیرمعقوله که در نهایت تیم‌ها ناچار به تن دادن می‌شن.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('Locating Comment button on Sarah post...');
    const clicked = await page.evaluate(() => {
      const allP = Array.from(document.querySelectorAll('p, span, div'));
      const p = allP.find(el => el.innerText && el.innerText.includes('چیزهایی که ای کاش وقتی تازه PM شده بودم'));
      if (!p) return { success: false, reason: 'Snippet not found' };

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

    console.log('Clicked comment button:', clicked);
    if (!clicked.success) throw new Error(clicked.reason);

    await page.waitForTimeout(2500);

    const editor = await page.$('div.ProseMirror[contenteditable="true"]');
    if (!editor) throw new Error('ProseMirror editor not found');

    const box = await editor.boundingBox();
    if (!box) throw new Error('Editor bounding box not found');

    await page.mouse.click(box.x + 20, box.y + 20);
    await page.waitForTimeout(600);
    await page.keyboard.insertText(commentText);
    await page.waitForTimeout(1500);

    const posted = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const postBtn = btns.find(b => b.innerText.trim() === 'Comment' && !b.disabled && b.getAttribute('aria-label') !== 'Comment');
      if (postBtn) {
        postBtn.click();
        return { success: true };
      }
      return { success: false, available: btns.map(b => b.innerText.trim()).filter(Boolean) };
    });

    console.log('Post comment result:', posted);
    await page.waitForTimeout(4000);

    const verified = await page.evaluate(() => {
      return document.body.innerText.includes('معمولاً با بالا رفتن سابقه در مدیریت محصول');
    });

    console.log('Verified live on Sarah post?', verified);

  } catch (err) {
    console.error('Error posting comment:', err);
  } finally {
    process.exit(0);
  }
})();
