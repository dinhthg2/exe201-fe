"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, Wallet, LogOut } from 'lucide-react';

interface UserMenuProps {
  user: any;
  logout: () => void;
  isDashboard?: boolean;
}

const buildAvatarUrl = (avatarPath: string | null) => {
  if (!avatarPath) return null;
  if (avatarPath.startsWith('http')) return avatarPath;
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api';
  return base.replace('/api', '') + avatarPath;
};

export default function UserMenu({ user, logout, isDashboard = false }: UserMenuProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => setAvatarError(false), [user?.avatar]);

  const handleNavigation = (path: string) => {
    router.push(path);
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    try { router.replace('/login'); } catch (_) { window.location.href = '/login'; }
  };

  const avatarSrc = buildAvatarUrl(user?.avatar || null) || null;

  if (isDashboard) {
    return (
      <div className="relative" ref={dropdownRef}>
        <motion.button
          className="flex items-center space-x-2 p-2 rounded-xl hover:bg-[#E6F0FA] transition-colors"
          onClick={() => setDropdownOpen((s) => !s)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div animate={{ rotate: dropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-5 w-5 text-gray-500" />
          </motion.div>
        </motion.button>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.18 }}
            >
              <div className="px-4 py-3 border-b border-gray-100 flex items-center space-x-3">
                {avatarSrc && !avatarError ? (
                  <Image
                    src={avatarSrc}
                    alt={user?.name || 'avatar'}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#E6F0FA]"
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#E6F0FA] flex items-center justify-center ring-2 ring-[#E6F0FA]">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>

              <div className="py-2">
                <motion.button
                  onClick={() => handleNavigation('/dashboard/profile')}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-[#E6F0FA] transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <User className="h-4 w-4 mr-3 text-gray-500" />
                  Hồ sơ cá nhân
                </motion.button>

                <motion.button
                  onClick={() => handleNavigation('/dashboard/wallet')}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-[#E6F0FA] transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <Wallet className="h-4 w-4 mr-3 text-gray-500" />
                  Ví Wallet
                </motion.button>
              </div>

              <div className="border-t border-gray-100 pt-2">
                <motion.button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <LogOut className="h-4 w-4 mr-3" />
                  Đăng xuất
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Home version with avatar
  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        className="flex items-center p-1 rounded-full hover:bg-yellow-100 transition-colors"
        onClick={() => setDropdownOpen((s) => !s)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {avatarSrc && !avatarError ? (
          <Image
            src={avatarSrc}
            alt={user?.name || 'avatar'}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-yellow-300"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-yellow-200 flex items-center justify-center ring-2 ring-yellow-300">
            <User className="h-4 w-4 text-gray-600" />
          </div>
        )}
      </motion.button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.18 }}
          >
            <div className="py-2">
              <motion.button
                onClick={() => handleNavigation('/dashboard/profile')}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-[#E6F0FA] transition-colors"
                whileHover={{ x: 4 }}
              >
                <User className="h-4 w-4 mr-3 text-gray-500" />
                Hồ sơ cá nhân
              </motion.button>

              <motion.button
                onClick={() => handleNavigation('/dashboard/wallet')}
                className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-[#E6F0FA] transition-colors"
                whileHover={{ x: 4 }}
              >
                <Wallet className="h-4 w-4 mr-3 text-gray-500" />
                Ví Wallet
              </motion.button>
            </div>

            <div className="border-t border-gray-100 pt-2">
              <motion.button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                whileHover={{ x: 4 }}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Đăng xuất
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}