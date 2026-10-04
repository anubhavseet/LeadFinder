import React from 'react';
import {
  Database,
  MapPin,
  Sparkles,
  FileText,
  CreditCard,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Zap,
  ArrowUpRight,
  Layers,
  X,
  LucideIcon,
} from 'lucide-react';
import { DashboardTab } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  leadsCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onSelectTab,
  leadsCount,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { user, logout, openProfileModal } = useAuth();

  const navItems: { id: DashboardTab; label: string; icon: LucideIcon; badge?: string }[] = [
    {
      id: 'crm',
      label: 'Leads CRM',
      icon: Database,
      badge: leadsCount > 0 ? String(leadsCount) : undefined,
    },
    {
      id: 'engine',
      label: 'Lead Engine',
      icon: MapPin,
    },
    {
      id: 'intelligence',
      label: 'Intelligence',
      icon: Sparkles,
      badge: 'Audit',
    },
    {
      id: 'pitches',
      label: 'AI Pitch Hub',
      icon: FileText,
    },
    {
      id: 'billing',
      label: 'Billing & Plans',
      icon: CreditCard,
    },
  ];

  const quotaLimit = 500;
  const quotaPercent = Math.min(100, Math.round((leadsCount / quotaLimit) * 100));

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0F172A] text-slate-300 w-64 border-r border-slate-800 select-none">
      {/* Brand & Workspace Header */}
      <div className="px-5 py-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-md shadow-blue-500/20">
            LF
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-white">LeadFinder</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] text-slate-400 truncate max-w-[130px]">Agency Workspace</span>
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] uppercase tracking-wider font-semibold text-slate-300">
          Core Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={16}
                  className={isActive ? 'text-white' : 'text-slate-300 group-hover:text-slate-200 transition-colors'}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-800 text-slate-300 border border-slate-700/60'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Plan Quota Meter Box */}
      <div className="p-3 mx-3 mb-3 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="text-slate-300 flex items-center gap-1.5 font-medium">
            <Zap size={12} className="text-amber-400" />
            <span>Monthly Quota</span>
          </span>
          <span className="font-mono text-slate-300 text-[10px]">
            {leadsCount} / {quotaLimit}
          </span>
        </div>

        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${quotaPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
          <span className="text-[10px] text-slate-300">Starter Plan</span>
          <button
            onClick={() => {
              onSelectTab('billing');
              onCloseMobile();
            }}
            className="text-[10px] text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-0.5 transition-colors"
          >
            <span>Upgrade</span>
            <ArrowUpRight size={10} />
          </button>
        </div>
      </div>

      {/* User Card & Sign Out */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={openProfileModal}
            className="flex items-center gap-2.5 min-w-0 p-1.5 rounded-lg hover:bg-slate-800/70 transition-colors text-left flex-1"
            title="Account Settings & API Key"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-white truncate">
                {user?.name || user?.email || 'User'}
              </div>
              <div className="text-[10px] text-slate-300 truncate">
                {user?.email || 'Active session'}
              </div>
            </div>
          </button>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-400 hover:bg-slate-800/70 transition-colors shrink-0"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-[100dvh] z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
