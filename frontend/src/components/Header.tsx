import React, { useState } from 'react';
import { RefreshCw, Download, Bookmark } from 'lucide-react';
import { Lead } from '../types';
import { useAuth } from '../context/AuthContext';
import { BookmarkletModal } from './bookmarklet/BookmarkletModal';

interface HeaderProps {
  onRefresh: () => void;
  leads: Lead[];
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, leads, isBackendConnected }) => {
  const { user, isAuthenticated, openAuthModal, openProfileModal } = useAuth();
  const [isBookmarkletOpen, setIsBookmarkletOpen] = useState(false);
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
    <header className="flex flex-col md:flex-row items-center justify-between gap-4 p-5 bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* Brand Group */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white">
            LF
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-gray-950">
                LeadFinder
              </h1>
              <span className="px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-700 rounded-md">
                CRM
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Opportunity gap scoring and outreach queue
            </p>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        {/* Backend Status */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            isBackendConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          ></span>
          <span>{isBackendConnected ? 'Backend connected' : 'Extension storage mode'}</span>
        </div>

        {/* Export Button */}
        <button
          onClick={exportToCSV}
          disabled={leads.length === 0}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 border border-gray-200 text-xs font-medium rounded-lg transition-colors"
        >
          <Download size={14} className="text-gray-500" />
          <span>Export CSV ({leads.length})</span>
        </button>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          <span>Sync leads</span>
        </button>

        {/* Free Extractor Bookmarklet Button */}
        <button
          onClick={() => setIsBookmarkletOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
          title="Free 1-Click Google Maps Extractor"
        >
          <Bookmark size={13} className="text-blue-600 fill-blue-600/20" />
          <span>Extractor (Free)</span>
        </button>

        {/* User Account / Auth Trigger */}
        {isAuthenticated && user ? (
          <button
            onClick={openProfileModal}
            className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-800 border border-gray-200 text-xs font-semibold rounded-lg transition-colors"
            title="Account & API Settings"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              {user.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, 2)}
            </div>
            <span className="max-w-[90px] truncate">{user.name}</span>
          </button>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-lg transition-colors"
          >
            <span>Sign in</span>
          </button>
        )}
      </div>

      {/* 1-Click Bookmarklet Setup Modal */}
      <BookmarkletModal
        isOpen={isBookmarkletOpen}
        onClose={() => setIsBookmarkletOpen(false)}
      />
    </header>
  );
};
