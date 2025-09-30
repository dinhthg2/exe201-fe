"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Featured courses — show only the 8 courses you requested, with images from /uploads
const fallbackCourses = [
  { id: 'CSD201', code: 'CSD201', title: 'Data Structures & Algorithms', level: 'Core', lessons: 12, color: 'from-[#bde0fe] to-[#9be7ff]', group: 'core', image: '/uploads/CSD201.jfif' },
  { id: 'DBI202', code: 'DBI202', title: 'Database Systems', level: 'Core', lessons: 12, color: 'from-[#a5d8ff] to-[#74c0fc]', group: 'core', image: '/uploads/DBI202.jfif' },
  { id: 'HCM202', code: 'HCM202', title: 'Human Computer Interaction', level: 'Core', lessons: 12, color: 'from-[#e6fcf5] to-[#63e6be]', group: 'core', image: '/uploads/HCM202.jfif' },
  { id: 'LAB211', code: 'LAB211', title: 'OOP Lab Java', level: 'Core', lessons: 12, color: 'from-[#ffd6e0] to-[#faa2c1]', group: 'core', image: '/uploads/LAB211.jfif' },
  { id: 'PRF192', code: 'PRF192', title: 'Programming Fundamentals', level: 'Core', lessons: 12, color: 'from-[#ffeaa7] to-[#ffd460]', group: 'core', image: '/uploads/PRF192.jfif' },
  { id: 'PRJ301', code: 'PRJ301', title: 'Web Application Development', level: 'Core', lessons: 12, color: 'from-[#ffd8a8] to-[#ffa94d]', group: 'core', image: '/uploads/PRJ301.jpg' },
  { id: 'PRO192', code: 'PRO192', title: 'Object-Oriented Programming', level: 'Core', lessons: 12, color: 'from-[#d7d7ff] to-[#9775fa]', group: 'core', image: '/uploads/PRO192.jpg' },
  { id: 'SWP391', code: 'SWP391', title: 'Software Project', level: 'Core', lessons: 12, color: 'from-[#ffd8a8] to-[#ffa94d]', group: 'core', image: '/uploads/SWP391.jfif' },
];

export default function FeaturedCourses(){
  const [courses,setCourses] = useState(fallbackCourses);
  const [loading,setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const perPage = 8;

  useEffect(()=>{
    // Intentionally do not fetch courses from API - use the predefined list above.
    // This ensures only the 8 provided courses are shown and demo data is removed.
    setLoading(false);
    return;
  },[]);

  // No tabs/search: show the provided courses list directly
  const filtered = courses;

  return (
    <section className="surface-light max-w-6xl mx-auto px-5 mt-20">
      <div className="mb-10 text-center md:text-left flex items-center justify-between">
        <h2 className="text-3xl md:text-4xl font-bold heading-primary relative inline-block">
          KHÓA HỌC NỔI BẬT
          <span className="absolute left-0 -bottom-2 h-1 bg-yellow-500 w-24"></span>
        </h2>
        <Link href="/courses" className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 bg-primary text-white hover:bg-primary-dark transition-colors">
          Tất cả
        </Link>
      </div>

      <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 gap-6">
        {loading ? Array.from({length:8}).map((_,i)=>(<CourseCardSkeleton key={i} />)) : filtered.slice(0, visibleCount).map(c => (
          <CourseCard key={c.id} c={c} />
        ))}
      </div>

      {/* Remove the old "Xem thêm" / "Thu gọn" buttons */}
      {/*
      <div className="flex items-center justify-center mt-6">
        {visibleCount < filtered.length ? (
          <button onClick={()=>setVisibleCount(v => Math.min(filtered.length, v + perPage))} className="px-5 py-2 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors">Xem thêm</button>
        ) : (
          filtered.length > perPage && <button onClick={()=>setVisibleCount(perPage)} className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Thu gọn</button>
        )}
      </div>
      */}
    </section>
  );
}

function CourseCardSkeleton(){
  return (
    <div className="rounded-2xl p-5 h-56 bg-white/60 animate-pulse" />
  );
}

function CourseCard({ c }){
  // allow optional image and keep consistent min height
  return (
    <div className={`group relative rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 animate-fadeInUp`}>
      <div className="relative h-36 w-full overflow-hidden">
        <ResponsiveCourseImage code={c.code} explicit={c.image} title={c.title} />
        <div className="absolute top-2 right-2 flex gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide bg-white text-gray-700 px-2 py-1 rounded-full shadow-sm">{c.code}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wide bg-white text-gray-700 px-2 py-1 rounded-full shadow-sm">{c.level}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col justify-between min-h-[120px]">
        <h3 className="font-semibold text-base leading-snug line-clamp-3 mb-2 group-hover:text-primary transition-colors duration-300">{c.title}</h3>
        <div className="flex items-center justify-between text-[13px] font-medium mt-auto">
          <span className="text-gray-600">{c.lessons} bài</span>
          <Link href={`/courses/${c.id}`} className="px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors transform group-hover:scale-105">
            Vào học
          </Link>
        </div>
      </div>
    </div>
  );
}

// Try multiple local extensions for course thumbnails; fallback to picsum
function ResponsiveCourseImage({ code, explicit, title }){
  const candidates = [];
  if(explicit) candidates.push(explicit);
  // prefer images the user placed in public/uploads
  const name = encodeURIComponent(code);
  const uploadMap = {
    'CSD201': '/uploads/CSD201.jfif',
    'DBI202': '/uploads/DBI202.jfif',
    'HCM202': '/uploads/HCM202.jfif',
    'LAB211': '/uploads/LAB211.jfif',
    'PRF192': '/uploads/PRF192.jfif',
    'PRJ301': '/uploads/PRJ301.jpg',
    'PRO192': '/uploads/PRO192.jpg',
    'SWP391': '/uploads/SWP391.jfif',
  };
  if(uploadMap[code]) candidates.push(uploadMap[code]);

  // also try common extensions under /uploads/ and root as a secondary fallback
  ['jpg','jfif','png','webp','webp'].forEach(ext => candidates.push(`/uploads/${name}.${ext}`));
  ['jpg','jfif','png','webp'].forEach(ext => candidates.push(`/${name}.${ext}`));

  // final fallback is picsum with seeded name
  candidates.push(`https://picsum.photos/seed/${name}/800/450`);

  const [idx,setIdx] = useState(0);
  const src = candidates[idx];
  return (
    <img
      src={src}
      alt={title}
      className="w-full h-full object-cover"
      onError={(e)=>{ if(idx < candidates.length - 1) setIdx(i => i + 1); else e.currentTarget.onerror = null; }}
    />
  );
}
