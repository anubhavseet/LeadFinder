import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  Download,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BillingView: React.FC<{ leadsCount: number }> = ({ leadsCount }) => {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const quotaLimit = 500;
  const quotaPercent = Math.min(100, Math.round((leadsCount / quotaLimit) * 100));

  const plans = [
    {
      id: 'starter',
      name: 'Starter Freelancer',
      priceMonthly: 39,
      priceAnnual: 29,
      isCurrent: true,
      description: 'Ideal for solo web designers and freelancers closing 1-3 local clients a month.',
      features: [
        '500 Extracted Leads / month',
        '100 AI Outreach Pitches',
        'Direct 1-Click SMS & Gmail Sender',
        'Pre-Scrape Quality Filters',
        'CSV & CRM Data Export',
      ],
      ctaText: 'Current Plan',
    },
    {
      id: 'agency',
      name: 'Pro Agency',
      priceMonthly: 89,
      priceAnnual: 69,
      isPopular: true,
      isCurrent: false,
      description: 'Built for digital marketing & SEO agencies scaling active client acquisition.',
      features: [
        '2,500 Extracted Leads / month',
        'Unlimited AI Outreach Pitches',
        'Deep Website Audit Signals',
        'Carrier & Mobile Line Verifier',
        'Multi-Step Drip Campaigns',
        'Priority GraphQL API Access',
      ],
      ctaText: 'Upgrade to Pro Agency',
    },
    {
      id: 'scale',
      name: 'Scale & Growth',
      priceMonthly: 199,
      priceAnnual: 159,
      isCurrent: false,
      description: 'For outbound sales teams and lead generation agencies managing multi-city operations.',
      features: [
        '10,000 Extracted Leads / month',
        'Unlimited AI Pitches & Sequences',
        '5 Team Seats with RBAC',
        'HubSpot & Webhook Automation',
        'Dedicated IP Crawl Pool',
        'SLA Support & Onboarding',
      ],
      ctaText: 'Upgrade to Scale',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold mb-2 border border-blue-100">
              <CreditCard size={12} />
              <span>Subscription & Credits</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Plan Management & Usage Quota
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Track your lead extraction consumption and upgrade your plan to increase monthly caps and unlock automated drip campaigns.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                billingCycle === 'annual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Annual</span>
              <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1 rounded font-bold">Save 25%</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Usage Meters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Lead Extraction Quota</span>
            <span className="font-mono text-slate-900 font-bold">{leadsCount} / {quotaLimit}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden my-3">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${quotaPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{quotaLimit - leadsCount} leads remaining</span>
            <span>Resets in 24 days</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">AI Pitch Generations</span>
            <span className="font-mono text-slate-900 font-bold">14 / 100</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden my-3">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `14%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>86 pitches remaining</span>
            <span>Resets in 24 days</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Email Deliverability Checks</span>
            <span className="font-mono text-slate-900 font-bold">8 / 50</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden my-3">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `16%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>42 checks remaining</span>
            <span>Resets in 24 days</span>
          </div>
        </div>
      </div>

      {/* Plan Tiers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {plans.map((p) => {
          const price = billingCycle === 'monthly' ? p.priceMonthly : p.priceAnnual;
          return (
            <div
              key={p.id}
              className={`rounded-2xl p-6 flex flex-col justify-between border transition-all ${
                p.isPopular
                  ? 'bg-white border-blue-600 shadow-xl shadow-blue-500/10 ring-2 ring-blue-600 relative'
                  : 'bg-white border-slate-200/90 shadow-sm'
              }`}
            >
              {p.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                  Most Popular for Agencies
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base text-slate-900">{p.name}</h3>
                  {p.isCurrent && (
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed min-h-[36px]">
                  {p.description}
                </p>

                <div className="mt-5 mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
                    ${price}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ month</span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 mb-6">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <button
                  disabled={p.isCurrent}
                  onClick={() => alert(`Redirecting to Stripe checkout for ${p.name}...`)}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    p.isCurrent
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : p.isPopular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 cursor-pointer'
                      : 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                  }`}
                >
                  {p.ctaText}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment & Invoice Records Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Payment Method & Invoices
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Secure billing managed via Stripe Customer Portal.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700">
              <span className="font-bold text-slate-900">VISA</span>
              <span>ending in 4242</span>
              <span className="text-[10px] text-slate-400">Exp 12/28</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase font-semibold">
                <th className="pb-3 font-semibold">Invoice Date</th>
                <th className="pb-3 font-semibold">Plan Description</th>
                <th className="pb-3 font-semibold">Amount</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-3 font-mono">Oct 01, 2026</td>
                <td className="py-3">LeadFinder Starter (Monthly Recurring)</td>
                <td className="py-3 font-mono font-bold">$39.00 USD</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Paid
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => alert('Downloading invoice PDF...')}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <Download size={12} />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-mono">Sep 01, 2026</td>
                <td className="py-3">LeadFinder Starter (Monthly Recurring)</td>
                <td className="py-3 font-mono font-bold">$39.00 USD</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Paid
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button
                    onClick={() => alert('Downloading invoice PDF...')}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <Download size={12} />
                    <span>PDF</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
