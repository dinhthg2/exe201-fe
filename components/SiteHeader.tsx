"use client";
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SiteHeader(){
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isActive = (href: string) => {
    if(href === '/') return pathname === '/';
    return pathname === href || (href.startsWith('/dashboard') && pathname.startsWith(href));
  };
  const navLink = (href:string, label:string) => (
    <Link
      key={href}
      href={href}
      className={`relative px-1 py-0.5 transition-colors hover:text-blue-600 ${isActive(href) ? 'text-blue-700 font-semibold after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-full after:bg-blue-600 after:rounded-full' : 'text-slate-600'}`}
    >{label}</Link>
  );
  return (
    <header>
      {/* Removed top header section */}
      <div className="border-b bg-[#e2f7ff]/80 backdrop-blur z-10">
        <div className="container mx-auto flex items-center gap-8 h-16 px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg group" aria-label="Trang chủ StudyMate">
            <span className="inline-flex items-center select-none">
              <Image src="/logo.png" alt="StudyMate" width={150} height={10} />
            </span>
          </Link>
          <nav className="flex-1 hidden md:flex gap-5 text-sm">
            {navLink('/', 'Trang chủ')}
            {navLink('/courses', 'Khóa học')}
            {navLink('/start', 'Bắt đầu')}
            {navLink('/news', 'Tin tức')}
            {navLink('/contact', 'Liên hệ')}
            {user && (
              <>
                {navLink('/dashboard','Tổng quan')}
                {navLink('/dashboard/find-buddy','Tìm bạn học')}
                {navLink('/dashboard/tutors','Tìm gia sư')}
                {navLink('/dashboard/messages','Tin nhắn')}
                {navLink('/dashboard/notifications','Thông báo')}
                {navLink('/dashboard/my-courses','Khóa học của tôi')}
                {navLink('/dashboard/schedule','Lịch')}
                {navLink('/dashboard/profile','Hồ sơ cá nhân')}
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="pl-8 pr-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm">Xin chào, <b>{user.name}</b></span>
                <Link href="/dashboard" className="px-3 py-2 rounded bg-yellow-400 hover:bg-yellow-300 text-sm font-medium">Dashboard</Link>
                <button onClick={() => { logout(); router.push('/'); }} className="text-xs text-red-600 underline">Đăng xuất</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/register" className="px-4 py-2 rounded-full bg-accent hover:bg-accent-dark font-medium text-sm text-white">Đăng ký</Link>
                <Link href="/login" className="px-4 py-2 rounded-full border border-accent text-accent hover:bg-accent-light font-medium text-sm">Đăng nhập</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
