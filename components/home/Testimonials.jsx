
"use client";

import Link from "next/link";
import Image from 'next/image';
import { Star, CheckCircle2 } from 'lucide-react';

const testimonials = [
  { name: 'Nguyễn Thị Lan', text: 'Với giao diện thân thiện, tôi có thể dễ dàng tìm kiếm và tham gia các khóa học chất lượng. Đây là nơi tuyệt vời để nâng cao kiến thức của mình.', rating: 5, avatar: '/uploads/student-1.png' },
  { name: 'Trần Văn Trung', text: 'Studymate đã giúp tôi tiếp cận các khoá học từ các giảng viên hàng đầu. Kiến thức mới đã giúp tôi phát triển sự nghiệp của mình.', rating: 5, avatar: '/uploads/student-2.jpg' },
  { name: 'Phạm Thị Thuỷ', text: 'Tôi rất hài lòng với chất lượng bài giảng và sự hỗ trợ tận tình từ đội ngũ giáo viên. Studymate thực sự là một nền tảng học tập xuất sắc.', rating: 5, avatar: '/uploads/student-3.jpg' },
];

export default function Testimonials(){
  return (
    <section className="max-w-6xl mx-auto px-5 mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Section: About Studymate */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold heading-primary mb-5">
            REVIEW VỀ STUDYMATE
          </h2>
          <p className="text-gray-700 text-lg mb-6">
            Studymate không chỉ là một linh vực đầu tư tiềm năng mà còn là một cổng thông tin lớn, nơi có tất cả các tiện ích từ thiết kế đến chất lượng tới cả mọi người.
          </p>
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-gray-700 font-medium">Cộng đồng hỗ trợ mạnh mẽ giúp bạn tìm được bạn học đồng hành</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-gray-700 font-medium">Chương trình đào tạo chất lượng cao từ giảng viên uy tín</p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <p className="text-gray-700 font-medium">An toàn và bảo mật thông tin học viên</p>
            </div>
          </div>
          <Link href="#" className="px-6 py-3 rounded-full bg-primary text-white font-semibold shadow hover:bg-primary-dark transition-colors">
            Xem tất cả
          </Link>
        </div>

        {/* Right Section: Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map(t => (
            <div key={t.name} className="rounded-2xl p-6 bg-white border border-gray-200 shadow flex flex-col gap-4 text-sm hover:shadow-md transition-shadow animate-fadeInUp">
              <div className="flex items-center gap-2 mb-2">
                {Array.from({ length: t.rating }).map((_, i) => (
    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                ))}
              </div>
              <p className="leading-relaxed text-gray-700">“{t.text}”</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image src={t.avatar} alt={t.name} layout="fill" objectFit="cover" />
                </div>
                <span className="text-[13px] font-medium text-primary">{t.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
