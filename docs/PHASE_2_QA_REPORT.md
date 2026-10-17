# BÁO CÁO KIỂM THỬ & NGHIỆM THU PHA 2: DATABASE ARCHITECTURE & API SERVICES
**Dự án:** Nền Tảng Ghép Trận Sân 7 Hà Nội — `BắtKèo7.vn`  
**Phiên bản:** Pha 2 (Database DDL + Row-Level Lock + API Services + Telegram Bot)  
**Quy trình:** 4-Agent Loop `[ARCHITECT]` ➔ `[CODER]` ➔ `[REVIEWER]` ➔ `[TESTER]`  

---

## 📋 I. TỔNG HỢP CÁC HẠNG MỤC HOÀN THÀNH (PHA 2)

### 1. Kiến Trúc Cơ Sở Dữ Liệu PostgreSQL / Supabase (`supabase/schema.sql`)
- [x] **7 Bảng dữ liệu cốt lõi**:
  - `public.teams`: Hồ sơ đội bóng, 3 Tier trình độ, điểm tín nhiệm (0–100đ), nhãn đỏ `TUNG_BUNG_KEO`, chuỗi trận sạch, thông tin VietQR mặc định.
  - `public.pitches`: Danh mục cụm sân 7 Cầu Giấy & Nam Từ Liêm (*Trung Kính Hạ, Thành Phát, Mễ Trì Hạ, ĐH Thương Mại, Đình Thôn...*).
  - `public.matches`: Kèo đấu sân 7, ca giờ, chi phí chia 50/50, cờ SOS `< 2h`, cờ ký quỹ `escrow_required`, optimistic locking version.
  - `public.sub_player_posts`: Chợ cầu lẻ khẩn cấp theo vị trí (*GK, DF, FW*), mức share tiền sân.
  - `public.roll_call_sessions` & `public.roll_call_members`: Điểm danh 1-chạm, trạng thái *Đi đá / Nghỉ*, đồng bộ quân số sang VietQR.
  - `public.blind_reviews`: Đánh giá mù 2 chiều (3 tiêu chí 5★ + vote lại Tier thực tế).
  - `public.penalty_audit_logs`: Nhật ký kiểm toán biến động điểm tín nhiệm và chế tài vi phạm.

### 2. Stored Procedure Khóa Hàng `fn_lock_match_challenge`
- Sử dụng `SELECT * FROM public.matches WHERE id = p_match_id FOR UPDATE;`
- Đảm bảo **ACID Transaction**: Chặn đứng 100% tình trạng hai đội cùng nhấn bắt đối 1 kèo tại cùng 1 thời điểm (Race Condition). Đội đến sau sẽ nhận thông báo `ALREADY_MATCHED`.
- Tự động kiểm tra điểm tín nhiệm của đội nhận kèo: Nếu `< 70đ` hoặc có nhãn đỏ `TUNG_BUNG_KEO`, tự động kích hoạt cờ `escrow_required = true` (yêu cầu ký quỹ 200.000đ).

### 3. Telegram Webhook Alert Engine (`src/services/telegramBotService.ts`)
- Tích hợp Bot `@BatKeo7_AlertBot` với định dạng tin nhắn HTML chuẩn:
  - Bản tin SOS khẩn cấp: Giảm 125k tiền sân + Tặng nước + Số điện thoại liên hệ.
  - Bản tin Khóa kèo thành công: Ghi nhận 2 đội và thời gian chốt kèo.
  - Bản tin Cảnh báo vi phạm & Nhãn đỏ công khai.

### 4. Hệ Thống Route Handlers (Next.js App Router)
- `GET /api/matches`: Lọc đa chiều theo Quận, Tier (1, 2, 3), Khung giờ (17:30, 19:00, 20:30), Từ khóa tìm kiếm và Cờ SOS.
- `POST /api/matches`: Tạo kèo mới và tự động kích hoạt thông báo cứu hộ SOS.
- `POST /api/matches/[id]/challenge`: Khóa kèo nguyên tử chống trùng lịch.
- `POST /api/telegram/webhook`: Xử lý lệnh bot và dispatch thông báo.
- `POST /api/reviews`: Tiếp nhận đánh giá mù và tự động mở khóa kết quả khi cả 2 đội cùng gửi.

---

## 🧪 II. MA TRẬN KIỂM THỬ (TEST EXECUTION MATRIX)

| Mã Test | Kịch Bản Kiểm Thử | Dữ Liệu Đầu Vào | Kết Quả Thực Tế | Đánh Giá |
| :--- | :--- | :--- | :--- | :--- |
| **P2-TC-01** | **Khóa kèo đồng thời (Race Condition)** | 2 request cùng gọi tới `/api/matches/m-1/challenge` | Request 1 thành công (`LOCKED_SUCCESSFULLY`); Request 2 trả về mã `ALREADY_MATCHED` (409). Không bị trùng lịch. | **PASSED (100%)** |
| **P2-TC-02** | **Ký quỹ cho đội dưới 70 điểm** | Đội có `creditScore = 35` nhận kèo | Hệ thống kích hoạt `escrowRequired = true`, yêu cầu ký quỹ 200.000đ. | **PASSED (100%)** |
| **P2-TC-03** | **Miễn cọc cho đội uy tín cao** | Đội có `creditScore = 100` nhận kèo | Hệ thống xác nhận `escrowRequired = false`, miễn 100% cọc tiền mặt. | **PASSED (100%)** |
| **P2-TC-04** | **Phát sóng Kèo Cứu Hộ SOS lên Telegram** | Đăng kèo mới với `isSOS = true` | Bot `@BatKeo7_AlertBot` định dạng bản tin HTML cứu hộ kèm ưu đãi giảm 125k. | **PASSED (100%)** |
| **P2-TC-05** | **Đánh giá mù tự động mở khóa (2-Way)** | Đội 1 gửi đánh giá -> Đội 2 gửi đánh giá | Khi chỉ có Đội 1 gửi: Kết quả ẩn. Khi Đội 2 gửi: `bothSubmitted = true`, mở khóa kết quả 2 chiều. | **PASSED (100%)** |

---

## 🎯 III. KẾT LUẬN & SẴN SÀNG CHUYỂN GIAO PHA 3
- Toàn bộ cơ chế khóa hàng Row-Level Lock, Database DDL và API Services đã được triển khai hoàn chỉnh, sẵn sàng kết nối trực tiếp với Supabase Production.
- Sẵn sàng chuyển giao sang **Pha 3: Sa bàn chiến thuật 2D tương tác (Tactical Board 3-2-1 cho sân 7), Bảng tỷ số trực tiếp (Live Match Tracker) và Quản lý giải đấu phủi.**
