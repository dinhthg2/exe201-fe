'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { User, Mail, Phone, BookOpen, Calendar, Edit3, Camera, Save, X, CreditCard, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

interface Profile {
  id: number;
  name: string;
  email: string;
  student_id?: string;
  phone?: string;
  specialization?: string;
  semester?: string;
  gpa?: number;
  bio?: string;
  interests?: string[];
  avatar?: string;
  created_at: string;
}

interface Payment {
  id: number;
  course_id: number;
  course_title: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  payment_method?: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPayments, setShowPayments] = useState(true);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  // Get auth context for updating user data
  const { updateUser } = useAuth();

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/dashboard/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const result = await response.json();
      if (result.success) {
        setProfile(result.data.profile);
        setPayments(result.data.payments || []);
        setEditForm(result.data.profile);
      } else {
        throw new Error(result.message || 'Failed to load profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước file không được vượt quá 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file hình ảnh');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/profile/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        // Update local profile state
        setProfile(prev => {
          const updated = prev ? { ...prev, avatar: result.data.avatar } : null;
          // Update AuthContext with the updated profile
          if (updated) {
            updateUser(updated);
          }
          return updated;
        });
        setEditForm(prev => ({ ...prev, avatar: result.data.avatar }));
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone: editForm.phone,
          specialization: editForm.specialization,
          semester: editForm.semester,
          bio: editForm.bio,
          interests: editForm.interests,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setProfile(result.data);
        setIsEditing(false);
        setError(null);
      } else {
        throw new Error(result.message || 'Update failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(profile || {});
    setError(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Thành công';
      case 'pending':
        return 'Đang xử lý';
      case 'failed':
        return 'Thất bại';
      default:
        return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-64 rounded-t-lg"></div>
            <div className="bg-white p-6 rounded-b-lg space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Lỗi: {error}</p>
            <button
              onClick={fetchProfile}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Chỉnh sửa</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-b-lg shadow-sm border-x border-b">
          {/* Avatar and Basic Info */}
          <div className="p-6 border-b">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="relative">
                {profile.avatar || editForm.avatar ? (
                  <img
                    src={editForm.avatar || profile.avatar}
                    alt={profile.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="h-12 w-12 text-white" />
                  </div>
                )}
                
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên
                      </label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h2>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{profile.email}</span>
                      </div>
                      {profile.student_id && (
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          <span>MSSV: {profile.student_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Đang lưu...' : 'Lưu'}</span>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                  >
                    <X className="h-4 w-4" />
                    <span>Hủy</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Info */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
              
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{profile.phone || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chuyên ngành
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.specialization || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, specialization: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập chuyên ngành"
                  />
                ) : (
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>{profile.specialization || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              {/* Semester */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kỳ học
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.semester || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, semester: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ví dụ: 2024.1"
                  />
                ) : (
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{profile.semester || 'Chưa cập nhật'}</span>
                  </div>
                )}
              </div>

              {/* GPA */}
              {profile.gpa && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    GPA
                  </label>
                  <div className="text-2xl font-bold text-blue-600">
                    {profile.gpa.toFixed(2)}/4.0
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Giới thiệu</h3>
              
              {/* Bio */}
              <div>
                {isEditing ? (
                  <textarea
                    value={editForm.bio || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Viết gì đó về bản thân..."
                  />
                ) : (
                  <p className="text-gray-600">
                    {profile.bio || 'Chưa có giới thiệu'}
                  </p>
                )}
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sở thích
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={Array.isArray(editForm.interests) ? editForm.interests.join(', ') : ''}
                    onChange={(e) => setEditForm(prev => ({ 
                      ...prev, 
                      interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ví dụ: Đọc sách, Âm nhạc, Thể thao"
                  />
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile.interests && profile.interests.length > 0 ? (
                      profile.interests.map((interest, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">Chưa có sở thích</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Payment History */}
          <div className="p-6 border-t">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lịch sử thanh toán</h3>
              <button
                onClick={() => setShowPayments(!showPayments)}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
              >
                {showPayments ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showPayments ? 'Ẩn' : 'Hiện'}</span>
              </button>
            </div>
            
            {showPayments && (
              <div className="space-y-3">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{payment.course_title}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString('vi-VN')}
                            {payment.payment_method && ` • ${payment.payment_method}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPaymentStatusColor(payment.status)}`}>
                          {getPaymentStatusText(payment.status)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Chưa có giao dịch nào</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-sm text-red-800 hover:text-red-900"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;