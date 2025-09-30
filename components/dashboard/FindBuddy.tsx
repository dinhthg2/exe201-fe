'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Heart, X, User, BookOpen, Calendar, MapPin, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Friend {
  id: number;
  name: string;
  avatar?: string;
  specialization?: string;
  semester?: string;
  bio?: string;
  interests?: string[];
  course_code?: string;
}

interface FindBuddyProps {
  onMatch?: (friendId: number) => void;
}

const FindBuddy: React.FC<FindBuddyProps> = ({ onMatch }) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [matchedFriend, setMatchedFriend] = useState<Friend | null>(null);
  const [matchedConversationId, setMatchedConversationId] = useState<string | null>(null);
  const [showMatchPopup, setShowMatchPopup] = useState(false);
  const [filters, setFilters] = useState({
    semester: '',
    major: '',
    course_code: ''
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const fetchFriends = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const queryParams = new URLSearchParams();
      if (filters.semester) queryParams.append('semester', filters.semester);
      if (filters.major) queryParams.append('major', filters.major);
      if (filters.course_code) queryParams.append('course_code', filters.course_code);

      const response = await fetch(`/api/dashboard/find-friends?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch friends');
      }

      const result = await response.json();
      if (result.success) {
        setFriends(result.data);
        setCurrentIndex(0);
      } else {
        throw new Error(result.message || 'Failed to load friends');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [router, filters]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleMatch = async (friendId: number) => {
    try {
      setIsAnimating(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/dashboard/friends/match', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ friend_id: friendId }),
      });

      const result = await response.json();
      
      if (result.success) {
        const matchedFriendData = friends[currentIndex];
        setMatchedFriend(matchedFriendData);
        // store conversationId if backend returned one
        setMatchedConversationId(result.conversationId || null);
        setShowMatchPopup(true);

        // Call parent callback if provided
        onMatch?.(friendId);
        
        // Move to next friend after animation
        setTimeout(() => {
          setCurrentIndex(prev => prev + 1);
          setIsAnimating(false);
        }, 300);
        
        // Hide popup after 3 seconds
        setTimeout(() => {
          setShowMatchPopup(false);
          setMatchedFriend(null);
          setMatchedConversationId(null);
        }, 3000);
      } else {
        throw new Error(result.message || 'Match failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Match failed');
      setIsAnimating(false);
    }
  };

  const handleSkip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 200);
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchFriends();
  };

  const currentFriend = friends[currentIndex];

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6 mx-auto"></div>
            <div className="bg-gray-200 h-96 rounded-2xl mb-4"></div>
            <div className="flex justify-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 mb-4">Lỗi: {error}</p>
            <button
              onClick={handleRefresh}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentFriend || currentIndex >= friends.length) {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Hết bạn học rồi!
            </h3>
            <p className="text-gray-600 mb-6">
              Không tìm thấy thêm bạn học phù hợp. Hãy thử điều chỉnh bộ lọc hoặc quay lại sau.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleRefresh}
                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Làm mới danh sách
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Quay lại Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-6">
          Tìm bạn học
        </h1>

        {/* Friend Card */}
        <div 
          className={`bg-white rounded-2xl shadow-lg border overflow-hidden transition-transform duration-300 ${
            isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
          }`}
        >
          {/* Avatar */}
          <div className="relative h-64 bg-gradient-to-br from-blue-400 to-purple-500">
            {currentFriend.avatar ? (
              <Image
                src={currentFriend.avatar}
                alt={currentFriend.name}
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <User className="h-20 w-20 text-white" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <h2 className="text-2xl font-bold">{currentFriend.name}</h2>
            </div>
          </div>

          {/* Info */}
          <div className="p-6">
            <div className="space-y-3">
              {currentFriend.specialization && (
                <div className="flex items-center gap-2 text-gray-600">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">{currentFriend.specialization}</span>
                </div>
              )}
              
              {currentFriend.semester && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Kỳ {currentFriend.semester}</span>
                </div>
              )}

              {currentFriend.course_code && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{currentFriend.course_code}</span>
                </div>
              )}
            </div>

            {currentFriend.bio && (
              <p className="text-gray-700 mt-4 text-sm leading-relaxed">
                {currentFriend.bio}
              </p>
            )}

            {currentFriend.interests && currentFriend.interests.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-900 mb-2">Sở thích:</p>
                <div className="flex flex-wrap gap-2">
                  {currentFriend.interests.map((interest, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <button
            onClick={handleSkip}
            disabled={isAnimating}
            className="w-16 h-16 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <X className="h-8 w-8 text-red-600" />
          </button>
          <button
            onClick={() => handleMatch(currentFriend.id)}
            disabled={isAnimating}
            className="w-16 h-16 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <Heart className="h-8 w-8 text-green-600" />
          </button>
        </div>

        {/* Progress */}
        <div className="text-center mt-4 text-sm text-gray-500">
          {currentIndex + 1} / {friends.length}
        </div>
      </div>

      {/* Match Popup */}
      {showMatchPopup && matchedFriend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Tuyệt vời!
            </h3>
            <p className="text-gray-600">
              Bạn đã match với <span className="font-semibold text-blue-600">{matchedFriend.name}</span>
            </p>
            <div className="mt-4 space-y-2">
              {matchedConversationId && (
                <button
                  onClick={() => {
                    // navigate to conversation page
                    router.push(`/dashboard/messages/${matchedConversationId}`);
                  }}
                  className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  💬 Nhắn tin ngay
                </button>
              )}

              <button
                onClick={() => { setShowMatchPopup(false); setMatchedConversationId(null); }}
                className="w-full px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindBuddy;