import React from 'react';
import { Search, Globe, Star, Flame, Filter, RotateCcw } from 'lucide-react';

interface LeadFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  noWebsiteOnly: boolean;
  setNoWebsiteOnly: (val: boolean) => void;
  lowRatingOnly: boolean;
  setLowRatingOnly: (val: boolean) => void;
  highScoreOnly: boolean;
  setHighScoreOnly: (val: boolean) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  search,
  setSearch,
  noWebsiteOnly,
  setNoWebsiteOnly,
  lowRatingOnly,
  setLowRatingOnly,
  highScoreOnly,
  setHighScoreOnly,
  selectedStatus,
  setSelectedStatus,
}) => {
  const isAnyFilterActive = search || noWebsiteOnly || lowRatingOnly || highScoreOnly || selectedStatus;

  const handleResetFilters = () => {
    setSearch('');
    setNoWebsiteOnly(false);
    setLowRatingOnly(false);
    setHighScoreOnly(false);
    setSelectedStatus('');
  };

  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[260px]">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by business name, category, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-white/10 focus:border-blue-500/80 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Filter Buttons & Status Select */}
      <div className="flex flex-wrap items-center gap-2">
        {/* No Website Toggle */}
        <button
          onClick={() => setNoWebsiteOnly(!noWebsiteOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
            noWebsiteOnly
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20'
              : 'bg-slate-800/60 text-slate-400 border-white/10 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Globe size={14} className={noWebsiteOnly ? 'text-amber-400' : 'text-slate-400'} />
          <span>No Website ⭐</span>
        </button>

        {/* Low Rating Toggle */}
        <button
          onClick={() => setLowRatingOnly(!lowRatingOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
            lowRatingOnly
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/20'
              : 'bg-slate-800/60 text-slate-400 border-white/10 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Star size={14} className={lowRatingOnly ? 'text-rose-400' : 'text-slate-400'} />
          <span>Low Rating (&lt;4.0)</span>
        </button>

        {/* High Score Toggle */}
        <button
          onClick={() => setHighScoreOnly(!highScoreOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition-all ${
            highScoreOnly
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm shadow-emerald-500/20'
              : 'bg-slate-800/60 text-slate-400 border-white/10 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Flame size={14} className={highScoreOnly ? 'text-emerald-400' : 'text-slate-400'} />
          <span>High Score (≥60)</span>
        </button>

        {/* CRM Status Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none bg-slate-950/80 border border-white/10 text-slate-200 text-xs font-semibold rounded-xl px-3 py-2 pr-8 outline-none focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">Status: ALL</option>
            <option value="NEW">Status: NEW</option>
            <option value="CONTACTED">Status: CONTACTED</option>
            <option value="IN_PROGRESS">Status: IN PROGRESS</option>
            <option value="CLOSED">Status: CLOSED</option>
          </select>
          <Filter size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>

        {/* Reset Filters */}
        {isAnyFilterActive && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-all"
            title="Reset Filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
