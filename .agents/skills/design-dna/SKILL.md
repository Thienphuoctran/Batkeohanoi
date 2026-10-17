---
name: design-dna
description: Football Design DNA — Extract, define, and apply design DNA across three dimensions: design system (tokens), design style (football/stadium aesthetic), and visual effects (Pitch Canvas, GSAP Scoreboard, Glassmorphism).
---

# Football Pro Design DNA

Quy chuẩn thiết kế giao diện ứng dụng bóng đá theo mô hình 3 chiều:

## 1. Dimension 1: Design System (Đo Lường & Tokens)
- **Primary Color:** Xanh sân cỏ FIFA Emerald/Green (`#15803d`, `#22c55e`, `#166534`).
- **Live Match Indicator:** Đỏ tươi chớp nháy (`#ef4444`).
- **Card Tokens:** Thẻ vàng (`#eab308`), Thẻ đỏ (`#dc2626`).
- **Surface & Background:** Sắc thái đêm sân vận động Dark Stadium Navy (`#0b1329`, `#0f172a`, `#1e293b`).
- **Typography:** Sans-serif đậm nét, hiện đại, số áo và tỷ số dùng font Mono hoặc Black Weight.
- **Radius:** Bo tròn hiện đại `rounded-2xl` cho card và `rounded-xl` cho button/inputs.

## 2. Dimension 2: Design Style (Cảm Xúc & Ngôn Ngữ Trực Quan)
- **Phong cách:** Thể thao tràn đầy năng lượng, chuyên nghiệp, hiện đại.
- **Spatial Bento Grid:** Bố cục dạng lưới đa ô (Bento) phân tách rõ ràng giữa Trận Đấu, Đặt Sân và Sa Bàn.
- **Glassmorphism:** Sử dụng lớp nền mờ `backdrop-blur-md` kết hợp viền mỏng 1px phản chiếu ánh đèn sân vận động (`border-white/10`).

## 3. Dimension 3: Visual Effects (Hiệu Ứng Trực Quan & Đồ Họa)
- **2D Pitch Canvas:** Sân bóng đồ họa với các sọc cỏ so le (`repeating-linear-gradient`), vạch kẻ vôi màu trắng mờ `rgba(255,255,255,0.4)`.
- **GSAP Animations:** Nội suy tỷ số trận đấu khi có bàn thắng (0 -> 1 -> 2), hiệu ứng trượt mượt mà của thẻ thông báo.
- **Canvas Confetti:** Bắn pháo giấy rực rỡ khi hoàn tất đặt sân hoặc khi đội nhà giành chiến thắng.
