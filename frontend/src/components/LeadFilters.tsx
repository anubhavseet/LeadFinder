import React from 'react';
import {
  Search,
  Globe,
  Star,
  Flame,
  Filter,
  RotateCcw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Phone,
  Mail,
  MessageSquare,
  Tag,
} from 'lucide-react';

interface LeadFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  noWebsiteOnly: boolean;
  setNoWebsiteOnly: (val: boolean) => void;
  lowRatingOnly: boolean;
  setLowRatingOnly: (val: boolean) => void;
  lowReviewsOnly: boolean;
  setLowReviewsOnly: (val: boolean) => void;
  highScoreOnly: boolean;
  setHighScoreOnly: (val: boolean) => void;
  hasPhone: boolean | null;
  setHasPhone: (val: boolean | null) => void;
  hasEmail: boolean | null;
  setHasEmail: (val: boolean | null) => void;
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
  sortOrder: 'ASC' | 'DESC';
  setSortOrder: (val: 'ASC' | 'DESC') => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  search,
  setSearch,
  category,
  setCategory,
  noWebsiteOnly,
  setNoWebsiteOnly,
  lowRatingOnly,
  setLowRatingOnly,
  lowReviewsOnly,
  setLowReviewsOnly,
  highScoreOnly,
  setHighScoreOnly,
  hasPhone,
  setHasPhone,
  hasEmail,
  setHasEmail,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  const activeFiltersCount = [
    Boolean(search),
    Boolean(category),
    noWebsiteOnly,
    lowRatingOnly,
    lowReviewsOnly,
    highScoreOnly,
    hasPhone !== null,
    hasEmail !== null,
    Boolean(selectedStatus),
  ].filter(Boolean).length;

  const isAnyFilterActive = activeFiltersCount > 0;

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setNoWebsiteOnly(false);
    setLowRatingOnly(false);
    setLowReviewsOnly(false);
    setHighScoreOnly(false);
    setHasPhone(null);
    setHasEmail(null);
    setSelectedStatus('');
  };

  const sortValue = `${sortBy}:${sortOrder}`;

  const handleSortChange = (combinedVal: string) => {
    const [newSortBy, newSortOrder] = combinedVal.split(':') as [string, 'ASC' | 'DESC'];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const toggleSortDirection = () => {
    setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Top Bar: Search Input & Sort Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
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
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Input Filter */}
        <div className="relative md:w-52">
          <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Filter category (e.g. Plumber)..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-8 pr-7 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-lg text-xs text-gray-900 placeholder-gray-400 outline-none transition-colors"
          />
          {category && (
            <button
              onClick={() => setCategory('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="relative">
            <select
              value={sortValue}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-gray-50 hover:bg-gray-100/80 border border-gray-200 text-gray-800 text-xs font-medium rounded-lg pl-8 pr-8 py-2 outline-none focus:border-blue-500 cursor-pointer transition-colors"
            >
              <option value="createdAt:DESC">📅 Date Added: Newest First</option>
              <option value="createdAt:ASC">📅 Date Added: Oldest First</option>
              <option value="opportunityScore:DESC">🎯 Opportunity Score: Highest First</option>
              <option value="opportunityScore:ASC">🎯 Opportunity Score: Lowest First</option>
              <option value="rating:DESC">⭐ Rating: Highest First</option>
              <option value="rating:ASC">⭐ Rating: Lowest First</option>
              <option value="reviewCount:DESC">💬 Reviews: Most First</option>
              <option value="reviewCount:ASC">💬 Reviews: Fewest First</option>
              <option value="name:ASC">🔤 Business Name: A → Z</option>
              <option value="name:DESC">🔤 Business Name: Z → A</option>
            </select>
            <ArrowUpDown size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            <Filter size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {/* Quick ASC/DESC flip button */}
          <button
            onClick={toggleSortDirection}
            className="p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
            title={`Sort ${sortOrder === 'ASC' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'ASC' ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
          </button>
        </div>
      </div>

      {/* Second Row: Filter Toggles & Status Select */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-1">
          Filters:
        </span>

        {/* No Website Toggle */}
        <button
          onClick={() => setNoWebsiteOnly(!noWebsiteOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            noWebsiteOnly
              ? 'bg-amber-50 text-amber-800 border-amber-300 font-semibold shadow-xs'
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
              ? 'bg-rose-50 text-rose-800 border-rose-300 font-semibold shadow-xs'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Star size={13} className={lowRatingOnly ? 'text-rose-600' : 'text-gray-400'} />
          <span>Low rating (&lt;4.0)</span>
        </button>

        {/* Few Reviews Toggle */}
        <button
          onClick={() => setLowReviewsOnly(!lowReviewsOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            lowReviewsOnly
              ? 'bg-purple-50 text-purple-800 border-purple-300 font-semibold shadow-xs'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <MessageSquare size={13} className={lowReviewsOnly ? 'text-purple-600' : 'text-gray-400'} />
          <span>Few reviews (&lt;15)</span>
        </button>

        {/* High Priority Toggle */}
        <button
          onClick={() => setHighScoreOnly(!highScoreOnly)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            highScoreOnly
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold shadow-xs'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Flame size={13} className={highScoreOnly ? 'text-emerald-600' : 'text-gray-400'} />
          <span>High priority (≥60)</span>
        </button>

        {/* Has Phone Toggle */}
        <button
          onClick={() => setHasPhone(hasPhone === true ? null : true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            hasPhone === true
              ? 'bg-blue-50 text-blue-800 border-blue-300 font-semibold shadow-xs'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Phone size={13} className={hasPhone === true ? 'text-blue-600' : 'text-gray-400'} />
          <span>Has phone</span>
        </button>

        {/* Has Email Toggle */}
        <button
          onClick={() => setHasEmail(hasEmail === true ? null : true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
            hasEmail === true
              ? 'bg-indigo-50 text-indigo-800 border-indigo-300 font-semibold shadow-xs'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Mail size={13} className={hasEmail === true ? 'text-indigo-600' : 'text-gray-400'} />
          <span>Has email</span>
        </button>

        {/* CRM Status Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className={`appearance-none text-xs font-medium rounded-lg px-3 py-1.5 pr-7 outline-none border transition-colors cursor-pointer ${
              selectedStatus
                ? 'bg-blue-50 text-blue-900 border-blue-300 font-semibold'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
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
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium rounded-lg border border-rose-200 transition-colors ml-auto"
            title="Reset all filters"
          >
            <RotateCcw size={12} />
            <span>Reset ({activeFiltersCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};
