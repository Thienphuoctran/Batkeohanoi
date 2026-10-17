---
name: football-ui-specs
description: Tiêu chuẩn kỹ thuật và quy chuẩn miền bóng đá (Kích thước sân 5, sân 7, sân 11, ma trận tọa độ chiến thuật, khung giờ đặt sân phủi tại Việt Nam, trạng thái trận đấu).
---

# Football UI & Domain Specifications (Quy Chuẩn Miền Bóng Đá)

Tài liệu định nghĩa các thông số chuẩn phục vụ xây dựng giao diện và logic hệ thống bóng đá:

---

## 1. Quy Chuẩn Kích Thước Sân Bóng & Khung Khổ Sân Cỏ Phủi Việt Nam

| Loại Sân | Kích Thước Tiêu Chuẩn (m) | Số Người | Bề Mặt | Đặc Điểm Phổ Biến Tại VN |
| :--- | :--- | :--- | :--- | :--- |
| **Sân 5 Người (Futsal / Mini)** | 25m - 42m x 15m - 25m | 5 vs 5 | Cỏ nhân tạo / Sàn gỗ | Thích hợp thi đấu nhanh, đá cúp công ty, giải sinh viên |
| **Sân 7 Người (Sân Phủi Chuẩn)** | 50m - 75m x 30m - 55m | 7 vs 7 | Cỏ nhân tạo hạt cao su | Loại hình phổ biến nhất tại Hà Nội, TP.HCM và các tỉnh |
| **Sân 11 Người (Sân Lớn FIFA)** | 100m - 110m x 64m - 75m | 11 vs 11 | Cỏ tự nhiên / Cỏ lá gừng | Sân vận động chuyên nghiệp (Mỹ Đình, Thống Nhất, Thiên Trường) |

---

## 2. Quy Cách Khung Giờ Đặt Sân Cỏ Nhân Tạo (Booking Slots)

Các cụm sân bóng đá phủi tại Việt Nam chia slot theo block 90 phút (1 tiếng 30 phút):
- **Khung Giờ Vàng (Peak Hours - Giá cao nhất):**
  - **Slot 1:** 17:30 - 19:00 (Sau giờ tan sở)
  - **Slot 2:** 19:00 - 20:30 (Được đặt nhiều nhất, cần cọc trước)
  - **Slot 3:** 20:30 - 22:00 (Các đội đá muộn)
- **Khung Giờ Ngày (Off-Peak - Giảm 20% - 40%):**
  - Buổi sáng: 06:00 - 07:30, 07:30 - 09:00
  - Buổi chiều: 15:00 - 16:30, 16:00 - 17:30

---

## 3. Ma Trận Tọa Độ Sa Bàn Chiến Thuật 2D (Tọa Độ X%, Y%)

Tọa độ sân lấy gốc `(0, 0)` tại góc trên bên trái của sân bóng:
- **Trục X:** Chiều ngang sân (`0%` là biên trái, `50%` là trung lộ, `100%` là biên phải).
- **Trục Y:** Chiều dọc sân (`0%` là khung thành đối phương / hàng tiền đạo, `100%` là khung thành đội nhà / thủ môn).

### Sơ Đồ 7 Người: 3-2-1 (Cân Bằng & Phòng Ngự Phản Công)
- **GK (Thủ môn):** X: `50%`, Y: `90%`
- **CB-L (Hậu vệ trái):** X: `20%`, Y: `70%`
- **CB (Trung vệ thòng):** X: `50%`, Y: `72%`
- **CB-R (Hậu vệ phải):** X: `80%`, Y: `70%`
- **MF-L (Tiền vệ trái / Cánh):** X: `35%`, Y: `45%`
- **MF-R (Tiền vệ phải / Cánh):** X: `65%`, Y: `45%`
- **ST (Tiền đạo cắm):** X: `50%`, Y: `20%`

### Sơ Đồ 11 Người: 4-3-3 (Tấn Công Tổng Lực)
- **GK:** X: `50%`, Y: `92%`
- **LB:** X: `15%`, Y: `75%` | **CB-L:** X: `38%`, Y: `78%` | **CB-R:** X: `62%`, Y: `78%` | **RB:** X: `85%`, Y: `75%`
- **DM:** X: `50%`, Y: `60%` | **CM-L:** X: `32%`, Y: `48%` | **CM-R:** X: `68%`, Y: `48%`
- **LW:** X: `20%`, Y: `25%` | **CF:** X: `50%`, Y: `18%` | **RW:** X: `80%`, Y: `25%`
