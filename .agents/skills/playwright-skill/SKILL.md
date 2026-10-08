---
name: playwright-skill
description: General Playwright & Chrome DevTools Protocol (CDP) browser automation skill for interacting with modern SPAs, executing user journeys, and managing persistent browser profiles.
---

# Playwright & CDP Automation Skill

This skill equips agents to write, test, and execute browser automation scripts using Playwright and direct Chrome DevTools Protocol (CDP) sessions.

---

## 1. Core Principles

1. **Persistent Browser Contexts**: Always prefer connecting to a real running browser profile (`chromium.connectOverCDP()`) over launching blank ephemeral browsers when authenticating with Google, social platforms, or enterprise portals.
2. **Resilient Evaluation (`robustEval`)**: Modern SPAs destroy execution contexts during micro-navigations. Always wrap `page.evaluate()` in retry loops.
3. **CDP Mouse & Keyboard Events**: Polymer, React, and Angular components often disregard synthetic JS events (`element.click()`). Dispatch native events via CDP `Input.dispatchMouseEvent` and `Input.dispatchKeyEvent`.
4. **Visual Verification**: Take targeted element and viewport screenshots at critical state transitions (`debug_*.png`).

---

## 2. Standard Pattern: Connecting to Existing Browser via CDP

```javascript
const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9223');
  const context = browser.contexts()[0];
  const page = context.pages()[0] || await context.newPage();
  
  // Use CDP session for deep automation
  const cdp = await context.newCDPSession(page);
  
  // Work with page...
  await page.goto('https://example.com');
  
  await browser.close();
}
```

---

## 3. Handling Complex Web Components & Shadow DOM

```javascript
// Pierce shadow roots and query visible targets
async function getVisibleTarget(page, selector) {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2
    };
  }, selector);
}
```
