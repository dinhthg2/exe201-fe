'use client';

import React from 'react';
import useSWR from 'swr';
import { BookOpen, Trophy, TrendingUp, Bell, ChevronRight, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

export interface Notification {
  id: number;
  type: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface OverviewResponse {
  totalCourses: number;
  completedCourses: number;
  progressPercent: number; // 0..100
  recentNotifications: Notification[];
}

// fetcher with Authorization header
const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (res.status === 401) {
    const err: any = new Error('Unauthorized');
    err.status = 401;
    throw err;
  }
  if (!res.ok) throw new Error('Network error');
  return res.json();
};

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border relative" role="group" aria-label={title}>
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color} mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
    <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition text-xs text-gray-500 bg-white px-2 py-1 rounded shadow">Click for details</div>
  </div>
);

const CircularProgress: React.FC<{ percentage: number }> = ({ percentage }) => {
  const radius = 48;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  return (
    <svg height={radius * 2} width={radius * 2} aria-hidden="true" className="mx-auto">
      <circle stroke="#e5e7eb" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
      <circle stroke="#0ea5e9" fill="transparent" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} style={{ strokeDashoffset }} r={normalizedRadius} cx={radius} cy={radius} transform={`rotate(-90 ${radius} ${radius})`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="text-sm font-semibold" fill="#0f172a">{percentage}%</text>
    </svg>
  );
};

const Overview: React.FC = () => {
  const router = useRouter();
  const { data, error, isValidating, mutate } = useSWR<OverviewResponse>('/api/dashboard/overview', fetcher, { revalidateOnFocus: false });

  React.useEffect(() => {
    if (error && (error as any).status === 401) {
      router.push('/login');
    }
  }, [error, router]);

  const onRefresh = async () => await mutate();

  const timeAgo = (d: string) => formatDistanceToNow(new Date(d), { addSuffix: true });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Trophy className="text-green-500" />;
      case 'payment':
        return <BookOpen className="text-yellow-500" />;
      case 'progress':
        return <TrendingUp className="text-sky-500" />;
      case 'message':
        return <Bell className="text-slate-500" />;
      default:
        return <Bell className="text-slate-500" />;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Có lỗi xảy ra. Vui lòng thử lại.</p>
          <div className="mt-2 flex gap-2">
            <button onClick={() => mutate()} className="px-4 py-2 bg-red-600 text-white rounded">Retry</button>
            <button onClick={() => router.push('/login')} className="px-4 py-2 bg-gray-100 rounded">Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    // loading skeleton
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-200 h-40 rounded-lg"></div>
            <div className="bg-gray-200 h-40 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tổng quan</h1>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Tổng số khóa học"
          value={data.totalCourses}
          icon={<BookOpen className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Khóa học đã hoàn thành"
          value={data.completedCourses}
          icon={<Trophy className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Tiến độ trung bình"
          value={`${data.progressPercent}%`}
          icon={<TrendingUp className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Tiến độ học tập
          </h2>
          <div className="flex flex-col items-center">
            <CircularProgress percentage={data.progressPercent} />
            <p className="text-sm text-gray-600 mt-4 text-center">
              Bạn đã hoàn thành {data.completedCourses} trong tổng số {data.totalCourses} khóa học
            </p>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Thông báo mới nhất
            </h2>
            <button
              onClick={() => router.push('/dashboard/notifications')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
            >
              Xem tất cả
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {data.recentNotifications.length > 0 ? (
              data.recentNotifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg border ${notification.read ? 'bg-gray-50 border-gray-200' : 'bg-sky-50 border-sky-200'} cursor-pointer`} onClick={() => {
                  // click behavior
                  if (notification.type === 'course') router.push('/courses');
                  else if (notification.type === 'match') router.push('/dashboard/messages');
                  else router.push('/dashboard/notifications');
                }}>
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'}`}>{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(notification.created_at)}</p>
                    </div>
                    {!notification.read && <div className="ml-2 text-xs text-sky-600">Mới</div>}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Không có thông báo mới</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;