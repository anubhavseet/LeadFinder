import React from 'react';
import { RefreshCw, Download, Database, MapPin } from 'lucide-react';
import { Lead } from '../types';

interface HeaderProps {
  onRefresh: () => void;
  leads: Lead[];
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, leads, isBackendConnected }) => {
  const exportToCSV = () => {
    if (!leads || leads.length === 0) return;
    const headers = ['Name', 'Category', 'Address', 'Phone', 'Website', 'Rating', 'Reviews', 'Opportunity Score', 'Status', 'Search Query'];
    const rows = leads.map(l => [
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

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leadfinder_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl">
      {/* Brand Group */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center font-display font-extrabold text-xl text-white shadow-lg shadow-blue-500/25">
            LF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                LeadFinder
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full tracking-wide uppercase">
                PRO CRM
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Small Business Freelance Lead Intelligence & Outreach Engine
            </p>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Backend Status */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            isBackendConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400' : 'bg-amber-400'
            }`}
          ></span>
          <span>{isBackendConnected ? 'GraphQL Backend Live' : 'Local Extension Storage Mode'}</span>
        </div>

        {/* Export Button */}
        <button
          onClick={exportToCSV}
          disabled={leads.length === 0}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-white/10 text-xs font-semibold rounded-xl transition-all shadow-sm active:scale-95"
        >
          <Download size={14} className="text-blue-400" />
          <span>Export CSV ({leads.length})</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-600/30 active:scale-95"
        >
          <RefreshCw size={14} />
          <span>Sync &amp; Refresh</span>
        </button>
      </div>
    </header>
  );
};
