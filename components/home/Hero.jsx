"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Hero(){
  const [currentSlide, setCurrentSlide] = useState(0);
  const captions = ['Học tập nhóm hiệu quả', 'Môi trường học tập chuyên nghiệp', 'Hướng dẫn tận tình'];
  return (
  <section className="relative rounded-b-[48px] overflow-hidden -mt-4 bg-white dark:bg-slate-950">
      {/* <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] bg-[length:200px_200px] opacity-30 pointer-events-none" /> */}
  <div className="relative z-10 max-w-6xl mx-auto px-5 pt-14 pb-24 grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight heading-primary">
            Nền tảng học tập <span className="text-accent">chủ động</span> & kết nối
          </h1>
          <p className="text-gray-700 dark:text-slate-300 text-base md:text-lg max-w-xl">Ghép đôi bạn học, kết nối gia sư và theo dõi tiến độ realtime.</p>
          <div className="flex gap-3">
            <Link href="/register" className="px-6 py-3 rounded-full bg-accent hover:bg-accent-dark text-white font-semibold shadow">Bắt đầu ngay</Link>
            <Link href="/courses" className="px-6 py-3 rounded-full bg-white border border-border text-primary hover:bg-gray-50 font-medium shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-primary">Xem khóa học</Link>
          </div>
          <ul className="flex gap-6 text-[12px] text-gray-600 dark:text-slate-400 pt-2">
            <li className="flex items-center gap-1">⚡ Học nhanh</li>
            <li className="flex items-center gap-1">🤝 Kết nối thật</li>
            <li className="flex items-center gap-1">📈 Theo dõi rõ</li>
          </ul>
        </div>
  <div className="surface-light relative w-full aspect-[4/3] rounded-3xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow flex items-center justify-center overflow-hidden">
    <AdSlider onChange={setCurrentSlide} />
          <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-gradient-to-br from-orange-200 to-yellow-300 blur-2xl opacity-60 animate-floaty" />
          <div className="absolute -bottom-8 -right-4 h-40 w-40 rounded-full bg-gradient-to-br from-sky-200 to-sky-400 blur-2xl opacity-50 animate-floaty [animation-delay:2s]" />
        </div>
        {/* Caption displayed under slider */}
  <div className="-mt-4 text-center md:col-start-2 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {captions[currentSlide]}
        </div>
      </div>
      {/* Promotional Banners */}
      <div className="bg-sky-200 text-white py-1 md:py-2 mt-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          {/* Giảng viên uy tín */}
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg transition-all duration-300 hover:bg-sky-100 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.523-.375l-.011-1.085a2.25 2.25 0 0 1 .91-2.147l.952-.693C19.982 14.07 21 12.388 21 10.5c0-2.208-.577-4.34-1.976-6.192a.75.75 0 0 0-1.04-.265l-1.023.479c-.198.093-.381.18-.567.261a.75.75 0 0 0-.85-.102l-.178-.08a7.516 7.516 0 0 0-2.15-1.428.75.75 0 0 0-.722.072L9.15 4.348A6.471 6.471 0 0 0 7.5 3 6 6 0 0 0 3 9.75c0 1.295.386 2.536 1.056 3.639a6.293 6.293 0 0 0 1.954 1.714l-.001.001c-.161.075-.327.155-.494.234a.75.75 0 0 0-.83.089L2.3 17.581a.75.75 0 0 0-.012.871C3.126 19.462 5.093 21 7.5 21c1.472 0 2.916-.518 4.09-1.576a.75.75 0 0 0 .108-.858c-.015-.028-.03-.056-.046-.084a6.626 6.626 0 0 0 1.905-.718l.192-.092Z" />
            </svg>
            <p className="font-bold text-base md:text-lg">GIẢNG VIÊN UY TÍN</p>
            <p className="text-xs md:text-sm">Bài học chất lượng</p>
          </div>
          {/* Thanh toán 1 lần */}
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg transition-all duration-300 hover:bg-sky-100 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-infinity w-8 h-8 md:w-10 md:h-10 text-white">
              <path d="M12 12c-2-2.5-4-6-6-6-.6.5-1 1.2-1 2 0 1 .7 1.9 2 2.7 1.6 1 3.5 1.5 5 1.3 2.5-.3 5.4-1.7 7-3.4.6-.6 1-1.4 1-2.3 0-1-.7-1.9-2-2.7C18 4.5 16.5 4 15 4c-3 0-6 2-9 6-2 2-3.3 4.3-3 6 0 1.3 1 2 2 2 1.4 0 2.5-.7 3.5-1.3 1.5-.9 2.5-2.4 2.5-4.3 0-1.8-.7-3.3-2-4.3-1.6-.9-3.5-1.3-5-1-.6.5-1 1.2-1 2 0 1 .7 1.9 2 2.7 1.6 1 3.5 1.5 5 1.3 2.5-.3 5.4-1.7 7-3.4.6-.6 1-1.4 1-2.3 0-1-.7-1.9-2-2.7C18 4.5 16.5 4 15 4c-3 0-6 2-9 6-2 2-3.3 4.3-3 6 0 1.3 1 2 2 2 1.4 0 2.5-.7 3.5-1.3 1.5-.9 2.5-2.4 2.5-4.3 0-1.8-.7-3.3-2-4.3Z" />
            </svg>
            <p className="font-bold text-base md:text-lg">THANH TOÁN 1 LẦN</p>
            <p className="text-xs md:text-sm">Học mãi mãi</p>
          </div>
          {/* Học trực tuyến */}
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg transition-all duration-300 hover:bg-sky-100 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-laptop-2 w-8 h-8 md:w-10 md:h-10 text-white">
              <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" /><path d="M2 14h20" />
            </svg>
            <p className="font-bold text-base md:text-lg">HỌC TRỰC TUYẾN</p>
            <p className="text-xs md:text-sm">Hỗ trợ trực tuyến</p>
          </div>
          {/* Cam kết chất lượng */}
          <div className="flex flex-col items-center space-y-2 p-4 rounded-lg transition-all duration-300 hover:bg-sky-100 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-award w-8 h-8 md:w-10 md:h-10 text-white">
              <circle cx="12" cy="8" r="6" /><path d="M15.477 12.89L21 15l-3.35-6.636" /><path d="M8.523 12.89 3 15l3.35-6.636" /><path d="M12 19v4" />
            </svg>
            <p className="font-bold text-base md:text-lg">CAM KẾT CHẤT LƯỢNG</p>
            <p className="text-xs md:text-sm">Chứng chỉ giáo dục</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdSlider({ onChange }){
  // slides with images and title overlays
  const slides = [
    { id: 1, image: '/uploads/tutorial-hero-1.webp', title: 'Học tập nhóm hiệu quả' },
    { id: 2, image: '/uploads/tutorial-hero-2.jpg', title: 'Môi trường học tập chuyên nghiệp' },
    { id: 3, image: '/uploads/tutorial-hero-3.jpg', title: 'Hướng dẫn tận tình' }
  ];
  const [index,setIndex] = useState(0);
  useEffect(()=>{
    const t = setInterval(()=>{
      setIndex(i=>{
        const next = (i+1)%slides.length;
        onChange?.(next);
        return next;
      });
    }, 3500);
    return ()=>clearInterval(t);
  },[onChange]);
  return (
    <div className="absolute inset-0">
      {slides.map((s,i) => (
        <div key={s.id} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-800 ${i === index ? 'opacity-100 z-10' : 'opacity-0'}`} style={{ backgroundImage: `url('${s.image}')` }}>
          <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2">
            {slides.map((_,di) => (
              <button key={di} onClick={() => { setIndex(di); onChange?.(di); }} className={`h-2 w-2 rounded-full bg-gray-300 transition-all duration-300 ${di === index ? '!w-6 bg-primary' : ''}`}></button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
