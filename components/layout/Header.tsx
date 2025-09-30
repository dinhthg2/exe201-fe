'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Wallet,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import UserMenu from '../ui/UserMenu';
import dynamic from 'next/dynamic';

const DarkModeToggle = dynamic(() => import('../DarkModeToggle.jsx'), { ssr: false });

interface HeaderProps {
  setSidebarOpen?: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationCount] = useState(3);
  const pathname = usePathname();
  
  // Get auth context
  const { user = null, logout = () => {} } = useAuth();
  
  // Debug user changes
  useEffect(() => {
    console.log('Header - User data changed:', user);
  }, [user]);
  
  const isDashboard = pathname?.startsWith('/dashboard');

  // Dashboard Header
  if (isDashboard && user) {
    return (
      <header className="bg-gradient-to-r from-white via-blue-50 to-indigo-50 shadow-lg border-b border-indigo-100">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-indigo-700 hover:bg-indigo-100 transition-colors"
            onClick={() => setSidebarOpen && setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search bar - aligned with content below */}
          <div className="flex-1 max-w-2xl lg:ml-64 lg:pl-6">
            <motion.div 
              className="relative rounded-full shadow-sm bg-white border border-borderNeutral px-5 py-2.5 focus-within:ring-2 focus-within:ring-primary/30"
              animate={{
                scale: searchFocused ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-300" />
              <input
                type="text"
                placeholder="Tìm kiếm khóa học, bạn học, gia sư..."
                className="w-full pl-10 pr-4 bg-transparent outline-none"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </motion.div>
          </div>

          {/* Right side - Notifications + Profile dropdown arrow */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <motion.button 
              className="relative p-2.5 text-gray-500 hover:text-gray-900 hover:bg-[#E6F0FA] rounded-xl transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="h-6 w-6" />
              {notificationCount > 0 && (
                <motion.span 
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-medium"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  {notificationCount}
                </motion.span>
              )}
            </motion.button>

            {/* User Menu */}
            <UserMenu key={user?.avatar || 'no-avatar'} user={user} logout={logout} isDashboard={true} />
          </div>
        </div>
      </header>
    );
  }

  // Home Header
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
            
            {/* User Menu */}
            <UserMenu user={user} logout={logout} isDashboard={false} />
          </div>
        ) : (
          <Link href="/login" className="px-4 py-2 rounded-full bg-yellow-400 hover:bg-yellow-300 font-medium text-sm">Tài khoản</Link>
        )}
      </div>
    </header>
  );
}
