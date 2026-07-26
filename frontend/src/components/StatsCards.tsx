import React from 'react';
import { Users, Globe, Star, Flame, Zap } from 'lucide-react';
import { LeadStats } from '../types';

interface StatsCardsProps {
  stats: LeadStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total Scraped Leads',
      value: stats.totalLeads,
      desc: 'Local businesses stored in CRM database',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'No Website Opportunity',
      value: stats.noWebsiteCount,
      desc: 'Prime targets for web dev freelancing pitch',
      icon: Globe,
      color: 'from-amber-400 to-orange-500',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'High Opportunity Score',
      value: stats.highPriorityLeadsCount,
      desc: 'Score ≥ 60 (high-conviction outreach targets)',
      icon: Flame,
      color: 'from-emerald-400 to-teal-500',
      textColor: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Avg Opportunity Score',
      value: `${stats.avgOpportunityScore || 0}/100`,
      desc: `Low Rating: ${stats.lowRatingCount} | Low Reviews: ${stats.lowReviewsCount}`,
      icon: Zap,
      color: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="relative overflow-hidden p-5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg transition-all hover:border-white/20 hover:-translate-y-0.5 group"
          >
            {/* Top Accent Line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color}`}></div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl border ${card.bgColor} ${card.textColor}`}>
                <IconComponent size={18} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-extrabold text-white tracking-tight">
                {card.value}
              </span>
            </div>

            <p className="mt-2 text-xs font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
              {card.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};
