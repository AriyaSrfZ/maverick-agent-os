const { chromium } = require('playwright');
const fs = require('fs');

const leaders = [
  { name: 'مهدی سیلاوی', vanity: 'mehdi-silavi-550a5558', title: 'Head of Product at Nobitex' },
  { name: 'سنا شمس‌فر', vanity: 'sana-shamsafar', title: 'Product Director @ Wallex' },
  { name: 'دانیال ابراهیمی', vanity: 'danialebrahimi', title: 'Director of Product at SnappPay' },
  { name: 'سید علی خوئی', vanity: 'sakhoee', title: 'CEO at Nobitex' },
  { name: 'لیلا پاکروان', vanity: 'leila-pakravan-898155113', title: 'Digital Banking PM at Dotin' },
  { name: 'سیما خدیو', vanity: 'seema-khadiv-5281b142a', title: 'Product Director at Snapp' },
  { name: 'پویان فیاضی', vanity: 'pouyanfayazi', title: 'Senior PM at Nobitex' },
  { name: 'محمدجواد گلستانی', vanity: 'mohammadjavad-golestani', title: 'Product Director at Divar' }
];

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];

  const logFile = '/home/aria/Downloads/CV/Linkdin files/batch_connection_results.json';
  let history = [];
  try {
    history = JSON.parse(fs.readFileSync(logFile, 'utf8'));
  } catch (e) {
    history = [];
  }

  for (const leader of leaders) {
    console.log(`\nProcessing Iranian Leader: ${leader.name} (${leader.vanity}) - ${leader.title}`);
    
    // Check if already sent
    if (history.some(h => h.vanity === leader.vanity && (h.status === 'sent_with_note' || h.status === 'sent_without_note'))) {
      console.log('Already in history, skipping.');
      continue;
    }

    // Try custom invite first
    const inviteUrl = `https://www.linkedin.com/preload/search-custom-invite/?vanityName=${leader.vanity}`;
    try {
      await page.goto(inviteUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      const hasModal = await page.evaluate(() => {
        const t = document.body.innerText;
        return t.includes('Add a note to your invitation') || t.includes('Personalize your invitation');
      });

      if (hasModal) {
        const addNoteClicked = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText.trim() === 'Add a note');
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        });

        const firstName = leader.name.split(' ')[0];
        const note = `سلام ${firstName} عزیز، من آریا هستم. سال‌هاست در حوزه فناوری و پرداخت فعالیت می‌کنم و این روزها بیشتر دارم شبکه حرفه‌ای‌ام رو با آدم‌های خوب و هم‌مسیر گسترش میدم. خوشحال میشم با هم در ارتباط باشیم.`;

        if (addNoteClicked) {
          await page.waitForTimeout(1000);
          await page.evaluate(() => {
            const ta = document.querySelector('textarea');
            if (ta) ta.focus();
          });
          await page.waitForTimeout(500);

          await page.keyboard.insertText(note);
          await page.waitForTimeout(1000);

          const sent = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const sendBtn = btns.reverse().find(b => b.innerText.trim() === 'Send' || b.getAttribute('aria-label') === 'Send invitation');
            if (sendBtn) {
              sendBtn.click();
              return true;
            }
            return false;
          });

          console.log(`Sent Persian personalized invite to ${leader.name}: ${sent}`);
          history.push({ name: leader.name, vanity: leader.vanity, type: 'iranian_clevel', status: sent ? 'sent_with_note' : 'send_failed' });
        } else {
          // Direct invite
          const directSent = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const sendBtn = btns.find(b => b.innerText.trim() === 'Send without a note');
            if (sendBtn) {
              sendBtn.click();
              return true;
            }
            return false;
          });
          console.log(`Sent direct invite to ${leader.name}: ${directSent}`);
          history.push({ name: leader.name, vanity: leader.vanity, type: 'iranian_clevel', status: directSent ? 'sent_without_note' : 'send_failed' });
        }
      } else {
        // Go to their profile and follow them
        const profileUrl = `https://www.linkedin.com/in/${leader.vanity}/`;
        console.log(`Navigating to profile to follow: ${profileUrl}`);
        await page.goto(profileUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        const followed = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const fBtn = btns.find(b => b.innerText.trim() === '+ Follow' || b.innerText.trim() === 'Follow');
          if (fBtn) {
            fBtn.click();
            return true;
          }
          return false;
        });
        console.log(`Followed profile ${leader.name}: ${followed}`);
        history.push({ name: leader.name, vanity: leader.vanity, type: 'iranian_clevel', status: followed ? 'followed' : 'already_following_or_connected' });
      }

      fs.writeFileSync(logFile, JSON.stringify(history, null, 2));
      const pause = Math.floor(Math.random() * 3000) + 4000;
      await page.waitForTimeout(pause);

    } catch (err) {
      console.error(`Error on ${leader.name}:`, err.message);
    }
  }

  console.log('\n================ DONE IRANIAN C-LEVEL BATCH ================');
  process.exit(0);
})();
