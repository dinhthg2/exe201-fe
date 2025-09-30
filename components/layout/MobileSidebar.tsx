"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import {
  Home,
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  MessageCircle,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

const nav: NavItem[] = [
  { name: 'Tổng quan', href: '/dashboard', icon: Home },
  { name: 'Khóa học', href: '/dashboard/my-courses', icon: BookOpen },
  { name: 'Tìm bạn học', href: '/dashboard/find-buddy', icon: Users },
  { name: 'Tìm gia sư', href: '/dashboard/tutors', icon: GraduationCap },
  { name: 'Lịch', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Tin nhắn', href: '/dashboard/messages', icon: MessageCircle },
];

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const router = useRouter();
  const pathname = usePathname() || '';

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const handleNavigation = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl lg:hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-[#E6F0FA] rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-lg">📚</span>
                  </div>
                  <span className="text-gray-800 font-bold text-xl">StudyMate</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto px-4 py-6">
                <ul className="space-y-2">
                  {nav.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <motion.button
                          onClick={() => handleNavigation(item.href)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all duration-200 font-medium ${
                            active
                              ? 'bg-[#E6F0FA] text-blue-700'
                              : 'text-gray-600 hover:bg-[#E6F0FA]/50 hover:text-blue-600'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`${active ? 'text-blue-600' : 'text-gray-500'}`}
                          >
                            <Icon className="h-5 w-5" />
                          </motion.div>
                          <span className="truncate">{item.name}</span>
                        </motion.button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Footer */}
              <div className="px-4 py-4 border-t border-gray-100">
                <div className="text-xs text-gray-500 text-center">&copy; 2025 StudyMate</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}