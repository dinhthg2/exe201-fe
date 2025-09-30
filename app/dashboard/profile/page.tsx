'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  User, 
  Wallet, 
  CreditCard, 
  Bell, 
  Camera, 
  Save,
  BookOpen,
  Users,
  MessageCircle,
  CheckCircle2
} from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { 
  Card as ShadcnCard, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../../../components/ui/shadcn-card';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';
import api from '../../../lib/api';
import { useAuth } from '../../../components/AuthContext';

const SPECIALIZATIONS = [
  { value: 'SE', label: 'Software Engineering' },
  { value: 'AI', label: 'Artificial Intelligence' },
  { value: 'MKT', label: 'Marketing' },
  { value: 'GD', label: 'Graphic Design' },
  { value: 'MC', label: 'Mass Communication' }
];

interface ProfileData {
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    student_id?: string;
    specialization?: string;
    semester?: number;
    phone?: string;
    bio?: string;
    location?: string;
  };
  wallet?: {
    balance: number;
    currency: string;
  };
  stats: {
    coursesCount: number;
    buddyCount: number;
    conversationsCount: number;
    unreadNotificationsCount: number;
  };
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  description: string;
  status: string;
  createdAt: string;
}

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  payload?: any;
  read: boolean;
  createdAt: string;
}

