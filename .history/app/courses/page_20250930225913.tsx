"use client";
import React, { useEffect, useState, useMemo } from 'react';
import api from '../../lib/api';

interface Course {
  id: number;
  title: string;
  subject?: string;
  price?: number;
  description?: string;
  lessons_count?: number;
  specialization?: string;
  semester?: number;
  course_code?: string;
}

const SPECIALIZATION_TABS = [
  { key:'SE', label:'SE', subjects:[] },
  { key:'AI', label:'AI', subjects:['Artificial Intelligence','Machine Learning'] },
  { key:'MKT', label:'MKT', subjects:[] },
  { key:'IB', label:'IB', subjects:[] },
  { key:'MC', label:'MC', subjects:[] }
];

const INSTRUCTORS: Record<string,string> = {
  'Programming Fundamentals':'Lecturer A',
  'Data Structures':'Lecturer B',
  'Algorithms':'Lecturer C',
  'Database Systems':'Lecturer D',
  'Operating Systems':'Lecturer E',
  'Computer Networks':'Lecturer F',
  'Web Development':'Lecturer G',
  'Mobile Development':'Lecturer H',
  'Software Engineering':'Lecturer I',
  'Artificial Intelligence':'Lecturer J',
  'Machine Learning':'Lecturer K',
  'Cloud Computing':'Lecturer L',
  'Cyber Security':'Lecturer M',
  'English Communication':'Lecturer N'
};

function mockLectures(id: number) {
  return 20 + (id * 7 % 120);
}

function computeBadges(course: Course, index: number) {
  const badges: string[] = [];
  if (index < 4) badges.push('NEW');
  if (course.price && course.price > 0) badges.push('HOT');
  if (/Toán|Math/i.test(course.title || course.subject || '')) badges.push('TopClass');
  if (/AI|Machine|Security|Cloud/i.test(course.title || course.subject || '')) badges.push('TopUni');
  return badges;
}

