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
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[260px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by business name, category, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-lg text-xs text-gray-900 placeholder-gray-400 outline-none transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 px-1"
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
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            noWebsiteOnly
              ? 'bg-amber-50 text-amber-800 border-amber-200 font-semibold'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Globe size={13} className={noWebsiteOnly ? 'text-amber-600' : 'text-gray-400'} />
          <span>No website</span>
        </button>

        {/* Low Rating Toggle */}
        <button
          onClick={() => setLowRatingOnly(!lowRatingOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            lowRatingOnly
              ? 'bg-rose-50 text-rose-800 border-rose-200 font-semibold'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Star size={13} className={lowRatingOnly ? 'text-rose-600' : 'text-gray-400'} />
          <span>Low rating (&lt;4.0)</span>
        </button>

        {/* High Score Toggle */}
        <button
          onClick={() => setHighScoreOnly(!highScoreOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            highScoreOnly
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Flame size={13} className={highScoreOnly ? 'text-emerald-600' : 'text-gray-400'} />
          <span>High priority (≥60)</span>
        </button>

        {/* CRM Status Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-200 text-gray-800 text-xs font-medium rounded-lg px-3 py-1.5 pr-8 outline-none focus:border-blue-500 cursor-pointer transition-colors"
          >
            <option value="">Status: All</option>
            <option value="NEW">Status: New</option>
            <option value="CONTACTED">Status: Contacted</option>
            <option value="IN_PROGRESS">Status: In progress</option>
            <option value="CLOSED">Status: Closed</option>
          </select>
          <Filter size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Reset Filters */}
        {isAnyFilterActive && (
          <button
            onClick={handleResetFilters}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-200 transition-colors"
            title="Reset filters"
          >
            <RotateCcw size={12} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
};
