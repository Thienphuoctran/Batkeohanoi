---
name: shadcn-ui
description: Official shadcn/ui component library integration. Use for building beautiful, accessible React/Next.js interfaces with minimal token overhead.
---
# shadcn/ui Guidelines for App Đá Bóng

## 1. Core Rule: Never write raw custom UI from scratch
Khi xây dựng các thành phần giao diện (nút bấm, thẻ sân bóng, bảng tỷ số, thanh điều hướng, modal đặt sân, tabs, dropdown):
- LUÔN kiểm tra và tận dụng các component chuẩn của `shadcn/ui` tại `@/components/ui/`:
  `button`, `card`, `badge`, `dialog`, `tabs`, `input`, `select`, `slider`, `avatar`, `skeleton`.
- Nếu chưa có sẵn file trong `src/components/ui/`, tạo theo khuôn mẫu chuẩn của Shadcn và Radix UI.

## 2. Token Saving Strategy
- TUYỆT ĐỐI KHÔNG xuất hàng trăm dòng mã CSS Tailwind tùy chỉnh cho những thành phần mà shadcn/ui đã chuẩn hóa.
- Nhập trực tiếp các component:
  ```tsx
  import { Button } from "@/components/ui/button";
  import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
  import { Badge } from "@/components/ui/badge";
  ```
- Tập trung mã nguồn vào logic cốt lõi của bóng đá: tính toán khung giờ trống, cập nhật tỷ số trực tiếp, điều khiển sa bàn kéo thả.
