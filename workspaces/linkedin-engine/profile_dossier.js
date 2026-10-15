const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const targetInput = process.argv[2];
if (!targetInput) {
  console.log('Usage: node profile_dossier.js <linkedin_profile_url_or_slug>');
  console.log('Example: node profile_dossier.js https://www.linkedin.com/in/amirmehdi-ebrahimian/');
  process.exit(1);
}

let profileUrl = targetInput;
if (!profileUrl.startsWith('http')) {
  profileUrl = `https://www.linkedin.com/in/${targetInput.replace(/^\/+|\/+$/g, '')}/`;
}

(async () => {
  let browser;
  try {
    console.log(`\n======================================================`);
    console.log(`[${new Date().toISOString()}] DEEP PROFILE DOSSIER EXTRACTION`);
    console.log(`Target: ${profileUrl}`);
    console.log(`======================================================`);

    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const context = browser.contexts()[0];
    const page = context.pages()[0] || await context.newPage();

    await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(4000);

    // Scroll down to render About and Experience sections
    for (let s = 0; s < 3; s++) {
      await page.evaluate(() => window.scrollBy(0, 900));
      await page.waitForTimeout(1500);
    }

    const dossier = await page.evaluate((targetUrl) => {
      const main = document.querySelector('main') || document.body;
      const sections = Array.from(main.querySelectorAll('section'));
      const headerCard = sections[0] || main;
      const cardText = headerCard.innerText || '';
      const lines = cardText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

      const name = lines[0] || '';
      const degreeMatch = cardText.match(/[·•]\s*(1st|2nd|3rd)/);
      const degree = degreeMatch ? degreeMatch[1] : '';

      const noise = [
        'View ', 'Contact info', 'Connect', 'Message', 'More', 'Follow', 'Pending',
        'degree connection', 'mutual connection', 'connections', 'followers',
        'He/Him', 'She/Her', 'They/Them', 'Highlights', 'About'
      ];
      const cleanedLines = lines.slice(1).filter(l =>
        !noise.some(n => l.startsWith(n) || l.includes(n)) &&
        !/^[·•]\s*(1st|2nd|3rd)$/.test(l) &&
        l !== name
      );

      const headline = cleanedLines[0] || '';
      const location = cleanedLines[1] || '';

      const connMatch = cardText.match(/(\d[\d,+]*\+?)\s*connections?/i);
      const connections = connMatch ? connMatch[1] : '';

      // 1. About section
      let about = '';
      const aboutAnchor = document.querySelector('#about');
      if (aboutAnchor) {
        let sec = aboutAnchor;
        for (let i = 0; i < 6; i++) {
          sec = sec.parentElement;
          if (!sec || sec.tagName === 'SECTION') break;
        }
        if (sec && sec.tagName === 'SECTION') {
          const spans = Array.from(sec.querySelectorAll('span[aria-hidden="true"], span')).filter(s => {
            const t = s.innerText?.trim() || '';
            return t.length > 25 && t !== 'About';
          });
          about = spans[0]?.innerText?.trim() || sec.innerText.replace(/^About\s*/, '').trim().slice(0, 2500);
        }
      }

      // 2. Experience section
      const experience = [];
      const expAnchor = document.querySelector('#experience');
      if (expAnchor) {
        let sec = expAnchor;
        for (let i = 0; i < 6; i++) {
          sec = sec.parentElement;
          if (!sec || sec.tagName === 'SECTION') break;
        }
        if (sec && sec.tagName === 'SECTION') {
          const items = Array.from(sec.querySelectorAll('li'));
          items.forEach(li => {
            const spans = Array.from(li.querySelectorAll('span[aria-hidden="true"]'))
              .map(s => s.innerText?.trim()).filter(Boolean);
            if (spans.length >= 1) {
              const role = spans[0] || '';
              const company = spans[1] || '';
              const duration = spans[2] || '';
              const desc = spans.slice(3).join(' ').slice(0, 400);
              if (role.length > 2 && !role.includes('experience')) {
                experience.push({ role, company, duration, desc });
              }
            }
          });
        }
      }

      // 3. Extract company and education from topcard affiliations
      const affiliations = Array.from(headerCard.querySelectorAll('button, a')).map(el => el.innerText.trim()).filter(t => t.length > 2 && t.length < 50 && !noise.some(n => t.includes(n)));

      // 4. Extract recent activity snippet if present
      let latestActivity = '';
      const activitySection = Array.from(document.querySelectorAll('section')).find(s => s.innerText && s.innerText.includes('Activity'));
      if (activitySection) {
        const text = activitySection.innerText.replace(/\s+/g, ' ');
        const snippetMatch = text.match(/(?:Posts|Comments|Images|Articles)\s+(.*?)(?:Like|Comment|Repost|\.\.\.|$)/);
        latestActivity = snippetMatch ? snippetMatch[1].slice(0, 300) : text.slice(0, 300);
      }

      // 5. Current connection actions
      const canConnect = !!document.querySelector('button[aria-label*="Invite"], button[aria-label*="Connect"]');
      const canMessage = !!document.querySelector('button[aria-label*="Message"]');
      const isPending = cardText.includes('Pending');

      return {
        url: targetUrl,
        name,
        degree,
        headline,
        location,
        connections,
        affiliations: affiliations.slice(0, 4),
        about: about.replace(/\s+/g, ' ').trim(),
        experience: experience.slice(0, 6),
        latestActivitySnippet: latestActivity,
        actionState: isPending ? 'PENDING' : (canConnect ? 'CAN_CONNECT' : (canMessage ? 'CAN_MESSAGE' : 'RESTRICTED')),
        extractedAt: new Date().toISOString()
      };
    }, profileUrl);

    console.log('\nExtracted Dossier:');
    console.log(JSON.stringify(dossier, null, 2));

    // Formulate a personalized outreach note hook based on actual experience
    const firstRole = dossier.experience[0] || {};
    const company = firstRole.company || dossier.affiliations[0] || '';
    let suggestedInviteNote = '';
    if (dossier.name) {
      const firstName = dossier.name.split(' ')[0];
      const validCompany = (company && !company.includes(firstName) && company !== dossier.name && company.length > 2) ? company : '';
      if (validCompany) {
        suggestedInviteNote = `Hi ${firstName}, saw your work with ${validCompany} in the region. Would be glad to connect and share notes on fintech infrastructure.`;
      } else {
        suggestedInviteNote = `Hi ${firstName}, following your work on fintech and platform architecture in the UAE. Glad to connect and stay in touch.`;
      }
    }
    dossier.suggestedPersonalizedInvite = suggestedInviteNote;
    console.log(`\nSuggested Connection Invite Note (${suggestedInviteNote.length} chars):`);
    console.log(`"${suggestedInviteNote}"`);

    // Persist
    const slug = profileUrl.split('/in/')[1]?.replace(/\/.*$/, '') || 'profile';
    const outFile = path.join(__dirname, 'data', `dossier_${slug}_${Date.now()}.json`);
    fs.writeFileSync(outFile, JSON.stringify(dossier, null, 2), 'utf8');
    console.log(`\nDossier saved to: ${outFile}`);

  } catch (err) {
    console.error('Dossier extraction error:', err.message);
  } finally {
    process.exit(0);
  }
})();
