'use client';

import { ReactNode } from 'react';

interface QuickActionProps {
  name: string;
  description: string;
  icon: ReactNode;
  href: string;
  gradient: string;
  onClick?: () => void;
}

export default function QuickAction({
  name,
  description,
  icon,
  href,
  gradient,
  onClick
}: QuickActionProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = href;
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient}`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}