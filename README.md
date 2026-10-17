# Football Pro — Nền Tảng Đặt Sân & Quản Lý Bóng Đá Thông Minh ⚽🏟️

Hệ sinh thái ứng dụng Web toàn diện dành cho cầu thủ, đội bóng phủi và chủ cụm sân cỏ nhân tạo tại Việt Nam.

---

## 🌟 Tính Năng Nổi Bật

1. **Trực Tiếp Tỷ Số & Diễn Biến Trận Đấu (Live Match Tracker)**
   - Hiển thị tỷ số thời gian thực với đồng hồ đếm phút (0 - 90'+).
   - Nhật ký sự kiện chi tiết: Bàn thắng, Thẻ vàng, Thẻ đỏ, Thay người.
   
2. **Hệ Thống Đặt Sân Cỏ Nhân Tạo (Smart Pitch Booking)**
   - Tìm kiếm cụm sân bóng theo quận/huyện tại TP.HCM & Hà Nội.
   - Hiển thị trực quan các khung giờ trống theo block 90 phút (17:30, 19:00, 20:30).
   - Đặt sân nhanh chóng, giữ slot chống trùng lịch (Zero Double Booking).

3. **Sa Bàn Chiến Thuật 2D (Interactive Pitch Tactics)**
   - Sân bóng đồ họa chuẩn kích thước sân 5, sân 7 và sân 11.
   - Hỗ trợ các sơ đồ phổ biến: 3-2-1, 2-3-1, 4-3-3, 4-2-3-1.
   - Hiển thị vị trí cầu thủ theo số áo, tên và vị trí (GK, DF, MF, FW).

4. **Quản Lý Đội & Quỹ Bóng Đá (Team & Fund Manager)**
   - Quản lý danh sách cầu thủ đội bóng.
   - Tính toán chi phí tiền sân, tiền nước và phân chia công bằng cho từng thành viên.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript 5+
- **Styling:** Tailwind CSS, Lucide Icons, Glassmorphism & Custom Football Tokens
- **UI Components:** Shadcn UI Architecture (`src/components/ui/`)
- **Animation:** GSAP 3+, Canvas Confetti

---

## 🚀 Khởi Chạy Dự Án

```bash
# Cài đặt các gói phụ thuộc
npm install

# Chạy môi trường phát triển
npm run dev
```

Truy cập: `http://localhost:3000`

---

## 🤖 Đội Ngũ AI & Tài Nguyên Kế Thừa

- [AGENTS.md](./AGENTS.md): Đội ngũ 17 Agent chuyên sâu.
- [REPOS.md](./REPOS.md): Danh mục liên kết các kho mã nguồn kế thừa (`mos-master-studio`, `ANhthe`).
- [GEMINI.md](./GEMINI.md): Quy chuẩn điều phối và phát triển hệ thống.
- [.agents/skills/](./.agents/skills/): Các bộ kỹ năng `shadcn-ui`, `design-dna`, `gsap-skills`, `football-ui-specs`.
