"use client";

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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

const nav: NavItem[] = [
  { name: 'Tổng quan', href: '/dashboard', icon: Home },
  { name: 'Khóa học', href: '/dashboard/my-courses', icon: BookOpen },
  { name: 'Tìm bạn học', href: '/dashboard/find-buddy', icon: Users },
  { name: 'Tìm gia sư', href: '/dashboard/tutors', icon: GraduationCap },
  { name: 'Lịch', href: '/dashboard/calendar', icon: Calendar },
  { name: 'Tin nhắn', href: '/dashboard/messages', icon: MessageCircle },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname() || '';

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-white via-surface to-surface border-r border-borderNeutral h-full flex flex-col shadow-sm">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-borderNeutral bg-white/70">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg text-white flex items-center justify-center shadow-sm">📚</div>
          <span className="text-text font-semibold text-lg">StudyMate</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-2">
          {nav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <motion.button
                  onClick={() => router.push(item.href)}
                  aria-current={active ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 py-2.5 px-3.5 text-sm rounded-xl transition-all duration-200 font-medium border ${
                    active
                      ? 'bg-primary/10 text-primary-700 border-primary/20'
                      : 'text-gray-700 hover:bg-surface border-transparent hover:text-text'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-primary-600' : 'text-primary-400'}`} />
                  <span className="truncate">{item.name}</span>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
