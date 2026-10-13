const { chromium } = require('playwright');
const fs = require('fs');

const amirComment = `تفکیک پاسخگویی از اختیار تصمیم، نکته بسیار دقیقیه.

وقتی برای پیاده سازی یک لاجیک فنی، مسئولیت نتیجه با تیم محصوله ولی زنجیره امضاها دست لایه هایی هست که هزینه ای بابت تاخیر نمیدن، انرژی تیم صرف متقاعد کردن بوروکراسی میشه نه بازار.

همین شفافیت اول مسیر جلوی سال ها فرسودگی رو میگیره.`;

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    console.log('--- POSTING ON AMIR MEHDI EBRAHIMIAN ---');
    await page.goto('https://www.linkedin.com/in/amirmehdi-ebrahimian/recent-activity/all/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);

    const clicked = await page.evaluate(() => {
      const all = Array.from(document.querySelectorAll('p, span, div'));
      const match = all.find(el => el.innerText && el.innerText.includes('کار من ساختن کسب‌وکار است'));
      if (!match) return { found: false, reason: 'Snippet not found' };

      let container = match;
      while (container && container.parentElement && !container.querySelector('button[aria-label="Comment"]')) {
        container = container.parentElement;
      }

      const commentBtn = container.querySelector('button[aria-label="Comment"]');
      if (!commentBtn) return { found: false, reason: 'Comment button not found' };

      commentBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      commentBtn.click();
      return { found: true };
    });

    console.log('Clicked comment button:', clicked);
    if (!clicked.found) throw new Error(clicked.reason);

    await page.waitForTimeout(2500);

    const editor = await page.waitForSelector('div.ql-editor[contenteditable="true"], div.ProseMirror[contenteditable="true"], div[role="textbox"][contenteditable="true"]', { timeout: 10000 });
    if (editor) {
      const box = await editor.boundingBox();
      if (box) {
        await page.mouse.click(box.x + 20, box.y + 20);
        await page.waitForTimeout(800);
        await page.keyboard.insertText(amirComment);
        await page.waitForTimeout(2000);

        const posted = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const postBtn = btns.find(b => b.innerText.trim() === 'Comment' && !b.disabled && b.getAttribute('aria-label') !== 'Comment');
          if (postBtn) {
            postBtn.click();
            return true;
          }
          return false;
        });

        console.log('Amir Mehdi comment submitted:', posted);
        await page.waitForTimeout(4000);

        const verified = await page.evaluate(() => {
          return document.body.innerText.includes('تفکیک پاسخگویی از اختیار تصمیم');
        });
        console.log('Verified live on Amir Mehdi post:', verified);

        if (verified) {
          const record = {
            id: 'amir_mehdi_startup_vs_enterprise',
            author: 'Amir Mehdi Ebrahimian',
            topic: 'Startup vs Enterprise accountability & decision authority',
            timestamp: new Date().toISOString(),
            status: 'PUBLISHED_LIVE'
          };
          fs.appendFileSync('/home/aria/Downloads/CV/rotation.log', JSON.stringify(record) + '\n');
          
          const historyPath = '/home/aria/Downloads/CV/posted_comments.json';
          const history = JSON.parse(fs.readFileSync(historyPath, 'utf8'));
          history.push(record);
          fs.writeFileSync(historyPath, JSON.stringify(history, null, 2), 'utf8');
        }
      }
    } else {
      console.error('Editor not found');
    }

  } catch (err) {
    console.error('Error on Amir Mehdi post:', err);
  } finally {
    process.exit(0);
  }
})();
