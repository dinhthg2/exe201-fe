'use client';

import React, { useEffect, useState } from 'react';

type Props = {
	studentId?: number;
};

type Overview = {
	total_enrollments?: number;
	completed_courses?: number;
	active_courses?: number;
	connected_friends?: number;
	average_progress?: number;
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

type Friend = {
	id: number;
	name: string;
	specialization?: string;
	semester?: string;
	bio?: string;
	avatar?: string;
	interests?: string[];
};

type Tutor = {
	id: number;
	name: string;
	specialization?: string;
	bio?: string;
	avatar?: string;
	phone?: string;
	email?: string;
	rating?: string;
};

type Notification = {
	id: number;
	type: string;
	title: string;
	content: string;
	read: boolean;
	created_at: string;
};

type Profile = {
	id: number;
	name: string;
	email: string;
	student_id?: string;
	specialization?: string;
	semester?: string;
	bio?: string;
	avatar?: string;
	phone?: string;
	address?: string;
	interests?: string[];
	paid_courses?: number;
	total_paid?: number;
};

export default function StudentDashboard({ studentId = 1 }: Props) {
	const [tab, setTab] = useState<'overview' | 'courses' | 'find-friends' | 'tutors' | 'messages' | 'notifications' | 'profile'>('overview');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	
	// Data states
	const [overview, setOverview] = useState<Overview | null>(null);
	const [courses, setCourses] = useState<Course[]>([]);
	const [friends, setFriends] = useState<Friend[]>([]);
	const [tutors, setTutors] = useState<Tutor[]>([]);
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [profile, setProfile] = useState<Profile | null>(null);
	
	// Form states
	const [swipeFilters, setSwipeFilters] = useState({
		semester: '',
		major: '',
		course_code: ''
	});

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tab]);

	const fetchData = async () => {
		setLoading(true);
		setError(null);
		try {
			const token = localStorage.getItem('token');
			const headers = {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json'
			};

			switch (tab) {
				case 'overview':
					const overviewRes = await fetch('/api/dashboard/overview', { headers });
					if (overviewRes.ok) {
						const data = await overviewRes.json();
						setOverview(data.data);
					}
					break;
				
				case 'courses':
					const coursesRes = await fetch('/api/dashboard/courses', { headers });
					if (coursesRes.ok) {
						const data = await coursesRes.json();
						setCourses(data.data || []);
					}
					break;

				case 'find-friends':
					const params = new URLSearchParams();
					if (swipeFilters.semester) params.append('semester', swipeFilters.semester);
					if (swipeFilters.major) params.append('major', swipeFilters.major);
					if (swipeFilters.course_code) params.append('course_code', swipeFilters.course_code);
					
					const friendsRes = await fetch(`/api/dashboard/find-friends?${params}`, { headers });
					if (friendsRes.ok) {
						const data = await friendsRes.json();
						setFriends(data.data || []);
					}
					break;

				case 'tutors':
					const tutorsRes = await fetch('/api/dashboard/tutors', { headers });
					if (tutorsRes.ok) {
						const data = await tutorsRes.json();
						setTutors(data.data || []);
					}
					break;

				case 'notifications':
					const notiRes = await fetch('/api/dashboard/notifications', { headers });
					if (notiRes.ok) {
						const data = await notiRes.json();
						setNotifications(data.data || []);
					}
					break;

				case 'profile':
					const profileRes = await fetch('/api/dashboard/profile', { headers });
					if (profileRes.ok) {
						const data = await profileRes.json();
						setProfile(data.data);
					}
					break;
			}
		} catch (err: any) {
			console.error('Error fetching data:', err);
			setError('Không thể tải dữ liệu');
		} finally {
			setLoading(false);
		}
	};

	const handleSwipe = async (targetId: number, direction: 'left' | 'right') => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/dashboard/friends/match', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					target_id: targetId,
					direction
				})
			});

			if (response.ok) {
				const result = await response.json();
				if (result.match) {
					alert('Chúc mừng! Bạn đã ghép đôi thành công!');
				}
				// Refresh friends list
				fetchData();
			}
		} catch (err) {
			console.error('Error swiping:', err);
		}
	};

	const handleRequestTutor = async (tutorId: number) => {
		try {
			const token = localStorage.getItem('token');
			const response = await fetch('/api/dashboard/tutors/request', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					tutor_id: tutorId,
					message: 'Tôi muốn học với bạn'
				})
			});

			if (response.ok) {
				alert('Đã gửi yêu cầu thành công!');
			}
		} catch (err) {
			console.error('Error requesting tutor:', err);
		}
	};

	const markAsRead = async (notificationId: number) => {
		try {
			const token = localStorage.getItem('token');
			await fetch(`/api/dashboard/notifications/${notificationId}/read`, {
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json'
				}
			});
			fetchData(); // Refresh notifications
		} catch (err) {
			console.error('Error marking notification as read:', err);
		}
	};

	return (
		<div className="flex h-full min-h-[600px] bg-gray-50">
			{/* Sidebar */}
			<aside className="w-64 bg-white border-r shadow-sm">
				<div className="p-4 border-b">
					<h2 className="font-semibold text-gray-800">Dashboard</h2>
				</div>
				<nav className="p-4">
					<ul className="space-y-2">
						{[
							{ key: 'overview', label: 'Tổng quan', icon: '📊' },
							{ key: 'courses', label: 'Khóa học của tôi', icon: '📚' },
							{ key: 'find-friends', label: 'Tìm bạn học', icon: '👥' },
							{ key: 'tutors', label: 'Tìm gia sư', icon: '🎓' },
							{ key: 'messages', label: 'Tin nhắn', icon: '💬' },
							{ key: 'notifications', label: 'Thông báo', icon: '🔔' },
							{ key: 'profile', label: 'Hồ sơ', icon: '👤' }
						].map((item) => (
							<li key={item.key}>
								<button 
									className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
										tab === item.key 
											? 'bg-indigo-600 text-white' 
											: 'text-gray-700 hover:bg-gray-100'
									}`} 
									onClick={() => setTab(item.key as any)}
								>
									<span>{item.icon}</span>
									{item.label}
								</button>
							</li>
						))}
					</ul>
				</nav>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-6">
				{loading && (
					<div className="flex justify-center items-center h-40">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
					</div>
				)}

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
						<p className="text-red-600">{error}</p>
					</div>
				)}

				{/* Overview Tab */}
				{tab === 'overview' && overview && (
					<div>
						<h1 className="text-2xl font-bold text-gray-800 mb-6">Tổng quan</h1>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							<div className="bg-white p-6 rounded-lg shadow-sm">
								<h3 className="text-sm font-medium text-gray-500">Tổng số khóa học</h3>
								<p className="text-2xl font-bold text-gray-900">{overview.total_enrollments || 0}</p>
							</div>
							<div className="bg-white p-6 rounded-lg shadow-sm">
								<h3 className="text-sm font-medium text-gray-500">Khóa học hoàn thành</h3>
								<p className="text-2xl font-bold text-green-600">{overview.completed_courses || 0}</p>
							</div>
							<div className="bg-white p-6 rounded-lg shadow-sm">
								<h3 className="text-sm font-medium text-gray-500">Khóa học đang học</h3>
								<p className="text-2xl font-bold text-blue-600">{overview.active_courses || 0}</p>
							</div>
							<div className="bg-white p-6 rounded-lg shadow-sm">
								<h3 className="text-sm font-medium text-gray-500">Bạn học đã kết nối</h3>
								<p className="text-2xl font-bold text-purple-600">{overview.connected_friends || 0}</p>
							</div>
							<div className="bg-white p-6 rounded-lg shadow-sm">
								<h3 className="text-sm font-medium text-gray-500">Tiến độ trung bình</h3>
								<p className="text-2xl font-bold text-orange-600">{overview.average_progress || 0}%</p>
							</div>
						</div>
					</div>
				)}

				{/* Courses Tab */}
				{tab === 'courses' && (
					<div>
						<h1 className="text-2xl font-bold text-gray-800 mb-6">Khóa học của tôi</h1>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{courses.map((course) => (
								<div key={course.id} className="bg-white p-6 rounded-lg shadow-sm">
									<h3 className="font-semibold text-gray-800 mb-2">{course.title}</h3>
									<p className="text-sm text-gray-600 mb-2">{course.description}</p>
									<p className="text-sm text-gray-500 mb-2">Môn: {course.subject}</p>
									<p className="text-sm text-gray-500 mb-4">Chuyên ngành: {course.specialization}</p>
									<div className="flex justify-between items-center mb-2">
										<span className="text-sm text-gray-600">Tiến độ</span>
										<span className="text-sm font-medium">{course.progress || 0}%</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2 mb-4">
										<div 
											className="bg-blue-600 h-2 rounded-full" 
											style={{ width: `${course.progress || 0}%` }}
										></div>
									</div>
									<span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
										course.status === 'completed' 
											? 'bg-green-100 text-green-800' 
											: 'bg-blue-100 text-blue-800'
									}`}>
										{course.status === 'completed' ? 'Hoàn thành' : 'Đang học'}
									</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Find Friends Tab */}
				{tab === 'find-friends' && (
					<div>
						<h1 className="text-2xl font-bold text-gray-800 mb-6">Tìm bạn học</h1>
						
						{/* Filters */}
						<div className="bg-white p-4 rounded-lg shadow-sm mb-6">
							<h3 className="font-medium mb-4">Bộ lọc</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<input
									type="text"
									placeholder="Kỳ học"
									value={swipeFilters.semester}
									onChange={(e) => setSwipeFilters(prev => ({ ...prev, semester: e.target.value }))}
									className="border border-gray-300 rounded-lg px-3 py-2"
								/>
								<input
									type="text"
									placeholder="Chuyên ngành"
									value={swipeFilters.major}
									onChange={(e) => setSwipeFilters(prev => ({ ...prev, major: e.target.value }))}
									className="border border-gray-300 rounded-lg px-3 py-2"
								/>
								<input
									type="text"
									placeholder="Mã môn học"
									value={swipeFilters.course_code}
									onChange={(e) => setSwipeFilters(prev => ({ ...prev, course_code: e.target.value }))}
									className="border border-gray-300 rounded-lg px-3 py-2"
								/>
							</div>
							<button
								onClick={fetchData}
								className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
							>
								Tìm kiếm
							</button>
						</div>

						{/* Friend Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{friends.map((friend) => (
								<div key={friend.id} className="bg-white p-6 rounded-lg shadow-sm">
									<div className="flex items-center mb-4">
										{friend.avatar && (
											<img 
												src={friend.avatar} 
												alt={friend.name}
												className="w-12 h-12 rounded-full mr-4"
											/>
										)}
										<div>
											<h3 className="font-semibold text-gray-800">{friend.name}</h3>
											<p className="text-sm text-gray-500">{friend.specialization}</p>
											<p className="text-sm text-gray-500">Kỳ {friend.semester}</p>
										</div>
									</div>
									<p className="text-sm text-gray-600 mb-4">{friend.bio}</p>
									{friend.interests && friend.interests.length > 0 && (
										<div className="mb-4">
											<p className="text-sm font-medium text-gray-700 mb-2">Sở thích:</p>
											<div className="flex flex-wrap gap-1">
												{friend.interests.map((interest, index) => (
													<span 
														key={index}
														className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
													>
														{interest}
													</span>
												))}
											</div>
										</div>
									)}
									<div className="flex gap-2">
										<button
											onClick={() => handleSwipe(friend.id, 'left')}
											className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200"
										>
											❌ Pass
										</button>
										<button
											onClick={() => handleSwipe(friend.id, 'right')}
											className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200"
										>
											💚 Like
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Tutors Tab */}
				{tab === 'tutors' && (
					<div>
						<h1 className="text-2xl font-bold text-gray-800 mb-6">Tìm gia sư</h1>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{tutors.map((tutor) => (
								<div key={tutor.id} className="bg-white p-6 rounded-lg shadow-sm">
									<div className="flex items-center mb-4">
										{tutor.avatar && (
											<img 
												src={tutor.avatar} 
												alt={tutor.name}
												className="w-12 h-12 rounded-full mr-4"
											/>
										)}
										<div>
											<h3 className="font-semibold text-gray-800">{tutor.name}</h3>
											<p className="text-sm text-gray-500">{tutor.specialization}</p>
											<div className="flex items-center">
												<span className="text-yellow-500">⭐</span>
												<span className="text-sm text-gray-600 ml-1">{tutor.rating}</span>
											</div>
										</div>
									</div>
									<p className="text-sm text-gray-600 mb-4">{tutor.bio}</p>
									<div className="space-y-2 mb-4 text-sm">
										{tutor.phone && (
											<p className="text-gray-600">📞 {tutor.phone}</p>
										)}
										{tutor.email && (
											<p className="text-gray-600">✉️ {tutor.email}</p>
										)}
									</div>
									<button
										onClick={() => handleRequestTutor(tutor.id)}
										className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
									>
										Yêu cầu gia sư
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Messages Tab */}
				{tab === 'messages' && (
					<div>
						<h1 className="text-2xl font-bold text-gray-800 mb-6">Tin nhắn</h1>
						<div className="bg-white rounded-lg shadow-sm p-6">
							<p className="text-gray-600 text-center">
								Chức năng tin nhắn sẽ được tích hợp sau khi có match hoặc kết nối với gia sư thành công.
							</p>
						</div>
					</div>
				)}

				{/* Notifications Tab */}
				{tab === 'notifications' && (
					<div>
						<h1 className="text-2xl font-bold text-gray-800 mb-6">Thông báo</h1>
						<div className="space-y-4">
							{notifications.map((notification) => (
								<div 
									key={notification.id} 
									className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${
										notification.read ? 'border-gray-300' : 'border-indigo-500'
									}`}
								>
									<div className="flex justify-between items-start">
										<div className="flex-1">
											<h3 className="font-medium text-gray-800">{notification.title}</h3>
											<p className="text-sm text-gray-600 mt-1">{notification.content}</p>
											<p className="text-xs text-gray-500 mt-2">
												{new Date(notification.created_at).toLocaleString('vi-VN')}
											</p>
										</div>
										{!notification.read && (
											<button
												onClick={() => markAsRead(notification.id)}
												className="text-indigo-600 text-sm hover:text-indigo-800"
											>
												Đánh dấu đã đọc
											</button>
										)}
									</div>
								</div>
							))}
							{notifications.length === 0 && (
								<div className="bg-white rounded-lg shadow-sm p-6 text-center">
									<p className="text-gray-600">Không có thông báo mới</p>
								</div>
							)}
						</div>
					</div>
				)}

				{/* Profile Tab */}
				{tab === 'profile' && profile && (
					<div>
						<h1 className="text-2xl font-bold text-gray-800 mb-6">Hồ sơ cá nhân</h1>
						<div className="bg-white rounded-lg shadow-sm p-6">
							<div className="flex items-center mb-6">
								{profile.avatar && (
									<img 
										src={profile.avatar} 
										alt={profile.name}
										className="w-20 h-20 rounded-full mr-6"
									/>
								)}
								<div>
									<h2 className="text-xl font-semibold text-gray-800">{profile.name}</h2>
									<p className="text-gray-600">{profile.email}</p>
									<p className="text-gray-600">MSSV: {profile.student_id}</p>
								</div>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<h3 className="font-medium text-gray-800 mb-4">Thông tin cá nhân</h3>
									<div className="space-y-3 text-sm">
										<p><span className="font-medium">Chuyên ngành:</span> {profile.specialization}</p>
										<p><span className="font-medium">Kỳ học:</span> {profile.semester}</p>
										<p><span className="font-medium">Điện thoại:</span> {profile.phone}</p>
										<p><span className="font-medium">Địa chỉ:</span> {profile.address}</p>
									</div>
								</div>
								
								<div>
									<h3 className="font-medium text-gray-800 mb-4">Thống kê thanh toán</h3>
									<div className="space-y-3 text-sm">
										<p><span className="font-medium">Khóa học đã thanh toán:</span> {profile.paid_courses}</p>
										<p><span className="font-medium">Tổng số tiền:</span> {profile.total_paid?.toLocaleString('vi-VN')} VND</p>
									</div>
								</div>
							</div>
							
							{profile.bio && (
								<div className="mt-6">
									<h3 className="font-medium text-gray-800 mb-2">Bio</h3>
									<p className="text-gray-600">{profile.bio}</p>
								</div>
							)}
							
							{profile.interests && profile.interests.length > 0 && (
								<div className="mt-6">
									<h3 className="font-medium text-gray-800 mb-2">Sở thích</h3>
									<div className="flex flex-wrap gap-2">
										{profile.interests.map((interest, index) => (
											<span 
												key={index}
												className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
											>
												{interest}
											</span>
										))}
									</div>
								</div>
							)}
							
							<div className="mt-6">
								<button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
									Chỉnh sửa hồ sơ
								</button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
}
