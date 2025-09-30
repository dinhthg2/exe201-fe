'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { BookOpen, Play, CheckCircle, Clock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  title: string;
  description?: string;
  subject?: string;
  specialization?: string;
  progress: number;
  status: 'enrolled' | 'completed' | 'in-progress';
  enrolled_at: string;
}

interface CourseCardProps {
  course: Course;
  onContinue: (courseId: number) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onContinue }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'enrolled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'in-progress':
        return 'Đang học';
      case 'enrolled':
        return 'Đã đăng ký';
      default:
        return 'Chưa xác định';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in-progress':
        return <Play className="h-4 w-4" />;
      case 'enrolled':
        return <Clock className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {course.title}
            </h3>
            {course.subject && (
              <p className="text-sm text-blue-600 font-medium">
                {course.subject}
              </p>
            )}
            {course.specialization && (
              <p className="text-sm text-gray-500">
                {course.specialization}
              </p>
            )}
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}
          >
            {getStatusIcon(course.status)}
            {getStatusText(course.status)}
          </span>
        </div>

        {/* Description */}
        {course.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Tiến độ</span>
            <span className="text-sm font-medium text-gray-900">
              {course.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(course.progress, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <User className="h-4 w-4 mr-1" />
            <span>
              Đăng ký: {new Date(course.enrolled_at).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <button
            onClick={() => onContinue(course.id)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {course.status === 'completed' ? 'Xem lại' : 'Tiếp tục học'}
          </button>
        </div>
      </div>
    </div>
  );
};

const MyCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const router = useRouter();

  const fetchCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/dashboard/courses', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const result = await response.json();
      if (result.success) {
        setCourses(result.data);
      } else {
        throw new Error(result.message || 'Failed to load courses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleContinueCourse = (courseId: number) => {
    router.push(`/courses/${courseId}`);
  };

  const filteredCourses = courses.filter(course => {
    switch (filter) {
      case 'in-progress':
        return course.status === 'in-progress' || course.status === 'enrolled';
      case 'completed':
        return course.status === 'completed';
      default:
        return true;
    }
  });

  const getFilterCounts = () => {
    const all = courses.length;
    const inProgress = courses.filter(c => c.status === 'in-progress' || c.status === 'enrolled').length;
    const completed = courses.filter(c => c.status === 'completed').length;
    return { all, inProgress, completed };
  };

  const counts = getFilterCounts();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Lỗi: {error}</p>
          <button
            onClick={fetchCourses}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h1>
        <div className="text-sm text-gray-500">
          {courses.length} khóa học
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Tất cả ({counts.all})
        </button>
        <button
          onClick={() => setFilter('in-progress')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'in-progress'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Đang học ({counts.inProgress})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            filter === 'completed'
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Đã hoàn thành ({counts.completed})
        </button>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onContinue={handleContinueCourse}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' && 'Chưa có khóa học nào'}
            {filter === 'in-progress' && 'Chưa có khóa học đang học'}
            {filter === 'completed' && 'Chưa hoàn thành khóa học nào'}
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === 'all' && 'Đăng ký khóa học đầu tiên để bắt đầu học tập'}
            {filter === 'in-progress' && 'Tất cả khóa học của bạn đã hoàn thành'}
            {filter === 'completed' && 'Tiếp tục học để hoàn thành khóa học'}
          </p>
          <button
            onClick={() => router.push('/courses')}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Khám phá khóa học
          </button>
        </div>
      )}
    </div>
  );
};

export default MyCourses;