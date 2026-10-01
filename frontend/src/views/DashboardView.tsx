import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../components/Header';
import { StatsCards } from '../components/StatsCards';
import { LeadFilters } from '../components/LeadFilters';
import { LeadTable } from '../components/LeadTable';
import { PitchModal } from '../components/PitchModal';
import { Lead, LeadStats } from '../types';
import {
  getLeads,
  getLeadStats,
  updateLeadStatus,
  deleteLead,
  deleteLeads,
  findEmailForLead,
  sendSmsPitchForLead,
  batchSendSmsPitches,
} from '../api/graphqlClient';
import { ArrowLeft, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  onNavigateLanding: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateLanding }) => {
  const { user, logout, openProfileModal } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<LeadStats>({
    totalLeads: 0,
    noWebsiteCount: 0,
    lowRatingCount: 0,
    lowReviewsCount: 0,
    avgOpportunityScore: 0,
    highPriorityLeadsCount: 0,
  });

  // Filter states
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [noWebsiteOnly, setNoWebsiteOnly] = useState<boolean>(false);
  const [lowRatingOnly, setLowRatingOnly] = useState<boolean>(false);
  const [lowReviewsOnly, setLowReviewsOnly] = useState<boolean>(false);
  const [highScoreOnly, setHighScoreOnly] = useState<boolean>(false);
  const [hasPhone, setHasPhone] = useState<boolean | null>(null);
  const [hasEmail, setHasEmail] = useState<boolean | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  // Sorting states (defaults to Newest First)
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Pagination states
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(15);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  const [selectedLeadForPitch, setSelectedLeadForPitch] = useState<Lead | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // Debounce search input
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  // Reset page to 1 whenever filters or sorting change
  const prevFiltersRef = useRef<string>('');
  useEffect(() => {
    const filtersKey = `${debouncedSearch}|${category}|${noWebsiteOnly}|${lowRatingOnly}|${lowReviewsOnly}|${highScoreOnly}|${hasPhone}|${hasEmail}|${selectedStatus}|${sortBy}|${sortOrder}`;
    if (prevFiltersRef.current !== '' && prevFiltersRef.current !== filtersKey) {
      setPage(1);
    }
    prevFiltersRef.current = filtersKey;
  }, [
    debouncedSearch,
    category,
    noWebsiteOnly,
    lowRatingOnly,
    lowReviewsOnly,
    highScoreOnly,
    hasPhone,
    hasEmail,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filter: Record<string, any> = {};
      if (debouncedSearch) filter.search = debouncedSearch;
      if (category) filter.category = category;
      if (noWebsiteOnly) filter.noWebsiteOnly = true;
      if (lowRatingOnly) filter.lowRatingOnly = true;
      if (lowReviewsOnly) filter.lowReviewsOnly = true;
      if (selectedStatus) filter.status = selectedStatus;
      if (highScoreOnly) filter.minOpportunityScore = 60;
      if (hasPhone !== null) filter.hasPhone = hasPhone;
      if (hasEmail !== null) filter.hasEmail = hasEmail;

      const pagination = {
        page,
        limit,
        sortBy,
        sortOrder,
      };

      const [leadsRes, statsRes] = await Promise.all([
        getLeads(filter, pagination),
        getLeadStats(),
      ]);

      setLeads(leadsRes.items);
      setTotalCount(leadsRes.totalCount);
      setTotalPages(leadsRes.totalPages);
      setStats(statsRes);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend load error:', err);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    category,
    noWebsiteOnly,
    lowRatingOnly,
    lowReviewsOnly,
    highScoreOnly,
    hasPhone,
    hasEmail,
    selectedStatus,
    sortBy,
    sortOrder,
    page,
    limit,
  ]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSortColumn = (columnName: string) => {
    if (sortBy === columnName) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(columnName);
      setSortOrder(columnName === 'name' ? 'ASC' : 'DESC');
    }
    setPage(1);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateLeadStatus(id, newStatus);
      loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteLead(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete lead:', err);
      alert('Error deleting lead. Please try again.');
    }
  };

  const handleBatchDeleteLeads = async (ids: string[]) => {
    try {
      await deleteLeads(ids);
      loadData();
    } catch (err) {
      console.error('Failed to batch delete leads:', err);
      alert('Error deleting selected leads. Please try again.');
    }
  };

  const handleFindEmail = async (id: string) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;

    try {
      let extensionRes: any = null;
      if (
        typeof window !== 'undefined' &&
        (window as any).chrome &&
        (window as any).chrome.runtime &&
        (window as any).chrome.runtime.sendMessage
      ) {
        try {
          extensionRes = await new Promise((resolve) => {
            (window as any).chrome.runtime.sendMessage(
              { action: 'SEARCH_LEAD_EMAIL', leadId: lead.id, name: lead.name, address: lead.address },
              (response: any) => resolve(response)
            );
          });
        } catch (e) {
          console.warn('Chrome extension messaging fallback:', e);
        }
      }

      if (extensionRes && extensionRes.success && extensionRes.email) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === id ? { ...l, email: extensionRes.email, emailSource: extensionRes.emailSource } : l
          )
        );
        return;
      }

      const updated = await findEmailForLead(id);
      if (updated.email) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, email: updated.email, emailSource: updated.emailSource } : l))
        );
      } else {
        alert('No public email found for this lead in web search.');
      }
    } catch (err) {
      console.error('Failed to find email:', err);
      alert('Error searching for email. Please try again.');
    }
  };

  const handleSendSmsPitch = async (id: string) => {
    try {
      await sendSmsPitchForLead(id);
      loadData();
    } catch (err: any) {
      console.error('Failed to send SMS pitch:', err);
      alert(`Failed to send SMS pitch: ${err.message || err}`);
    }
  };

  const handleBatchSendSmsPitches = async (leadIds: string[]) => {
    try {
      const res = await batchSendSmsPitches(leadIds);
      alert(`Successfully dispatched SMS pitches to ${res.updatedCount} leads.`);
      loadData();
    } catch (err: any) {
      console.error('Failed batch SMS pitch:', err);
      alert(`Batch SMS dispatch error: ${err.message || err}`);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#F7F8FA] text-gray-900 font-sans antialiased p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Navigation Breadcrumb / Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateLanding}
              className="inline-flex items-center gap-2 text-xs font-medium text-gray-600 hover:text-gray-950 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to overview</span>
            </button>

            <div className="hidden sm:inline-flex items-center gap-2 text-xs text-gray-400">
              <span>|</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span className="text-gray-500 font-medium">CRM workspace · Live sync</span>
            </div>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={openProfileModal}
                className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200/80 transition-colors text-xs font-medium text-gray-700 cursor-pointer"
                title="Account Settings & API Key"
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                <span className="text-[10px] text-gray-400 font-normal">({user.role || 'user'})</span>
              </button>
            )}

            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-colors"
              title="Sign Out"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        <Header
          onRefresh={loadData}
          leads={leads}
          isBackendConnected={isBackendConnected}
        />

        <StatsCards stats={stats} />

        <LeadFilters
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          noWebsiteOnly={noWebsiteOnly}
          setNoWebsiteOnly={setNoWebsiteOnly}
          lowRatingOnly={lowRatingOnly}
          setLowRatingOnly={setLowRatingOnly}
          lowReviewsOnly={lowReviewsOnly}
          setLowReviewsOnly={setLowReviewsOnly}
          highScoreOnly={highScoreOnly}
          setHighScoreOnly={setHighScoreOnly}
          hasPhone={hasPhone}
          setHasPhone={setHasPhone}
          hasEmail={hasEmail}
          setHasEmail={setHasEmail}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        <LeadTable
          leads={leads}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          limit={limit}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortColumn={handleSortColumn}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          onOpenPitch={(lead) => setSelectedLeadForPitch(lead)}
          onUpdateStatus={handleUpdateStatus}
          onDeleteLead={handleDeleteLead}
          onBatchDeleteLeads={handleBatchDeleteLeads}
          onFindEmail={handleFindEmail}
          onSendSmsPitch={handleSendSmsPitch}
          onBatchSendSmsPitches={handleBatchSendSmsPitches}
        />

        {selectedLeadForPitch && (
          <PitchModal
            lead={selectedLeadForPitch}
            onClose={() => setSelectedLeadForPitch(null)}
            onSendSmsPitch={handleSendSmsPitch}
          />
        )}
      </div>
    </div>
  );
};
