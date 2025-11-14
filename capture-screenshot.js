const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--single-process']
  });

  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  console.log('Loading website...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('Capturing screenshot...');
  await page.screenshot({ path: '/tmp/ecommerce-live.jpg', type: 'jpeg', quality: 90, fullPage: false });

  await browser.close();
  console.log('✅ Screenshot saved to /tmp/ecommerce-live.jpg');
})();
