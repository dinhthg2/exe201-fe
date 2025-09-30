import React from 'react';

interface HeroSectionProps {
  title: string;
  subtitle: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  quickFilters: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  stats: {
    courses: number;
    students: string;
    rating: string;
    support: string;
  };
}

export default function HeroSection({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  quickFilters,
  activeFilter,
  onFilterChange,
  stats
}: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white mb-12">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <span className="inline-block text-sm font-semibold tracking-wider bg-white/20 px-4 py-2 rounded-full backdrop-blur">
              🎓 KHÓA HỌC FPT UNIVERSITY 2025
            </span>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              {title}
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Quick Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input 
                value={searchValue} 
                onChange={e => onSearchChange(e.target.value)} 
                placeholder="Tìm kiếm khóa học, chuyên ngành, kỹ năng..." 
                className="w-full text-lg px-6 py-4 pl-12 rounded-2xl bg-white/90 backdrop-blur text-slate-700 placeholder-slate-500 focus:outline-none focus:ring-4 focus:ring-white/40 shadow-xl"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                🔍
              </div>
              {searchValue && (
                <button 
                  onClick={() => onSearchChange('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {quickFilters.map(filter => (
              <button 
                key={filter} 
                onClick={() => onFilterChange(filter)} 
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter 
                    ? 'bg-white text-blue-600 shadow-lg' 
                    : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.courses}+</div>
              <div className="text-sm opacity-80">Khóa học</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.students}</div>
              <div className="text-sm opacity-80">Học viên</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.rating}</div>
              <div className="text-sm opacity-80">⭐ Đánh giá</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{stats.support}</div>
              <div className="text-sm opacity-80">Hỗ trợ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
