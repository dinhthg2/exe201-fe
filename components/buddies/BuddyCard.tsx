"use client";
import React from 'react';
import Image from 'next/image';

export default function BuddyCard({ buddy }: { buddy: any }) {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl shadow-2xl p-5 w-[90vw] max-w-md sm:w-80 sm:max-w-sm">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0 relative">
          {buddy.avatar ? (
            <Image src={buddy.avatar} alt={buddy.name} fill sizes="80px" className="object-cover rounded-full" />
          ) : (
            <div className="text-gray-400 text-2xl">?</div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-lg leading-tight">{buddy.name}</div>
            {buddy.is_online && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Online</span>}
          </div>
          <div className="text-sm text-gray-500 mt-1">{buddy.specialization} • Kỳ {buddy.semester}</div>
          <div className="text-xs text-gray-400 mt-2">Mã môn: {buddy.course_code || 'N/A'}</div>
        </div>
      </div>

      {buddy.bio && (
        <p className="text-sm text-gray-600 mt-4 line-clamp-3">{buddy.bio}</p>
      )}

      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <div className="px-2 py-1 bg-slate-100 rounded-full">{(buddy.common_courses || 0)} chung</div>
        <div className="px-2 py-1 bg-slate-100 rounded-full">Kinh nghiệm: {buddy.experience || '---'}</div>
      </div>
    </div>
  );
}
