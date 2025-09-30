'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface MatchUser {
  id: number;
  name: string;
  avatar?: string;
  major: string;
  semester: number;
}

interface ModalMatchSuccessProps {
  matchUser: MatchUser;
  matchId: number;
  conversationId: string;
  onClose: () => void;
}

export default function ModalMatchSuccess({ matchUser, matchId, conversationId, onClose }: ModalMatchSuccessProps) {
  const router = useRouter();

  const handleStartChat = () => {
    router.push(`/dashboard/messages/${conversationId}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 max-w-sm mx-4 text-center shadow-xl">
        <div className="mb-4">
          {matchUser.avatar ? (
            <Image
              src={matchUser.avatar}
              alt={matchUser.name}
              width={96}
              height={96}
              className="w-24 h-24 rounded-full mx-auto object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto flex items-center justify-center">
              <span className="text-gray-600 text-2xl">
                {matchUser.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          🎉 Match thành công!
        </h2>
        
        <div className="mb-4">
          <div className="font-semibold text-lg text-gray-800">{matchUser.name}</div>
          <div className="text-gray-600 text-sm">
            {matchUser.major} - Kỳ {matchUser.semester}
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-6">
          Bạn và {matchUser.name} đã thích nhau! Bắt đầu cuộc trò chuyện ngay bây giờ.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={handleStartChat}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            💬 Nhắn tin ngay
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  );
}