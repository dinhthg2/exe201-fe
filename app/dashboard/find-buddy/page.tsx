'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import ModalMatchSuccess from '../../../components/buddies/ModalMatchSuccess';
import { useRouter } from 'next/navigation';

// Định nghĩa các chuyên ngành
const majors = [
  { value: 'SE', label: 'Kỹ thuật phần mềm' },
  { value: 'GD', label: 'Thiết kế đồ hoạ' },
  { value: 'AI', label: 'Trí tuệ nhân tạo' },
  { value: 'MKT', label: 'Marketing số' },
  { value: 'MC', label: 'Truyền thông đa phương tiện' }
];

interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  major: string;
  semester: number;
  bio?: string;
  matchPercent: number;
}

interface Subject {
  code: string;
  name: string;
}

interface MatchModalState {
  open: boolean;
  user?: User;
  matchId?: number;
  conversationId?: string;
}

export default function FindBuddyPage() {
  const [semester, setSemester] = useState('');
  const [major, setMajor] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [results, setResults] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchModal, setMatchModal] = useState<MatchModalState>({ open: false });
  const [isFallback, setIsFallback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cardHistory, setCardHistory] = useState<number[]>([]);
  const router = useRouter();

  // Lấy API base URL (avoid duplicate /api if NEXT_PUBLIC_API_BASE already includes it)
  const getApiUrl = (endpoint: string) => {
    const raw = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
    const base = raw.replace(/\/$/, ''); // remove trailing slash
    if (base.endsWith('/api')) {
      // base already contains /api
      return `${base}/find-buddy${endpoint}`;
    }
    return `${base}/api/find-buddy${endpoint}`;
  };

  // Lấy danh sách môn học khi chọn chuyên ngành và kỳ
  useEffect(() => {
    const fetchSubjects = async () => {
      if (major && semester) {
        try {
          const token = localStorage.getItem('token');
          const url = getApiUrl(`/subjects?major=${major}&semester=${semester}`);
          console.debug('Fetching subjects URL:', url);
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.debug('Subjects fetch status:', response.status);
          const data = await response.json();
          console.debug('Subjects fetch data:', data);
          if (data && data.success) {
            setSubjects(data.subjects || []);
          } else {
            setSubjects([]);
          }
        } catch (error) {
          console.error('Error fetching subjects:', error);
          setSubjects([]);
        }
        setSubjectCode('');
      } else {
        setSubjects([]);
        setSubjectCode('');
      }
    };

    fetchSubjects();
  }, [major, semester]);

  // Tìm kiếm bạn học
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semester || !major || !subjectCode) {
      alert('Vui lòng chọn đầy đủ thông tin tìm kiếm');
      return;
    }

    setIsLoading(true);
    setResults([]);
    setCurrentIndex(0);
    setIsFallback(false);
    setCardHistory([]);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/search'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ semester: parseInt(semester), major, subjectCode })
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.users || []);
        setIsFallback(data.fallback || false);
      } else {
        alert('Lỗi tìm kiếm: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Lỗi kết nối server');
    } finally {
      setIsLoading(false);
    }
  };

  // Like user
  const handleLike = async () => {
    if (currentIndex >= results.length) return;
    
    const user = results[currentIndex];
    setCardHistory(prev => [...prev, currentIndex]);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/like'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: user.id })
      });

      const data = await response.json();
      if (data.success && data.match) {
        setMatchModal({
          open: true,
          user: data.user,
          matchId: data.matchId,
          conversationId: data.conversationId
        });
      }
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Like error:', error);
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Pass user
  const handlePass = async () => {
    if (currentIndex >= results.length) return;
    
    const user = results[currentIndex];
    setCardHistory(prev => [...prev, currentIndex]);
    
    try {
      const token = localStorage.getItem('token');
      await fetch(getApiUrl('/pass'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ targetUserId: user.id })
      });
    } catch (error) {
      console.error('Pass error:', error);
    }
    
    setCurrentIndex(prev => prev + 1);
  };

  // Undo action
  const handleUndo = () => {
    if (cardHistory.length > 0) {
      const lastIndex = cardHistory[cardHistory.length - 1];
      setCardHistory(prev => prev.slice(0, -1));
      setCurrentIndex(lastIndex);
    }
  };

  // Current user để hiển thị
  const currentUser = results[currentIndex];
  const hasResults = results.length > 0;
  const isFinished = currentIndex >= results.length;

  return (
    <div className="bg-gray-50">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          🔍 Tìm bạn học
        </h1>

        {/* Form tìm kiếm */}
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kỳ học
              </label>
              <select 
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={semester} 
                onChange={e => setSemester(e.target.value)}
              >
                <option value="">Chọn kỳ học</option>
                {[...Array(9)].map((_, i) => (
                  <option key={i+1} value={i+1}>Kỳ {i+1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chuyên ngành
              </label>
              <select 
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={major} 
                onChange={e => setMajor(e.target.value)}
              >
                <option value="">Chọn chuyên ngành</option>
                {majors.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Môn học
              </label>
              <select 
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={subjectCode} 
                onChange={e => setSubjectCode(e.target.value)}
                disabled={!subjects.length}
              >
                <option value="">
                  {subjects.length ? 'Chọn môn học' : 'Chọn chuyên ngành và kỳ trước'}
                </option>
                {subjects.map(s => {
                  const codeOrName = s.code || s.name;
                  const label = s.code ? `${s.code} - ${s.name}` : s.name;
                  return (
                    <option key={codeOrName} value={codeOrName}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <button 
              type="submit"
              disabled={isLoading || !semester || !major || !subjectCode}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang tìm kiếm...' : '🔍 Tìm kiếm'}
            </button>
          </div>
        </form>

        {/* Hiển thị kết quả */}
        {hasResults && !isFinished && currentUser && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            {isFallback && (
              <div className="bg-yellow-50 border-b border-yellow-200 p-3 text-center">
                <p className="text-sm text-yellow-800">
                  💡 Không tìm thấy kết quả chính xác. Đây là gợi ý phù hợp:
                </p>
              </div>
            )}

            {/* User Card */}
            <div className="p-6 text-center">
              {/* Avatar */}
              <div className="mb-4">
                {currentUser.avatar ? (
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mx-auto flex items-center justify-center border-4 border-gray-200">
                    <span className="text-white text-3xl font-bold">
                      {currentUser.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>

              {/* User Info */}
              <h2 className="text-xl font-bold text-gray-800 mb-2">
                {currentUser.name}
              </h2>
              
              <div className="space-y-1 mb-4">
                <p className="text-gray-600">
                  📚 {majors.find(m => m.value === currentUser.major)?.label || currentUser.major}
                </p>
                <p className="text-gray-600">🎓 Kỳ {currentUser.semester}</p>
                <p className="text-gray-600">📖 {subjectCode}</p>
              </div>

              {currentUser.bio && (
                <p className="text-gray-700 text-sm mb-4 italic">
                  “{currentUser.bio}”
                </p>
              )}

              {/* Match Percentage */}
              <div className="mb-6">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  currentUser.matchPercent === 100 
                    ? 'bg-green-100 text-green-800' 
                    : currentUser.matchPercent >= 70
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  ⭐ {currentUser.matchPercent}% phù hợp
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handlePass}
                  className="w-16 h-16 bg-gray-200 hover:bg-red-200 rounded-full flex items-center justify-center text-2xl transition-colors shadow-lg"
                  title="Pass"
                >
                  ❌
                </button>
                
                {cardHistory.length > 0 && (
                  <button
                    onClick={handleUndo}
                    className="w-16 h-16 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center text-2xl transition-colors shadow-lg"
                    title="Undo"
                  >
                    ↩️
                  </button>
                )}
                
                <button
                  onClick={handleLike}
                  className="w-16 h-16 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-2xl transition-colors shadow-lg"
                  title="Like"
                >
                  ❤️
                </button>
              </div>

              {/* Progress */}
              <div className="mt-6 text-xs text-gray-500">
                {currentIndex + 1} / {results.length}
              </div>
            </div>
          </div>
        )}

        {/* No more cards */}
        {hasResults && isFinished && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Hết rồi!
            </h2>
            <p className="text-gray-600 mb-4">
              Bạn đã xem hết tất cả kết quả. Thử tìm kiếm với tiêu chí khác?
            </p>
            <button
              onClick={() => {
                setResults([]);
                setCurrentIndex(0);
                setCardHistory([]);
                setSemester('');
                setMajor('');
                setSubjectCode('');
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Tìm kiếm mới
            </button>
          </div>
        )}

        {/* No results */}
        {!isLoading && !hasResults && semester && major && subjectCode && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Không tìm thấy ai
            </h2>
            <p className="text-gray-600">
              Thử thay đổi tiêu chí tìm kiếm hoặc quay lại sau.
            </p>
          </div>
        )}

        {/* Match Success Modal */}
        {matchModal.open && matchModal.user && matchModal.matchId && matchModal.conversationId && (
          <ModalMatchSuccess
            matchUser={matchModal.user}
            matchId={matchModal.matchId}
            conversationId={matchModal.conversationId}
            onClose={() => setMatchModal({ open: false })}
          />
        )}
      </div>
    </div>
  );
}