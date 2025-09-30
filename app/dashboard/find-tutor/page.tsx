"use client";

/*
FindTutor component

Paste this prompt block at the top so Copilot can generate matching code:

1) Page path: /dashboard/find-tutor (client component)
2) On load call GET /api/dashboard/tutors?major=&course_code=&min_rating=&page=&pageSize=&sort=
3) Use useSWR for caching + revalidate
4) Export types:
   export interface TutorItem { tutorId:number; name:string; avatarUrl?:string; major:string; courseCodes:string[]; rating:number; pricePerHour?:number; bio?:string; availableSlots?:{date:string; timeFrom:string; timeTo:string}[] }
   interface TutorsResponse { tutors: TutorItem[]; total: number }
5) Toolbar: search (name), major dropdown, course code input, min rating slider, price range, sort select
6) Results: tutor card with avatar, name, major, truncated bio, stars, price/hour, badges (Top-rated/Online now)
7) Pagination (page & pageSize)
8) Card actions: View detail (modal), Request contact (open modal -> POST /api/dashboard/tutors/connect) with message + preferred_slot
9) On connect success show toast; if connected navigate to /dashboard/messages?with=<tutor_user_id>
10) Error handling: 401 redirect /login, validation messages inline, 429 show retry later
11) Accessibility: aria attributes, modal focus handling
12) Tests to consider: changing filters updates API call, open connect modal, successful POST triggers toast and revalidation
*/

import React from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { Star, User, MessageSquare, Search, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Types ---
export interface TutorItem {
  tutorId: number;
  name: string;
  avatarUrl?: string;
  major: string;
  courseCodes: string[];
  rating: number; // 0..5
  pricePerHour?: number;
  bio?: string;
  availableSlots?: { date: string; timeFrom: string; timeTo: string }[];
}

export interface TutorsResponse {
  tutors: TutorItem[];
  total: number;
}

// fetcher with Authorization header
const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (res.status === 401) { const e: any = new Error('Unauthorized'); e.status = 401; throw e; }
  if (!res.ok) {
    const text = await res.text().catch(()=>null);
    const e: any = new Error(text || 'Network error'); e.status = res.status; throw e;
  }
  return res.json();
};

const pageSizeOptions = [6, 12, 24];

