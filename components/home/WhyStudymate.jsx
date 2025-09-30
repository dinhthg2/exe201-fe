import Image from 'next/image';
import { Award, BookOpen, Users, LayoutDashboard } from 'lucide-react'; // Updated icons

export default function WhyStudymate() {
  return (
    <section className="max-w-6xl mx-auto px-5 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl md:text-4xl font-bold heading-primary">
            Học nhanh hơn, thực hành hiệu quả với Studymate
          </h2>
          <p className="text-gray-700 text-lg">
            Nền tảng học tập tập trung vào kỹ năng thực hành, lộ trình rõ ràng và chất lượng cao. Tham gia hôm nay để tiếp cận kho học liệu, bài tập, và dự án thực tế giúp bạn sẵn sàng cho công việc.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-800">Lộ trình theo nghề nghiệp</p>
                <p className="text-sm text-gray-600">Chuẩn hoá học phần theo vị trí mong muốn.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-800">Dự án thực tế</p>
                <p className="text-sm text-gray-600">Tích lũy portfolio qua các bài tập và dự án.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-800">Tutor hướng dẫn</p>
                <p className="text-sm text-gray-600">Học cùng tutor chuyên, review code và project.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <LayoutDashboard className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <p className="font-bold text-gray-800">Theo dõi tiến độ</p>
                <p className="text-sm text-gray-600">Dashboard chi tiết giúp bạn không lệch hướng.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="relative w-full h-96 rounded-xl overflow-hidden shadow-lg animate-fadeInUp" style={{animationDelay:'.1s'}}>
          <Image
            src="/uploads/why-studymate.jpg" // Replace with actual image
            alt="Học nhanh hơn, thực hành hiệu quả với Studymate"
            layout="fill"
            objectFit="cover"
            className="rounded-xl"
          />
        </div>
      </div>
    </section>
  );
}
