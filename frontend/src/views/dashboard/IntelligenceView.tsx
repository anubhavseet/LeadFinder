import React from 'react';
import {
  Sparkles,
  Globe,
  Star,
  MessageSquare,
  Smartphone,
  Phone,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Lead, LeadStats } from '../../types';

interface IntelligenceViewProps {
  leads: Lead[];
  stats: LeadStats;
  onOpenPitch: (lead: Lead) => void;
  onNavigateCrmWithFilter?: (filterType: string) => void;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({
  leads,
  stats,
  onOpenPitch,
  onNavigateCrmWithFilter,
}) => {
  // Compute intelligence metrics
  const noWebsiteLeads = leads.filter((l) => !l.website);
  const lowRatingLeads = leads.filter((l) => l.rating && l.rating <= 4.0);
  const mobileLeads = leads.filter((l) => l.lineType === 'MOBILE');
  const highIntentLeads = [...leads]
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 8);

  const avgScore = stats.avgOpportunityScore || (leads.length > 0
    ? Math.round(leads.reduce((sum, l) => sum + (l.opportunityScore || 0), 0) / leads.length)
    : 0);

  return (
    <div className="space-y-6">
      {/* Overview Intelligence Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold mb-2 border border-emerald-100">
              <TrendingUp size={12} />
              <span>Opportunity Gap Engine</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Business Vulnerabilities & Conversion Signals
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              LeadFinder automatically inspects every local listing to detect missing assets, negative review sentiment, and direct mobile lines so your agency pitches the exact service they urgently need.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 shrink-0">
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                Average Opp Score
              </div>
              <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                {avgScore}
                <span className="text-xs text-slate-400 font-normal"> / 100</span>
              </div>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                High Priority
              </div>
              <div className="text-xl font-bold text-emerald-600 font-mono mt-0.5">
                {stats.highPriorityLeadsCount}
                <span className="text-xs text-slate-400 font-normal"> targets</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Gap Diagnostics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gap 1: No Website */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                <Globe size={16} />
              </div>
              <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/80">
                $1.5k - $3k Deal Size
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {stats.noWebsiteCount || noWebsiteLeads.length}
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-1">
              Zero Website Presence
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Operating purely on Maps. Prime candidates for modern, mobile-first web design & hosting packages.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-blue-600 font-medium">
            Service: Web Design & SEO &rarr;
          </div>
        </div>

        {/* Gap 2: Sub-4.0 Star Rating */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60">
                <Star size={16} />
              </div>
              <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/80">
                $500/mo Retainer
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {stats.lowRatingCount || lowRatingLeads.length}
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-1">
              Damaged Star Ratings (&le; 4.0)
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Losing customers to competitors due to negative feedback. Urgent need for review collection & management.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-blue-600 font-medium">
            Service: Reputation Management &rarr;
          </div>
        </div>

        {/* Gap 3: Review Deficit */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200/60">
                <MessageSquare size={16} />
              </div>
              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/80">
                Local SEO
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {stats.lowReviewsCount || 0}
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-1">
              Low Review Volume (&lt; 15)
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Lacking social proof to rank in Google's local 3-pack. Ready for automated SMS review request campaigns.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-blue-600 font-medium">
            Service: Review Automation &rarr;
          </div>
        </div>

        {/* Gap 4: Mobile Line Direct SMS */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
                <Smartphone size={16} />
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
                98% Open Rate
              </span>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-900">
              {mobileLeads.length}
            </div>
            <div className="text-xs font-semibold text-slate-800 mt-1">
              Verified Mobile Lines
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Identified as cellular carriers. Compatible with instant 1-click SMS pitch dispatches directly from CRM.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-blue-600 font-medium">
            Direct Reach: 1-Click SMS &rarr;
          </div>
        </div>
      </div>

      {/* Ranked High-Opportunity Prospects Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Top High-Intent Prospects (Ranked by Opportunity Score)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              These businesses exhibit multiple overlapping service vulnerabilities.
            </p>
          </div>
        </div>

        {highIntentLeads.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No leads extracted yet. Launch the Lead Engine to begin scanning prospects.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-semibold">
                  <th className="pb-3 font-semibold">Business</th>
                  <th className="pb-3 font-semibold">Contact</th>
                  <th className="pb-3 font-semibold">Rating</th>
                  <th className="pb-3 font-semibold">Detected Gaps</th>
                  <th className="pb-3 font-semibold text-right">Opp Score</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {highIntentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="font-semibold text-slate-900">{lead.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {lead.category || 'Local Business'} &middot; {lead.address || 'Address on file'}
                      </div>
                    </td>

                    <td className="py-3 pr-4">
                      <div className="font-mono text-slate-700">{lead.phone || 'No phone'}</div>
                      <div className="text-[10px] text-slate-400">
                        {lead.lineType ? `${lead.lineType}` : 'Standard line'}
                      </div>
                    </td>

                    <td className="py-3 pr-4 font-mono text-slate-700">
                      {lead.rating ? `${lead.rating} ★ (${lead.reviewCount || 0})` : 'Unrated'}
                    </td>

                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {!lead.website && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-200">
                            No Website
                          </span>
                        )}
                        {lead.rating && lead.rating <= 4.0 && (
                          <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] font-medium border border-rose-200">
                            Low Rating
                          </span>
                        )}
                        {lead.opportunityTags?.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 pr-4 text-right font-mono font-bold text-slate-900">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-900">
                        {lead.opportunityScore}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <button
                        onClick={() => onOpenPitch(lead)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                      >
                        <FileText size={12} />
                        <span>Pitch</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
