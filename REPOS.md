# Danh Mục Các Kho Mã Nguồn & Dự Án Antigravity Đã Kết Nối (REPOS & PROJECTS)

Tài liệu này tổng hợp các kho mã nguồn, dự án và tài nguyên đã có trên hệ thống máy tính để các AI Agent trong dự án **App Đá Bóng (Football Pro Platform)** dễ dàng tra cứu, kế thừa và áp dụng:

---

## 1. Dự Án Hiện Tại
- **Đường dẫn:** `d:\google antigravity\App đá bóng`
- **Mục tiêu:** Nền tảng Đặt Sân Cỏ Nhân Tạo, Quản Lý Giải Đấu & Trận Đấu, Tỷ Số Trực Tiếp (Live Score), Sa Bàn Chiến Thuật 2D và Quản Lý Đội Bóng Phủi.
- **Kiến trúc cốt lõi:**
  - **Framework:** Next.js 14+ (App Router, TypeScript, React 18/19).
  - **Styling & Theme:** Tailwind CSS với Football Tokens (`pitch`, `live`, `stadium-navy`), CSS Variables, Glassmorphism.
  - **Component Library:** Shadcn UI (`components.json`), Lucide Icons, Radix Primitives.
  - **Visuals & Motion:** Canvas 2D Pitch Engine, GSAP Animations (Tween điểm số, match event cards, timeline diễn biến).
  - **Data Engine:** Mock Data thực tế tại Việt Nam (Chảo Lửa Tân Bình, K300, Thống Nhất Arena, FC Phủi Sài Gòn, Hà Nội Capital FC).

---

## 2. Dự Án Kế Thừa: MOS Master Studio
- **Đường dẫn:** `d:\google antigravity\mos-master-studio`
- **Tài nguyên kế thừa:**
  - **Hệ thống 17 Agents chuyên sâu** (`01-orchestrator` đến `17-proctor`) chia pha chặt chẽ.
  - **Quy trình 4-Agent Loop chuẩn mực**: `[ARCHITECT]` -> `[CODER]` -> `[REVIEWER]` -> `[TESTER]`.
  - **Thiết kế Spatial Bento Grid & Glassmorphism** từ `design-dna`.
  - **Quy chuẩn Token & Quota Economy**: Viết code modular (<150 dòng/file), cấm quét thư mục rác `node_modules`, `.next`, `dist`.
  - **Bảo mật Zero-Trust**: RLS Prisma, API Proxy giấu key máy chủ, Rate Limiter.

---

## 3. Dự Án Kế Thừa: ANhthe Studio
- **Đường dẫn:** `d:\google antigravity\ANhthe`
- **Tài nguyên kế thừa:**
  - Thuật toán Canvas 2D vẽ vạch sân bóng, định vị tọa độ cầu thủ (X%, Y%).
  - Kỹ thuật tối ưu hóa Client-side state, Responsive UI thân thiện trên điện thoại di động (Mobile-First).
  - Hiệu ứng `canvas-confetti` khi đặt sân thành công hoặc trận đấu có bàn thắng.
  - Cấu trúc thư mục `.agents/skills/` và các tài liệu chuẩn hóa `AGENTS.md`, `GEMINI.md`.

---

## 4. Dự Án Tham Khảo: Ứng Dụng Học Toán
- **Đường dẫn:** `d:\google antigravity\ứng dụng học toán`
- **Tài nguyên kế thừa:**
  - Cấu trúc tối giản của Next.js + TypeScript.
  - Cách tổ chức các component tương tác nhẹ và nhanh.

---

## 5. Hệ Sinh Thái Agency Agents & Global Plugins
- **Đường dẫn Plugin:** `C:\Users\phuoc\.gemini\config\plugins\agency-agents`
- **Thư viện Skill toàn cục:** `C:\Users\phuoc\.agents\skills`
  - `shadcn`: Quy tắc sử dụng component registry, cấm code CSS thủ công lặp lại.
  - `design-dna`: Hệ thống 3 chiều (Design System, Design Style, Visual Effects).
  - `gsap-core`: Chuẩn mực viết tween và điều phối hoạt ảnh mượt mà.
  - `agent-reach`: Khả năng nghiên cứu, cập nhật thông tin và dữ liệu giải đấu từ internet.
