const { chromium } = require('playwright');

const OPTION_B_ABOUT = `Over 15 years in the technical trenches architecting, debugging, and operating platform systems for user bases exceeding 45 million.

I am an old-school systems thinker. What I genuinely enjoy doing is simple: researching complex workflows, finding systemic flaws, debugging integrations, and learning every day to make broken platforms resilient. 

From engineering zero-defect reconciliation logic across upstream banking switches to setting up raw telemetry stacks (Prometheus, Grafana, ELK) and parsing judicial fraud logs across 30,000 cases, I've spent my career translating operational chaos into quiet, stable code.

I diagnose and fix broken transaction flows, API gateways, and asynchronous handoffs. I build multi-party ledger reconciliation, fraud mitigation, and compliance architecture. And I bridge the gap between engineering teams, executive directives, and frontline operations.

Currently driving platform and database architecture at Persia Fava Gostaresh Co. Open to Technical Product Owner, Systems Analyst, or Platform Operations opportunities with visa sponsorship in Dubai / UAE or internationally.

Contact: ariasg2002@gmail.com`;

(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
  const page = browser.contexts()[0].pages()[0];

  console.log('Navigating to summary edit form...');
  await page.goto('https://www.linkedin.com/in/ariya-sarrafzadeh/edit/forms/summary/new/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const editable = await page.locator('div[aria-label="About"][contenteditable="true"], [contenteditable="true"][aria-label="About"]').first();
  const count = await editable.count();
  if (count === 0) {
    console.error('Editable div not found!');
    process.exit(1);
  }

  console.log('Found contenteditable div. Focusing...');
  await editable.focus();
  await page.waitForTimeout(500);

  // Select all and replace
  await page.keyboard.press('Control+A');
  await page.waitForTimeout(300);
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(500);

  console.log('Inserting Option B text...');
  await page.keyboard.insertText(OPTION_B_ABOUT);
  await page.waitForTimeout(1000);

  console.log('Clicking Save button...');
  const saveClicked = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const saveBtn = btns.find(b => b.innerText.trim() === 'Save');
    if (saveBtn) {
      saveBtn.click();
      return true;
    }
    return false;
  });
  console.log('Save clicked:', saveClicked);
  await page.waitForTimeout(4000);

  // Verify on profile
  await page.goto('https://www.linkedin.com/in/ariya-sarrafzadeh/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const preview = await page.evaluate(() => {
    const sec = Array.from(document.querySelectorAll('section')).find(s => s.innerText && s.innerText.includes('About'));
    return sec ? sec.innerText.substring(0, 600) : 'None';
  });
  console.log('\nLIVE PROFILE ABOUT PREVIEW:\n', preview);
  process.exit(0);
})();
