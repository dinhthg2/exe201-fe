'use client';

import {
  UserGroupIcon,
  TrophyIcon,
  CheckCircleIcon,
  AcademicCapIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

interface NotificationItemProps {
  id: string;
  type: 'buddy' | 'payment' | 'progress' | 'tutor';
  title: string;
  message: string;
  time: string;
  read: boolean;
  onClick?: () => void;
}

export default function NotificationItem({
  id,
  type,
  title,
  message,
  time,
  read,
  onClick
}: NotificationItemProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'buddy':
        return <UserGroupIcon className="h-5 w-5 text-blue-600" />;
      case 'progress':
        return <TrophyIcon className="h-5 w-5 text-green-600" />;
      case 'payment':
        return <CheckCircleIcon className="h-5 w-5 text-purple-600" />;
      case 'tutor':
        return <AcademicCapIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = '/dashboard/notifications';
    }
  };

  return (
    <div
      className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
        read ? 'hover:bg-gray-50' : 'bg-blue-50 hover:bg-blue-100'
      }`}
      onClick={handleClick}
    >
      <div className="flex-shrink-0 mt-1">
        {getNotificationIcon(type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${read ? 'text-gray-900' : 'text-blue-900'}`}>
          {title}
        </p>
        <p className={`text-sm ${read ? 'text-gray-600' : 'text-blue-700'} mt-1`}>
          {message}
        </p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
      {!read && (
        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
      )}
    </div>
  );
}