"use client";
import { useEffect, useState, useMemo } from 'react';
import api from '../../../lib/api';
import { Search, RefreshCcw, Star } from 'lucide-react';

interface Tutor { id:number; name:string; email:string; subjects:string[]; rating:number; price_per_hour:number; avatar?:string; bio:string; }

import { useAuth } from '../../../components/AuthContext';

export default function TutorsPage(){
  const auth = useAuth();
  const user = auth?.user; // reserved for future actions (connect, message)
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [q, setQ] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [reviewStats, setReviewStats] = useState<Record<number,{avg:number; count:number}>>({});
  const [loadingReviews, setLoadingReviews] = useState(false);

  async function load(){
    setLoading(true); setError(null);
    try {
      const res = await api.get(`/students/dashboard/tutors`);
      const data = res.data?.data || res.data?.tutors || []; // fallback if shape differs
      setTutors(data);
    } catch(err:any){ setError(err?.response?.data?.message || 'Lỗi tải tutors'); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ load(); }, []);

  // Fetch review summaries for tutors after main list loaded
  useEffect(()=>{
    if(!tutors.length) return;
    let cancelled = false;
    async function fetchAll(){
      setLoadingReviews(true);
      try {
        const results: Record<number,{avg:number;count:number}> = {};
        await Promise.all(tutors.map(async t => {
          try {
            const res = await api.get(`/reviews/tutor/${t.id}`); // returns array of reviews
            const arr = res.data || [];
            if(!Array.isArray(arr) || !arr.length){
              results[t.id] = { avg: t.rating || 0, count: 0 }; return;
            }
            const sum = arr.reduce((a:any,r:any)=> a + (r.rating||0), 0);
            results[t.id] = { avg: parseFloat((sum / arr.length).toFixed(2)), count: arr.length };
          } catch { /* ignore individual errors */ }
        }));
        if(!cancelled) setReviewStats(results);
      } finally { if(!cancelled) setLoadingReviews(false); }
    }
    fetchAll();
    return ()=>{ cancelled = true; };
  }, [tutors]);

  const filtered = useMemo(()=>{
    return tutors.filter(t => {
      if(q){
        const low = q.toLowerCase();
        if(!t.name.toLowerCase().includes(low) && !t.subjects.some(s=>s.toLowerCase().includes(low))) return false;
      }
      if(minRating && t.rating < minRating) return false;
      if(maxPrice !== null && t.price_per_hour > maxPrice) return false;
      return true;
    });
  }, [tutors, q, minRating, maxPrice]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-emerald-800">Danh sách Tutors</h1>
          <p className="text-sm text-emerald-600">Tìm kiếm & lọc gia sư phù hợp.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Tìm tên hoặc môn" className="pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:border-emerald-400 focus:ring-0" />
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span>Đánh giá tối thiểu</span>
            <select value={minRating} onChange={e=>setMinRating(parseFloat(e.target.value))} className="border rounded-lg px-2 py-1 text-xs bg-white">
              <option value={0}>Tất cả</option>
              <option value={3}>≥3.0</option>
              <option value={4}>≥4.0</option>
              <option value={4.5}>≥4.5</option>
            </select>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <span>Giá tối đa</span>
            <input type="number" min={0} value={maxPrice ?? ''} onChange={e=> setMaxPrice(e.target.value ? parseInt(e.target.value) : null)} className="w-24 border rounded-lg px-2 py-1 text-xs bg-white" placeholder="All" />
          </div>
          <button onClick={load} disabled={loading} className="inline-flex items-center gap-1 text-xs px-3 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-40"><RefreshCcw className="h-4 w-4"/>Làm mới</button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20"><div className="animate-spin h-10 w-10 border-4 border-emerald-300 border-t-transparent rounded-full" /></div>
      )}
      {error && !loading && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}
      {!loading && !error && filtered.length === 0 && <div className="p-6 rounded-xl bg-white border border-slate-100 text-sm text-slate-500">Không tìm thấy tutor phù hợp.</div>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(t => (
          <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col">
            <div className="flex items-start gap-4">
              {t.avatar ? (
                <img src={t.avatar} alt={t.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-emerald-100" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center text-emerald-600 font-semibold text-xl">
                  {t.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 truncate">{t.name}</h3>
                <p className="text-xs text-slate-500 truncate">{t.subjects?.join(', ') || 'Chưa cập nhật môn'}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                    <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
                    <span className="font-medium">
                      {reviewStats[t.id]?.avg ?? t.rating}
                    </span>
                    <span className="text-[10px] text-slate-400">({reviewStats[t.id]?.count ?? 0})</span>
                  </div>
                  <span className="text-[11px] text-slate-400">{t.price_per_hour ? t.price_per_hour + 'k/h' : 'Miễn phí?'}</span>
                </div>
              </div>
            </div>
            {t.bio && <p className="mt-3 text-xs text-slate-600 line-clamp-3">{t.bio}</p>}
            <div className="mt-4 flex gap-2">
              <button className="flex-1 text-center text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl font-medium">Kết nối</button>
              <button className="text-xs px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700">Chi tiết</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
