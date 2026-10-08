const { chromium } = require('playwright');

const targets = [
  {
    name: 'Reza Rahnama',
    vanity: 'reza%D9%80rahnama%D9%80ac',
    message: 'سلام رضا عزیز، ممنون از قبول ارتباط. خیلی خوشحال می‌شم با هم در ارتباط باشیم و از تجربیاتت در بازارپی و توسعه زیرساخت‌های پرداخت بشنوم.'
  },
  {
    name: 'Ashkan Azari',
    vanity: 'ashkan-azari',
    message: 'سلام اشکان عزیز، ممنون از قبول ارتباط. باعث افتخاره که با هم در ارتباطیم و خوشحال می‌شم تجربیاتمون رو در حوزه پرداخت و توسعه محصولات مقیاس‌بالا به اشتراک بذاریم.'
  },
  {
    name: 'Payam Rahimi',
    vanity: 'payam-rahimi',
    message: 'Hi Payam, thank you for connecting. Truly glad to connect with an experienced leader in fintech and payment platforms. Looking forward to staying in touch and exchanging insights.'
  },
  {
    name: 'Mohamed Lotfy',
    vanity: 'mohamed-lotfy-emara',
    message: 'Hi Mohamed, thank you for connecting. Really glad to connect with tech leadership in Dubai. Wishing you continued success with Quarizm, and look forward to staying in touch.'
  },
  {
    name: 'Hossein Gholipour',
    vanity: 'hosseingholipour',
    message: 'سلام حسین عزیز، ممنون از قبول ارتباط. خیلی خوشحال می‌شم با هم در ارتباط باشیم و تجربیاتمون رو به اشتراک بذاریم.'
  },
  {
    name: 'Esmaeil Ghafarnia',
    vanity: 'esmaeil-ghafarnia',
    message: 'سلام اسماعیل عزیز، ممنون از قبول ارتباط. باعث افتخاره که با مدیران با‌تجربه فناوری در ارتباط باشم. خوشحال می‌شم در تماس بمونیم.'
  }
];

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    for (const target of targets) {
      console.log(`\n==================================================`);
      console.log(`[TARGET] ${target.name} (${target.vanity})`);

      // Navigate to profile
      await page.goto(`https://www.linkedin.com/in/${target.vanity}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      // Get compose link
      const composeHref = await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('a')).find(b => b.innerText.trim() === 'Message');
        return btn ? btn.getAttribute('href') : null;
      });

      if (!composeHref) {
        console.log(`[SKIP] No Message link found for ${target.name}`);
        continue;
      }

      console.log(`Navigating to composer: ${composeHref}`);
      await page.goto(`https://www.linkedin.com${composeHref}`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);

      // Check if thread already has any outbound message from Ariya
      const threadHistory = await page.evaluate(() => {
        const msgs = Array.from(document.querySelectorAll('.msg-s-event-listitem__body, .msg-s-message-listitem'));
        return msgs.map(m => m.innerText.trim()).filter(Boolean);
      });

      if (threadHistory.length > 0) {
        console.log(`[SKIP] Existing thread detected for ${target.name} (${threadHistory.length} messages):`, threadHistory[threadHistory.length - 1]);
        continue;
      }

      // Find the input element rect
      const inputRect = await page.evaluate(() => {
        const input = document.querySelector('div.msg-form__contenteditable[contenteditable="true"]');
        if (!input) return null;
        const rect = input.getBoundingClientRect();
        return { x: rect.x + 20, y: rect.y + 20, width: rect.width, height: rect.height };
      });

      if (!inputRect) {
        console.log(`[ERROR] Could not find contenteditable input for ${target.name}`);
        continue;
      }

      // Click to focus input
      await page.mouse.click(inputRect.x, inputRect.y);
      await page.waitForTimeout(600);

      // Insert message text
      await page.keyboard.insertText(target.message);
      await page.waitForTimeout(1200);

      // Find Send button
      const sendBtnInfo = await page.evaluate(() => {
        const btn = document.querySelector('button.msg-form__send-button, button[type="submit"]');
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        return {
          disabled: btn.disabled,
          x: rect.x + rect.width / 2,
          y: rect.y + rect.height / 2
        };
      });

      if (!sendBtnInfo || sendBtnInfo.disabled) {
        console.log(`[ERROR] Send button disabled or not found for ${target.name}`);
        continue;
      }

      // Click Send button via coordinate
      await page.mouse.click(sendBtnInfo.x, sendBtnInfo.y);
      console.log(`[SENT] Clicked Send for ${target.name}!`);
      await page.waitForTimeout(3500);

      // Verify message appeared in thread
      const verified = await page.evaluate(() => {
        const msgs = Array.from(document.querySelectorAll('.msg-s-event-listitem__body, .msg-s-message-listitem'));
        return msgs.length > 0 ? msgs[msgs.length - 1].innerText.trim() : null;
      });

      console.log(`[VERIFIED] Last message in thread: ${verified}`);
      await page.waitForTimeout(3000);
    }

    console.log(`\nAll targets processed!`);
  } catch (err) {
    console.error('Fatal execution error:', err);
  } finally {
    process.exit(0);
  }
})();
