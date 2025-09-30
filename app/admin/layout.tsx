'use client';

import React from 'react';
import AdminWrapper from '../../components/layout/AdminWrapper';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin layout - không có header và footer của trang chủ
  return (
    <AdminWrapper>
      {children}
    </AdminWrapper>
  );
}
