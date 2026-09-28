import React from 'react';
import { Users, Globe, Flame, Zap } from 'lucide-react';
import { LeadStats } from '../types';

interface StatsCardsProps {
  stats: LeadStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const cards = [
    {
      title: 'Total leads',
      value: stats.totalLeads,
      desc: 'Extracted businesses in CRM',
      icon: Users,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50 border-blue-100',
    },
    {
      title: 'No website found',
      value: stats.noWebsiteCount,
      desc: 'Prime targets for web design outreach',
      icon: Globe,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-100',
    },
    {
      title: 'High priority',
      value: stats.highPriorityLeadsCount,
      desc: 'Opportunity score ≥ 60',
      icon: Flame,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-100',
    },
    {
      title: 'Average score',
      value: `${stats.avgOpportunityScore || 0}/100`,
      desc: `${stats.lowRatingCount} low ratings · ${stats.lowReviewsCount} few reviews`,
      icon: Zap,
      iconColor: 'text-gray-700',
      iconBg: 'bg-gray-100 border-gray-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className="p-5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500">
                {card.title}
              </span>
              <div className={`p-2 rounded-lg border ${card.iconBg} ${card.iconColor}`}>
                <IconComponent size={16} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-gray-950 tracking-tight">
                {card.value}
              </span>
            </div>

            <p className="mt-1.5 text-xs text-gray-500">
              {card.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
};
