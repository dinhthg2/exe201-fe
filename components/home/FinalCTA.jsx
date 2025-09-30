"use client";
import Link from 'next/link';

export default function FinalCTA(){
  return (
    <section className="max-w-5xl mx-auto px-5">
      <div className="rounded-3xl bg-gradient-to-r from-[#ffeaa7] via-[#ffd666] to-[#ffcd38] p-12 text-center shadow-lg border border-yellow-300">
  <h2 className="text-3xl font-bold mb-4 heading-primary">Bạn là sinh viên hoặc gia sư có nhu cầu truyền tải kiến thức?</h2>
        <p className="text-sky-900/80 mb-8 max-w-2xl mx-auto text-sm md:text-base">Tham gia StudyMate để nhận lộ trình cá nhân, kết nối bạn học & gia sư, theo dõi tiến bộ rõ ràng mỗi ngày.</p>
        <div className="flex gap-4 justify-center">
            <Link href="/register" className="px-8 py-3 rounded-full bg-white text-sky-900 font-semibold hover:bg-yellow-50 shadow">Đăng ký miễn phí</Link>
            <Link href="/login" className="px-8 py-3 rounded-full bg-[#b8facd] text-white font-semibold shadow hover:bg-[#064461] dark:bg-sky-900 dark:hover:bg-sky-800 focus:outline-none focus:ring-2 focus:ring-sky-300">Đăng nhập</Link>
        </div>
      </div>
    </section>
  );
}