export default function FindTutorPage() {
  const router = useRouter();

  // filters
  const [searchText, setSearchText] = React.useState('');
  const [major, setMajor] = React.useState('');
  const [courseCode, setCourseCode] = React.useState('');
  const [minRating, setMinRating] = React.useState(0);
  const [priceMin, setPriceMin] = React.useState<number | ''>('');
  const [priceMax, setPriceMax] = React.useState<number | ''>('');
  const [sortBy, setSortBy] = React.useState('relevance');

  // pagination
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(12);

  // modals
  const [detailTutor, setDetailTutor] = React.useState<TutorItem | null>(null);
  const [connectTutor, setConnectTutor] = React.useState<TutorItem | null>(null);

  // UI state
  const [toast, setToast] = React.useState<{ type: 'success'|'error'|'info'; message: string } | null>(null);
  const [connecting, setConnecting] = React.useState(false);
  const [optimisticPending, setOptimisticPending] = React.useState<Record<number, boolean>>({});

  const buildUrl = React.useCallback(() => {
    const params: string[] = [];
    if (major) params.push(`major=${encodeURIComponent(major)}`);
    if (courseCode) params.push(`course_code=${encodeURIComponent(courseCode)}`);
    if (searchText) params.push(`search=${encodeURIComponent(searchText)}`);
    if (minRating) params.push(`min_rating=${encodeURIComponent(String(minRating))}`);
    if (priceMin !== '') params.push(`priceMin=${encodeURIComponent(String(priceMin))}`);
    if (priceMax !== '') params.push(`priceMax=${encodeURIComponent(String(priceMax))}`);
    if (sortBy) params.push(`sort=${encodeURIComponent(sortBy)}`);
    params.push(`page=${page}`);
    params.push(`pageSize=${pageSize}`);
    return `/api/dashboard/tutors${params.length ? `?${params.join('&')}` : ''}`;
  }, [major, courseCode, searchText, minRating, priceMin, priceMax, sortBy, page, pageSize]);

  const { data, error, mutate } = useSWR<TutorsResponse>(buildUrl(), fetcher, { revalidateOnFocus: false });

  React.useEffect(() => {
    if (error && (error as any).status === 401) router.push('/login');
  }, [error, router]);

  // Derived list
  const tutors = data?.tutors || [];
  const total = data?.total || 0;

  // Connect request payload state
  const [connectMessage, setConnectMessage] = React.useState('');
  const [preferredSlot, setPreferredSlot] = React.useState<{ date?: string; timeFrom?: string; timeTo?: string }>({});

  const openDetail = (t: TutorItem) => setDetailTutor(t);
  const closeDetail = () => setDetailTutor(null);

  const openConnect = (t: TutorItem) => { setConnectTutor(t); setConnectMessage(''); setPreferredSlot({}); };
  const closeConnect = () => setConnectTutor(null);

  const doConnect = async () => {
    if (!connectTutor) return;
    setConnecting(true);
    setOptimisticPending(p => ({ ...p, [connectTutor.tutorId]: true }));
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch('/api/dashboard/tutors/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ tutor_id: connectTutor.tutorId, message: connectMessage || undefined, preferred_slot: Object.keys(preferredSlot).length ? preferredSlot : undefined })
      });
      if (res.status === 401) return router.push('/login');
      if (res.status === 429) throw new Error('Quá nhiều yêu cầu, vui lòng thử lại sau');
      if (!res.ok) {
        const txt = await res.text().catch(()=>null);
        throw new Error(txt || 'Lỗi server');
      }
      const json = await res.json();
      // json: { status:'pending'|'connected', request_id, tutor }
      if (json.status === 'connected') {
        setToast({ type: 'success', message: 'Đã kết nối — chuyển đến tin nhắn' });
        // revalidate and navigate to messages
        await mutate();
        router.push(`/dashboard/messages?with=${json.tutor && (json.tutor.user_id || json.tutor.id)}`);
      } else {
        setToast({ type: 'success', message: 'Yêu cầu đã gửi' });
        await mutate();
      }
      closeConnect();
    } catch (e: any) {
      setToast({ type: 'error', message: e.message || 'Lỗi' });
      // rollback optimistic
      setOptimisticPending(p => { const copy = { ...p }; delete copy[connectTutor!.tutorId]; return copy; });
    } finally {
      setConnecting(false);
    }
  };

  // Pagination helpers
  const pages = Math.max(1, Math.ceil((total || 0) / pageSize));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Tìm gia sư</h1>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col lg:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-5 w-5 text-gray-400" />
          <input aria-label="Tìm tên gia sư" value={searchText} onChange={(e)=>setSearchText(e.target.value)} placeholder="Tìm theo tên..." className="w-full px-3 py-2 border rounded" />
        </div>

        <select aria-label="Chuyên ngành" value={major} onChange={(e)=>setMajor(e.target.value)} className="px-3 py-2 border rounded">
          <option value="">Tất cả chuyên ngành</option>
          <option value="CS">Công nghệ thông tin</option>
          <option value="MATH">Toán</option>
          <option value="EN">Tiếng Anh</option>
        </select>

        <input aria-label="Mã môn" value={courseCode} onChange={(e)=>setCourseCode(e.target.value)} placeholder="Mã môn (tùy chọn)" className="px-3 py-2 border rounded" />

        <select aria-label="Sắp xếp" value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="px-3 py-2 border rounded">
          <option value="relevance">Phù hợp</option>
          <option value="rating_desc">Đánh giá cao</option>
          <option value="price_asc">Giá thấp</option>
        </select>

        <button onClick={() => { setPage(1); mutate(); }} className="px-3 py-2 bg-blue-600 text-white rounded">Áp dụng</button>
      </div>

      {/* Loading skeleton */}
      {!data && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_,i)=> (<div key={i} className="animate-pulse bg-white rounded p-4 h-40" />))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded">Có lỗi xảy ra. Vui lòng thử lại.</div>
      )}

      {/* Results */}
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map(t => (
              <div key={t.tutorId} className="bg-white rounded-lg p-4 shadow-sm border flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                    {t.avatarUrl ? <img src={t.avatarUrl} alt={`${t.name} avatar`} className="h-14 w-14 object-cover" /> : <User className="h-6 w-6 text-gray-400" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{t.name}</h3>
                      {t.rating >= 4.5 && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">Top-rated</span>}
                      {optimisticPending[t.tutorId] && <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded">Yêu cầu đang chờ</span>}
                    </div>
                    <div className="text-sm text-gray-500">{t.major} • {t.courseCodes?.slice(0,3).join(', ')}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1 text-yellow-500"><Star className="h-4 w-4" /> <span className="font-semibold">{t.rating?.toFixed ? t.rating.toFixed(1) : t.rating}</span></div>
                    <div className="text-sm text-gray-600">{t.pricePerHour ? `${t.pricePerHour} / giờ` : 'Thỏa thuận'}</div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-3 line-clamp-3">{t.bio}</p>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <button onClick={() => openDetail(t)} className="px-3 py-1 border rounded">Xem chi tiết</button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openConnect(t)} className="px-3 py-1 bg-green-600 text-white rounded flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Yêu cầu liên hệ</button>
                    <a href={`/booking? tutorId=${t.tutorId}`} className="px-3 py-1 border rounded">Đặt lịch</a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">Hiển thị {Math.min(total, (page-1)*pageSize + 1)} - {Math.min(total, page*pageSize)} / {total}</div>
            <div className="flex items-center gap-2">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1} className="p-2 border rounded"><ChevronLeft/></button>
              <div>Trang {page} / {pages}</div>
              <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page>=pages} className="p-2 border rounded"><ChevronRight/></button>
              <select value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 border rounded">
                {pageSizeOptions.map(s=> <option key={s} value={s}>{s} / trang</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Detail modal */}
      {detailTutor && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-start gap-4">
              <div className="h-20 w-20 bg-gray-100 rounded-full overflow-hidden">
                {detailTutor.avatarUrl ? <img src={detailTutor.avatarUrl} alt={`${detailTutor.name} avatar`} /> : <User className="h-8 w-8 text-gray-400" />}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold">{detailTutor.name}</h2>
                <div className="text-sm text-gray-500">{detailTutor.major} • {detailTutor.courseCodes?.join(', ')}</div>
                <div className="mt-3 text-sm text-gray-700">{detailTutor.bio}</div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={()=>{ setDetailTutor(null); openConnect(detailTutor); }} className="px-3 py-1 bg-green-600 text-white rounded">Kết nối</button>
                  <button onClick={closeDetail} className="px-3 py-1 border rounded">Đóng</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Connect modal */}
      {connectTutor && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold">Gửi yêu cầu kết nối tới {connectTutor.name}</h3>
            <label className="block text-sm mt-3">Tin nhắn (tùy chọn)</label>
            <textarea value={connectMessage} onChange={(e)=>setConnectMessage(e.target.value)} className="w-full border rounded p-2 mt-1" rows={4} />

            <label className="block text-sm mt-3">Khoảng thời gian muốn được liên hệ</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              <input type="date" value={preferredSlot.date || ''} onChange={(e)=>setPreferredSlot(s=>({ ...s, date: e.target.value }))} className="px-2 py-1 border rounded" />
              <input type="time" value={preferredSlot.timeFrom || ''} onChange={(e)=>setPreferredSlot(s=>({ ...s, timeFrom: e.target.value }))} className="px-2 py-1 border rounded" />
              <input type="time" value={preferredSlot.timeTo || ''} onChange={(e)=>setPreferredSlot(s=>({ ...s, timeTo: e.target.value }))} className="px-2 py-1 border rounded" />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={closeConnect} className="px-3 py-2 border rounded">Hủy</button>
              <button onClick={doConnect} disabled={connecting} className="px-3 py-2 bg-blue-600 text-white rounded">{connecting ? 'Đang gửi...' : 'Gửi yêu cầu'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div aria-live="polite" className={`fixed bottom-6 right-6 px-4 py-2 rounded ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          <div className="flex items-center gap-3">
            <div className="text-sm">{toast.message}</div>
            <button onClick={()=>setToast(null)} className="text-white opacity-80">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}