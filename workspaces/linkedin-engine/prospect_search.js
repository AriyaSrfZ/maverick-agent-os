const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// CLI args parsing
const args = process.argv.slice(2);
let query = 'fintech "payment rails" OR "core banking" Dubai';
let networkFilter = 'all'; // '2nd', '3rd', or 'all'
let maxResults = 10;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--query' || args[i] === '-q') query = args[i + 1];
  if (args[i] === '--filter' || args[i] === '-f') networkFilter = args[i + 1];
  if (args[i] === '--limit' || args[i] === '-l') maxResults = parseInt(args[i + 1], 10) || 10;
}

(async () => {
  let browser;
  try {
    console.log(`\n======================================================`);
    console.log(`[${new Date().toISOString()}] LINKEDIN PROSPECT SEARCH & RESEARCH`);
    console.log(`Query: "${query}" | Limit: ${maxResults}`);
    console.log(`======================================================`);

    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const context = browser.contexts()[0];
    const page = context.pages()[0] || await context.newPage();

    let searchUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}&origin=GLOBAL_SEARCH_HEADER`;
    if (networkFilter === '2nd') {
      searchUrl += '&network=%5B%22S%22%5D';
    } else if (networkFilter === '3rd') {
      searchUrl += '&network=%5B%22O%22%5D';
    }

    console.log(`Navigating to search URL: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(4000);

    // Scroll down gradually to trigger lazy-loading of all 10 results
    for (let s = 0; s < 3; s++) {
      await page.evaluate(() => window.scrollBy(0, 800));
      await page.waitForTimeout(1500);
    }

    const prospects = await page.evaluate((max) => {
      const results = [];
      const seen = new Set();
      const anchors = Array.from(document.querySelectorAll('a[href*="/in/"]'));
      
      for (const a of anchors) {
        if (results.length >= max) break;
        const rawUrl = a.href.split('?')[0];
        if (seen.has(rawUrl)) continue;

        const text = a.innerText.trim();
        if (!text || !text.includes('\n')) continue; // Must be the rich profile card anchor

        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length < 2) continue;

        seen.add(rawUrl);
        const name = lines[0].replace(/[·•]\s*(1st|2nd|3rd)\+?/, '').trim();
        const degreeMatch = text.match(/[·•]\s*(1st|2nd|3rd)\+?/);
        const degree = degreeMatch ? degreeMatch[1] : '';

        const noise = ['1st', '2nd', '3rd', '•', '·', 'Connect', 'Follow', 'Message', 'Pending'];
        const cleanLines = lines.slice(1).filter(l => 
          !noise.includes(l) && 
          !/^[·•]\s*(1st|2nd|3rd)\+?$/.test(l) && 
          !l.includes('mutual connection') && 
          !l.includes('followers') &&
          l.length > 3
        );

        results.push({
          name,
          degree,
          headline: cleanLines[0] || '',
          location: cleanLines[1] || '',
          url: rawUrl,
          discoveredAt: new Date().toISOString()
        });
      }
      return results;
    }, maxResults);

    console.log(`\nDiscovered ${prospects.length} targeted prospects:`);
    console.log(JSON.stringify(prospects, null, 2));

    // Save output
    const safeTag = query.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30);
    const outFile = path.join(__dirname, 'data', `prospects_${safeTag}_${Date.now()}.json`);
    fs.writeFileSync(outFile, JSON.stringify(prospects, null, 2), 'utf8');
    console.log(`\nPersisted dossier to: ${outFile}`);

  } catch (err) {
    console.error('Prospect search error:', err.message);
  } finally {
    process.exit(0);
  }
})();
