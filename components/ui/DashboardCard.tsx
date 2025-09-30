'use client';

import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  gradient: string;
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  value,
  icon,
  color,
  gradient,
  onClick
}: DashboardCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer transform hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-4 rounded-xl bg-gradient-to-br ${gradient}`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}