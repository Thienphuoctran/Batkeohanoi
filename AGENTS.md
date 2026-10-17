# Football Pro — Antigravity Agent Ecosystem

Dự án này là nền tảng **App Bóng Đá Thông Minh (Football Pro Platform)** bao gồm Đặt Sân Cỏ Nhân Tạo, Tỷ Số Trực Tiếp (Live Score), Sa Bàn Chiến Thuật 2D và Quản Lý Giải Đấu & Đội Bóng Phủi Việt Nam.

---

## 1. Hệ thống 17 Agents Chuyên Sâu (trong `.agents/agents/`)
1. **01-orchestrator.md**: Tổng Đạo Diễn Dự Án (Spec-First, chia pha và điều phối tiến độ)
2. **02-backend-architect.md**: Kỹ sư Kiến Trúc API & Quản lý Luồng Dữ Liệu
3. **03-frontend-ui.md**: Chuyên gia Frontend & UI/UX (shadcn/ui Master, Mobile-First, Bento Grid)
4. **04-database-expert.md**: Quản lý CSDL Sân Bóng, Lịch Đặt, Bảng Xếp Hạng & Cầu Thủ
5. **05-devops-deployer.md**: Kỹ sư Triển khai & Tối ưu Static Export / Vercel / PWA
6. **06-code-reviewer.md**: Chuyên gia Soi Mã & Rà soát Lỗi logic (<150 dòng/file, Clean Code)
7. **07-qa-tester.md**: Kỹ sư Kiểm thử Tự động & Test Luồng Đặt Sân, Xung Đột Lịch
8. **08-security-auditor.md**: Kiểm toán viên An ninh (Zero-Trust, Chống Spam Đặt Sân, Rate Limiting)
9. **09-video-producer.md**: Sản xuất Video Demo & Hướng Dẫn Tính Năng
10. **10-pitch-tactics-engine.md**: **Chuyên gia Sa Bàn & Sơ Đồ Chiến Thuật Bóng Đá (3-2-1, 4-3-3, Drag & Drop)**
11. **11-market-poster.md**: Truyền thông Giải đấu & Kết nối Cộng đồng Phủi
12. **12-copywriter-seo.md**: Tối ưu Nội dung Tin tức Bóng đá, Sân bóng & SEO
13. **13-stats-financial.md**: Thống kê Tài chính Đặt Sân, Quỹ Đội, Tiền Nước & Tiền Sân
14. **14-tournament-manager.md**: Quản trị Giải Đấu (Vòng Bảng, Knockout, Tính Điểm, Hiệu Số)
15. **15-prompt-architect.md**: Kỹ sư Tinh chỉnh Super-Prompt cho AI Assistant
16. **16-live-match-tracker.md**: **Chuyên gia Tỷ Số Trực Tiếp, Bàn Thắng, Thẻ Phạt & Timeline Trận Đấu**
17. **17-pitch-booking-manager.md**: **Kiến trúc sư Vận Hành & Khóa Slot Đặt Sân Cỏ Nhân Tạo**

---

## 2. Hệ thống Kỹ Năng / Skills (trong `.agents/skills/`)
- **`shadcn-ui`**: Bộ component UI chuẩn hóa (Button, Card, Badge, Dialog, Tabs, Input, Select).
- **`design-dna`**: Hệ thống giao diện thể thao hiện đại, kính mờ Glassmorphism, sân cỏ 2D.
- **`gsap-skills`**: Hoạt ảnh mượt mà cho bảng tỷ số, danh sách sự kiện trận đấu và chuyển động cầu thủ.
- **`football-ui-specs`**: Quy chuẩn kích thước sân cỏ 5/7/11, khung giờ đặt sân phủi và tọa độ chiến thuật.

---

## 3. Quy trình Thực thi Chuẩn (4-Agent Loop)
Mỗi tính năng mới bắt buộc đi qua 4 trạm:
`[ARCHITECT]` (Khóa Spec tiêu chuẩn) ➔ `[CODER]` (Viết code modular với Shadcn & Tailwind) ➔ `[REVIEWER]` (Rà soát logic & tối ưu re-render) ➔ `[TESTER]` (Kiểm thử tải giao diện và tương tác).

---

## 4. Tài Liệu Kế Thừa Liên Quan
- Danh mục Repo kế thừa: [REPOS.md](file:///d:/google%20antigravity/App%20đá%20bóng/REPOS.md)
- Nguyên tắc chỉ đạo AI: [GEMINI.md](file:///d:/google%20antigravity/App%20đá%20bóng/GEMINI.md)