const SUBJECT_BG: Record<string, string> = {
  'Programming Fundamentals': 'from-sky-500 to-sky-700',
  'Data Structures': 'from-indigo-500 to-indigo-700',
  'Algorithms': 'from-violet-500 to-violet-700',
  'Database Systems': 'from-emerald-500 to-emerald-700',
  'Operating Systems': 'from-pink-500 to-pink-600',
  'Computer Networks': 'from-cyan-500 to-cyan-700',
  'Web Development': 'from-teal-500 to-teal-700',
  'Mobile Development': 'from-fuchsia-500 to-fuchsia-700',
  'Software Engineering': 'from-amber-600 to-orange-700',
  'Artificial Intelligence': 'from-purple-500 to-purple-700',
  'Machine Learning': 'from-violet-600 to-violet-800',
  'Cloud Computing': 'from-blue-500 to-blue-700',
  'Cyber Security': 'from-slate-600 to-slate-900',
  'English Communication': 'from-rose-500 to-rose-700'
};

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<'created' | 'title' | 'price'>('created');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [subject, setSubject] = useState<string>('Tất cả');
  const [track, setTrack] = useState<string>('all');
  const [semester, setSemester] = useState<number | 'all'>('all');
  const [curriculumCourses, setCurriculumCourses] = useState<Course[] | null>(null);
  const [curriculumGrouped, setCurriculumGrouped] = useState<Record<string, Course[]> | null>(null);
  const [curriculumCache, setCurriculumCache] = useState<Record<string, { grouped: Record<string, Course[]>; ts: number }>>({});
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');
  const [groupBySemester, setGroupBySemester] = useState(false);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [myEnrollments, setMyEnrollments] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        if (track !== 'all') {
          if (semester === 'all') {
            if (curriculumCache[track] && !search) {
              setCurriculumGrouped(curriculumCache[track].grouped);
              if (accordionOpen.size === 0) {
                const firstKeys = Object.keys(curriculumCache[track].grouped).slice(0, 2);
                setAccordionOpen(new Set(firstKeys));
              }
              setCourses([]); setCurriculumCourses(null); setTotal(0);
            } else {
              const cur = await api.get(`/courses/curriculum?specialization=${track}${search ? `&q=${encodeURIComponent(search)}` : ''}`);
              const grouped: Record<string, Course[]> = cur.data.semesters || {};
              setCurriculumGrouped(grouped);
              if (!search) {
                setCurriculumCache(prev => ({ ...prev, [track]: { grouped, ts: Date.now() } }));
              }
              const firstKeys = Object.keys(grouped).slice(0, 2);
              setAccordionOpen(new Set(firstKeys));
              setCourses([]); setCurriculumCourses(null); setTotal(0);
            }
            return;
          } else {
            if (curriculumCache[track]) {
              const group = curriculumCache[track].grouped;
              const semKey = String(semester);
              const list = group[semKey] || [];
              setCurriculumCourses(list); setCourses(list); setTotal(list.length);
              return;
            }
            const cur = await api.get(`/courses/curriculum?specialization=${track}&semester=${semester}${search ? `&q=${encodeURIComponent(search)}` : ''}`);
            const list: Course[] = cur.data.courses || [];
            setCurriculumCourses(list); setCourses(list); setTotal(list.length);
            return;
          }
        }
        setCurriculumGrouped(null); setCurriculumCourses(null);
        const params = new URLSearchParams({ page: String(page), size: String(pageSize), sort, order });
        if (search) params.append('q', search);
        const res = await api.get(`/courses?${params.toString()}`);
        const payload = res.data; setCourses(payload.data || []); setTotal(payload.total || 0);
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, pageSize, sort, order, track, semester, search]);

  useEffect(() => {
    (async () => {
      try {
        const rawUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        if (!rawUser) return;
        const user = JSON.parse(rawUser);
        if (!user?.id) return;
        const enr = await api.get(`/enrollments/student/${user.id}`);
        const ids = (enr.data || []).map((e: any) => e.course_id);
        setMyEnrollments(new Set<number>(ids));
      } catch (_e) {}
    })();
  }, []);

  async function enroll(courseId: number) {
    try {
      const rawUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const user = rawUser ? JSON.parse(rawUser) : null;
      if (!user?.id) { alert('Vui lòng đăng nhập'); return; }
      setEnrollingId(courseId);
      await api.post('/enrollment', { student_id: user.id, course_id: courseId });
      setMyEnrollments(prev => {
        const arr: number[] = Array.from(prev);
        if (!arr.includes(courseId)) arr.push(courseId);
        return new Set(arr);
      });
    } catch (e: any) {
      alert(e?.response?.data?.message || e.message);
    } finally {
      setEnrollingId(null);
    }
  }

  const filtered = useMemo(() => {
    const base = (track !== 'all' && semester !== 'all') ? (curriculumCourses || []) : courses;
    return base.filter(c => {
      const subj = c.subject || 'Khác';
      const matchSubject = subject === 'Tất cả' || subj === subject;
      const matchTrack = track === 'all' || c.specialization === track;
      const matchSemester = semester === 'all' || c.semester === semester;
      const s = search.toLowerCase();
      const matchSearch = !search || (c.title?.toLowerCase().includes(s) || (c.description || '').toLowerCase().includes(s) || (c.course_code || '').toLowerCase().includes(s));
      return matchSubject && matchTrack && matchSemester && matchSearch;
    });
  }, [courses, curriculumCourses, subject, search, track, semester]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Khóa học FPT University
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Khám phá các khóa học chất lượng cao từ lập trình cơ bản đến công nghệ tiên tiến
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm kiếm khóa học..."
                className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                🔍
              </div>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Specialization Filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🎯 Chuyên ngành</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setTrack('all'); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    track === 'all'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  Tất cả
                </button>
                {SPECIALIZATION_TABS.map(t => (
                  <button
                    key={t.key}
                    onClick={() => { setTrack(t.key); setSubject('Tất cả'); setPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      track === t.key
                        ? 'bg-emerald-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Semester Filter */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📅 Kỳ học</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setSemester('all'); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    semester === 'all'
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                  }`}
                >
                  Tất cả
                </button>
                {Array.from({ length: 9 }, (_, i) => i + 1).map(k => (
                  <button
                    key={k}
                    onClick={() => { setSemester(k); setPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      semester === k
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                    }`}
                  >
                    Kỳ {k}
                  </button>
                ))}
              </div>
            </div>

            {/* View Options */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">👁️ Hiển thị</h3>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Lưới
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    viewMode === 'compact'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Danh sách
                </button>
              </div>
            </div>

            {/* Sort and Additional Options */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">📊 Sắp xếp</h3>
                <select
                  value={`${sort}-${order}`}
                  onChange={e => {
                    const [newSort, newOrder] = e.target.value.split('-');
                    setSort(newSort as any);
                    setOrder(newOrder as any);
                    setPage(1);
                  }}
                  className="w-full text-xs bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-2 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="created-desc">Mới nhất</option>
                  <option value="created-asc">Cũ nhất</option>
                  <option value="title-asc">Tên A-Z</option>
                  <option value="title-desc">Tên Z-A</option>
                  <option value="price-asc">Giá thấp</option>
                  <option value="price-desc">Giá cao</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setGroupBySemester(g => !g)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    groupBySemester
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <span>{groupBySemester ? '☑️' : '☐'}</span>
                  Nhóm theo kỳ
                </button>
              </div>

              {track !== 'all' && semester === 'all' && curriculumGrouped && (
                <button
                  onClick={() => setShowRoadmap(true)}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium shadow-lg transition-all"
                >
                  🗺️ Xem lộ trình học
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary & Pagination */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Tìm thấy <span className="text-blue-600 dark:text-blue-400 font-bold">{filtered.length}</span> khóa học
                {search && <span className="text-gray-500"> cho "{search}"</span>}
              </div>
              {(subject !== 'Tất cả' || track !== 'all' || semester !== 'all' || search) && (
                <button
                  onClick={() => {
                    setSubject('Tất cả');
                    setTrack('all');
                    setSemester('all');
                    setSearch('');
                    setPage(1);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-all"
              >
                ← Trước
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        page === pageNum
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {Math.ceil(total / pageSize) > 5 && (
                  <span className="text-gray-400 px-2">...</span>
                )}
              </div>

              <button
                disabled={page * pageSize >= total}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:bg-gray-200 dark:hover:bg-gray-600 text-sm font-medium transition-all"
              >
                Sau →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
                <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">😔</div>
            <div className="text-lg font-semibold text-red-600 mb-2">Có lỗi xảy ra</div>
            <div className="text-gray-600 dark:text-gray-400">{error}</div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Không tìm thấy khóa học nào
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {search ? `Không có kết quả cho "${search}"` : 'Thử điều chỉnh bộ lọc để xem thêm khóa học'}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSubject('Tất cả');
                setTrack('all');
                setSemester('all');
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
            >
              Xem tất cả khóa học
            </button>
          </div>
        )}

        {/* Curriculum accordion (specialization only & semester=all) */}
        {track !== 'all' && semester === 'all' && curriculumGrouped && (
          <div className="space-y-4 mb-8">
            {Object.keys(curriculumGrouped).sort((a, b) => parseInt(a) - parseInt(b)).map(semKey => {
              const list = curriculumGrouped[semKey];
              const open = accordionOpen.has(semKey);
              return (
                <div key={semKey} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <button
                    onClick={() => setAccordionOpen(prev => {
                      const n = new Set(prev);
                      if (n.has(semKey)) n.delete(semKey);
                      else n.add(semKey);
                      return n;
                    })}
                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span className="font-semibold">Kỳ {semKey} <span className="ml-2 text-sm font-normal text-gray-500">{list.length} môn</span></span>
                    <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {open && (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {list.map(c => (
                        <div key={c.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                          <div className="flex-1">
                            <div className="font-medium">{c.course_code} – {c.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{c.description}</div>
                          </div>
                          <a
                            href={`/courses/${c.id}`}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all"
                          >
                            Chi tiết
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Standard listing / specific semester view */}
        {!(track !== 'all' && semester === 'all' && curriculumGrouped) && !groupBySemester && !loading && filtered.length > 0 && (
          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}>
            {filtered.map((c, i) => {
              const badges = computeBadges(c, i);
              const subj = c.subject || 'Khác';
              const enrolled = myEnrollments.has(c.id);
              return (
                <CourseCard key={c.id} course={c} badges={badges} subject={subj} enrolled={enrolled} enrolling={enrollingId === c.id} onEnroll={() => enroll(c.id)} viewMode={viewMode} />
              );
            })}
          </div>
        )}

        {/* Grouped by semester view */}
        {groupBySemester && !loading && filtered.length > 0 && (
          <div className="space-y-10">
            {Array.from(new Set(filtered.map(c => c.semester).filter(Boolean))).sort((a: any, b: any) => a - b).map(sem => (
              <div key={sem}>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">K{sem}</span>
                  Kỳ {sem}
                  <span className="text-sm font-normal text-gray-500">({filtered.filter(c => c.semester === sem).length} khóa học)</span>
                </h3>
                <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'space-y-4'}>
                  {filtered.filter(c => c.semester === sem).map((c, i) => {
                    const badges = computeBadges(c, i);
                    const subj = c.subject || 'Khác';
                    const enrolled = myEnrollments.has(c.id);
                    return <CourseCard key={c.id} course={c} badges={badges} subject={subj} enrolled={enrolled} enrolling={enrollingId === c.id} onEnroll={() => enroll(c.id)} viewMode={viewMode} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Roadmap Modal */}
        {showRoadmap && curriculumGrouped && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-6 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 relative my-8">
              <button
                onClick={() => setShowRoadmap(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ✕
              </button>
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                🗺️ Lộ trình chuyên ngành {track}
              </h2>
              <div className="space-y-10">
                {Object.keys(curriculumGrouped).sort((a, b) => parseInt(a) - parseInt(b)).map(semKey => {
                  const list = curriculumGrouped[semKey];
                  return (
                    <div key={semKey} className="relative">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          K{semKey}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Kỳ {semKey}</h3>
                          <p className="text-gray-600 dark:text-gray-400">{list.length} môn học</p>
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-16">
                        {list.map(c => (
                          <div key={c.id} className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-xs font-mono bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                                {c.course_code}
                              </span>
                              <a
                                href={`/courses/${c.id}`}
                                className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded group-hover:shadow-md transition-all"
                              >
                                Xem
                              </a>
                            </div>
                            <h4 className="font-medium text-sm mb-2 line-clamp-2 text-gray-900 dark:text-white">
                              {c.title}
                            </h4>
                            {c.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {c.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Connection line to next semester */}
                      {parseInt(semKey) < Math.max(...Object.keys(curriculumGrouped).map(k => parseInt(k))) && (
                        <div className="absolute left-6 top-20 w-0.5 h-16 bg-gradient-to-b from-blue-400 to-purple-400 opacity-30"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({ course, badges, subject, enrolled, enrolling, onEnroll, viewMode = 'grid' }: {
  course: Course;
  badges: string[];
  subject: string;
  enrolled: boolean;
  enrolling: boolean;
  onEnroll: () => void;
  viewMode?: 'grid' | 'compact';
}) {
  const instructor = INSTRUCTORS[subject] || 'Đang cập nhật';
  const lectures = course.lessons_count ?? mockLectures(course.id);
  const bg = SUBJECT_BG[subject] || 'from-slate-500 to-slate-700';

  if (viewMode === 'compact') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all group">
        <div className="flex gap-4">
          {/* Compact image */}
          <div className={`w-24 h-24 flex-shrink-0 rounded-lg bg-gradient-to-br ${bg} flex items-center justify-center text-white relative overflow-hidden`}>
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,white,transparent_60%)]" />
            <div className="relative text-center">
              <div className="text-xs font-bold">{subject}</div>
            </div>
            <div className="absolute top-1 left-1 flex flex-col gap-1">
              {badges.slice(0, 2).map(b => <Badge key={b} kind={b} />)}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{course.description || 'Chưa có mô tả.'}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {course.specialization && <span className="text-xs px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">{course.specialization}</span>}
                {course.semester && <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">K{course.semester}</span>}
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">📘 {lectures}</span>
                <span className="flex items-center gap-1">👨‍🏫 {instructor}</span>
                <span className="font-semibold text-emerald-600">{course.price ? course.price + '₫' : 'Miễn phí'}</span>
              </div>

              <div className="flex gap-2">
                {enrolled ? (
                  <a href={`/courses/${course.id}`} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-all">
                    Tiếp tục
                  </a>
                ) : (
                  <>
                    <button onClick={onEnroll} disabled={enrolling} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-all">
                      {enrolling ? 'Đang ghi danh...' : 'Ghi danh'}
                    </button>
                    <a href={`/courses/${course.id}`} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-all">
                      Chi tiết
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div className="group relative rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Hero section with gradient background */}
      <div className={`h-48 relative bg-gradient-to-br ${bg} text-white flex items-center justify-center p-6`}>
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,white,transparent_60%)]" />
        <div className="relative w-full flex flex-col gap-3 text-center">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 drop-shadow-sm">{course.title}</h3>
          <p className="text-sm uppercase tracking-wide font-medium text-white/90">{subject}</p>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {badges.map(b => <Badge key={b} kind={b} />)}
        </div>

        {/* Course metadata */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {course.specialization && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-black/30 backdrop-blur text-white border border-white/20">
              {course.specialization}
            </span>
          )}
          {course.semester && (
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-white/20 backdrop-blur text-white border border-white/20">
              Kỳ {course.semester}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3 flex-1">
          {course.description || 'Khóa học chất lượng cao với nội dung được thiết kế phù hợp với thị trường lao động hiện tại.'}
        </div>

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
          <span className="flex items-center gap-1.5">
            📚 <span className="font-medium">{lectures} bài</span>
          </span>
          <span className="flex items-center gap-1.5">
            👨‍🏫 <span className="font-medium">{instructor}</span>
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-emerald-600">
            {course.price ? `${course.price.toLocaleString()}₫` : 'Miễn phí'}
          </span>

          {enrolled ? (
            <a
              href={`/courses/${course.id}`}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Tiếp tục học
            </a>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={onEnroll}
                disabled={enrolling}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
              >
                {enrolling ? '...' : 'Ghi danh'}
              </button>
              <a
                href={`/courses/${course.id}`}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
              >
                Chi tiết
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ kind }: { kind: string }) {
  const styles: Record<string, string> = {
    'NEW': 'bg-emerald-500 shadow-emerald-200',
    'HOT': 'bg-red-500 shadow-red-200',
    'TopClass': 'bg-indigo-600 shadow-indigo-200',
    'TopUni': 'bg-orange-500 shadow-orange-200'
  };

  return (
    <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full text-white shadow-lg ${styles[kind] || 'bg-gray-500 shadow-gray-200'}`}>
      {kind}
    </span>
  );
}
