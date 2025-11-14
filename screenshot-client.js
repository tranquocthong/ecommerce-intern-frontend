// ===================================================
// CLIENT-SIDE CODE - Chạy trên VM (máy của Claude)
// ===================================================
// Chụp màn hình website và POST lên server của bạn
// ===================================================

const { chromium } = require('playwright');
const axios = require('axios');

// ⚠️ QUAN TRỌNG: Thay đổi URL này thành địa chỉ server của bạn
const SERVER_URL = 'https://uncolourably-subdeltoidal-elly.ngrok-free.dev/screenshot';

// Ví dụ:
// const SERVER_URL = 'http://192.168.1.100:9000/screenshot';
// const SERVER_URL = 'http://yourdomain.com/screenshot';

const WEBSITE_URL = 'http://localhost:3000';
const SCREENSHOT_INTERVAL = 2000; // 2 giây

let browser = null;
let page = null;
let screenshotCount = 0;
let errorCount = 0;

async function setupBrowser() {
  console.log('🌐 Đang khởi động browser...');

  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--single-process'
    ]
  });

  page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  console.log('📱 Đang load website:', WEBSITE_URL);
  await page.goto(WEBSITE_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });

  console.log('✅ Browser đã sẵn sàng!\n');
}

async function captureAndSend() {
  try {
    // Chụp màn hình
    const screenshot = await page.screenshot({
      type: 'jpeg',
      quality: 80,
      fullPage: false
    });

    // Convert sang base64
    const base64Image = `data:image/jpeg;base64,${screenshot.toString('base64')}`;

    // POST lên server
    const response = await axios.post(SERVER_URL, {
      image: base64Image,
      timestamp: Date.now()
    }, {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'ngrok-skip-browser-warning': 'true'
      }
    });

    screenshotCount++;
    const size = (base64Image.length / 1024).toFixed(2);
    const time = new Date().toLocaleTimeString('vi-VN');

    console.log(`✅ [${screenshotCount}] Đã gửi screenshot ${size} KB - ${time}`);

    if (errorCount > 0) {
      console.log(`🔄 Kết nối đã khôi phục!`);
      errorCount = 0;
    }

  } catch (error) {
    errorCount++;

    if (error.code === 'ECONNREFUSED') {
      console.error(`❌ [${errorCount}] Không thể kết nối tới server: ${SERVER_URL}`);
      console.error(`   → Bạn đã chạy server chưa? (node screenshot-server.js)`);
    } else if (error.code === 'ETIMEDOUT') {
      console.error(`⏱️  [${errorCount}] Timeout - Server phản hồi quá chậm`);
    } else {
      console.error(`❌ [${errorCount}] Lỗi:`, error.message);
    }

    if (errorCount === 1) {
      console.log('💡 Tips: Kiểm tra lại SERVER_URL và đảm bảo server đang chạy!\n');
    }
  }
}

async function start() {
  console.log('\n' + '='.repeat(60));
  console.log('📸 Screenshot Client - Bắt đầu chạy!');
  console.log('='.repeat(60));
  console.log(`🎯 Target website: ${WEBSITE_URL}`);
  console.log(`📡 Server endpoint: ${SERVER_URL}`);
  console.log(`⏱️  Interval: ${SCREENSHOT_INTERVAL / 1000} giây`);
  console.log('='.repeat(60) + '\n');

  try {
    await setupBrowser();

    // Chụp ngay lần đầu
    await captureAndSend();

    // Sau đó chụp định kỳ
    setInterval(captureAndSend, SCREENSHOT_INTERVAL);

  } catch (error) {
    console.error('💥 Lỗi khởi động:', error.message);
    process.exit(1);
  }
}

// Cleanup khi tắt
process.on('SIGINT', async () => {
  console.log('\n\n⏹️  Đang dừng client...');
  if (browser) {
    await browser.close();
  }
  console.log(`📊 Tổng kết: Đã gửi ${screenshotCount} screenshots`);
  console.log('👋 Tạm biệt!\n');
  process.exit(0);
});

// Bắt đầu
start();