export default function ProfileNewPage() {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    student_id: '',
    semester: '',
    phone: '',
    bio: '',
    location: ''
  });

  // Load profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  // Load tab-specific data when tab changes
  useEffect(() => {
    switch (activeTab) {
      case 'transactions':
        loadTransactions();
        break;
      case 'notifications':
        loadNotifications();
        break;
    }
  }, [activeTab]);

  // Update form data when profile data changes
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.user.name || '',
        specialization: profileData.user.specialization || '',
        student_id: profileData.user.student_id || '',
        semester: profileData.user.semester?.toString() || '',
        phone: profileData.user.phone || '',
        bio: profileData.user.bio || '',
        location: profileData.user.location || ''
      });
    }
  }, [profileData]);

  const loadProfileData = async () => {
    try {
      const response = await api.get('/profile/me');
      setProfileData(response.data);
      return response.data; // Return data for use in other functions
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Không thể tải thông tin profile');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await api.get('/profile/payments');
      setTransactions(response.data.payments || []);
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const response = await api.get('/profile/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);
    try {
      const response = await api.patch('/profile/update', {
        ...formData,
        semester: formData.semester ? parseInt(formData.semester) : null
      });

      if (response.data) {
        await loadProfileData();
        toast.success('Cập nhật thông tin thành công!');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('avatar', file);

    try {
      const response = await api.post('/profile/upload-avatar', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data) {
        console.log('Avatar upload response:', response.data);
        
        // Reload profile data and get the updated data
        const updatedProfileData = await loadProfileData();
        console.log('Updated profile data:', updatedProfileData);
        
        // Update AuthContext with the updated user data
        if (updatedProfileData?.user) {
          console.log('Updating user in AuthContext:', updatedProfileData.user);
          updateUser(updatedProfileData.user);
        }
        
        toast.success('Cập nhật avatar thành công!');
      }
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error?.response?.data?.message || 'Không thể tải lên avatar');
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/profile/notifications/mark-all-read');
      
      await loadNotifications();
      await loadProfileData(); // Refresh unread count
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error: any) {
      console.error('Error marking notifications as read:', error);
      toast.error(error?.response?.data?.message || 'Lỗi kết nối server');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getTransactionStatusBadge = (status: string) => {
    const statusMap = {
      success: { label: 'Thành công', color: 'bg-emerald-100 text-emerald-800' },
      pending: { label: 'Đang xử lý', color: 'bg-amber-100 text-amber-800' },
      failed: { label: 'Thất bại', color: 'bg-red-100 text-red-800' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
        {statusInfo.label}
      </span>
    );
  };

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      newBuddy: <Users className="w-4 h-4" />,
      paymentSuccess: <CheckCircle2 className="w-4 h-4" />,
      paymentFailed: <CreditCard className="w-4 h-4" />,
      courseProgress: <BookOpen className="w-4 h-4" />
    };
    
    return iconMap[type as keyof typeof iconMap] || <Bell className="w-4 h-4" />;
  };

  // Load data when switching tabs
  useEffect(() => {
    if (activeTab === 'transactions' && transactions.length === 0) {
      loadTransactions();
    } else if (activeTab === 'notifications' && notifications.length === 0) {
      loadNotifications();
    }
  }, [activeTab, transactions.length, notifications.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải thông tin profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <Card className="w-96 text-center">
          <p className="text-gray-600">Không thể tải thông tin profile</p>
          <button 
            onClick={loadProfileData} 
            className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          >
            Thử lại
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-white shadow-lg rounded-full bg-emerald-200 flex items-center justify-center text-2xl text-emerald-800">
                  {profileData.user.avatar ? (
                    <Image 
                      src={profileData.user.avatar} 
                      alt="Avatar" 
                      width={80}
                      height={80}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profileData.user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{profileData.user.name}</h1>
                <p className="text-emerald-100 mb-4">{profileData.user.email}</p>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-2xl font-bold">{profileData.stats.coursesCount}</span>
                    </div>
                    <p className="text-xs text-emerald-100">Khóa học</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span className="text-2xl font-bold">{profileData.stats.buddyCount}</span>
                    </div>
                    <p className="text-xs text-emerald-100">Bạn học</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-2xl font-bold">{profileData.stats.conversationsCount}</span>
                    </div>
                    <p className="text-xs text-emerald-100">Cuộc trò chuyện</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Bell className="w-4 h-4" />
                      <span className="text-2xl font-bold">{profileData.stats.unreadNotificationsCount}</span>
                    </div>
                    <p className="text-xs text-emerald-100">Thông báo mới</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-lg p-2">
            {[
              { id: 'personal', label: 'Thông tin cá nhân', icon: User },
              { id: 'wallet', label: 'Ví của tôi', icon: Wallet },
              { id: 'transactions', label: 'Lịch sử thanh toán', icon: CreditCard },
              { id: 'notifications', label: 'Thông báo', icon: Bell }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors',
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:bg-emerald-50'
                )}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'personal' && (
            <Card className="bg-white/80 backdrop-blur-sm border border-emerald-200 shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-emerald-700 mb-2">Thông tin cá nhân</h2>
                <p className="text-gray-600">Cập nhật thông tin cá nhân của bạn</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Họ và tên</label>
                    <input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email (không thể chỉnh sửa)</label>
                    <input
                      value={profileData.user.email}
                      disabled
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chuyên ngành</label>
                    <select 
                      value={formData.specialization} 
                      onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Chọn chuyên ngành</option>
                      {SPECIALIZATIONS.map((spec) => (
                        <option key={spec.value} value={spec.value}>
                          {spec.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mã số sinh viên</label>
                    <input
                      value={formData.student_id}
                      onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Kỳ học</label>
                    <select 
                      value={formData.semester} 
                      onChange={(e) => setFormData({...formData, semester: e.target.value})}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="">Chọn kỳ học</option>
                      {[1,2,3,4,5,6,7,8,9].map((sem) => (
                        <option key={sem} value={sem.toString()}>
                          Kỳ {sem}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Số điện thoại</label>
                    <input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Địa chỉ</label>
                  <input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Giới thiệu bản thân</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Viết một vài dòng giới thiệu về bản thân..."
                    className="w-full px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-500 focus:outline-none min-h-24"
                  />
                </div>
                
                <button
                  onClick={handleUpdateProfile}
                  disabled={updating}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{updating ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </div>
            </Card>
          )}

          {activeTab === 'wallet' && (
            <Card className="bg-white/80 backdrop-blur-sm border border-emerald-200 shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-emerald-700 mb-2">Ví của tôi</h2>
                <p className="text-gray-600">Quản lý số dư và giao dịch của bạn</p>
              </div>

              <div className="text-center py-8">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white mb-6 max-w-md mx-auto">
                  <Wallet className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Số dư hiện tại</h3>
                  <p className="text-3xl font-bold">
                    {profileData.wallet ? formatCurrency(profileData.wallet.balance) : formatCurrency(0)}
                  </p>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2 rounded-lg font-medium">
                    Nạp tiền
                  </button>
                  <button className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-6 py-2 rounded-lg font-medium">
                    Rút tiền
                  </button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'transactions' && (
            <Card className="bg-white/80 backdrop-blur-sm border border-emerald-200 shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-emerald-700 mb-2">Lịch sử thanh toán</h2>
                <p className="text-gray-600">Xem tất cả giao dịch của bạn</p>
              </div>

              {transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border border-emerald-100 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium">
                            Mã GD: #{transaction.id}
                          </div>
                          {getTransactionStatusBadge(transaction.status)}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(transaction.createdAt).toLocaleString('vi-VN')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "font-bold",
                          transaction.type === 'topup' ? 'text-emerald-600' : 'text-red-600'
                        )}>
                          {transaction.type === 'topup' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Chưa có giao dịch nào</p>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="bg-white/80 backdrop-blur-sm border border-emerald-200 shadow-xl">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-emerald-700 mb-2">Thông báo</h2>
                  <p className="text-gray-600">Quản lý tất cả thông báo của bạn</p>
                </div>
                {notifications.some(n => !n.read) && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 border rounded-lg transition-colors cursor-pointer hover:bg-emerald-50",
                        notification.read 
                          ? "border-gray-200 bg-white" 
                          : "border-emerald-200 bg-emerald-50"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={cn(
                          "mt-1 p-2 rounded-full",
                          notification.read 
                            ? "bg-gray-100 text-gray-400" 
                            : "bg-emerald-100 text-emerald-600"
                        )}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className={cn(
                              "font-medium",
                              notification.read ? "text-gray-700" : "text-emerald-800"
                            )}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm mt-1">
                            {notification.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">Chưa có thông báo nào</p>
                </div>
              )}
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}