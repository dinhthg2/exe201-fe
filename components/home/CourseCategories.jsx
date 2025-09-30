"use client";
import Link from 'next/link';

// Using Lucide React icons for a modern look, similar to the image
import {
  Languages,
  HardDrive,
  Home,
  Rocket,
  Megaphone,
  Camera,
  Lightbulb,
  Palette,
  Briefcase,
  Heart,
  ShoppingCart,
  MonitorDot
} from 'lucide-react';

const categories = [
  { name: 'Kỹ năng ngoại ngữ', icon: Languages, href: '#' },
  { name: 'Phát triển phần mềm', icon: HardDrive, href: '#' },
  { name: 'Khoa học dữ liệu', icon: Briefcase, href: '#' },
  { name: 'Trí tuệ nhân tạo', icon: Rocket, href: '#' },
  { name: 'Digital Marketing', icon: Megaphone, href: '#' },
  { name: 'Thiết kế đa phương tiện', icon: Camera, href: '#' },
  { name: 'Phát triển bản thân', icon: Lightbulb, href: '#' },
  { name: 'Quản lý dự án', icon: Briefcase, href: '#' },
  { name: 'Thương mại điện tử', icon: ShoppingCart, href: '#' },
  { name: 'Sức khỏe & lối sống', icon: Heart, href: '#' },
  { name: 'Thiết kế đồ họa', icon: Palette, href: '#' },
  { name: 'Tin học văn phòng', icon: MonitorDot, href: '#' },
];

export default function CourseCategories() {
  return (
    <section className="max-w-6xl mx-auto px-5 mt-20">
      <div className="mb-10 text-center md:text-left">
        <h2 className="text-3xl md:text-4xl font-bold heading-primary relative inline-block">
          DANH MỤC KHÓA HỌC
          <span className="absolute left-0 -bottom-2 h-1 bg-yellow-500 w-24"></span>
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <Link
            key={category.name}
            href={category.href}
            className={`flex items-center space-x-4 p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-300 group
              ${index % 4 === 0 ? 'bg-blue-50' : index % 4 === 1 ? 'bg-green-50' : index % 4 === 2 ? 'bg-yellow-50' : 'bg-purple-50'}
            `}
          >
            <category.icon className="w-8 h-8 text-gray-500 group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
            <span className="font-semibold text-gray-800 group-hover:text-primary transition-colors duration-300">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
