---
name: gsap-skills
description: Kỹ năng điều phối hoạt ảnh mượt mà trong bóng đá (nội suy điểm số, hoạt ảnh thẻ phạt, dòng thời gian timeline, cleanup với gsap.context()).
---

# GSAP Skills for Football Web & App

## 1. Khi Nào Dùng GSAP
- **Nội suy điểm số trận đấu:** Khi tỷ số thay đổi (ví dụ: 1 -> 2), dùng GSAP tween số chạy mượt mà kèm hiệu ứng nảy nhẹ (`back.out(2)`).
- **Diễn biến trận đấu (Match Timeline):** Các sự kiện bàn thắng, thẻ vàng/thẻ đỏ trượt từ trên xuống với `stagger: 0.1` và `autoAlpha: 1`.
- **Di chuyển cầu thủ trên sa bàn:** Khi huấn luyện viên chọn đổi sơ đồ từ 4-3-3 sang 4-2-3-1, các chấm cầu thủ lướt nhẹ nhàng đến tọa độ mới.

## 2. Quản Lý Vòng Đời Trong React (`gsap.context()`)
Luôn bọc các tween trong `gsap.context()` bên trong `useLayoutEffect` hoặc `useEffect` để tránh rò rỉ bộ nhớ khi unmount:

```tsx
import { useEffect, useRef } from "react";
import gsap from "gsap";

export function ScoreboardTween({ score }: { score: number }) {
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        numberRef.current,
        { scale: 1.4, color: "#22c55e" },
        { scale: 1, color: "#ffffff", duration: 0.5, ease: "back.out(2)" }
      );
    });

    return () => ctx.revert();
  }, [score]);

  return <span ref={numberRef}>{score}</span>;
}
```
