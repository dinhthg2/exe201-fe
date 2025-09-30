'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Overview = {
  total_enrollments?: number;
  completed_courses?: number;
  active_courses?: number;
  connected_friends?: number;
  average_progress?: number;
  total_matches?: number;
  pending_messages?: number;
};

type Course = {
  id: number;
  title: string;
  description?: string;
  subject?: string;
  specialization?: string;
  progress?: number;
  status?: string;
  enrolled_at?: string;
};

type Notification = {
  id: number;
  type: string;
  title: string;
  content: string;
  read: boolean;
  created_at: string;
};

export default function DashboardOverview() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';

      // Fetch overview statistics
      const overviewRes = await fetch(`${apiBase}/api/dashboard/overview`, { headers });
      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setOverview(overviewData.data);
      }

      // Fetch recent courses (limited)
      const coursesRes = await fetch('/api/dashboard/courses?limit=3', { headers });
      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setRecentCourses(coursesData.data || []);
      }

      // Fetch recent notifications (limited)
      const notificationsRes = await fetch('/api/dashboard/notifications?limit=5', { headers });
      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json();
        setRecentNotifications(notificationsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-indigo-200 to-blue-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white/70 p-6 rounded-2xl shadow-sm border border-borderNeutral">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gradient-to-r from-gray-300 to-gray-400 rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text">Chào mừng trở lại , hãy bắt đầu 1 ngày học tập hiệu quả </h1>
        
        {/* Overview Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          <div className="bg-primary/10 text-primary-700 border border-primary/20 rounded-2xl shadow-sm p-5">
            <h3 className="flex items-center gap-2 text-sm font-medium mb-2">
              <span className="inline-block h-6 w-6 rounded-lg bg-primary/20" aria-hidden="true"></span>
              Tổng khóa học
            </h3>
            <p className="text-3xl md:text-4xl font-semibold">{overview?.total_enrollments || 0}</p>
          </div>
          
          <div className="bg-success/10 text-success-700 border border-success/20 rounded-2xl shadow-sm p-5">
            <h3 className="flex items-center gap-2 text-sm font-medium mb-2">
              <span className="inline-block h-6 w-6 rounded-lg bg-success/20" aria-hidden="true"></span>
              Khóa học hoàn thành
            </h3>
            <p className="text-3xl md:text-4xl font-semibold">{overview?.completed_courses || 0}</p>
          </div>
          
          <div className="bg-warning/10 text-warning-700 border border-warning/20 rounded-2xl shadow-sm p-5">
            <h3 className="flex items-center gap-2 text-sm font-medium mb-2">
              <span className="inline-block h-6 w-6 rounded-lg bg-warning/20" aria-hidden="true"></span>
              Khóa học đang học
            </h3>
            <p className="text-3xl md:text-4xl font-semibold">{overview?.active_courses || 0}</p>
          </div>
          
          <div className="bg-accent/10 text-accent-700 border border-accent/20 rounded-2xl shadow-sm p-5">
            <h3 className="flex items-center gap-2 text-sm font-medium mb-2">
              <span className="inline-block h-6 w-6 rounded-lg bg-accent/20" aria-hidden="true"></span>
              Bạn bè kết nối
            </h3>
            <p className="text-3xl md:text-4xl font-semibold">{overview?.connected_friends || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
          {/* Recent Courses */}
          <div className="bg-card rounded-2xl shadow-sm p-6 border border-borderNeutral">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-text">Khóa học gần đây</h2>
              <a href="/dashboard/my-courses" className="text-sm text-primary hover:underline">
                Xem tất cả →
              </a>
            </div>
            
            {recentCourses.length > 0 ? (
              <div className="space-y-4">
                {recentCourses.map((course) => (
                  <div key={course.id} className="border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-lg">
                    <h3 className="font-medium text-text">{course.title}</h3>
                    <p className="text-sm text-muted">{course.specialization} • {course.subject}</p>
                    {course.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted">Tiến độ</span>
                          <span className="text-xs font-medium text-text">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-borderNeutral rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center text-muted py-12">
                <span aria-hidden className="h-10 w-10 rounded-full bg-muted/10 mr-3" />
                Chưa có khóa học nào
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          <div className="bg-card rounded-2xl shadow-sm p-6 border border-borderNeutral">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-text">Thông báo mới</h2>
              <a href="/dashboard/notifications" className="text-sm text-primary hover:underline">
                Xem tất cả →
              </a>
            </div>
            
            {recentNotifications.length > 0 ? (
              <div className="space-y-4">
                {recentNotifications.map((notification) => (
                  <div key={notification.id} className={`p-3 rounded-lg border-l-4 ${notification.read ? 'bg-surface border-borderNeutral' : 'bg-primary/5 border-primary'}`}>
                    <h4 className="font-medium text-text text-sm">{notification.title}</h4>
                    <p className="text-sm text-muted mt-1 line-clamp-2">{notification.content}</p>
                    <p className="text-xs text-muted mt-2">
                      {new Date(notification.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center text-muted py-12">
                <span aria-hidden className="h-10 w-10 rounded-full bg-muted/10 mr-3" />
                Không có thông báo mới
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
