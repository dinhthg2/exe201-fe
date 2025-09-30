"use client";
import Link from 'next/link';

export default function PromoShowcase(){
  return (
    <section className="surface-light max-w-6xl mx-auto px-5">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold heading-primary">Học nhanh hơn, thực hành hiệu quả với StudyMate</h2>
          <p className="text-lg text-gray-700">Nền tảng học tập tập trung vào kỹ năng thực hành, lộ trình rõ ràng và tutor chất lượng. Tham gia hôm nay để tiếp cận kho học liệu, bài tập, và dự án thực tế giúp bạn sẵn sàng cho công việc.</p>

          <ul className="grid grid-cols-2 gap-3 mt-4">
            <li className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="h-10 w-10 rounded-md bg-gradient-to-br from-sky-500 to-emerald-400 text-white flex items-center justify-center font-bold">1</div>
              <div>
                <div className="font-semibold">Lộ trình theo nghề nghiệp</div>
                <div className="text-sm text-gray-500">Chuẩn hoá học phần theo vị trí mong muốn.</div>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="h-10 w-10 rounded-md bg-gradient-to-br from-rose-500 to-orange-400 text-white flex items-center justify-center font-bold">2</div>
              <div>
                <div className="font-semibold">Dự án thực tế</div>
                <div className="text-sm text-gray-500">Tích luỹ portfolio qua các bài tập và project.</div>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="h-10 w-10 rounded-md bg-gradient-to-br from-indigo-500 to-pink-500 text-white flex items-center justify-center font-bold">3</div>
              <div>
                <div className="font-semibold">Tutor hướng dẫn</div>
                <div className="text-sm text-gray-500">Học cùng tutor thực chiến, review code và project.</div>
              </div>
            </li>
            <li className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
              <div className="h-10 w-10 rounded-md bg-gradient-to-br from-emerald-400 to-sky-500 text-white flex items-center justify-center font-bold">4</div>
              <div>
                <div className="font-semibold">Theo dõi tiến độ</div>
                <div className="text-sm text-gray-500">Dashboard chi tiết giúp bạn không lệch hướng.</div>
              </div>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-sky-50 to-white h-64 flex items-center justify-center">
            {/* Animated banner placeholder - replace with real animated image or Lottie */}
            <div className="absolute inset-0 bg-[url('/uploads/banner1.png')] bg-cover bg-center opacity-90 animate-zoomSlow"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg overflow-hidden h-28 bg-cover bg-center" style={{backgroundImage:"url('/uploads/banner2.jpg')"}}></div>
            <div className="rounded-lg overflow-hidden h-28 bg-cover bg-center" style={{backgroundImage:"url('/uploads/banner3.jpg')"}}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-zoomSlow{ animation: zoomSlow 12s linear infinite; }
        @keyframes zoomSlow{ 0%{ transform: scale(1); } 50%{ transform: scale(1.03); } 100%{ transform: scale(1); } }
      `}</style>
    </section>
  );
}
