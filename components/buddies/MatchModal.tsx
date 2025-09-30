"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function MatchModal({ open, data, onClose }: { open: boolean; data: any; onClose: ()=>void }) {
  const router = useRouter();
  React.useEffect(()=>{
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  },[open,onClose]);

  if (!open || !data) return null;
  const { buddy, conversationId } = data;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-xl transform transition-all duration-300 scale-100">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="flex items-center gap-3">
            {buddy.avatar ? (
              <div className="relative h-28 w-28 rounded-full overflow-hidden">
                <Image src={buddy.avatar} alt={buddy.name} fill sizes="112px" className="object-cover" />
              </div>
            ) : (
              <div className="h-28 w-28 rounded-full bg-gray-100 flex items-center justify-center">?</div>
            )}
            <div className="text-center md:text-left">
              <div className="text-2xl font-semibold">🎉 Bạn và {buddy.name} đã match!</div>
              <div className="text-sm text-gray-500 mt-1">{buddy.specialization} • Kỳ {buddy.semester}</div>
            </div>
          </div>

          <div className="mt-4 md:mt-0 md:ml-auto flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border rounded-full">Tiếp tục tìm bạn</button>
            <button onClick={() => router.push(`/dashboard/messages/${conversationId}`)} className="px-4 py-2 bg-blue-600 text-white rounded-full">Nhắn tin ngay</button>
          </div>
        </div>
      </div>
    </div>
  );
}
