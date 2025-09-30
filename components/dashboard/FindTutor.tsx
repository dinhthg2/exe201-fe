'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { User, Star, DollarSign, BookOpen, Phone, Mail, Filter, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Tutor {
  id: number;
  name: string;
  avatar?: string;
  specialization?: string;
  bio?: string;
  phone?: string;
  email?: string;
  rating: number;
  price?: number;
  experience?: string;
  subjects?: string[];
}

interface TutorCardProps {
  tutor: Tutor;
  onConnect: (tutorId: number) => void;
  isConnecting?: boolean;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor, onConnect, isConnecting }) => {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            {tutor.avatar ? (
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {tutor.name}
            </h3>
            {tutor.specialization && (
              <p className="text-sm text-blue-600 font-medium mb-1">
                {tutor.specialization}
              </p>
            )}
            
            <div className="flex items-center space-x-1 mb-2">
              {renderStars(tutor.rating)}
              <span className="text-sm text-gray-600 ml-1">
                ({tutor.rating.toFixed(1)})
              </span>
            </div>
          </div>

          {tutor.price && (
            <div className="text-right">
              <div className="flex items-center text-green-600 font-semibold">
                <DollarSign className="h-4 w-4" />
                <span>{tutor.price.toLocaleString()}đ</span>
              </div>
              <p className="text-xs text-gray-500">/ buổi</p>
            </div>
          )}
        </div>

        {/* Bio */}
        {tutor.bio && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {tutor.bio}
          </p>
        )}

        {/* Experience */}
        {tutor.experience && (
          <div className="mb-3">
            <span className="text-xs font-medium text-gray-700">Kinh nghiệm: </span>
            <span className="text-xs text-gray-600">{tutor.experience}</span>
          </div>
        )}

        {/* Subjects */}
        {tutor.subjects && tutor.subjects.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Môn dạy:</p>
            <div className="flex flex-wrap gap-1">
              {tutor.subjects.slice(0, 3).map((subject, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                >
                  {subject}
                </span>
              ))}
              {tutor.subjects.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{tutor.subjects.length - 3} khác
                </span>
              )}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
          {tutor.phone && (
            <div className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              <span>{tutor.phone}</span>
            </div>
          )}
          {tutor.email && (
            <div className="flex items-center">
              <Mail className="h-3 w-3 mr-1" />
              <span>{tutor.email}</span>
            </div>
          )}
        </div>

        {/* Connect Button */}
        <button
          onClick={() => onConnect(tutor.id)}
          disabled={isConnecting}
          className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isConnecting ? 'Đang kết nối...' : 'Kết nối'}
        </button>
      </div>
    </div>
  );
};

const FindTutor: React.FC = () => {
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectingTutorId, setConnectingTutorId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    major: '',
    course_code: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();

  const fetchTutors = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const queryParams = new URLSearchParams();
      if (filters.major) queryParams.append('major', filters.major);
      if (filters.course_code) queryParams.append('course_code', filters.course_code);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/dashboard/tutors?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tutors');
      }

      const result = await response.json();
      if (result.success) {
        setTutors(result.data);
      } else {
        throw new Error(result.message || 'Failed to load tutors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [router, filters]);

  useEffect(() => {
    fetchTutors();
  }, [fetchTutors]);

  const handleConnect = async (tutorId: number) => {
    try {
      setConnectingTutorId(tutorId);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/tutors/connect', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tutor_id: tutorId }),
      });

      const result = await response.json();
      
      if (result.success) {
        const tutorName = tutors.find(t => t.id === tutorId)?.name || 'gia sư';
        setShowSuccess(`Bạn đã kết nối với ${tutorName}`);
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(null);
        }, 3000);
      } else {
        throw new Error(result.message || 'Connection failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setConnectingTutorId(null);
    }
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    fetchTutors();
  };

  const clearFilters = () => {
    setFilters({ major: '', course_code: '', search: '' });
    setLoading(true);
    fetchTutors();
  };

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
            onClick={fetchTutors}
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
        <h1 className="text-2xl font-bold text-gray-900">Tìm gia sư</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          Bộ lọc
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <form onSubmit={handleFilterSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên ngành
                </label>
                <input
                  type="text"
                  value={filters.major}
                  onChange={(e) => setFilters(prev => ({ ...prev, major: e.target.value }))}
                  placeholder="Ví dụ: Công nghệ thông tin"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã môn học
                </label>
                <input
                  type="text"
                  value={filters.course_code}
                  onChange={(e) => setFilters(prev => ({ ...prev, course_code: e.target.value }))}
                  placeholder="Ví dụ: PRN221"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder="Tên gia sư hoặc kỹ năng"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Tìm kiếm
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200"
              >
                Xóa bộ lọc
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-600">{showSuccess}</p>
        </div>
      )}

      {/* Tutors Grid */}
      {tutors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tutors.map((tutor) => (
            <TutorCard
              key={tutor.id}
              tutor={tutor}
              onConnect={handleConnect}
              isConnecting={connectingTutorId === tutor.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không tìm thấy gia sư
          </h3>
          <p className="text-gray-500 mb-6">
            Thử điều chỉnh bộ lọc để tìm kiếm gia sư phù hợp
          </p>
          <button
            onClick={clearFilters}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Xem tất cả gia sư
          </button>
        </div>
      )}
    </div>
  );
};

export default FindTutor;