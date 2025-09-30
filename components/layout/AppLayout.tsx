'use client';

import { ReactNode, useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import SiteFooter from '../SiteFooter.jsx';
import SiteHeader from '../SiteHeader'; // Import SiteHeader here

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAdmin = pathname?.startsWith('/admin');

  // Admin và Dashboard routes sử dụng layout riêng - không áp dụng AppLayout
  if (isAdmin || isDashboard) {
    return <>{children}</>;
  }

  // Home layout without sidebar
  return (
    <div className="min-h-screen flex flex-col font-sans bg-surface dark:bg-slate-950">
      <SiteHeader /> {/* Use SiteHeader instead of Header */}
      <main className="flex-1 max-w-7xl mx-auto px-6 lg:px-8 py-6 space-y-6">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}