"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function PromoBanner(){
  const deadline = new Date(Date.now() + 1000*60*60*24*5); // 5 days
  const [remain,setRemain] = useState(calc(deadline));
  useEffect(()=>{ const t = setInterval(()=> setRemain(calc(deadline)), 1000); return ()=>clearInterval(t); },[]);
  return (
    <div className="max-w-6xl mx-auto px-5 -mt-12" id="promo-banner">
  <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 shadow-lg
       bg-[linear-gradient(110deg,#c9f3d2_0%,#f5e993_48%,#ffffff_92%)]
       dark:bg-gradient-to-r dark:from-emerald-700 dark:via-emerald-600 dark:to-amber-500
       text-slate-800 dark:text-slate-100">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_25%_30%,#ffffff_0%,transparent_55%)] dark:opacity-20" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight">Ưu đãi kỳ Fall</h2>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-200 max-w-xl">Giảm <b>30%</b> cho 200 học viên mới & tặng mentoring 1-1 tuần đầu.</p>
            <ul className="text-[12px] md:text-[13px] space-y-1 text-emerald-800 dark:text-emerald-200 font-medium">
              <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-300">✔</span><span>Tư vấn lộ trình 1-1</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-300">✔</span><span>Truy cập tài liệu độc quyền</span></li>
              <li className="flex items-start gap-2"><span className="text-emerald-600 dark:text-emerald-300">✔</span><span>Ghép đôi bạn học tức thì</span></li>
            </ul>
            <div className="pt-2 flex gap-4 flex-wrap items-center">
              <Link href="/register" className="px-6 py-2 rounded-full bg-white text-emerald-700 font-semibold text-sm shadow-sm hover:bg-emerald-50 dark:text-emerald-900">Nhận ưu đãi</Link>
              <Link href="/courses" className="px-6 py-2 rounded-full border border-emerald-300/70 bg-white/40 backdrop-blur text-sm font-medium hover:bg-white/70 dark:border-amber-200/50 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50">Danh sách khóa học</Link>
              <div className="text-xs font-mono bg-emerald-900/10 dark:bg-emerald-900/40 text-slate-700 dark:text-amber-100 px-3 py-2 rounded-md tracking-wider">{remain.d}d {remain.h}h {remain.m}m {remain.s}s</div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-3 gap-3 text-center text-[11px]">
            {[
              {label:'Slots còn lại', value:'57'},
              {label:'Giảm tối đa', value:'30%'},
              {label:'Ngày còn', value: remain.d.toString()},
            ].map(b => (
              <div key={b.label} className="rounded-xl bg-white/70 dark:bg-emerald-900/40 backdrop-blur-sm border border-emerald-200/60 dark:border-emerald-700/60 p-4 flex flex-col gap-1 text-slate-800 dark:text-slate-100">
                <span className="text-lg md:text-xl font-bold">{b.value}</span>
                <span className="uppercase tracking-wide text-[10px] font-medium">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function calc(deadline){
  const diff = Math.max(0, deadline.getTime() - Date.now());
  const d = Math.floor(diff/86400000);
  const h = Math.floor(diff/3600000)%24;
  const m = Math.floor(diff/60000)%60;
  const s = Math.floor(diff/1000)%60;
  return {d,h,m,m2:m,s};
}
