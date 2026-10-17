# HƯỚNG DẪN CÀI ĐẶT & VẬN HÀNH TELEGRAM BOT (@BatKeo7_AlertBot)
**Dự án:** Nền Tảng Ghép Trận Sân 7 Hà Nội — `BắtKèo7.vn` (v2.0)  
**Phân hệ:** Telegram & Zalo Real-Time Webhook Engine  

---

## 📌 I. TỔNG QUAN VỀ TELEGRAM BOT TRONG BẮTKÈO7.VN
Bot Telegram đóng 3 vai trò sống còn trong chu trình ghép trận và chống bùng kèo:
1. **Phát tín hiệu Kèo Cứu Hộ SOS (< 2 tiếng):** Bắn thông báo khẩn cấp tới Kênh phát sóng cộng đồng (`@batkeo7_hanoi_feed`) khi đối thủ hủy sát giờ, kèm ưu đãi giảm giá sân (`125.000đ`) và số điện thoại đội trưởng.
2. **Khóa Kèo Row-Level Lock tức thì:** Bắn tin xác nhận kèm thông tin sân bóng tới 2 đội trưởng ngay khi bắt đối thành công.
3. **Cảnh báo vi phạm & Nhãn đỏ công khai:** Tự động thông báo tới Kênh khi một đội vi phạm hủy sát giờ lần 2 bị trừ điểm và kích hoạt cọc 100%.

---

## 🛠️ II. 5 BƯỚC THIẾT LẬP THỰC TẾ ĐỂ BOT CHẠY THẬT (PRODUCTION)

### Bước 1: Tạo Bot và lấy Token từ `@BotFather`
1. Mở ứng dụng Telegram, tìm kiếm **`@BotFather`** (có tích xanh xác thực).
2. Nhập lệnh:
   ```text
   /newbot
   ```
3. Đặt tên hiển thị cho Bot (Display Name):
   ```text
   BắtKèo7 Hà Nội — Bot Ghép Trận Sân 7
   ```
4. Đặt Username duy nhất cho Bot (phải kết thúc bằng chữ `bot`):
   ```text
   BatKeo7_AlertBot   (hoặc BatKeo7_Hanoi_Bot)
   ```
5. `@BotFather` sẽ trả về **HTTP API Token**, ví dụ:
   ```text
   7123456789:AAFlmQ_abcdefgh123456789xyz
   ```
   👉 *Lưu token này để điền vào file `.env.local`.*

---

### Bước 2: Cài đặt danh sách lệnh Slash Commands
Gửi lệnh `/setcommands` cho `@BotFather`, chọn bot vừa tạo và paste toàn bộ danh sách sau:
```text
start - Khởi động bot & xem hướng dẫn tra cứu
keohomnay - Xem các kèo đang mở tại Cầu Giấy & Nam Từ Liêm
sos - Xem trạm cứu hộ kèo phút chót (<2h, giảm 125k)
diemuytin - Tra cứu quy chế tín nhiệm 100đ & cơ chế gỡ nhãn
taokeo - Hướng dẫn mở kèo ghép trận mới
trogiup - Hỗ trợ kỹ thuật & báo cáo sự cố bất khả kháng
```

---

### Bước 3: Tạo Kênh Phát Sóng (Channel) & Lấy Chat ID
1. Trên Telegram, bấm **New Channel** (ví dụ tên: `BắtKèo7 — Kèo Sân 7 Hà Nội`).
2. Đặt link công khai (Public Link), ví dụ: `t.me/batkeo7_hanoi_feed`.
3. **Thêm Bot vào Kênh làm Quản Trị Viên (Admin):**
   - Vào Channel Settings ➔ Administrators ➔ Add Administrator ➔ Tìm `@BatKeo7_AlertBot`.
   - Cấp quyền: **Post Messages** (Đăng tin).
4. Chat ID của kênh công khai sẽ chính là username: `@batkeo7_hanoi_feed`.
   *(Nếu là Group kín, dùng bot `@userinfobot` hoặc `@getmyid_bot` để lấy ID số âm, ví dụ: `-100192837465`).*

---

### Bước 4: Đăng ký Webhook với Telegram API
Để Telegram tự động gửi các tin nhắn/lệnh của người dùng về API Route của ứng dụng:

#### 1. Khi chạy Production (Vercel / Tên miền thật):
Mở trình duyệt hoặc dùng `curl` chạy lệnh sau:
```bash
curl -F "url=https://batkeo7.vn/api/telegram/webhook" \
     -F "secret_token=batkeo7_super_secret_webhook_key_2026" \
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```
*Kết quả trả về thành công:*
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

#### 2. Khi chạy thử nghiệm tại máy Local (Localhost):
Do Telegram không thể gọi trực tiếp `http://localhost:3000`, bạn mở terminal chạy `ngrok` hoặc `localtunnel`:
```bash
npx localtunnel --port 3000
# hoặc
ngrok http 3000
```
Sau đó đăng ký URL ngrok:
```text
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://xxxx.ngrok-free.app/api/telegram/webhook&secret_token=batkeo7_super_secret_webhook_key_2026
```

---

### Bước 5: Cấu hình biến môi trường `.env.local`
Tạo file `.env.local` tại thư mục gốc dự án:
```env
TELEGRAM_BOT_TOKEN="7123456789:AAFlmQ_abcdefgh123456789xyz"
TELEGRAM_CHAT_ID="@batkeo7_hanoi_feed"
TELEGRAM_WEBHOOK_SECRET="batkeo7_super_secret_webhook_key_2026"
NEXT_PUBLIC_APP_URL="https://batkeo7.vn"
```

---

## 🔍 III. KIỂM THỬ TỨC THÌ (SMOKE TEST)
1. **Kiểm tra trạng thái Webhook:**
   Truy cập URL trên trình duyệt:
   ```text
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo
   ```
2. **Thử nghiệm trên giao diện Web:**
   - Mở ứng dụng tại [preview_batkeo7.html](file:///d:/google%20antigravity/App%20%C4%91%C3%A1%20b%C3%B3ng/preview_batkeo7.html) hoặc trang chủ Next.js.
   - Bấm vào biểu tượng chuông **🔔** trên thanh Header.
   - Bấm nút **"Bắn thử thông báo test qua Telegram Bot"**.
   - Kênh Telegram sẽ nhận được ngay bản tin định dạng chuẩn HTML kèm nút bấm mở web app.
