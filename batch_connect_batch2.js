const { chromium } = require('playwright');
const fs = require('fs');

const targets = [
  // Iranian tech expats in Dubai
  { name: 'Mohammadreza Hassani', vanity: 'mohammadreza-hassani', type: 'compatriot' },
  { name: 'Ala Kiani', vanity: 'alakiani', type: 'compatriot' },
  { name: 'Muhamad Saber Taherian', vanity: 'muhamadsabertaherian', type: 'compatriot' },
  { name: 'Ramin Fazli', vanity: 'ramin-fazli', type: 'compatriot' },
  { name: 'Mehdi Teymorian', vanity: 'mehdi-teymorian', type: 'compatriot' },
  { name: 'Ali Shakeri Nouri', vanity: 'alishakerinouri', type: 'compatriot' },
  { name: 'Pooria Hassanzadeh', vanity: 'pooriahassanzadeh', type: 'compatriot' },

  // UAE Tech & FinTech Recruiters in Dubai
  { name: 'Maham Khan', vanity: 'mk1993', type: 'recruiter' },
  { name: 'Muneeb Maqsood', vanity: 'muneeb-maqsood-5a8505187', type: 'recruiter' },
  { name: 'Nermin Alsheikh', vanity: 'nermin-alsheikh', type: 'recruiter' },
  { name: 'Haris Salman', vanity: 'haris-salman', type: 'recruiter' },
  { name: 'Faizan Ahmed', vanity: 'faizan-ahmed-7b1071258', type: 'recruiter' },
  { name: 'Anuj Namdev', vanity: 'anujnamdev', type: 'recruiter' }
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

  for (const target of targets) {
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

      // Humanized jitter pause between invites (4 to 8 seconds)
      const jitter = Math.floor(Math.random() * 4000) + 4000;
      await page.waitForTimeout(jitter);

    } catch (err) {
      console.error(`Error on ${target.name}:`, err.message);
      history.push({ name: target.name, vanity: target.vanity, status: 'error', error: err.message });
      fs.writeFileSync(logFile, JSON.stringify(history, null, 2));
    }
  }

  console.log('\n================ DONE ALL TARGETS ================');
  process.exit(0);
})();
