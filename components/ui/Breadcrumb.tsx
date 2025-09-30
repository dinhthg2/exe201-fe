'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChevronRightIcon, HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showBack?: boolean;
  onBack?: () => void;
}

const routeMap: { [key: string]: string } = {
  '/dashboard': 'Tổng quan',
  '/dashboard/my-courses': 'Khóa học của tôi',
  '/dashboard/find-buddy': 'Tìm bạn học',
  '/dashboard/find-tutor': 'Tìm gia sư',
  '/dashboard/messages': 'Tin nhắn',
  '/dashboard/notifications': 'Thông báo',
  '/dashboard/wallet': 'Ví của tôi',
  '/dashboard/profile': 'Hồ sơ cá nhân',
};

export default function Breadcrumb({ items, showBack = false, onBack }: BreadcrumbProps) {
  const router = useRouter();
  const pathname = usePathname();

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = pathname.split('/').filter(segment => segment);
    const breadcrumbs: BreadcrumbItem[] = [];

    // Always start with Dashboard
    breadcrumbs.push({
      label: 'Tổng quan',
      href: '/dashboard',
      current: pathname === '/dashboard',
    });

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      if (currentPath !== '/dashboard') {
        const label = routeMap[currentPath] || segment.replace(/-/g, ' ');
        const isLast = index === pathSegments.length - 1;
        
        breadcrumbs.push({
          label: label.charAt(0).toUpperCase() + label.slice(1),
          href: currentPath,
          current: isLast,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <nav className="flex items-center space-x-2 text-sm">
        {showBack && (
          <button
            onClick={handleBack}
            className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Quay lại</span>
          </button>
        )}
        
        <HomeIcon className="h-4 w-4 text-gray-400" />
        
        {breadcrumbs.map((item, index) => (
          <div key={item.href} className="flex items-center space-x-2">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            )}
            {item.current ? (
              <span className="font-medium text-gray-900">{item.label}</span>
            ) : (
              <a
                href={item.href}
                className="text-gray-500 hover:text-gray-700 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                }}
              >
                {item.label}
              </a>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}