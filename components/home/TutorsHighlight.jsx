
"use client";
import Image from 'next/image';
import { useRef } from 'react';

const tutors = [
  { id:1, name:'Nguyễn Minh Quân', dept:'Software Engineering', code:'PRO192', avatar:'/logo.svg', rating:4.9, tags:['Java','OOP','Clean Code'], desc:'Tập trung khả năng phân tích & thiết kế hướng đối tượng.' },
  { id:2, name:'Trần Thị Hạnh', dept:'Database', code:'DBI202', avatar:'/logo.svg', rating:4.8, tags:['SQL','Index','ERD'], desc:'Chia nhỏ tối ưu truy vấn, giải thích execution plan.' },
  { id:3, name:'Phạm Tuấn Kiệt', dept:'Algorithms', code:'DSA', avatar:'/logo.svg', rating:5.0, tags:['DSA','Recursion','Graph'], desc:'Minh họa trực quan cấu trúc dữ liệu khó bằng ví dụ.' },
  { id:4, name:'Lê Hoàng Anh', dept:'Web Development', code:'PRJ301', avatar:'/logo.svg', rating:4.7, tags:['Servlet','MVC','Deploy'], desc:'Gắn thực hành dự án nhỏ mỗi tuần.' },
  { id:5, name:'Vũ Thị Mai', dept:'Operating Systems', code:'OSG202', avatar:'/logo.svg', rating:4.85, tags:['Process','Thread','Memory'], desc:'Giải OS bằng mô hình & demo nhỏ.' },
  { id:6, name:'Đỗ Quốc Hưng', dept:'Project Management', code:'SWP391', avatar:'/logo.svg', rating:4.92, tags:['SCRUM','Team','Delivery'], desc:'Nhấn mạnh planning & retrospective hiệu quả.' },
];

export default function TutorsHighlight(){
  const scroller = useRef(null);
  const scroll = (dir)=>{ if(!scroller.current) return; scroller.current.scrollBy({left: dir*320, behavior:'smooth'}); };
  return (
    <section className="surface-light max-w-6xl mx-auto px-5">
      <div className="flex items-center justify-between mb-6">
  <h2 className="text-2xl font-bold heading-primary">Giảng viên / Tutor tiêu biểu</h2>
        <div className="flex gap-2">
          <button onClick={()=>scroll(-1)} className="h-8 w-8 rounded-full border flex items-center justify-center text-primary bg-white hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 dark:text-primary">‹</button>
          <button onClick={()=>scroll(1)} className="h-8 w-8 rounded-full border flex items-center justify-center text-primary bg-white hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700 dark:text-primary">›</button>
        </div>
      </div>
      <div ref={scroller} className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent">
        {tutors.map(t => (
          <div key={t.id} className="snap-start shrink-0 w-72 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 p-5 shadow-lg flex flex-col gap-3 relative group hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center overflow-hidden ring-2 ring-white/70 dark:ring-slate-700 shadow">
                <Image src={t.avatar} alt={t.name} width={48} height={48} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate" title={t.name}>{t.name}</div>
                <div className="text-[10px] uppercase tracking-wide text-primary font-medium">{t.dept}</div>
              </div>
              <div className="text-[11px] font-semibold bg-accent-light px-2 py-1 rounded-full text-accent-dark">★ {t.rating}</div>
            </div>
            <p className="text-[12px] leading-relaxed text-gray-600 dark:text-slate-400 line-clamp-3 group-hover:line-clamp-none transition-all">{t.desc}</p>
            <div className="flex flex-wrap gap-1">
              {t.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-1 rounded-full bg-secondary-light dark:bg-slate-700/50 border border-secondary text-secondary-dark dark:text-secondary-light">{tag}</span>)}
            </div>
            <div className="flex justify-between items-center pt-1">
              <button className="text-[11px] px-3 py-1 rounded-full bg-primary-light text-primary-dark font-medium hover:bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary">Chi tiết</button>
              <button className="text-[11px] px-3 py-1 rounded-full bg-accent text-white hover:bg-accent-dark transition-colors">Book</button>
            </div>
            <div className="absolute left-0 bottom-0 h-1 bg-gradient-to-r from-accent to-accent-dark" style={{width: `${(t.rating/5)*100}%`}}></div>
          </div>
        ))}
      </div>
    </section>
  );
}
