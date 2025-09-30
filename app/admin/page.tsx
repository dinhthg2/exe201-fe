'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../components/AuthContext.jsx';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:5000/api';

interface Stats {
  studentCount: number;
  tutorCount: number;
  approvedTutorCount: number;
  pendingTutorCount: number;
  courseCount: number;
  matchCount: number;
  enrollmentCount: number;
  reviewCount: number;
  swipeCount: number;
  chatCount: number;
  revenue: number;
  pendingRevenue: number;
  totalTransactions: number;
  todayUsers: number;
  todayEnrollments: number;
  totalUsers: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_approved?: boolean;
  phone?: string;
}

interface Course {
  id: number;
  code: string;
  title: string;
  specialization?: string;
  semester?: number;
}

interface Payment {
  id: number;
  amount: number;
  status: string;
  created_at: string;
  User?: User;
}

export default function AdminPage() {
  const { user, token, initializing } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [stats, setStats] = useState<Stats>({
    studentCount: 0, tutorCount: 0, approvedTutorCount: 0, pendingTutorCount: 0,
    courseCount: 0, matchCount: 0, enrollmentCount: 0, reviewCount: 0,
    swipeCount: 0, chatCount: 0, revenue: 0, pendingRevenue: 0,
    totalTransactions: 0, todayUsers: 0, todayEnrollments: 0, totalUsers: 0
  });
  
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [pendingTutors, setPendingTutors] = useState<User[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  
  // Pagination states
  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const [currentPageCourses, setCurrentPageCourses] = useState(1);
  const itemsPerPage = 10;
  
  // Filter states
  const [filterUserRole, setFilterUserRole] = useState('all');
  const [filterUserStatus, setFilterUserStatus] = useState('all');
  const [filterCourseSpec, setFilterCourseSpec] = useState('all');
  
  // Add/Edit Course states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (!initializing) {
      if (!user || !token) {
        router.push('/login');
        return;
      }
      if (user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      setLoading(false);
      fetchAllData();
    }
  }, [user, token, initializing, router]);

  const fetchAllData = async () => {
    await Promise.all([fetchStats(), fetchUsers(), fetchCourses(), fetchPendingTutors(), fetchPayments()]);
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses`);
      const coursesData = response.data.data || response.data.courses || (Array.isArray(response.data) ? response.data : []);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchPendingTutors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/tutors/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingTutors(response.data);
    } catch (error) {
      console.error('Error fetching pending tutors:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Xóa thành công!');
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert('Lỗi khi xóa');
    }
  };

  const handleUpdateUser = async (userId: number, userData: any) => {
    try {
      await axios.put(`${API_BASE_URL}/admin/users/${userId}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Cập nhật người dùng thành công!');
      setShowAddUserModal(false);
      setEditingUser(null);
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      alert('Lỗi khi cập nhật: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleAddUser = async (userData: any) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/users`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Thêm người dùng thành công!');
      setShowAddUserModal(false);
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      alert('Lỗi khi thêm: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleApproveTutor = async (tutorId: number) => {
    try {
      await axios.put(`${API_BASE_URL}/admin/tutors/${tutorId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Duyệt gia sư thành công!');
      fetchPendingTutors();
      fetchStats();
    } catch (error) {
      alert('Lỗi khi duyệt gia sư');
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khóa học này?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/admin/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Xóa khóa học thành công!');
      fetchCourses();
      fetchStats();
    } catch (error) {
      alert('Lỗi khi xóa');
    }
  };

  const handleAddCourse = async (courseData: any) => {
    try {
      await axios.post(`${API_BASE_URL}/admin/courses`, courseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Thêm khóa học thành công!');
      setShowAddCourseModal(false);
      fetchCourses();
      fetchStats();
    } catch (error: any) {
      alert('Lỗi khi thêm: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleUpdateCourse = async (courseId: number, courseData: any) => {
    try {
      await axios.put(`${API_BASE_URL}/admin/courses/${courseId}`, courseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Cập nhật khóa học thành công!');
      setShowAddCourseModal(false);
      setEditingCourse(null);
      fetchCourses();
      fetchStats();
    } catch (error: any) {
      alert('Lỗi khi cập nhật: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Filter and paginate users
  const filteredUsers = users.filter(u => {
    const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterUserRole === 'all' || u.role === filterUserRole;
    const matchStatus = filterUserStatus === 'all' || 
                       (filterUserStatus === 'approved' && u.is_approved) ||
                       (filterUserStatus === 'pending' && !u.is_approved);
    return matchSearch && matchRole && matchStatus;
  });
  
  const totalPagesUsers = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPageUsers - 1) * itemsPerPage,
    currentPageUsers * itemsPerPage
  );

  // Filter and paginate courses
  const filteredCourses = courses.filter(c => {
    const matchSearch = c.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSpec = filterCourseSpec === 'all' || c.specialization === filterCourseSpec;
    return matchSearch && matchSpec;
  });
  
  const totalPagesCourses = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPageCourses - 1) * itemsPerPage,
    currentPageCourses * itemsPerPage
  );
  
  // Get unique specializations
  const specializations = Array.from(new Set(courses.map(c => c.specialization).filter(Boolean)));

  if (initializing || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-white border-r z-30 overflow-y-auto">
        <div className="h-20 px-6 border-b flex items-center">
          <div className="relative w-full">
            <Image 
              src="/logo.png" 
              alt="StudyMate Logo" 
              width={150}
              height={40}
              className="object-contain"
            />
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
            { id: 'users', label: 'Người dùng', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197' },
            { id: 'courses', label: 'Khóa học', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13' },
            { id: 'tutors', label: 'Duyệt gia sư', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { id: 'payments', label: 'Thanh toán', icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
          ].map(item => (
          <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
            </svg>
              {item.label}
          </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"></path>
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-20 h-20">
          <div className="px-8 h-full flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-800">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'users' && 'Quản lý người dùng'}
                {activeTab === 'courses' && 'Quản lý khóa học'}
                {activeTab === 'tutors' && 'Duyệt gia sư'}
                {activeTab === 'payments' && 'Thanh toán'}
              </h2>
              <span className="text-sm text-gray-400">•</span>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            
            {activeTab !== 'dashboard' && (
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                />
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
            )}
                  </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Section: Thống kê tổng quan */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-blue-600 rounded mr-3"></div>
                  Thống kê tổng quan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div 
                  onClick={() => setSelectedChart('users')}
                  className="bg-white p-6 rounded-xl border shadow-sm cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Tổng người dùng</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers}</p>
                  <p className="text-xs text-gray-400 mt-2">+{stats.todayUsers} hôm nay • Click xem biểu đồ</p>
                </div>

                <div 
                  onClick={() => setSelectedChart('enrollments')}
                  className="bg-white p-6 rounded-xl border shadow-sm cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13"></path>
                      </svg>
                  </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Khóa học</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.courseCount}</p>
                  <p className="text-xs text-gray-400 mt-2">{stats.enrollmentCount} đăng ký • Click xem biểu đồ</p>
                  </div>

                <div 
                  onClick={() => setSelectedChart('roles')}
                  className="bg-white p-6 rounded-xl border shadow-sm cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Phân bố người dùng</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stats.studentCount + stats.tutorCount}</p>
                  <p className="text-xs text-gray-400 mt-2">Học viên & Gia sư • Click xem biểu đồ</p>
                </div>

                <div 
                  onClick={() => setSelectedChart('revenue')}
                  className="bg-white p-6 rounded-xl border shadow-sm cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                  </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                    </svg>
              </div>
                  <p className="text-gray-500 text-sm font-medium">Doanh thu</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{((stats.revenue || 0) / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-gray-400 mt-2">{stats.totalTransactions} giao dịch • Click xem biểu đồ</p>
            </div>
          </div>
        </div>


              {/* Section: Thông tin chi tiết */}
                  <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <div className="w-1 h-6 bg-green-600 rounded mr-3"></div>
                  Thông tin chi tiết hệ thống
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Thông tin hệ thống</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Học viên</span>
                      <span className="font-semibold text-gray-800">{stats.studentCount}</span>
                  </div>
                    <div className="flex justify-between items-center py-2 border-t">
                      <span className="text-sm text-gray-600">Gia sư</span>
                      <span className="font-semibold text-gray-800">{stats.tutorCount}</span>
                  </div>
                    <div className="flex justify-between items-center py-2 border-t">
                      <span className="text-sm text-gray-600">Gia sư đã duyệt</span>
                      <span className="font-semibold text-green-600">{stats.approvedTutorCount}</span>
                  </div>
                    <div className="flex justify-between items-center py-2 border-t">
                      <span className="text-sm text-gray-600">Gia sư chờ duyệt</span>
                      <span className="font-semibold text-orange-600">{stats.pendingTutorCount}</span>
                  </div>
                </div>
              </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Hoạt động</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Swipes</span>
                      <span className="font-semibold text-gray-800">{stats.swipeCount}</span>
                  </div>
                    <div className="flex justify-between items-center py-2 border-t">
                      <span className="text-sm text-gray-600">Đánh giá</span>
                      <span className="font-semibold text-gray-800">{stats.reviewCount}</span>
                  </div>
                    <div className="flex justify-between items-center py-2 border-t">
                      <span className="text-sm text-gray-600">Tin nhắn</span>
                      <span className="font-semibold text-gray-800">{stats.chatCount}</span>
                  </div>
                    <div className="flex justify-between items-center py-2 border-t">
                      <span className="text-sm text-gray-600">Users mới hôm nay</span>
                      <span className="font-semibold text-blue-600">+{stats.todayUsers}</span>
                  </div>
                </div>
              </div>

                <div className="bg-white p-6 rounded-xl border shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-4">Giao dịch gần đây</h3>
                  <div className="space-y-3">
                    {payments.length > 0 ? (
                      payments.slice(0, 4).map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center py-2 border-t first:border-0">
                          <div className="text-sm text-gray-600 truncate mr-2">{payment.User?.name || 'N/A'}</div>
                          <span className="font-semibold text-green-600 whitespace-nowrap">{payment.amount.toLocaleString()}đ</span>
                  </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 text-center py-4">Chưa có giao dịch</p>
                    )}
                  </div>
                </div>
              </div>
                </div>
              </div>
        )}

          {/* USERS TAB */}
              {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Filters and Add Button */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Bộ lọc</h3>
                  <button
                    onClick={() => setShowAddUserModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    <span>Thêm người dùng</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vai trò</label>
                    <select
                      value={filterUserRole}
                      onChange={(e) => { setFilterUserRole(e.target.value); setCurrentPageUsers(1); }}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả vai trò</option>
                      <option value="student">Học viên</option>
                      <option value="tutor">Gia sư</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái</label>
                    <select
                      value={filterUserStatus}
                      onChange={(e) => { setFilterUserStatus(e.target.value); setCurrentPageUsers(1); }}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="approved">Đã duyệt</option>
                      <option value="pending">Chờ duyệt</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-800">Danh sách người dùng ({filteredUsers.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vai trò</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                            user.role === 'tutor' ? 'bg-blue-100 text-blue-700' : 
                            'bg-green-100 text-green-700'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {user.is_approved ? 'Đã duyệt' : 'Chưa duyệt'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm space-x-2">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowAddUserModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>

              {/* Pagination */}
              {totalPagesUsers > 1 && (
                <div className="p-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Hiển thị {((currentPageUsers - 1) * itemsPerPage) + 1} - {Math.min(currentPageUsers * itemsPerPage, filteredUsers.length)} trong tổng {filteredUsers.length}
              </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPageUsers(prev => Math.max(1, prev - 1))}
                      disabled={currentPageUsers === 1}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    {[...Array(totalPagesUsers)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPageUsers(i + 1)}
                        className={`px-3 py-1 border rounded-lg ${
                          currentPageUsers === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPageUsers(prev => Math.min(totalPagesUsers, prev + 1))}
                      disabled={currentPageUsers === totalPagesUsers}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
            </div>
                </div>
              )}
            </div>
            </div>
          )}

          {/* COURSES TAB */}
              {activeTab === 'courses' && (
            <div className="space-y-6">
              {/* Filters and Add Button */}
              <div className="bg-white rounded-xl border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Bộ lọc</h3>
                  <button
                    onClick={() => setShowAddCourseModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                    <span>Thêm khóa học</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chuyên ngành</label>
                    <select
                      value={filterCourseSpec}
                      onChange={(e) => { setFilterCourseSpec(e.target.value); setCurrentPageCourses(1); }}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Tất cả chuyên ngành</option>
                      {specializations.map(spec => (
                        <option key={spec} value={spec}>{spec}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Courses Table */}
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-800">Danh sách khóa học ({filteredCourses.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên khóa học</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chuyên ngành</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học kỳ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {paginatedCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{course.code}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{course.title}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{course.specialization || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{course.semester || 'N/A'}</td>
                        <td className="px-6 py-4 text-right text-sm space-x-2">
                          <button
                            onClick={() => {
                              setEditingCourse(course);
                              setShowAddCourseModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPagesCourses > 1 && (
                <div className="p-4 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Hiển thị {((currentPageCourses - 1) * itemsPerPage) + 1} - {Math.min(currentPageCourses * itemsPerPage, filteredCourses.length)} trong tổng {filteredCourses.length}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPageCourses(prev => Math.max(1, prev - 1))}
                      disabled={currentPageCourses === 1}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Trước
                    </button>
                    {[...Array(totalPagesCourses)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPageCourses(i + 1)}
                        className={`px-3 py-1 border rounded-lg ${
                          currentPageCourses === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPageCourses(prev => Math.min(totalPagesCourses, prev + 1))}
                      disabled={currentPageCourses === totalPagesCourses}
                      className="px-3 py-1 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          )}

          {/* TUTORS TAB */}
              {activeTab === 'tutors' && (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-800">Gia sư chờ duyệt ({pendingTutors.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pendingTutors.length > 0 ? (
                      pendingTutors.map((tutor) => (
                        <tr key={tutor.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{tutor.id}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{tutor.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{tutor.email}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{tutor.phone || 'N/A'}</td>
                          <td className="px-6 py-4 text-right">
            <button 
                              onClick={() => handleApproveTutor(tutor.id)}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
            >
                              Duyệt
            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Không có gia sư chờ duyệt
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
          </div>
        )}

          {/* PAYMENTS TAB */}
              {activeTab === 'payments' && (
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="font-semibold text-gray-800">Lịch sử thanh toán ({payments.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.length > 0 ? (
                      payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-900">{payment.id}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.User?.name || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm font-bold text-green-600">{payment.amount.toLocaleString()}đ</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                              'bg-red-100 text-red-700'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(payment.created_at).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                          Chưa có giao dịch nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
              )}
            </div>
      </main>

      {/* Chart Modal Popup */}
      {selectedChart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  selectedChart === 'users' ? 'bg-blue-100' :
                  selectedChart === 'enrollments' ? 'bg-green-100' :
                  selectedChart === 'roles' ? 'bg-purple-100' : 'bg-orange-100'
                }`}>
                  <svg className={`w-5 h-5 ${
                    selectedChart === 'users' ? 'text-blue-600' :
                    selectedChart === 'enrollments' ? 'text-green-600' :
                    selectedChart === 'roles' ? 'text-purple-600' : 'text-orange-600'
                  }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            </div>
                {selectedChart === 'users' && 'Biểu đồ tăng trưởng người dùng'}
                {selectedChart === 'enrollments' && 'Biểu đồ đăng ký khóa học'}
                {selectedChart === 'roles' && 'Biểu đồ phân bố người dùng'}
                {selectedChart === 'revenue' && 'Biểu đồ doanh thu'}
            </h3>
            <button 
                onClick={() => setSelectedChart(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

            {/* User Growth Chart */}
            {selectedChart === 'users' && (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={[
                  { name: 'Tuần 1', users: Math.floor(stats.totalUsers * 0.6) },
                  { name: 'Tuần 2', users: Math.floor(stats.totalUsers * 0.65) },
                  { name: 'Tuần 3', users: Math.floor(stats.totalUsers * 0.72) },
                  { name: 'Tuần 4', users: Math.floor(stats.totalUsers * 0.78) },
                  { name: 'Tuần 5', users: Math.floor(stats.totalUsers * 0.85) },
                  { name: 'Tuần 6', users: Math.floor(stats.totalUsers * 0.92) },
                  { name: 'Tuần 7', users: stats.totalUsers }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" stroke="#3B82F6" fill="#93C5FD" name="Số người dùng" />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* Enrollment Bar Chart */}
            {selectedChart === 'enrollments' && (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={[
                  { month: 'Tháng 1', enrollments: Math.floor(stats.enrollmentCount * 0.12) },
                  { month: 'Tháng 2', enrollments: Math.floor(stats.enrollmentCount * 0.14) },
                  { month: 'Tháng 3', enrollments: Math.floor(stats.enrollmentCount * 0.15) },
                  { month: 'Tháng 4', enrollments: Math.floor(stats.enrollmentCount * 0.13) },
                  { month: 'Tháng 5', enrollments: Math.floor(stats.enrollmentCount * 0.16) },
                  { month: 'Tháng 6', enrollments: Math.floor(stats.enrollmentCount * 0.15) },
                  { month: 'Tháng 7', enrollments: Math.floor(stats.enrollmentCount * 0.15) }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="enrollments" fill="#10B981" name="Số đăng ký" />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Role Distribution Bar Chart */}
            {selectedChart === 'roles' && (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={[
                  { name: 'Học viên', value: stats.studentCount, fill: '#10B981' },
                  { name: 'Gia sư đã duyệt', value: stats.approvedTutorCount, fill: '#3B82F6' },
                  { name: 'Gia sư chờ duyệt', value: stats.pendingTutorCount, fill: '#F59E0B' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Số lượng">
                    {[
                      { name: 'Học viên', value: stats.studentCount, fill: '#10B981' },
                      { name: 'Gia sư đã duyệt', value: stats.approvedTutorCount, fill: '#3B82F6' },
                      { name: 'Gia sư chờ duyệt', value: stats.pendingTutorCount, fill: '#F59E0B' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* Revenue Area Chart */}
            {selectedChart === 'revenue' && (
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={[
                  { month: 'Tháng 1', revenue: parseFloat(((stats.revenue || 0) / 1000000 * 0.10).toFixed(1)) },
                  { month: 'Tháng 2', revenue: parseFloat(((stats.revenue || 0) / 1000000 * 0.13).toFixed(1)) },
                  { month: 'Tháng 3', revenue: parseFloat(((stats.revenue || 0) / 1000000 * 0.15).toFixed(1)) },
                  { month: 'Tháng 4', revenue: parseFloat(((stats.revenue || 0) / 1000000 * 0.14).toFixed(1)) },
                  { month: 'Tháng 5', revenue: parseFloat(((stats.revenue || 0) / 1000000 * 0.17).toFixed(1)) },
                  { month: 'Tháng 6', revenue: parseFloat(((stats.revenue || 0) / 1000000 * 0.16).toFixed(1)) },
                  { month: 'Tháng 7', revenue: parseFloat(((stats.revenue || 0) / 1000000 * 0.15).toFixed(1)) }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stroke="#F97316" fill="#FED7AA" name="Doanh thu (triệu đồng)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </h3>
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setEditingUser(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                role: formData.get('role'),
                is_approved: formData.get('is_approved') === 'true'
              };
              
              if (editingUser) {
                handleUpdateUser(editingUser.id, userData);
              } else {
                handleAddUser(userData);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingUser?.name || ''}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser?.email || ''}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                    <input
                      type="password"
                      name="password"
                      required
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                  <select
                    name="role"
                    defaultValue={editingUser?.role || 'student'}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="student">Học viên</option>
                    <option value="tutor">Gia sư</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    name="is_approved"
                    defaultValue={editingUser?.is_approved ? 'true' : 'false'}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Đã duyệt</option>
                    <option value="false">Chờ duyệt</option>
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                {editingCourse ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
              </h3>
              <button
                onClick={() => {
                  setShowAddCourseModal(false);
                  setEditingCourse(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const courseData = {
                code: formData.get('code'),
                title: formData.get('title'),
                specialization: formData.get('specialization'),
                semester: parseInt(formData.get('semester') as string) || 1
              };
              
              if (editingCourse) {
                handleUpdateCourse(editingCourse.id, courseData);
              } else {
                handleAddCourse(courseData);
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã khóa học</label>
                  <input
                    type="text"
                    name="code"
                    defaultValue={editingCourse?.code || ''}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên khóa học</label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={editingCourse?.title || ''}
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chuyên ngành</label>
                  <input
                    type="text"
                    name="specialization"
                    defaultValue={editingCourse?.specialization || ''}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Học kỳ</label>
                  <input
                    type="number"
                    name="semester"
                    defaultValue={editingCourse?.semester || 1}
                    min="1"
                    max="9"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCourseModal(false);
                    setEditingCourse(null);
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingCourse ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}