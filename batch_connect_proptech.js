const { chromium } = require('playwright');
const fs = require('fs');

const proptechTargets = [
  // PropTech Recruiters & Talent Partners
  { name: 'Ben Wilson', vanity: 'benwilson1', type: 'proptech_recruiter' },
  { name: 'Tejaswi Akkipeddi', vanity: 'tejaswiniakkipeddi', type: 'proptech_recruiter' },
  { name: 'Nisha Hafiz', vanity: 'nisha-hafiz', type: 'proptech_recruiter' },
  { name: 'Purva R', vanity: 'purva-r-785a771ab', type: 'proptech_recruiter' },
  
  // PropTech Product & Engineering Leaders
  { name: 'Rohan Katoch', vanity: 'rohankatoch', type: 'proptech_leader' },
  { name: 'Sarah B', vanity: 'sarah-bm', type: 'proptech_leader' },
  { name: 'Fahd Badran', vanity: 'fahdbadran', type: 'proptech_leader' },

  // Iranian Compatriots in Dubai Tech / PropTech
  { name: 'Ali Eslami', vanity: 'ali-eslamii', type: 'compatriot' },
  { name: 'Shabnam Mofrad', vanity: 'shabnam-mofrad-6126797b', type: 'compatriot' }
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

  for (const target of proptechTargets) {
    console.log(`\n-----------------------------------------`);
    console.log(`Target: ${target.name} (${target.vanity}) [${target.type}]`);

    // Check if already in history as sent
    if (history.some(h => h.vanity === target.vanity && (h.status === 'sent_with_note' || h.status === 'sent_without_note'))) {
      console.log(`Already sent invite previously. Skipping.`);
      continue;
    }

    const inviteUrl = `https://www.linkedin.com/preload/search-custom-invite/?vanityName=${target.vanity}`;
    try {
      await page.goto(inviteUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      const hasModal = await page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('Add a note to your invitation') || text.includes('Personalize your invitation');
      });

      if (!hasModal) {
        console.log(`Custom invite modal not shown for ${target.name}. Might already be connected or pending.`);
        history.push({ name: target.name, vanity: target.vanity, status: 'skipped_or_pending' });
        fs.writeFileSync(logFile, JSON.stringify(history, null, 2));
        continue;
      }

      const addNoteClicked = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText.trim() === 'Add a note');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });

      const firstName = target.name.split(' ')[0];
      const note = `Hi ${firstName}, I’m Ariya, with 15+ years of experience in payments, fintech technology and operations. I’m expanding my international professional network and would be glad to connect and stay in touch.`;

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

        console.log(`Sent personalized note invite to ${target.name}: ${sent}`);
        await page.waitForTimeout(3000);
        history.push({ name: target.name, vanity: target.vanity, type: target.type, status: sent ? 'sent_with_note' : 'send_failed' });
      } else {
        const sendDirect = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const btn = btns.find(b => b.innerText.trim() === 'Send without a note');
          if (btn) {
            btn.click();
            return true;
          }
          return false;
        });
        console.log(`Sent direct invite to ${target.name}: ${sendDirect}`);
        await page.waitForTimeout(3000);
        history.push({ name: target.name, vanity: target.vanity, type: target.type, status: sendDirect ? 'sent_without_note' : 'send_failed' });
      }

      fs.writeFileSync(logFile, JSON.stringify(history, null, 2));

      // Jitter pause
      const jitter = Math.floor(Math.random() * 3000) + 4000;
      await page.waitForTimeout(jitter);

    } catch (err) {
      console.error(`Error on ${target.name}:`, err.message);
      history.push({ name: target.name, vanity: target.vanity, status: 'error', error: err.message });
      fs.writeFileSync(logFile, JSON.stringify(history, null, 2));
    }
  }

  console.log('\n================ DONE ALL PROPTECH TARGETS ================');
  process.exit(0);
})();
