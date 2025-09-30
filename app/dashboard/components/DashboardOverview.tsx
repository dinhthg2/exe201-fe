"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getJson } from '../../../lib/api';
import {
  BookOpen,
  Clock,
  Trophy,
  Users,
  TrendingUp,
  Calendar,
  MessageSquare,
  User,
  GraduationCap,
} from 'lucide-react';

interface DashboardStats {
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  studyBuddies: number;
  avgProgress: number;
}

interface RecentCourse {
  id: string;
  title?: string;
  progress: number;
  lastAccessed: string;
  subject?: string;
}

interface Connection {
  id: string;
  name: string;
  type: 'buddy' | 'tutor';
  avatar?: string;
  subject?: string;
  lastActive?: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCourses, setRecentCourses] = useState<RecentCourse[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const overview = await getJson<any>('/dashboard/overview');
        if (!mounted) return;
        
        setStats({
          totalCourses: overview.totalCourses || 0,
          activeCourses: (overview.totalCourses || 0) - (overview.completedCourses || 0),
          completedCourses: overview.completedCourses || 0,
          studyBuddies: overview.studyBuddies || 0,
          avgProgress: overview.progressPercent || 0,
        });

        // Mock recent courses
        setRecentCourses([
          { id: '1', title: 'Lập trình Web', progress: 75, lastAccessed: '2 giờ trước', subject: 'PRF192' },
          { id: '2', title: 'Cơ sở dữ liệu', progress: 45, lastAccessed: '1 ngày trước', subject: 'DBI202' },
          { id: '3', title: 'Toán rời rạc', progress: 90, lastAccessed: '3 ngày trước', subject: 'MAD101' },
        ]);

        // Mock connections
        setConnections([
          { id: '1', name: 'Nguyễn Văn A', type: 'buddy', subject: 'PRF192', lastActive: '2 giờ trước' },
          { id: '2', name: 'Trần Thị B', type: 'tutor', subject: 'DBI202', lastActive: '1 ngày trước' },
          { id: '3', name: 'Lê Minh C', type: 'buddy', subject: 'MAD101', lastActive: '3 giờ trước' },
        ]);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Tổng quan Dashboard
            </h1>
            <p className="text-gray-600">
              Chào mừng bạn trở lại! Đây là tổng quan về hoạt động học tập của bạn.
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-sm text-gray-500">
            Cập nhật: {new Date().toLocaleString('vi-VN')}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Tổng khóa học"
            value={stats.totalCourses}
            icon={<BookOpen className="h-6 w-6" />}
            color="blue"
            onClick={() => router.push('/dashboard/my-courses')}
          />
          <StatCard
            title="Đang học"
            value={stats.activeCourses}
            icon={<Clock className="h-6 w-6" />}
            color="green"
            onClick={() => router.push('/dashboard/my-courses?filter=active')}
          />
          <StatCard
            title="Hoàn thành"
            value={stats.completedCourses}
            icon={<Trophy className="h-6 w-6" />}
            color="purple"
            onClick={() => router.push('/dashboard/my-courses?filter=completed')}
          />
          <StatCard
            title="Tiến độ TB"
            value={`${stats.avgProgress}%`}
            icon={<TrendingUp className="h-6 w-6" />}
            color="orange"
          />
        </div>
      )}

      {/* Main Content - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Course Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Overview */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Thống kê tiến độ khóa học
            </h2>
            
            {/* Overall Progress */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Tiến độ tổng thể</span>
                <span className="text-sm font-bold text-blue-600">{stats?.avgProgress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div 
                  className="h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.avgProgress || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{stats?.totalCourses || 0}</div>
                <div className="text-xs text-gray-600">Tổng khóa học</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{stats?.activeCourses || 0}</div>
                <div className="text-xs text-gray-600">Đang học</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{stats?.completedCourses || 0}</div>
                <div className="text-xs text-gray-600">Hoàn thành</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">{stats?.studyBuddies || 0}</div>
                <div className="text-xs text-gray-600">Bạn học</div>
              </div>
            </div>
          </motion.div>

          {/* Recent Courses */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Khóa học gần đây</h2>
              <button
                onClick={() => router.push('/dashboard/my-courses')}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Xem tất cả →
              </button>
            </div>
            <div className="space-y-4">
              {recentCourses.map((course) => (
                <motion.div
                  key={course.id}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                  whileHover={{ x: 4 }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{course.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>{course.subject}</span>
                      <span>•</span>
                      <span>{course.lastAccessed}</span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{course.progress}%</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Connections */}
        <div className="space-y-6">
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Bạn học & Gia sư
            </h2>
            <div className="space-y-4">
              {connections.map((connection) => (
                <motion.div
                  key={connection.id}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer"
                  whileHover={{ x: 4 }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    connection.type === 'buddy' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {connection.type === 'buddy' ? 
                      <Users className="h-5 w-5" /> : 
                      <GraduationCap className="h-5 w-5" />
                    }
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{connection.name}</h3>
                    <div className="text-sm text-gray-600">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        connection.type === 'buddy' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {connection.type === 'buddy' ? 'Bạn học' : 'Gia sư'}
                      </span>
                      {connection.subject && (
                        <>
                          <span className="mx-2">•</span>
                          <span>{connection.subject}</span>
                        </>
                      )}
                    </div>
                    {connection.lastActive && (
                      <div className="text-xs text-gray-500 mt-1">
                        Hoạt động: {connection.lastActive}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {connections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Chưa có kết nối nào</p>
                  <button
                    onClick={() => router.push('/dashboard/find-buddy')}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Tìm bạn học →
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            className="bg-white rounded-2xl p-6 shadow-sm"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Thao tác nhanh</h2>
            <div className="space-y-3">
              <motion.button
                onClick={() => router.push('/dashboard/calendar')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-blue-50 rounded-xl transition-colors"
                whileHover={{ x: 4 }}
              >
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Xem lịch học</h3>
                  <p className="text-sm text-gray-600">Quản lý thời khóa biểu</p>
                </div>
              </motion.button>

              <motion.button
                onClick={() => router.push('/dashboard/messages')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-green-50 rounded-xl transition-colors"
                whileHover={{ x: 4 }}
              >
                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Tin nhắn</h3>
                  <p className="text-sm text-gray-600">Trò chuyện với bạn học</p>
                </div>
              </motion.button>

              <motion.button
                onClick={() => router.push('/dashboard/profile')}
                className="w-full flex items-center space-x-3 p-3 text-left hover:bg-purple-50 rounded-xl transition-colors"
                whileHover={{ x: 4 }}
              >
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Hồ sơ</h3>
                  <p className="text-sm text-gray-600">Cập nhật thông tin</p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
}

function StatCard({ title, value, icon, color, onClick }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600 bg-blue-50',
    green: 'from-green-500 to-green-600 text-green-600 bg-green-50',
    purple: 'from-purple-500 to-purple-600 text-purple-600 bg-purple-50',
    orange: 'from-orange-500 to-orange-600 text-orange-600 bg-orange-50',
  };

  return (
    <motion.div
      className={`bg-white rounded-2xl p-6 shadow-sm cursor-pointer ${onClick ? 'hover:shadow-md' : ''}`}
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[color].split(' ')[2]} ${colorClasses[color].split(' ')[3]}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}