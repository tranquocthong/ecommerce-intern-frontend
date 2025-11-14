#!/bin/bash

# ===================================================
# Script khởi động screenshot streaming
# ===================================================

echo ""
echo "============================================================"
echo "📸 E-Commerce Screenshot Streaming"
echo "============================================================"
echo ""

# Kiểm tra server URL đã cấu hình chưa
SERVER_URL=$(grep "const SERVER_URL" screenshot-client.js | cut -d"'" -f2)

if [[ $SERVER_URL == *"YOUR_IP"* ]]; then
    echo "❌ LỖI: Chưa cấu hình SERVER_URL!"
    echo ""
    echo "📝 Bạn cần:"
    echo "   1. Chạy server trên máy của bạn:"
    echo "      node screenshot-server.js"
    echo ""
    echo "   2. Lấy địa chỉ IP (ví dụ: http://192.168.1.100:9000)"
    echo ""
    echo "   3. Cập nhật file screenshot-client.js:"
    echo "      const SERVER_URL = 'http://YOUR_IP:9000/screenshot';"
    echo ""
    echo "   4. Chạy lại script này!"
    echo ""
    exit 1
fi

echo "✅ Server URL: $SERVER_URL"
echo ""
echo "🚀 Đang khởi động..."
echo ""

# Chạy với Xvfb (virtual display)
xvfb-run --server-args="-screen 0 1920x1080x24" node screenshot-client.js
