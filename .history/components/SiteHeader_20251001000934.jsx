"use client";
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './AuthContext.jsx';
import dynamic from 'next/dynamic';
const DarkModeToggle = dynamic(()=>import('./DarkModeToggle.jsx'), { ssr:false });

export default function SiteHeader(){
  const authSafe = useAuth() || {};
  const { user = null, logout = ()=>{} } = authSafe;
  return (
  <header className="surface-light border-b bg-[#e2f7ff]/80 backdrop-blur z-10">
      <div className="container mx-auto flex items-center gap-8 h-16 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Image src="/logo.png" alt="StudyMate" width={150} height={10} />
        </Link>
        <nav className="flex-1 hidden md:flex gap-6 text-sm">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <Link href="/courses" className="hover:text-blue-600">Khóa học</Link>
          <Link href="/start" className="hover:text-blue-600">Bắt đầu</Link>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <DarkModeToggle />
        </div>
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm">Xin chào, <b>{user.name}</b></span>
            <Link href="/dashboard" className="px-3 py-2 rounded bg-yellow-400 hover:bg-yellow-300 text-sm font-medium">Dashboard</Link>
            <button onClick={logout} className="text-xs text-red-600 underline">Đăng xuất</button>
          </div>
        ) : (
          <Link href="/login" className="px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 font-medium text-sm">Tài khoản</Link>
        )}
      </div>
    </header>
  );
}
