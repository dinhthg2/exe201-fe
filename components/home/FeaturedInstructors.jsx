import Image from 'next/image';

const tutors = [
  { id: 1, name: 'Huỳnh Ngọc Thanh', title: 'Digital Marketing', avatar: '/uploads/tutor-1.png' },
  { id: 2, name: 'Hanah Pham', title: 'UI/UX Design', avatar: '/uploads/tutor-2.jpg' },
  { id: 3, name: 'Trần Trung Anh', title: 'Programmer', avatar: '/uploads/tutor-3.jpg' },
  { id: 4, name: 'Tuấn Dino', title: 'Life skill', avatar: '/uploads/tutor-4.jpg' },
  { id: 5, name: 'Nguyễn Văn La', title: 'Business', avatar: '/uploads/tutor-5.png' },
  { id: 6, name: 'Lê Lâm Phúc', title: 'Data Science', avatar: '/uploads/tutor-6.jpg' },
];

export default function FeaturedInstructors() {
  return (
    <section className="max-w-6xl mx-auto px-5 mt-20">
      <h2 className="text-3xl md:text-4xl font-bold heading-primary mb-10 text-center md:text-left">
        GIẢNG VIÊN TIÊU BIỂU
      </h2>

      <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent">
        {tutors.map((tutor) => (
          <div
            key={tutor.id}
            className="flex-shrink-0 w-64 rounded-xl bg-white shadow-sm border border-gray-100 p-5 text-center transition-all duration-300 hover:shadow-md hover:-translate-y-1 group"
          >
            <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 border-4 border-primary-light group-hover:border-primary transition-colors duration-300">
              <Image
                src={tutor.avatar}
                alt={tutor.name}
                layout="fill"
                objectFit="cover"
              />
            </div>
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors duration-300">{tutor.name}</h3>
            <p className="text-sm text-gray-600">{tutor.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
