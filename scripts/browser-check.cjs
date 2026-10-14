const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const baseUrl = process.argv[2] || 'http://127.0.0.1:3370';
  const prefix = process.argv[3] || 'production';
  const expectedRelease = process.env.EXPECTED_RELEASE || 'METEOR@3.6-rc.0';
  const outputDir = path.resolve(process.env.OUTPUT_DIR || 'artifacts');
  fs.mkdirSync(outputDir, { recursive: true });
  const agents = [
    { name: 'chrome' },
    { name: 'example', userAgent: 'example' },
    { name: 'ie11', userAgent: 'Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko' },
    { name: 'googlebot', userAgent: 'Googlebot' },
  ];
  const results = [];
  try {
    for (const agent of agents) {
      const context = await browser.newContext(agent.userAgent ? { userAgent: agent.userAgent } : {});
      const page = await context.newPage();
      const result = { name: agent.name, requestedUserAgent: agent.userAgent || 'Chromium default', errors: [], console: [], failedRequests: [] };
      page.on('pageerror', error => result.errors.push({ message: error.message, stack: error.stack }));
      page.on('console', message => result.console.push({ type: message.type(), text: message.text() }));
      page.on('requestfailed', request => result.failedRequests.push({ url: request.url(), error: request.failure()?.errorText }));
      const response = await page.goto(baseUrl, { waitUntil: 'load', timeout: 60000 });
      result.httpStatus = response.status();
      try {
        await page.waitForFunction(() => window.__issue14397 === 'tagged template literal' && document.querySelector('#react-target')?.textContent?.includes('Welcome to Meteor'), null, { timeout: 15000 });
      } catch (error) {
        result.bootWaitError = error.message;
      }
      Object.assign(result, await page.evaluate(() => ({
        actualUserAgent: navigator.userAgent,
        release: window.Meteor?.release,
        isModern: window.__meteor_runtime_config__?.isModern,
        reproResult: window.__issue14397 || null,
        renderedText: document.querySelector('#react-target')?.innerText || '',
        scriptUrls: Array.from(document.scripts).map(script => script.src).filter(Boolean),
      })));
      await page.screenshot({ path: path.join(outputDir, `${prefix}-${agent.name}.png`), fullPage: true });
      result.expectedRelease = expectedRelease;
      result.expectedIsModern = agent.name === 'chrome';
      result.pass = result.httpStatus === 200 &&
        result.release === expectedRelease &&
        result.isModern === result.expectedIsModern &&
        result.reproResult === 'tagged template literal' &&
        result.renderedText.includes('Welcome to Meteor') &&
        result.errors.length === 0;
      results.push(result);
      await context.close();
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(outputDir, `${prefix}-browser-results.json`), JSON.stringify(results, null, 2) + '\n');
  console.log(JSON.stringify(results, null, 2));
  if (results.some(result => !result.pass)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
