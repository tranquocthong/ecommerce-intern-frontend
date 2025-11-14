# 📸 Hướng Dẫn Screenshot Streaming

Hệ thống cho phép xem live e-commerce website từ VM (Claude) về máy của bạn thông qua HTTP POST.

---

## 🎯 Cách Hoạt Động

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   React App     │         │  Screenshot     │         │   Your Server   │
│  localhost:3000 │  ────>  │     Client      │  ────>  │   Your PC       │
│  (VM - Claude)  │         │  (VM - Claude)  │  POST   │  localhost:9000 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
                                    │                            │
                                    │                            │
                                    └─── Chụp mỗi 2 giây ────────┘
```

---

## 📋 Bước 1: Setup Trên Máy Của Bạn

### 1.1. Download 2 files về máy:

Copy 2 files này về máy của bạn:
- ✅ `screenshot-server.js` (server code)
- ✅ `package.json` (dependencies)

### 1.2. Cài đặt dependencies:

```bash
# Tạo thư mục mới
mkdir ecommerce-viewer
cd ecommerce-viewer

# Copy screenshot-server.js vào đây

# Tạo package.json
npm init -y

# Cài dependencies
npm install express
```

### 1.3. Chạy server:

```bash
node screenshot-server.js
```

Bạn sẽ thấy:
```
============================================================
🚀 Screenshot Server đang chạy!
============================================================

📱 Mở trên máy này:
   http://localhost:9000

🌐 Mở từ thiết bị khác (cùng mạng WiFi):
   http://192.168.1.XXX:9000

📡 Endpoint nhận screenshot:
   POST http://192.168.1.XXX:9000/screenshot

============================================================
⏳ Đang chờ screenshots từ client...
```

**⚠️ QUAN TRỌNG:**
- Lưu lại địa chỉ IP này (ví dụ: `192.168.1.100`)
- Mở browser và vào `http://localhost:9000` để xem

---

## 🚀 Bước 2: Chạy Client Trên VM (Tôi làm)

### 2.1. Tôi cần biết địa chỉ IP của bạn

**Cho tôi biết địa chỉ IP từ bước 1.3**

Ví dụ: `192.168.1.100` hoặc nếu bạn có public IP/domain

### 2.2. Tôi sẽ cập nhật SERVER_URL và chạy:

```javascript
const SERVER_URL = 'http://YOUR_IP:9000/screenshot';
```

Thành:

```javascript
const SERVER_URL = 'http://192.168.1.100:9000/screenshot';
```

### 2.3. Sau đó tôi chạy:

```bash
xvfb-run node screenshot-client.js
```

---

## 🎨 Bước 3: Xem Kết Quả

1. **Mở browser trên máy của bạn:**
   ```
   http://localhost:9000
   ```

2. **Bạn sẽ thấy:**
   - Giao diện web đẹp với thông tin real-time
   - Screenshot của e-commerce website
   - Tự động cập nhật mỗi 2 giây
   - Thông tin: trạng thái, thời gian, kích thước

---

## 🔧 Troubleshooting

### ❌ Client không kết nối được?

**Kiểm tra:**
1. Server đã chạy chưa? (`node screenshot-server.js`)
2. Firewall có block port 9000?
   ```bash
   # Windows
   netsh advfirewall firewall add rule name="Screenshot Server" dir=in action=allow protocol=TCP localport=9000

   # Linux/Mac
   sudo ufw allow 9000
   ```
3. Cùng mạng WiFi? (Nếu dùng local IP)
4. SERVER_URL đúng chưa?

### 🌐 Nếu muốn access từ internet (không cùng mạng):

**Option 1: Dùng ngrok (trên máy của bạn)**
```bash
npx ngrok http 9000
```

Sẽ có URL như: `https://xxxx.ngrok.io`

Cho tôi URL này, tôi sẽ cập nhật:
```javascript
const SERVER_URL = 'https://xxxx.ngrok.io/screenshot';
```

**Option 2: Public IP**
Nếu máy bạn có public IP, forward port 9000:
```
Router Settings → Port Forwarding → Port 9000 → Your PC IP
```

---

## 📊 Specs

- **Resolution:** 1920x1080
- **Format:** JPEG (quality 80%)
- **Size:** ~150-300 KB/screenshot
- **Interval:** 2 seconds
- **Latency:** < 500ms (tùy network)

---

## 🎯 Bước Tiếp Theo

**Cho tôi biết địa chỉ IP/URL của server bạn!**

Ví dụ:
- ✅ `http://192.168.1.100:9000` (local network)
- ✅ `http://your-public-ip:9000` (public IP)
- ✅ `https://xxxx.ngrok.io` (ngrok)
- ✅ `http://yourdomain.com` (domain)

Tôi sẽ cập nhật và chạy client ngay!
