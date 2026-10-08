const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const userDataDir = '/home/aria/.config/youtube-browser-profile';
  console.log('Launching dedicated YouTube Chrome instance with proxy 127.0.0.1:7897...');

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    channel: 'chrome',
    viewport: { width: 1280, height: 900 },
    proxy: {
      server: 'http://127.0.0.1:7897'
    },
    args: [
      '--remote-debugging-port=9223',
      '--no-first-run',
      '--no-default-browser-check'
    ]
  });

  const page = context.pages()[0] || await context.newPage();
  console.log('Navigating to YouTube Studio...');
  try {
    await page.goto('https://studio.youtube.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Current URL:', page.url());
    console.log('Page Title:', await page.title());
  } catch (err) {
    console.error('Navigation warning:', err.message);
  }
  console.log('YouTube browser is live on desktop (Port 9223).');
})();
