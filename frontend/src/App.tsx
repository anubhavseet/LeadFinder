import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { LeadFilters } from './components/LeadFilters';
import { LeadTable } from './components/LeadTable';
import { PitchModal } from './components/PitchModal';
import { Lead, LeadStats } from './types';
import { getLeads, getLeadStats, updateLeadStatus, deleteLead, findEmailForLead } from './api/graphqlClient';

export const App: React.FC = () => {
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
  const [noWebsiteOnly, setNoWebsiteOnly] = useState<boolean>(false);
  const [lowRatingOnly, setLowRatingOnly] = useState<boolean>(false);
  const [highScoreOnly, setHighScoreOnly] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

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

  // Reset page to 1 whenever filters change (use a ref to avoid double-fetching)
  const prevFiltersRef = useRef<string>('');
  useEffect(() => {
    const filtersKey = `${debouncedSearch}|${noWebsiteOnly}|${lowRatingOnly}|${highScoreOnly}|${selectedStatus}`;
    if (prevFiltersRef.current !== '' && prevFiltersRef.current !== filtersKey) {
      setPage(1);
    }
    prevFiltersRef.current = filtersKey;
  }, [debouncedSearch, noWebsiteOnly, lowRatingOnly, highScoreOnly, selectedStatus]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const filter: Record<string, any> = {};
      if (debouncedSearch) filter.search = debouncedSearch;
      if (noWebsiteOnly) filter.noWebsiteOnly = true;
      if (lowRatingOnly) filter.lowRatingOnly = true;
      if (selectedStatus) filter.status = selectedStatus;
      if (highScoreOnly) filter.minOpportunityScore = 60;

      const pagination = {
        page,
        limit,
        sortBy: 'opportunityScore',
        sortOrder: 'DESC',
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
  }, [debouncedSearch, noWebsiteOnly, lowRatingOnly, highScoreOnly, selectedStatus, page, limit]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000); // Poll every 8s to reduce flicker
    return () => clearInterval(interval);
  }, [loadData]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await updateLeadStatus(id, newStatus);
      loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(id);
        loadData();
      } catch (err) {
        console.error('Failed to delete lead:', err);
      }
    }
  };

  const handleFindEmail = async (id: string) => {
    try {
      const updated = await findEmailForLead(id);
      if (updated.email) {
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, email: updated.email, emailSource: updated.emailSource } : l))
        );
      } else {
        alert('No public email found for this lead in OSINT web search.');
      }
    } catch (err) {
      console.error('Failed to find email:', err);
      alert('Error searching for email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans antialiased p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <Header
          onRefresh={loadData}
          leads={leads}
          isBackendConnected={isBackendConnected}
        />

        <StatsCards stats={stats} />

        <LeadFilters
          search={search}
          setSearch={setSearch}
          noWebsiteOnly={noWebsiteOnly}
          setNoWebsiteOnly={setNoWebsiteOnly}
          lowRatingOnly={lowRatingOnly}
          setLowRatingOnly={setLowRatingOnly}
          highScoreOnly={highScoreOnly}
          setHighScoreOnly={setHighScoreOnly}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />

        <LeadTable
          leads={leads}
          totalCount={totalCount}
          page={page}
          totalPages={totalPages}
          limit={limit}
          loading={loading}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
          onOpenPitch={(lead) => setSelectedLeadForPitch(lead)}
          onUpdateStatus={handleUpdateStatus}
          onDeleteLead={handleDeleteLead}
          onFindEmail={handleFindEmail}
        />

        {selectedLeadForPitch && (
          <PitchModal
            lead={selectedLeadForPitch}
            onClose={() => setSelectedLeadForPitch(null)}
          />
        )}
      </div>
    </div>
  );
};

export default App;
