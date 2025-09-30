"use client";

/*
FE: MyCourses component

Paste this block above the component so Copilot can pick up the desired behavior:

/*
1. Use SWR to call GET /api/dashboard/my-courses with Authorization header.
2. Export these TypeScript interfaces for reuse elsewhere:
   interface CourseItem { courseId: number; title: string; shortDescription: string; progress: number; status: 'enrolled'|'in_progress'|'completed'|'cancelled'; lastAccessedAt?: string; price?: number; paid?: boolean }
   interface MyCoursesResponse { courses: CourseItem[] }
3. Toolbar: search, filter status (All/Enrolled/Completed), sort (recent, progress desc).
4. Grid cards show title, truncated description, progress bar animated, status badge, buttons: Continue, Details, Unregister (confirm modal). If paid=false & price -> show Checkout button linking /payments/checkout?courseId=.
5. Click Continue -> /courses/:id/learn ; Details -> /courses/:id
6. Unregister -> DELETE /api/dashboard/my-courses/:courseId/unregister -> on success revalidate SWR and show toast
7. Update progress -> PATCH /api/dashboard/my-courses/:courseId/progress {progress} with optimistic update and rollback on error. If progress becomes 100% -> show toast and revalidate Overview and Notifications.
8. Loading skeleton, empty state with CTA "Tìm khóa học" linking to /courses
9. 401 -> redirect /login, 404 -> show not found, 500 -> retry button
10. Accessibility: images alt, aria-labels, modal focus management
11. Export interfaces for reuse

Unit tests to consider (describe only): render list, click continue navigates, update progress triggers API call and optimistic UI.
*/

import React from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

// --- Types exported for reuse ---
export type CourseStatus = 'enrolled' | 'in_progress' | 'completed' | 'cancelled';

export interface CourseItem {
  courseId: number;
  title: string;
  shortDescription: string;
  progress: number; // 0..100
  status: CourseStatus;
  lastAccessedAt?: string;
  price?: number;
  paid?: boolean;
}

export interface MyCoursesResponse {
  courses: CourseItem[];
}

// local fetcher with Authorization header
const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (res.status === 401) {
    const e: any = new Error('Unauthorized'); e.status = 401; throw e;
  }
  if (res.status === 404) {
    const e: any = new Error('Not Found'); e.status = 404; throw e;
  }
  if (!res.ok) {
    const text = await res.text().catch(()=>null);
    const e: any = new Error(text || 'Network error'); e.status = res.status; throw e;
  }
  return res.json();
};

const statusOptions: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'enrolled', label: 'Đã đăng ký' },
  { value: 'in_progress', label: 'Đang học' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' }
];

