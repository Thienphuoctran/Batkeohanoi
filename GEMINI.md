# Master System Guidelines for Football Pro (App Đá Bóng)

## 1. Trigger /pipeline (4-Agent Loop)
Khi người dùng yêu cầu làm một tính năng mới hoặc prompt bắt đầu bằng `/pipeline`: Chạy khép kín 4 bước:
1. **[ARCHITECT]**: Khóa Spec & Hợp đồng dữ liệu (`football.ts`, TypeScript interfaces, Input/Output).
2. **[CODER]**: Viết code modular (<150-200 dòng/file), bắt buộc dùng `shadcn/ui` tại `@/components/ui/`.
3. **[REVIEWER]**: Soi lỗi logic, chống trùng lịch đặt sân, rà soát hiệu năng render trên di động.
4. **[TESTER]**: Kiểm thử tự động tương tác click, đổi tab và luồng người dùng.

## 2. Token & Quota Economy
- Chỉ in đúng đoạn code cần sửa (Git Diff / ReplacementChunk), tuyệt đối không in lại toàn bộ file dài.
- Khi làm Web: Bắt buộc dùng component của `shadcn/ui` (`src/components/ui/`) để giảm thiểu code CSS viết tay.
- Cấm đọc các thư mục/file nặng: `node_modules`, `.git`, `.next`, `dist`, `build`, `package-lock.json`.

## 3. Kiến Trúc Cốt Lõi Football Pro
- **Frontend**: Next.js 14+ (App Router, TypeScript), Tailwind CSS, Shadcn UI, Lucide React.
- **Visuals & Motion**:
  - Sân cỏ 2D (`pitch-pattern`, tọa độ X%, Y%).
  - GSAP (Score Tween, Match Timeline, Sa bàn đổi sơ đồ).
  - Canvas Confetti (Hiệu ứng ăn mừng bàn thắng & xác nhận đặt sân).
- **Phân Hệ Nghiệp Vụ Chính**:
  1. **Live Score & Match Tracker**: Bảng tỷ số trực tiếp, sự kiện bàn thắng, thẻ vàng/đỏ, thay người.
  2. **Pitch Booking System**: Quản lý cụm sân cỏ nhân tạo, lọc theo quận/huyện, đặt slot 90 phút (khung giờ vàng 17h30, 19h00, 20h30).
  3. **Tactical Board (Sa Bàn)**: Bố trí đội hình 5 người, 7 người (3-2-1), 11 người (4-3-3), kéo thả cầu thủ.
  4. **Team & Tournament Manager**: Quản lý danh sách cầu thủ, quỹ đội, chia tiền sân, bảng xếp hạng giải đấu.

## 4. Danh Mục Tài Liệu Trọng Yếu
- [REPOS.md](file:///d:/google%20antigravity/App%20đá%20bóng/REPOS.md): Các kho mã nguồn kế thừa (`mos-master-studio`, `ANhthe`).
- [AGENTS.md](file:///d:/google%20antigravity/App%20đá%20bóng/AGENTS.md): Đội ngũ 17 chuyên gia AI chuyên sâu.
- [football-ui-specs](file:///d:/google%20antigravity/App%20đá%20bóng/.agents/skills/football-ui-specs/SKILL.md): Tiêu chuẩn kỹ thuật miền bóng đá.
