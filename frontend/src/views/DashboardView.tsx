import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatsCards } from '../components/StatsCards';
import { LeadFilters } from '../components/LeadFilters';
import { LeadTable } from '../components/LeadTable';
import { PitchModal } from '../components/PitchModal';
import { BookmarkletModal } from '../components/bookmarklet/BookmarkletModal';
import { DashboardSidebar } from '../components/dashboard/DashboardSidebar';
import { DashboardTopNav } from '../components/dashboard/DashboardTopNav';
import { LeadEngineView } from './dashboard/LeadEngineView';
import { IntelligenceView } from './dashboard/IntelligenceView';
import { AiPitchHubView } from './dashboard/AiPitchHubView';
import { BillingView } from './dashboard/BillingView';
import { Lead, LeadStats, DashboardTab } from '../types';
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
import { Download, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  onNavigateLanding: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateLanding }) => {
  const { user } = useAuth();

  // Tab & Mobile Navigation
  const getInitialTab = (): DashboardTab => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('engine')) return 'engine';
      if (hash.includes('intelligence')) return 'intelligence';
      if (hash.includes('pitches')) return 'pitches';
      if (hash.includes('billing')) return 'billing';
    }
    return 'crm';
  };

  const [activeTab, setActiveTab] = useState<DashboardTab>(getInitialTab);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBookmarkletModalOpen, setIsBookmarkletModalOpen] = useState(false);

  // Sync hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('engine')) setActiveTab('engine');
      else if (hash.includes('intelligence')) setActiveTab('intelligence');
      else if (hash.includes('pitches')) setActiveTab('pitches');
      else if (hash.includes('billing')) setActiveTab('billing');
      else if (hash === '#crm' || hash === '#dashboard') setActiveTab('crm');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSelectTab = (tab: DashboardTab) => {
    setActiveTab(tab);
    if (tab === 'crm') {
      window.location.hash = 'crm';
    } else {
      window.location.hash = `crm/${tab}`;
    }
  };

  // Lead Data states
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

  // Sorting states
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

  // Reset page to 1 whenever filters change
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

  const exportToCSV = () => {
    if (!leads || leads.length === 0) return;
    const headers = ['Name', 'Category', 'Address', 'Phone', 'Website', 'Rating', 'Reviews', 'Opportunity Score', 'Status', 'Search Query'];
    const rows = leads.map((l) => [
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${(l.category || '').replace(/"/g, '""')}"`,
      `"${(l.address || '').replace(/"/g, '""')}"`,
      `"${(l.phone || '').replace(/"/g, '""')}"`,
      `"${(l.website || '').replace(/"/g, '""')}"`,
      l.rating || '',
      l.reviewCount || '',
      l.opportunityScore || 0,
      l.status || 'NEW',
      `"${(l.searchQuery || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leadfinder_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC] text-slate-900 font-sans antialiased flex flex-row">
      {/* 1. App Sidebar */}
      <DashboardSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        leadsCount={totalCount || leads.length}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Sticky Header */}
        <DashboardTopNav
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNavigateLanding={onNavigateLanding}
          onOpenBookmarklet={() => setIsBookmarkletModalOpen(true)}
          onRefresh={loadData}
          isRefreshing={loading}
          isBackendConnected={isBackendConnected}
        />

        {/* Dynamic Route Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'crm' && (
            <div className="space-y-6">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/90 rounded-2xl px-5 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-800">
                    Lead Database
                  </span>
                  <span className="text-[11px] font-mono font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {totalCount} Extracted
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportToCSV}
                    disabled={leads.length === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Download active results as CSV"
                  >
                    <Download size={13} />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => handleSelectTab('engine')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                  >
                    <Compass size={13} />
                    <span>Launch Scraper</span>
                  </button>
                </div>
              </div>

              {/* Stats Ribbon */}
              <StatsCards stats={stats} />

              {/* Filters */}
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

              {/* Table */}
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
            </div>
          )}

          {activeTab === 'engine' && (
            <LeadEngineView onNavigateCrm={() => handleSelectTab('crm')} />
          )}

          {activeTab === 'intelligence' && (
            <IntelligenceView
              leads={leads}
              stats={stats}
              onOpenPitch={(lead) => setSelectedLeadForPitch(lead)}
            />
          )}

          {activeTab === 'pitches' && <AiPitchHubView />}

          {activeTab === 'billing' && (
            <BillingView leadsCount={totalCount || leads.length} />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {selectedLeadForPitch && (
        <PitchModal
          lead={selectedLeadForPitch}
          onClose={() => setSelectedLeadForPitch(null)}
          onSendSmsPitch={handleSendSmsPitch}
        />
      )}

      <BookmarkletModal
        isOpen={isBookmarkletModalOpen}
        onClose={() => setIsBookmarkletModalOpen(false)}
      />
    </div>
  );
};
