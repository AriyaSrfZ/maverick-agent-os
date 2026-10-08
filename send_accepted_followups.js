const { chromium } = require('playwright');

const items = [
  {
    name: 'Reza Rahnama',
    vanity: 'reza%D9%80rahnama%D9%80ac',
    // سلام رضا عزیز، ممنون از قبول ارتباط. خیلی خوشحال می‌شم با هم در ارتباط باشیم و از تجربیاتت در بازارپی و توسعه زیرساخت‌های پرداخت بشنوم.
    message: "سلام رضا عزیز، ممنون از قبول ارتباط. خیلی خوشحال می‌شم با هم در ارتباط باشیم و از تجربیاتت در بازارپی و توسعه زیرساخت‌های پرداخت بشنوم."
  },
  {
    name: 'Ashkan Azari',
    vanity: 'ashkan-azari',
    // سلام اشکان عزیز، ممنون از قبول ارتباط. باعث افتخاره که با هم در ارتباطیم و خوشحال می‌شم تجربیاتمون رو در حوزه پرداخت و توسعه محصول به اشتراک بذاریم.
    message: "سلام اشکان عزیز، ممنون از قبول ارتباط. باعث افتخاره که با هم در ارتباطیم و خوشحال می‌شم تجربیاتمون رو در حوزه پرداخت و توسعه محصول به اشتراک بذاریم."
  },
  {
    name: 'Payam Rahimi',
    vanity: 'payam-rahimi',
    message: "Hi Payam, thank you for connecting. Truly glad to connect with an experienced leader in fintech and payment platforms. Looking forward to staying in touch and exchanging insights."
  },
  {
    name: 'Mohamed Lotfy',
    vanity: 'mohamed-lotfy-emara',
    message: "Hi Mohamed, thank you for connecting. Really glad to connect with tech leadership in Dubai. Wishing you continued success with Quarizm, and look forward to staying in touch."
  }
];

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];

    for (const item of items) {
      console.log(`\n========================================`);
      console.log(`Processing follow-up for: ${item.name}`);
      console.log(`Message: ${item.message}`);
      
      await page.goto(`https://www.linkedin.com/in/${item.vanity}/`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3500);

      // Find and click the Message button on the profile page
      const clicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, a'));
        const btn = btns.find(b => b.innerText.trim() === 'Message' || b.getAttribute('aria-label')?.includes('Message'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });

      if (!clicked) {
        console.error(`Could not find Message button for ${item.name}`);
        continue;
      }

      await page.waitForTimeout(2500);

      // Check if active input box exists
      const sendResult = await page.evaluate(async (msgText) => {
        const activeInput = document.querySelector('div.msg-form__contenteditable[contenteditable="true"], div[role="textbox"][contenteditable="true"]');
        if (!activeInput) {
          return { success: false, reason: 'Active input not found' };
        }

        activeInput.focus();
        document.execCommand('insertText', false, msgText);
        
        await new Promise(r => setTimeout(r, 1000));

        // Find and click the Send button
        const sendBtns = Array.from(document.querySelectorAll('button.msg-form__send-button, button'));
        const sendBtn = sendBtns.find(b => {
          const t = b.innerText.trim();
          const label = b.getAttribute('aria-label') || '';
          return t === 'Send' || label.toLowerCase().includes('send');
        });

        if (sendBtn && !sendBtn.disabled) {
          sendBtn.click();
          return { success: true };
        }

        return { success: false, reason: 'Send button disabled or not found' };
      }, item.message);

      console.log(`Send result for ${item.name}:`, sendResult);

      await page.waitForTimeout(2000);

      // Close the conversation overlay bubble to keep screen clean
      await page.evaluate(() => {
        const closeBtns = Array.from(document.querySelectorAll('button[data-control-name="overlay.close_conversation_window"], .msg-overlay-bubble-header__control--close, button[aria-label*="Close your conversation"]'));
        for (const b of closeBtns) b.click();
      });

      await page.waitForTimeout(2500);
    }

    console.log('\nAll follow-ups finished successfully.');
  } catch (err) {
    console.error('Error executing follow-ups:', err);
  } finally {
    process.exit(0);
  }
})();
