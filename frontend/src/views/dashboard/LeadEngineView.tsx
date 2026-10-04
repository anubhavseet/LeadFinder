import React, { useState } from 'react';
import {
  Compass,
  Bookmark,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Search,
  Sliders,
  Sparkles,
  Zap,
  Globe,
  Phone,
  CheckCircle2,
  Minimize2,
  Maximize2,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LeadEngineViewProps {
  onNavigateCrm?: () => void;
}

export const LeadEngineView: React.FC<LeadEngineViewProps> = ({ onNavigateCrm }) => {
  const { token, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [maxLeads, setMaxLeads] = useState('50');
  const [noWebsiteOnly, setNoWebsiteOnly] = useState(true);
  const [mustHavePhone, setMustHavePhone] = useState(true);
  const [maxRating, setMaxRating] = useState('any');
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [launchMode, setLaunchMode] = useState<'background' | 'tab'>('background');
  const [activeCrawl, setActiveCrawl] = useState<{
    query: string;
    maxLeads: string;
    time: string;
  } | null>(null);

  const userPayload = user ? JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }) : null;
  const bookmarkletCode = token
    ? `javascript:(function(){window.__LF_TOKEN='${token}';${userPayload ? `window.__LF_USER=${userPayload};` : ''}const s=document.createElement('script');s.src='http://localhost:5173/leadfinder-bookmarklet.js?v='+Date.now();document.body.appendChild(s);})();`
    : `javascript:(function(){const s=document.createElement('script');s.src='http://localhost:5173/leadfinder-bookmarklet.js?v='+Date.now();document.body.appendChild(s);})();`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  const handleLaunch = (mode: 'background' | 'tab' = launchMode) => {
    const q = new URLSearchParams({
      lf_cap: maxLeads,
      lf_noweb: String(noWebsiteOnly),
      lf_phone: String(mustHavePhone),
      lf_rating: maxRating,
      lf_autostart: '1',
    });

    if (mode === 'background') {
      q.set('lf_autoclose', '1');
    }

    if (token) {
      q.set('lf_token', token);
    }

    const cleanQuery = searchQuery.trim();
    let targetUrl = '';
    if (cleanQuery) {
      q.set('lf_query', cleanQuery);
      targetUrl = `https://www.google.com/maps/search/${encodeURIComponent(cleanQuery).replace(/%20/g, '+')}?${q.toString()}`;
    } else {
      targetUrl = `https://www.google.com/maps?${q.toString()}`;
    }

    if (mode === 'background') {
      // Position micro-window neatly at the bottom-right corner of the desktop
      const popupWidth = 440;
      const popupHeight = 560;
      const left = Math.max(0, (window.screen.availWidth || 1920) - popupWidth - 20);
      const top = Math.max(0, (window.screen.availHeight || 1080) - popupHeight - 40);
      const features = `width=${popupWidth},height=${popupHeight},left=${left},top=${top},resizable=yes,scrollbars=yes`;
      window.open(targetUrl, 'leadfinder_background_crawler', features);

      setActiveCrawl({
        query: cleanQuery || 'Local Businesses',
        maxLeads,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else {
      window.open(targetUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Background Crawl Status Banner (If launched) */}
      {activeCrawl && (
        <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start sm:items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0 mt-1 sm:mt-0" />
            <div>
              <div className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                <span>Background Crawler Active</span>
                <span className="text-[10px] text-emerald-700 bg-emerald-100/70 font-mono px-1.5 py-0.2 rounded font-normal">
                  Started {activeCrawl.time}
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-0.5">
                Extracting up to <strong>{activeCrawl.maxLeads} leads</strong> for <em>"{activeCrawl.query}"</em>. Leads stream directly into your CRM and the micro-window will <strong>auto-close</strong> when done.
              </p>
            </div>
          </div>

          {onNavigateCrm && (
            <button
              onClick={onNavigateCrm}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all shrink-0 self-start sm:self-center"
            >
              <span>View Leads in CRM</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      )}

      {/* Main Command Dispatcher Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold mb-3 border border-blue-100">
              <Zap size={12} />
              <span>Target Dispatcher</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Launch Live Scraper to Google Maps
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Enter any niche and territory. LeadFinder launches Google Maps with your pre-configured quality filters, extracts phone numbers and website status, and saves leads straight into MongoDB.
            </p>
          </div>

          {/* Mode Selector & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="inline-flex p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLaunchMode('background')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  launchMode === 'background'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Runs in miniature corner window and closes automatically when done"
              >
                <Minimize2 size={12} className={launchMode === 'background' ? 'text-blue-600' : ''} />
                <span>Background (Auto-Close)</span>
              </button>
              <button
                type="button"
                onClick={() => setLaunchMode('tab')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  launchMode === 'tab'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Opens standard full-screen Google Maps in new tab"
              >
                <Maximize2 size={12} className={launchMode === 'tab' ? 'text-blue-600' : ''} />
                <span>Full Tab</span>
              </button>
            </div>

            <button
              onClick={() => handleLaunch()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Compass size={15} />
              <span>
                {launchMode === 'background' ? 'Start Background Crawl' : 'Open Google Maps & Start'}
              </span>
            </button>
          </div>
        </div>

        {/* Input Parameters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Search Query
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Dentists in Seattle, Plumbers in Miami..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Max Leads Cap
            </label>
            <select
              value={maxLeads}
              onChange={(e) => setMaxLeads(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            >
              <option value="25">25 Leads (Quick Sample)</option>
              <option value="50">50 Leads (Standard Session)</option>
              <option value="100">100 Leads (Deep Extraction)</option>
              <option value="200">200 Leads (Regional Batch)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Star Rating Filter
            </label>
            <select
              value={maxRating}
              onChange={(e) => setMaxRating(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            >
              <option value="any">Any Rating</option>
              <option value="4.0">&le; 4.0 Stars (Reputation Repair Targets)</option>
              <option value="4.3">&le; 4.3 Stars</option>
              <option value="4.5">&le; 4.5 Stars</option>
            </select>
          </div>
        </div>

        {/* Quality Toggles */}
        <div className="flex flex-wrap items-center gap-6 mt-4 pt-4 border-t border-slate-100">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={noWebsiteOnly}
              onChange={(e) => setNoWebsiteOnly(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="flex items-center gap-1.5">
              <Globe size={13} className="text-amber-500" />
              <span>Only Businesses with NO Website (Prime Redesign Targets)</span>
            </span>
          </label>

          <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700">
            <input
              type="checkbox"
              checked={mustHavePhone}
              onChange={(e) => setMustHavePhone(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span className="flex items-center gap-1.5">
              <Phone size={13} className="text-emerald-500" />
              <span>Must Have Phone Number (Direct Calling / SMS)</span>
            </span>
          </label>
        </div>
      </div>

      {/* Two Column Section: Bookmarklet Setup & Scraping Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1-Click Bookmarklet Setup Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Bookmark size={18} className="text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                  1-Click Browser Bookmarklet
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Zero Install Required
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Drag the button below directly into your browser's bookmarks bar. Click it on any Google Maps tab to open the floating HUD overlay.
            </p>

            {/* Draggable Bookmarklet Button */}
            <div className="my-6 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center">
              <a
                href={bookmarkletCode}
                onClick={(e) => {
                  e.preventDefault();
                  alert('Drag this button to your browser bookmarks bar (or click "Copy Code" below).');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 cursor-grab active:cursor-grabbing hover:scale-105 transition-all select-none border border-blue-400/20"
              >
                <Bookmark size={14} />
                <span>LeadFinder Extractor</span>
              </a>
              <div className="text-[10px] text-slate-400 mt-2">
                Drag to your Bookmarks Bar (Press Ctrl+Shift+B / ⌘+Shift+B if hidden)
              </div>
            </div>

            {/* 3 Step Guide */}
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 text-slate-600">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <span>Drag the button into your browser bookmarks bar once.</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-600">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <span>Search for any business category on Google Maps.</span>
              </div>
              <div className="flex items-start gap-2.5 text-slate-600">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <span>Click the bookmark. Leads stream straight into your CRM.</span>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium py-1 px-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {copiedBookmarklet ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
              <span>{copiedBookmarklet ? 'Code Copied to Clipboard' : 'Copy JavaScript Bookmarklet Code'}</span>
            </button>
          </div>
        </div>

        {/* Extraction Engine Architecture & Auto-Close Protocol Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900 tracking-tight">
                Background Micro-Window Protocol
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              When launched in background mode, LeadFinder opens a miniature 440x560 browser window that stays tucked at the bottom corner of your screen. It automatically syncs leads to your database and closes down once the crawl finishes.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>Auto-Close on Completion</span>
                  <span className="font-mono text-[10px] text-emerald-600">Window Self-Termination</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Monitors the lead count against your target cap. Once reached or the end of results is hit, it executes the final sync and cleanly terminates the window.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>Zero-Cost Residential IP</span>
                  <span className="font-mono text-[10px] text-blue-600">$0 Proxy Bills</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Operates using your genuine browser session and home Wi-Fi IP address. Immune to datacenter IP bans with zero expensive rotating proxy charges.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                  <span>Compact Overlay Auto-Minimize</span>
                  <span className="font-mono text-[10px] text-amber-600">Non-Intrusive Pill</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Automatically minimizes into a slender floating pill in background windows so Google Maps place cards have full visibility to lazy-load.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>LeadFinder Stealth v1.2</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <CheckCircle2 size={12} />
              <span>Auto-Close Active</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
