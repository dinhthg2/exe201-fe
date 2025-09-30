"use client";
import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';

interface Lesson { 
  id:number; 
  title:string; 
  duration_minutes:number; 
  description?:string;
  video_url?:string;
  order_index?:number;
  is_completed?:boolean;
}
interface Course { 
  id:number; 
  title:string; 
  description?:string; 
  subject?:string; 
  lessons_count?:number; 
  lessons?:Lesson[]; 
  specialization?:string; 
  semester?:number; 
  course_code?:string;
  price?:number;
  difficulty_level?:string;
  prerequisites?:string[];
  learning_outcomes?:string[];
  instructor_name?:string;
  rating?:number;
  total_ratings?:number;
  estimated_hours?:number;
}
interface Enrollment { id:number; course_id:number; progress:number; status:string; }
interface ProgressLog { id:number; previous_progress:number; new_progress:number; createdAt:string; }
interface Review { id:number; rating:number; comment:string; student_name:string; createdAt:string; }

export default function CourseDetailPage({ params }:{ params:{ id:string } }){
  const courseId = params.id;
  const [course,setCourse] = useState<Course|null>(null);
  const [loading,setLoading] = useState(true);
  const [enrollment,setEnrollment] = useState<Enrollment|null>(null);
  const [logs,setLogs] = useState<ProgressLog[]>([]);
  const [reviews,setReviews] = useState<Review[]>([]);
  const [updating,setUpdating] = useState(false);
  const [enrolling,setEnrolling] = useState(false);
  const [error,setError] = useState<string|null>(null);
  const [activeTab, setActiveTab] = useState<'overview'|'lessons'|'reviews'>('overview');
  const [expandedLesson, setExpandedLesson] = useState<number|null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(()=>{ 
    checkAuthentication();
    load(); 
  },[courseId]);

  function checkAuthentication() {
    const rawUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (rawUser && token) {
      try {
        const user = JSON.parse(rawUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }

  async function load(){
    try {
      setLoading(true);
      
      // Always load basic course info
      const res = await api.get(`/courses/${courseId}`);
      setCourse(res.data);
      
      // Only load detailed info if authenticated
      if (isAuthenticated && currentUser?.id) {
        // Load reviews
        try {
          const reviewsRes = await api.get(`/reviews/course/${courseId}`);
          setReviews(reviewsRes.data || []);
        } catch(e) {
          setReviews([]);
        }
        
        // Load enrollment info
        try {
          const enrRes = await api.get(`/enrollments/student/${currentUser.id}`);
          const enr = (enrRes.data||[]).find((e:Enrollment)=> e.course_id === parseInt(courseId));
          if(enr){
            setEnrollment(enr);
            // Load progress logs
            try {
              const logRes = await api.get(`/enrollments/${enr.id}/logs`);
              setLogs(logRes.data.data||[]);
            } catch(e) {
              setLogs([]);
            }
          }
        } catch(e) {
          // User not enrolled or error loading enrollment
        }
      }
    } catch(e:any){ 
      setError(e?.response?.data?.message || e.message); 
    }
    finally { 
      setLoading(false); 
    }
  }

  async function enroll(){
    try {
      const rawUser = localStorage.getItem('user');
      if(!rawUser){ alert('Đăng nhập trước'); return; }
      const user = JSON.parse(rawUser);
      setEnrolling(true);
      const resp = await api.post('/enrollment',{ student_id:user.id, course_id: parseInt(courseId) });
      setEnrollment(resp.data.enrollment);
    } catch(e:any){ alert(e?.response?.data?.message || e.message); }
    finally { setEnrolling(false); }
  }

  async function plus10(){
    if(!enrollment) return;
    try {
      setUpdating(true);
      const next = Math.min(100, enrollment.progress + 10);
      await api.patch(`/enrollment/${enrollment.id}/progress`, { progress: next });
      await load();
    } catch(e:any){ alert(e?.response?.data?.message || e.message); }
    finally { setUpdating(false); }
  }

  async function submitReview(){
    try {
      const rawUser = localStorage.getItem('user');
      if(!rawUser){ alert('Đăng nhập trước'); return; }
      const user = JSON.parse(rawUser);
      
      await api.post('/review', {
        course_id: parseInt(courseId),
        student_id: user.id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: '' });
      await load(); // Reload to get updated reviews
    } catch(e:any){ 
      alert(e?.response?.data?.message || e.message); 
    }
  }

  const getDifficultyColor = (level?: string) => {
    switch(level?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
    ));
  };

  if(loading) return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
  
  if(!course) return <div className="max-w-5xl mx-auto px-4 py-10 text-center text-red-600">Không tìm thấy khóa học.</div>;

  const progressValues = logs.slice().reverse().map(l=>l.new_progress);
  if(progressValues.length === 0 && enrollment) progressValues.push(enrollment.progress);
  const sparkPoints = progressValues.map((v,i)=> `${(i/(Math.max(1,progressValues.length-1)))*100},${100-v}`).join(' ');

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#4F8EF7] text-white rounded-b-2xl shadow-lg">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-5">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <a href="/courses" className="hover:underline opacity-80 transition-opacity duration-200">Khóa học</a>
                <span>›</span>
                <span className="opacity-60">{course.subject || 'Khác'}</span>
              </div>
              
              <div className="space-y-3">
                {course.course_code && (
                  <span className="inline-block text-xs font-mono bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    {course.course_code}
                  </span>
                )}
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{course.title}</h1>
                <p className="text-base text-white/90 max-w-2xl">{course.description || 'Chưa có mô tả.'}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 text-sm backdrop-blur-sm">
                  <span>⭐</span>
                  <span>{averageRating.toFixed(1)}</span>
                  <span className="opacity-70">({reviews.length} đánh giá)</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 text-sm backdrop-blur-sm">
                  <span>👥</span>
                  <span>{course.total_ratings || 0} học viên</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 rounded-full px-3 py-1 text-sm backdrop-blur-sm">
                  <span>⏱️</span>
                  <span>{course.estimated_hours || Math.ceil((course.lessons_count || 0) * 0.5)} giờ</span>
                </div>
                {course.difficulty_level && (
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty_level)} bg-white/20 text-white`}>
                    {course.difficulty_level}
                  </span>
                )}
              </div>
            </div>

            {/* Course Info Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4 border border-[#E6ECF5]">
              {course.price !== undefined && (
                <div className="text-center pb-4 border-b border-[#E6ECF5]">
                  <div className="text-3xl font-bold text-[#22C55E]">
                    {course.price === 0 ? 'Miễn phí' : `${course.price?.toLocaleString()}₫`}
                  </div>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#475569]">Môn học:</span>
                  <span className="font-medium">{course.subject || 'Khác'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569]">Số bài học:</span>
                  <span className="font-medium">{course.lessons_count || 0}</span>
                </div>
                {course.instructor_name && (
                  <div className="flex justify-between">
                    <span className="text-[#475569]">Giảng viên:</span>
                    <span className="font-medium">{course.instructor_name}</span>
                  </div>
                )}
                {course.specialization && (
                  <div className="flex justify-between">
                    <span className="text-[#475569]">Chuyên ngành:</span>
                    <span className="font-medium">{course.specialization}</span>
                  </div>
                )}
                {typeof course.semester === 'number' && (
                  <div className="flex justify-between">
                    <span className="text-[#475569]">Kỳ học:</span>
                    <span className="font-medium">Kỳ {course.semester}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-3">
                {isAuthenticated ? (
                  !enrollment ? (
                    <button 
                      disabled={enrolling} 
                      onClick={enroll} 
                      className="w-full py-3 px-4 bg-[#4F8EF7] hover:bg-[#4F8EF7]/90 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/30 focus-visible:outline-none"
                    >
                      {enrolling ? 'Đang ghi danh...' : 'Ghi danh ngay'}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#22C55E]">{enrollment.progress}%</div>
                        <div className="text-sm text-[#475569]">Tiến độ hoàn thành</div>
                      </div>
                      <div className="w-full bg-[#E6ECF5] rounded-full h-2">
                        <div 
                          className="bg-[#22C55E] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                      <button 
                        disabled={updating || enrollment.progress >= 100} 
                        onClick={plus10} 
                        className="w-full py-2 px-4 bg-[#4F8EF7] hover:bg-[#4F8EF7]/90 text-white rounded-xl font-medium disabled:opacity-50 transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/30 focus-visible:outline-none"
                      >
                        {updating ? 'Đang cập nhật...' : enrollment.progress >= 100 ? 'Đã hoàn thành' : 'Tiếp tục học (+10%)'}
                      </button>
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    <button 
                      onClick={() => window.location.href = '/login'} 
                      className="w-full py-3 px-4 bg-[#4F8EF7] hover:bg-[#4F8EF7]/90 text-white rounded-xl font-semibold transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/30 focus-visible:outline-none"
                    >
                      Đăng nhập để ghi danh
                    </button>
                    <p className="text-xs text-[#475569] text-center">
                      Cần đăng nhập để tham gia khóa học
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart for Enrolled Students */}
      {enrollment && progressValues.length > 1 && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-[#E6ECF5]">
            <h3 className="text-lg font-semibold mb-4 text-[#0F172A]">Xu hướng tiến độ học tập</h3>
            <div className="relative h-24">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#22C55E" />
                    <stop offset="100%" stopColor="#22C55E" />
                  </linearGradient>
                </defs>
                <polyline fill="none" stroke="url(#progressGradient)" strokeWidth={3} points={sparkPoints} />
              </svg>
              <div className="absolute bottom-2 right-4 text-xs text-[#475569]">
                {progressValues.join(' → ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 space-y-6 md:space-y-8">
        {/* Tabs */}
        <div className="flex space-x-2 p-1 bg-[#F7F9FC] rounded-xl shadow-inner border border-[#E6ECF5]">
          {[
            { key: 'overview', label: 'Tổng quan', icon: '📋' },
            { key: 'lessons', label: 'Bài học', icon: '📚', requireAuth: true },
            { key: 'reviews', label: `Đánh giá (${reviews.length})`, icon: '⭐', requireAuth: true }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              disabled={tab.requireAuth && !isAuthenticated}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/30 focus-visible:outline-none ${
                activeTab === tab.key 
                  ? 'bg-white text-[#4F8EF7] shadow-sm' 
                  : tab.requireAuth && !isAuthenticated
                    ? 'text-[#475569]/50 cursor-not-allowed' // disabled color
                    : 'text-[#475569] hover:bg-white/50 hover:text-[#0F172A]'
              }`}
              title={tab.requireAuth && !isAuthenticated ? 'Vui lòng đăng nhập để xem nội dung này' : undefined}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {tab.requireAuth && !isAuthenticated && <span className="ml-1 text-[#475569]/50">🔒</span>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                  <section className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6ECF5]">
                    <h3 className="text-xl font-semibold mb-4 text-[#0F172A]">Kết quả học tập</h3>
                    <ul className="space-y-3">
                      {course.learning_outcomes.map((outcome, index) => (
                        <li key={index} className="flex items-start gap-3 text-[#475569]">
                          <span className="flex-shrink-0 w-5 h-5 bg-[#22C55E]/15 text-[#22C55E] rounded-full flex items-center justify-center text-xs font-bold">✓</span>
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {course.prerequisites && course.prerequisites.length > 0 && (
                  <section className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6ECF5]">
                    <h3 className="text-xl font-semibold mb-4 text-[#0F172A]">Yêu cầu tiên quyết</h3>
                    <ul className="space-y-3">
                      {course.prerequisites.map((req, index) => (
                        <li key={index} className="flex items-start gap-3 text-[#475569]">
                          <span className="flex-shrink-0 w-5 h-5 bg-[#F59E0B]/15 text-[#F59E0B] rounded-full flex items-center justify-center text-xs font-bold">!</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6ECF5]">
                  <h3 className="text-xl font-semibold mb-4 text-[#0F172A]">Mô tả chi tiết</h3>
                  <div className="prose max-w-none text-[#475569]">
                    <p>{course.description || 'Chưa có mô tả chi tiết cho khóa học này.'}</p>
                  </div>
                </section>

                {/* Login prompt for unauthenticated users */}
                {!isAuthenticated && (
                  <section className="bg-[#FFFBEB] rounded-2xl p-6 border border-[#F59E0B]/30 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-[#F59E0B]/15 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-[#F59E0B] mb-2">
                          Đăng nhập để trải nghiệm đầy đủ
                        </h4>
                        <p className="text-[#F59E0B]/90 mb-4 text-sm">
                          Đăng nhập để xem chi tiết bài học, tham gia thảo luận, đánh giá khóa học và theo dõi tiến độ học tập của bạn.
                        </p>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => window.location.href = '/login'} 
                            className="px-6 py-2 bg-[#4F8EF7] hover:bg-[#4F8EF7]/90 text-white rounded-xl font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/30 focus-visible:outline-none"
                          >
                            Đăng nhập
                          </button>
                          <button 
                            onClick={() => window.location.href = '/register'} 
                            className="px-6 py-2 bg-[#F7F9FC] hover:bg-white text-[#4F8EF7] border border-[#E6ECF5] rounded-xl font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/30 focus-visible:outline-none"
                          >
                            Đăng ký ngay
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <>
                {isAuthenticated ? (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#E6ECF5]">
                    <div className="p-6 border-b border-[#E6ECF5]">
                      <h3 className="text-xl font-semibold text-[#0F172A]">Nội dung khóa học</h3>
                      <p className="text-[#475569] mt-1 text-sm">
                        {course.lessons_count || 0} bài học • {course.estimated_hours || Math.ceil((course.lessons_count || 0) * 0.5)} giờ học
                      </p>
                    </div>
                    {(!course.lessons || course.lessons.length === 0) ? (
                      <div className="p-6 text-center text-[#475569]">
                        <div className="text-4xl mb-2">📚</div>
                        <p>Chưa có bài học nào được thêm vào khóa học này.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-[#E6ECF5]">
                        {course.lessons.map((lesson, index) => (
                          <div key={lesson.id} className="p-4 hover:bg-[#F7F9FC] transition-colors duration-200">
                            <div 
                              className="flex items-center justify-between cursor-pointer group"
                              onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex items-center gap-3">
                                  <span className="flex-shrink-0 w-8 h-8 bg-[#4F8EF7]/15 text-[#4F8EF7] rounded-full flex items-center justify-center text-sm font-semibold">
                                    {index + 1}
                                  </span>
                                  <div className="flex-1">
                                    <h4 className="font-medium text-[#0F172A]">{lesson.title}</h4>
                                    {lesson.description && (
                                      <p className="text-sm text-[#475569] mt-1 line-clamp-1 group-hover:line-clamp-none transition-all duration-300 ease-out">{lesson.description}</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-[#475569]">
                                <span>{lesson.duration_minutes || 0} phút</span>
                                {lesson.video_url && <span className="text-[#4F8EF7]">🎥</span>}
                                <span className={`transition-transform duration-200 ${expandedLesson === lesson.id ? 'rotate-180' : ''}`}>
                                  ▼
                                </span>
                              </div>
                            </div>
                            
                            {expandedLesson === lesson.id && (
                              <div className="mt-4 ml-11 p-4 bg-[#F7F9FC] rounded-lg border border-[#E6ECF5]">
                                {lesson.description && (
                                  <p className="text-sm text-[#475569] mb-3">{lesson.description}</p>
                                )}
                                {lesson.video_url ? (
                                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
                                    <span className="text-white">Video Player Placeholder</span>
                                  </div>
                                ) : (
                                  <div className="text-sm text-[#475569]">Nội dung bài học sẽ được cập nhật sớm.</div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm p-8 border border-[#E6ECF5]">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#F7F9FC] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-[#0F172A]">Nội dung bài học được bảo vệ</h3>
                      <p className="text-[#475569] mb-6">
                        Vui lòng đăng nhập để xem chi tiết nội dung bài học và tài liệu của khóa học này.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button 
                          onClick={() => window.location.href = '/login'} 
                          className="px-6 py-2 bg-[#4F8EF7] hover:bg-[#4F8EF7]/90 text-white rounded-xl font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/30 focus-visible:outline-none"
                        >
                          Đăng nhập
                        </button>
                        <button 
                          onClick={() => window.location.href = '/register'} 
                          className="px-6 py-2 bg-[#F7F9FC] hover:bg-white text-[#4F8EF7] border border-[#E6ECF5] rounded-xl font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/30 focus-visible:outline-none"
                        >
                          Đăng ký
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <>
                {isAuthenticated ? (
                  <div className="space-y-6">
                    {/* Review Summary */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6ECF5]">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-[#4F8EF7]">{averageRating.toFixed(1)}</div>
                          <div className="flex justify-center gap-1 mt-1">
                            {renderStars(Math.round(averageRating))}
                          </div>
                          <div className="text-sm text-[#475569] mt-1">{reviews.length} đánh giá</div>
                        </div>
                        <div className="flex-1">
                          {[5,4,3,2,1].map(rating => {
                            const count = reviews.filter(r => r.rating === rating).length;
                            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                            return (
                              <div key={rating} className="flex items-center gap-2 text-sm text-[#475569]">
                                <span className="w-3">{rating}</span>
                                <span className="text-[#F59E0B]">★</span>
                                <div className="flex-1 bg-[#E6ECF5] rounded-full h-2">
                                  <div 
                                    className="bg-[#F59E0B] h-2 rounded-full transition-all duration-200"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="w-8 text-xs text-[#475569]">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Add Review Button */}
                    {enrollment && !showReviewForm && (
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="w-full py-3 px-4 border-2 border-dashed border-[#E6ECF5] rounded-xl text-[#475569] hover:border-[#4F8EF7] hover:text-[#4F8EF7] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/30 focus-visible:outline-none"
                      >
                        + Thêm đánh giá của bạn
                      </button>
                    )}

                    {/* Review Form */}
                    {showReviewForm && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6ECF5]">
                        <h4 className="font-semibold mb-4 text-[#0F172A]">Đánh giá khóa học</h4>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2 text-[#475569]">Điểm đánh giá</label>
                            <div className="flex gap-2">
                              {[1,2,3,4,5].map(rating => (
                                <button
                                  key={rating}
                                  onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                                  className={`text-2xl transition-colors duration-200 ${rating <= newReview.rating ? 'text-[#F59E0B]' : 'text-[#E6ECF5]'} hover:text-[#F59E0B] focus-visible:ring-2 focus-visible:ring-[#F59E0B]/30 focus-visible:outline-none`}
                                  aria-label={`Rate ${rating} stars`}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2 text-[#475569]">Nhận xét</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                              placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
                              className="w-full p-3 border border-[#E6ECF5] rounded-xl bg-white focus:ring-2 focus:ring-[#4F8EF7]/30 focus:border-transparent text-[#0F172A]"
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-3">
                            <button
                              onClick={submitReview}
                              className="px-4 py-2 bg-[#4F8EF7] hover:bg-[#4F8EF7]/90 text-white rounded-xl font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/30 focus-visible:outline-none"
                            >
                              Gửi đánh giá
                            </button>
                            <button
                              onClick={() => setShowReviewForm(false)}
                              className="px-4 py-2 border border-[#E6ECF5] text-[#475569] rounded-xl hover:bg-[#F7F9FC] transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#E6ECF5]/30 focus-visible:outline-none"
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-4">
                      {reviews.length === 0 ? (
                        <div className="text-center py-8 text-[#475569]">
                          <div className="text-4xl mb-2">💭</div>
                          <p>Chưa có đánh giá nào cho khóa học này.</p>
                        </div>
                      ) : (
                        reviews.map(review => (
                          <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6ECF5]">
                            <div className="flex items-start gap-4">
                              <div className="w-10 h-10 bg-[#4F8EF7]/15 rounded-full flex items-center justify-center text-[#4F8EF7] font-semibold">
                                {review.student_name?.charAt(0) || '?'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div>
                                    <h5 className="font-medium text-[#0F172A]">{review.student_name || 'Ẩn danh'}</h5>
                                    <div className="flex items-center gap-2">
                                      <div className="flex">{renderStars(review.rating)}</div>
                                      <span className="text-sm text-[#475569]">
                                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <p className="text-[#475569]">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl shadow-sm p-8 border border-[#E6ECF5]">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-[#F7F9FC] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m0 0v8a2 2 0 002 2h8a2 2 0 002-2V8M9 12h6m-6 4h6" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 text-[#0F172A]">Đánh giá được bảo vệ</h3>
                      <p className="text-[#475569] mb-6">
                        Vui lòng đăng nhập để xem đánh giá và chia sẻ trải nghiệm của bạn về khóa học này.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button 
                          onClick={() => window.location.href = '/login'} 
                          className="px-6 py-2 bg-[#4F8EF7] hover:bg-[#4F8EF7]/90 text-white rounded-xl font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/30 focus-visible:outline-none"
                        >
                          Đăng nhập
                        </button>
                        <button 
                          onClick={() => window.location.href = '/register'} 
                          className="px-6 py-2 bg-[#F7F9FC] hover:bg-white text-[#4F8EF7] border border-[#E6ECF5] rounded-xl font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4F8EF7]/30 focus-visible:outline-none"
                        >
                          Đăng ký
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6ECF5]">
              <h4 className="font-semibold mb-4 text-[#0F172A]">Hành động nhanh</h4>
              <div className="space-y-3">
                <button className="w-full py-2 px-3 text-sm border border-[#E6ECF5] rounded-xl text-[#475569] hover:bg-[#F7F9FC] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#E6ECF5]/30 focus-visible:outline-none">
                  📤 Chia sẻ khóa học
                </button>
                <button className="w-full py-2 px-3 text-sm border border-[#E6ECF5] rounded-xl text-[#475569] hover:bg-[#F7F9FC] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#E6ECF5]/30 focus-visible:outline-none">
                  ❤️ Thêm vào yêu thích
                </button>
                <button className="w-full py-2 px-3 text-sm border border-[#E6ECF5] rounded-xl text-[#475569] hover:bg-[#F7F9FC] transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#E6ECF5]/30 focus-visible:outline-none">
                  📋 Sao chép link
                </button>
              </div>
            </div>

            {/* Course Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E6ECF5]">
              <h4 className="font-semibold mb-4 text-[#0F172A]">Thống kê khóa học</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#475569]">Tổng học viên:</span>
                  <span className="font-medium">{course.total_ratings || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569]">Đánh giá TB:</span>
                  <span className="font-medium">{averageRating.toFixed(1)} ⭐</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569]">Tỷ lệ hoàn thành:</span>
                  <span className="font-medium text-[#22C55E]">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#475569]">Cập nhật:</span>
                  <span className="font-medium">Tháng này</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
