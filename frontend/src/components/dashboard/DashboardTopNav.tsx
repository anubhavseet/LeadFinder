import React from 'react';
import {
  Menu,
  ArrowLeft,
  RefreshCw,
  Compass,
  Bookmark,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { DashboardTab } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface DashboardTopNavProps {
  activeTab: DashboardTab;
  onOpenMobileSidebar: () => void;
  onNavigateLanding: () => void;
  onOpenBookmarklet: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isBackendConnected: boolean;
}

const tabTitles: Record<DashboardTab, { title: string; subtitle: string }> = {
  crm: {
    title: 'Leads CRM',
    subtitle: 'Opportunity gap scoring & active outreach pipeline',
  },
  engine: {
    title: 'Lead Engine',
    subtitle: 'Google Maps extraction HUD & crawler dispatcher',
  },
  intelligence: {
    title: 'Intelligence & Gaps',
    subtitle: 'Deep-dive website gaps, review complaints & intent metrics',
  },
  pitches: {
    title: 'AI Pitch Hub',
    subtitle: 'High-converting cold outreach frameworks & templates',
  },
  billing: {
    title: 'Billing & Quota',
    subtitle: 'Manage subscription tier, credit consumption & invoices',
  },
};

export const DashboardTopNav: React.FC<DashboardTopNavProps> = ({
  activeTab,
  onOpenMobileSidebar,
  onNavigateLanding,
  onOpenBookmarklet,
  onRefresh,
  isRefreshing,
  isBackendConnected,
}) => {
  const { user, openProfileModal } = useAuth();
  const current = tabTitles[activeTab];

  return (
    <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateLanding}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors pr-2 border-r border-slate-200"
            title="Return to Product Landing Page"
          >
            <ArrowLeft size={13} />
            <span>Overview</span>
          </button>

          <div>
            <h1 className="text-sm font-semibold text-slate-900 tracking-tight leading-none flex items-center gap-2">
              <span>{current.title}</span>
              <span className="hidden md:inline-block w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="hidden md:inline-block text-xs font-normal text-slate-500">
                {current.subtitle}
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* Right: Actions, Live Status, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Backend live status indicator */}
        <div
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isBackendConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              : 'bg-rose-50 text-rose-700 border-rose-200/80'
          }`}
          title={isBackendConnected ? 'NestJS GraphQL connected on port 4000' : 'Backend offline'}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isBackendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
            }`}
          />
          <span className="font-mono text-[10px]">{isBackendConnected ? 'Port 4000' : 'Offline'}</span>
        </div>

        {/* Sync Leads / Refresh */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors inline-flex items-center gap-1.5"
          title="Refresh Data from CRM"
        >
          <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-blue-600' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Extractor Launcher Button */}
        <button
          onClick={onOpenBookmarklet}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm shadow-blue-500/20 transition-all hover:shadow hover:scale-[1.01] active:scale-[0.99]"
          title="Open Bookmarklet & Scraper HUD"
        >
          <Compass size={14} />
          <span className="font-semibold">Extract Leads</span>
        </button>

        {/* User Avatar */}
        {user && (
          <button
            onClick={openProfileModal}
            className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold hover:ring-2 hover:ring-blue-600 transition-all cursor-pointer"
            title="View Profile & API Key"
          >
            {user.name ? user.name[0].toUpperCase() : 'U'}
          </button>
        )}
      </div>
    </header>
  );
};