export default function MyCoursesPage() {
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();

  // toolbar state
  const [search, setSearch] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const [sortBy, setSortBy] = React.useState('recent');

  // confirmation modal
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [targetCourseToUnregister, setTargetCourseToUnregister] = React.useState<number | null>(null);

  // simple toast
  const [toast, setToast] = React.useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const apiUrl = React.useMemo(() => {
    const params: string[] = [];
    if (debouncedSearch) params.push(`search=${encodeURIComponent(debouncedSearch)}`);
    if (statusFilter && statusFilter !== 'all') params.push(`status=${encodeURIComponent(statusFilter)}`);
    if (sortBy) params.push(`sort=${encodeURIComponent(sortBy)}`);
    return `/api/dashboard/my-courses${params.length ? `?${params.join('&')}` : ''}`;
  }, [debouncedSearch, statusFilter, sortBy]);

  const { data, error, isValidating, mutate } = useSWR<any>(apiUrl, fetcher, { revalidateOnFocus: false });

  // Normalize backend response to MyCoursesResponse.courses
  const normalized = React.useMemo<MyCoursesResponse | null>(() => {
    if (!data) return null;
    // backend may return { success: true, data: [...] } or { courses: [...] }
    const rawList = Array.isArray(data) ? data : (data.courses || data.data || data.items || []);
    const mapped = (rawList || []).map((it: any) => ({
      courseId: it.courseId || it.id || it.course_id || (it.course && it.course.id),
      title: it.title || (it.course && it.course.title) || 'Untitled',
      shortDescription: it.shortDescription || it.short_description || it.description || (it.course && it.course.description) || '',
      progress: typeof it.progress === 'number' ? Math.round(it.progress) : (it.progress ? Number(it.progress) : 0),
      status: (it.status === 'dropped' ? 'cancelled' : it.status) || 'enrolled',
      lastAccessedAt: it.updated_at || it.enrolled_at || it.lastAccessedAt || (it.course && it.course.updatedAt) || undefined,
      price: it.price || (it.payment && it.payment.amount) || undefined,
      paid: typeof it.paid === 'boolean' ? it.paid : (it.paid_status === 'success' || (it.payment && it.payment.status === 'success')) || false
    } as CourseItem));
    return { courses: mapped };
  }, [data]);

  React.useEffect(() => {
    if (error && (error as any).status === 401) router.push('/login');
  }, [error, router]);

  const onRetry = async () => await mutate();

  const openUnregisterConfirm = (courseId: number) => {
    setTargetCourseToUnregister(courseId);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    setTargetCourseToUnregister(null);
    setConfirmOpen(false);
  };

  const doUnregister = async () => {
    if (!targetCourseToUnregister) return;
    const cid = targetCourseToUnregister;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`/api/dashboard/my-courses/${cid}/unregister`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : undefined });
      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error('Không thể hủy đăng ký');
      setToast({ type: 'success', message: 'Hủy đăng ký thành công' });
      closeConfirm();
      await mutate();
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Lỗi' });
    }
  };

  // Update progress with optimistic UI
  const updateProgress = async (courseId: number, newProgress: number) => {
    // optimistic update
    const key = apiUrl;
    const previous = data;
    const optimistic = previous ? {
      courses: previous.courses.map(c => c.courseId === courseId ? { ...c, progress: newProgress, status: newProgress >= 100 ? 'completed' : (c.status === 'enrolled' ? 'in_progress' : c.status) } : c)
    } : { courses: [] };

    try {
      await mutate(optimistic, false);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`/api/dashboard/my-courses/${courseId}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ progress: newProgress })
      });

      if (res.status === 401) return router.push('/login');
      if (!res.ok) throw new Error('Cập nhật tiến độ thất bại');

      const json = await res.json();

      // if completed, notify and revalidate overview & notifications
      if (newProgress >= 100) {
        setToast({ type: 'success', message: 'Bạn đã hoàn thành khóa học!' });
        // revalidate Overview and Notifications if present
        try { await globalMutate('/api/dashboard/overview'); } catch (e) {}
        try { await globalMutate('/api/dashboard/notifications'); } catch (e) {}
      } else {
        setToast({ type: 'success', message: 'Cập nhật tiến độ thành công' });
      }

      // revalidate local list
      await mutate();
      return json;
    } catch (e: any) {
      // rollback
      await mutate(previous, false);
      setToast({ type: 'error', message: e.message || 'Lỗi cập nhật tiến độ' });
      return null;
    }
  };

  // small helpers
  const gotoCourse = (id: number) => router.push(`/courses/${id}`);
  const gotoLearn = (id: number) => router.push(`/courses/${id}/learn`);

  // UI helpers
  const truncated = (s: string, n = 140) => s && s.length > n ? s.slice(0, n) + '…' : s;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Khóa học của tôi</h1>

      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-6">
        <div className="flex-1">
          <label className="sr-only">Tìm kiếm khóa học</label>
          <input aria-label="Tìm kiếm khóa học" value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Tìm theo tiêu đề..." className="w-full px-3 py-2 border rounded-md" />
        </div>

        <div className="flex items-center gap-2">
          <label className="sr-only">Lọc trạng thái</label>
          <select aria-label="Lọc trạng thái" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-md">
            {statusOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          <label className="sr-only">Sắp xếp</label>
          <select aria-label="Sắp xếp" value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="px-3 py-2 border rounded-md">
            <option value="recent">Mới nhất</option>
            <option value="progress_desc">Tiến độ giảm dần</option>
          </select>

          <button onClick={() => mutate()} aria-label="Làm mới" className="px-3 py-2 bg-gray-100 rounded-md">Làm mới</button>
        </div>
      </div>

      {/* Error states */}
      {error && (
        <div className="mb-4">
          { (error as any).status === 404 ? (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">Không tìm thấy khóa học.</div>
          ) : (
            <div className="bg-red-50 border border-red-200 p-4 rounded flex items-center justify-between">
              <div>Đã xảy ra lỗi. Vui lòng thử lại.</div>
              <div className="flex gap-2">
                <button onClick={onRetry} className="px-3 py-1 bg-red-600 text-white rounded">Thử lại</button>
                <button onClick={()=>router.push('/login')} className="px-3 py-1 bg-gray-100 rounded">Đăng nhập</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {!data && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_,i)=> (
            <div key={i} className="animate-pulse bg-white rounded-lg p-4 border h-44" />
          ))}
        </div>
      )}

      {/* Empty state */}
  {normalized && normalized.courses.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-4">Bạn chưa đăng ký khóa học nào.</p>
          <button onClick={()=>router.push('/courses')} className="px-4 py-2 bg-blue-600 text-white rounded">Tìm khóa học</button>
        </div>
      )}

      {/* Courses grid */}
  {normalized && normalized.courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {normalized.courses.map(course => (
            <article key={course.courseId} className="bg-white p-4 rounded-lg shadow-sm border flex flex-col" aria-labelledby={`course-${course.courseId}-title`}>
              <div className="flex-1">
                <h3 id={`course-${course.courseId}-title`} className="text-lg font-semibold text-gray-900 cursor-pointer" onClick={()=>gotoCourse(course.courseId)}>{course.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{truncated(course.shortDescription || '', 160)}</p>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-medium text-gray-600">Tiến độ</div>
                  <div className="text-sm font-semibold">{course.progress}%</div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div style={{ width: `${Math.max(0, Math.min(100, course.progress))}%` }} className="h-3 bg-emerald-500 transition-all duration-500" aria-hidden="true" />
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs ${course.status === 'completed' ? 'bg-green-100 text-green-800' : course.status === 'in_progress' ? 'bg-sky-100 text-sky-800' : 'bg-gray-100 text-gray-700'}`}>{course.status.replace('_',' ')}</span>
                  <div className="flex items-center gap-2">
                    <button aria-label={`Tiếp tục học ${course.title}`} onClick={()=>gotoLearn(course.courseId)} className="px-3 py-1 bg-blue-600 text-white rounded">Tiếp tục học</button>
                    <button aria-label={`Xem chi tiết ${course.title}`} onClick={()=>gotoCourse(course.courseId)} className="px-3 py-1 border rounded">Xem chi tiết</button>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="text-sm text-gray-500">{course.lastAccessedAt ? `Truy cập ${formatDistanceToNow(new Date(course.lastAccessedAt), { addSuffix: true })}` : ''}</div>
                  <div className="flex items-center gap-2">
                    {(!course.paid && course.price) && (
                      <a href={`/payments/checkout?courseId=${course.courseId}`} aria-label={`Thanh toán ${course.title}`} className="px-3 py-1 bg-yellow-500 text-white rounded">Thanh toán</a>
                    )}
                    <button aria-label={`Hủy đăng ký ${course.title}`} onClick={()=>openUnregisterConfirm(course.courseId)} className="px-3 py-1 text-sm text-red-600">Hủy</button>
                  </div>
                </div>

                {/* small quick progress controls for demo (increase by 10) */}
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => updateProgress(course.courseId, Math.min(100, course.progress + 10))} className="text-sm px-2 py-1 bg-gray-100 rounded">+10%</button>
                  <button onClick={() => updateProgress(course.courseId, Math.max(0, course.progress - 10))} className="text-sm px-2 py-1 bg-gray-100 rounded">-10%</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Confirm modal */}
      {confirmOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">Xác nhận</h3>
            <p className="text-sm text-gray-600 mb-4">Bạn có chắc muốn hủy đăng ký khóa học này? Hành động này có thể không hoàn tiền.</p>
            <div className="flex justify-end gap-2">
              <button onClick={closeConfirm} className="px-3 py-2 border rounded">Hủy</button>
              <button onClick={doUnregister} className="px-3 py-2 bg-red-600 text-white rounded">Xác nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div aria-live="polite" className={`fixed bottom-6 right-6 px-4 py-2 rounded ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-sky-600 text-white'}`}>
          <div className="flex items-center gap-3">
            <div className="text-sm">{toast.message}</div>
            <button onClick={() => setToast(null)} aria-label="Đóng thông báo" className="text-white opacity-80">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}