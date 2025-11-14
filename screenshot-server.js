// ===================================================
// SERVER-SIDE CODE - Chạy trên máy của bạn
// ===================================================
// Cách chạy: node screenshot-server.js
// Sau đó mở browser: http://localhost:9000
// ===================================================

const express = require('express');
const app = express();
const PORT = 9000;

let latestScreenshot = null;
let lastUpdateTime = null;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS - cho phép nhận từ mọi nguồn
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Trang web hiển thị screenshot
app.get('/', (req, res) => {
  const stats = {
    hasScreenshot: !!latestScreenshot,
    lastUpdate: lastUpdateTime ? new Date(lastUpdateTime).toLocaleString('vi-VN') : 'Chưa có',
    size: latestScreenshot ? `${(latestScreenshot.length / 1024).toFixed(2)} KB` : '0 KB'
  };

  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>E-Commerce Website Live View</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          min-height: 100vh;
          padding: 20px;
        }
        .container {
          max-width: 1920px;
          margin: 0 auto;
        }
        .header {
          background: white;
          border-radius: 15px;
          padding: 20px 30px;
          margin-bottom: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
        }
        h1 {
          color: #667eea;
          font-size: 28px;
          margin: 0;
        }
        .stats {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .stat {
          background: #f0f0f0;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
        }
        .stat strong {
          color: #667eea;
          display: block;
        }
        .screen-container {
          background: white;
          border-radius: 15px;
          padding: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          text-align: center;
        }
        #screenshot {
          max-width: 100%;
          border-radius: 10px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .loading {
          padding: 100px;
          color: #999;
          font-size: 18px;
        }
        .status {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${stats.hasScreenshot ? '#4CAF50' : '#ff9800'};
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .refresh-info {
          margin-top: 15px;
          color: #666;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div>
            <h1>🛍️ E-Commerce Website - Live Preview</h1>
            <div class="refresh-info">
              <span class="status"></span>
              Tự động cập nhật mỗi 2 giây
            </div>
          </div>
          <div class="stats">
            <div class="stat">
              <strong>Trạng thái</strong>
              ${stats.hasScreenshot ? '✅ Đang nhận' : '⏳ Đang chờ'}
            </div>
            <div class="stat">
              <strong>Cập nhật lần cuối</strong>
              ${stats.lastUpdate}
            </div>
            <div class="stat">
              <strong>Kích thước</strong>
              ${stats.size}
            </div>
          </div>
        </div>

        <div class="screen-container">
          <img id="screenshot" src="/stream" alt="Loading screenshot...">
        </div>
      </div>

      <script>
        // Tự động refresh mỗi 2 giây
        setInterval(() => {
          const img = document.getElementById('screenshot');
          img.src = '/stream?' + Date.now();

          // Cập nhật stats
          fetch('/stats')
            .then(r => r.json())
            .then(data => {
              document.querySelector('.stats').innerHTML = \`
                <div class="stat">
                  <strong>Trạng thái</strong>
                  \${data.hasScreenshot ? '✅ Đang nhận' : '⏳ Đang chờ'}
                </div>
                <div class="stat">
                  <strong>Cập nhật lần cuối</strong>
                  \${data.lastUpdate}
                </div>
                <div class="stat">
                  <strong>Kích thước</strong>
                  \${data.size}
                </div>
              \`;
            });
        }, 2000);
      </script>
    </body>
    </html>
  `);
});

// API nhận screenshot từ client
app.post('/screenshot', (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Lưu screenshot (base64)
    latestScreenshot = image;
    lastUpdateTime = Date.now();

    console.log(`✅ Received screenshot: ${(image.length / 1024).toFixed(2)} KB at ${new Date().toLocaleTimeString('vi-VN')}`);

    res.json({
      success: true,
      timestamp: lastUpdateTime,
      size: image.length
    });
  } catch (error) {
    console.error('❌ Error receiving screenshot:', error);
    res.status(500).json({ error: error.message });
  }
});

// API lấy screenshot mới nhất
app.get('/stream', (req, res) => {
  if (!latestScreenshot) {
    // Tạo placeholder image khi chưa có screenshot
    const placeholder = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    res.set('Content-Type', 'image/png');
    return res.send(placeholder);
  }

  // Gửi screenshot (base64 decoded)
  const imageBuffer = Buffer.from(latestScreenshot.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  res.set('Content-Type', 'image/jpeg');
  res.send(imageBuffer);
});

// API lấy stats
app.get('/stats', (req, res) => {
  res.json({
    hasScreenshot: !!latestScreenshot,
    lastUpdate: lastUpdateTime ? new Date(lastUpdateTime).toLocaleString('vi-VN') : 'Chưa có',
    size: latestScreenshot ? `${(latestScreenshot.length / 1024).toFixed(2)} KB` : '0 KB',
    timestamp: lastUpdateTime
  });
});

// Lấy local IP address
const os = require('os');
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log('\n' + '='.repeat(60));
  console.log('🚀 Screenshot Server đang chạy!');
  console.log('='.repeat(60));
  console.log(`\n📱 Mở trên máy này:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`\n🌐 Mở từ thiết bị khác (cùng mạng WiFi):`);
  console.log(`   http://${localIP}:${PORT}`);
  console.log(`\n📡 Endpoint nhận screenshot:`);
  console.log(`   POST http://${localIP}:${PORT}/screenshot`);
  console.log('\n' + '='.repeat(60));
  console.log('⏳ Đang chờ screenshots từ client...\n');
});
