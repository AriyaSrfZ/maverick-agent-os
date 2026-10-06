const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const userDataDir = '/home/aria/.config/linkedin-browser-profile';
  console.log('Launching Chrome with persistent profile at:', userDataDir);
  
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1280, height: 900 },
    args: [
      '--remote-debugging-port=9222',
      '--no-first-run',
      '--no-default-browser-check'
    ]
  });

  const page = context.pages()[0] || await context.newPage();
  console.log('Navigating to LinkedIn profile...');
  await page.goto('https://www.linkedin.com/in/ariya-sarrafzadeh/', { waitUntil: 'domcontentloaded' });
  console.log('Browser is active and ready on your desktop.');
  console.log('Remote debugging active on http://127.0.0.1:9222');
})();
