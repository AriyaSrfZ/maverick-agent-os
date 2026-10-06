const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  try {
    const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const page = browser.contexts()[0].pages()[0];
    
    // Ensure we are on the profile page
    if (!page.url().includes('/in/ariya-sarrafzadeh')) {
      await page.goto('https://www.linkedin.com/in/ariya-sarrafzadeh/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
    }

    // Capture headline from DOM
    const headlineElem = await page.locator('.text-body-medium.break-words').first();
    const currentHeadline = (await headlineElem.textContent().catch(() => '')).trim();

    // Scroll to About section and capture text
    const aboutHeader = page.locator('#about');
    let currentAbout = '';
    if (await aboutHeader.count() > 0) {
      await aboutHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(1000);
      const aboutContainer = page.locator('section:has(#about) .inline-show-more-text');
      if (await aboutContainer.count() > 0) {
        currentAbout = (await aboutContainer.textContent().catch(() => '')).trim();
      }
    }

    const state = {
      captured_at: new Date().toISOString(),
      url: page.url(),
      headline: currentHeadline,
      about: currentAbout
    };

    fs.writeFileSync('/home/aria/Downloads/CV/Linkdin files/pre_update_state.json', JSON.stringify(state, null, 2));
    console.log('Pre-update state captured:');
    console.log(JSON.stringify(state, null, 2));

  } catch (err) {
    console.error('Error capturing state:', err);
  }
})();
