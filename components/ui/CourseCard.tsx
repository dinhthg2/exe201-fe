'use client';

import Image from 'next/image';

interface CourseCardProps {
  id: string;
  name: string;
  thumbnail: string;
  progress: number;
  lastAccessed: string;
  onClick?: () => void;
}

export default function CourseCard({
  id,
  name,
  thumbnail,
  progress,
  lastAccessed,
  onClick
}: CourseCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.location.href = `/dashboard/courses/${id}`;
    }
  };

  return (
    <div
      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={handleClick}
    >
      <Image
        src={thumbnail}
        alt={name}
        width={48}
        height={48}
        className="w-12 h-12 rounded-lg object-cover"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{name}</p>
        <div className="flex items-center mt-1">
          <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-500 min-w-0">{progress}%</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{lastAccessed}</p>
      </div>
    </div>
  );
}