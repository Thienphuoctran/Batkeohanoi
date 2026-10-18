import React from 'react';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'BắtKèo7 Admin Hub | Trung Tâm Quản Trị Dự Án',
  description:
    'Trung tâm chỉ huy và điều phối sàn bắt đối bóng đá phủi BắtKèo7 Hà Nội: Xét duyệt kháng cáo 1-chạm, đối soát cọc 200k và ma trận nhiệt độ kèo đấu.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
