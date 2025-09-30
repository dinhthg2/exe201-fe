import React from 'react';

interface FilterBarProps {
  subjects: string[];
  activeSubject: string;
  onSubjectChange: (subject: string) => void;
  tracks: Array<{ key: string; label: string }>;
  activeTrack: string;
  onTrackChange: (track: string) => void;
  semesters: number[];
  activeSemester: number | 'all';
  onSemesterChange: (semester: number | 'all') => void;
  sort: 'created' | 'title' | 'price';
  order: 'asc' | 'desc';
  onSortChange: (sort: 'created' | 'title' | 'price', order: 'asc' | 'desc') => void;
  viewMode: 'grid' | 'compact';
  onViewModeChange: (mode: 'grid' | 'compact') => void;
  groupBySemester: boolean;
  onGroupBySemesterChange: (grouped: boolean) => void;
  onShowRoadmap?: () => void;
}

export default function FilterBar({
  subjects,
  activeSubject,
  onSubjectChange,
  tracks,
  activeTrack,
  onTrackChange,
  semesters,
  activeSemester,
  onSemesterChange,
  sort,
  order,
  onSortChange,
  viewMode,
  onViewModeChange,
  groupBySemester,
  onGroupBySemesterChange,
  onShowRoadmap
}: FilterBarProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 mb-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left side - Subject filters */}
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📚 Môn học</h3>
              <div className="flex flex-wrap gap-2">
                {subjects.slice(0, 8).map(s => (
                  <button 
                    key={s} 
                    onClick={() => {
                      onSubjectChange(s);
                      onTrackChange('all');
                    }} 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeSubject === s 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
                {subjects.length > 8 && (
                  <button className="px-4 py-2 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600">
                    +{subjects.length - 8} khác
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">🎯 Chuyên ngành</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => onTrackChange('all')} 
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      activeTrack === 'all' 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                    }`}
                  >
                    Tất cả
                  </button>
                  {tracks.map(t => (
                    <button 
                      key={t.key} 
                      onClick={() => {
                        onTrackChange(t.key);
                        onSubjectChange('Tất cả');
                      }} 
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        activeTrack === t.key 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">📅 Kỳ học</h3>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => onSemesterChange('all')} 
                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                      activeSemester === 'all' 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                    }`}
                  >
                    Tất cả
                  </button>
                  {semesters.map(k => (
                    <button 
                      key={k} 
                      onClick={() => onSemesterChange(k)} 
                      className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                        activeSemester === k 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
                      }`}
                    >
                      Kỳ {k}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right side - View options */}
          <div className="lg:w-64 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">👁️ Hiển thị</span>
              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button 
                  onClick={() => onViewModeChange('grid')} 
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Lưới
                </button>
                <button 
                  onClick={() => onViewModeChange('compact')} 
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    viewMode === 'compact' 
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Danh sách
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">📊 Sắp xếp</span>
              <select 
                value={`${sort}-${order}`} 
                onChange={e => {
                  const [newSort, newOrder] = e.target.value.split('-');
                  onSortChange(newSort as any, newOrder as any);
                }} 
                className="text-xs bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
              >
                <option value="created-desc">Mới nhất</option>
                <option value="created-asc">Cũ nhất</option>
                <option value="title-asc">Tên A-Z</option>
                <option value="title-desc">Tên Z-A</option>
                <option value="price-asc">Giá thấp</option>
                <option value="price-desc">Giá cao</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => onGroupBySemesterChange(!groupBySemester)} 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium ${
                  groupBySemester 
                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                <span>{groupBySemester ? '☑️' : '☐'}</span>
                Nhóm theo kỳ
              </button>
            </div>

            {onShowRoadmap && (
              <button 
                onClick={onShowRoadmap} 
                className="w-full px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white rounded-lg text-sm font-medium shadow-lg transition-all"
              >
                🗺️ Xem lộ trình học
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
