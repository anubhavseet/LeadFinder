import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Sparkles,
  Mail,
  MessageSquare,
  Phone,
  Layers,
  Send,
  Zap,
} from 'lucide-react';

interface PitchTemplate {
  id: string;
  title: string;
  service: string;
  channel: 'Email' | 'SMS' | 'Call';
  dealSize: string;
  subject: string;
  body: string;
  highlights: string[];
}

const templates: PitchTemplate[] = [
  {
    id: 'web-design',
    title: 'The Missing Website Modernizer',
    service: 'Web Design & Booking',
    channel: 'Email',
    dealSize: '$1,500 - $3,500',
    subject: 'Quick question regarding your online booking for {business_name}',
    body: `Hi {owner_name},\n\nI was searching for top-rated {category} services in your area and noticed {business_name} has a strong presence on Google Maps, but no direct website linked for customers to view your services or book an appointment.\n\nMost homeowners and clients in your area search on their phones and book immediately with competitors who have a fast 1-click mobile page.\n\nI built a quick preview mockup of what a modern mobile site and booking engine could look like for {business_name}. Would you be open to taking a look? No pressure either way.\n\nBest,\n[Your Name]\n[Your Agency / Phone]`,
    highlights: [
      'Points out immediate revenue lost to competitors',
      'Offers a risk-free visual preview mockup',
      'No aggressive sales pressure; prompts a low-friction reply',
    ],
  },
  {
    id: 'reputation',
    title: 'The Negative Review Shield',
    service: 'Reputation Management',
    channel: 'Email',
    dealSize: '$400 - $800/mo',
    subject: 'Idea to help {business_name} rebound from recent Google reviews',
    body: `Hi {owner_name},\n\nI saw that {business_name} currently has a {rating}★ rating on Google Maps with a couple of recent review complaints mentioning service delays.\n\nIn your industry, a sub-4.2 star rating typically cuts customer phone calls by over 35%, even though your actual service is great.\n\nWe set up a simple automated SMS system that catches unhappy customers privately before they post publicly, while routing happy clients straight to 5-star Google reviews. We recently helped a local business go from 3.8★ to 4.7★ in 60 days.\n\nDo you have 5 minutes this Thursday to see how it works?\n\nBest,\n[Your Name]`,
    highlights: [
      'Addresses real pain point with urgency',
      'Explains private feedback interception vs public 5-stars',
      'Includes a realistic 60-day case study reference',
    ],
  },
  {
    id: 'sms-direct',
    title: 'The 1-Click Cellular SMS Breaker',
    service: 'Quick Appointment Hook',
    channel: 'SMS',
    dealSize: 'High Reply Rate',
    subject: 'SMS Text Message',
    body: `Hey {owner_name}, came across {business_name} on Google Maps while looking for {category}. Noticed you don't have a mobile site up for fast quotes—are you taking on new clients this month? - [Your Name]`,
    highlights: [
      'Under 160 characters to avoid carrier multi-segment splits',
      'Casual, conversational question that warrants an instant "Yes"',
      '98% open rate within 3 minutes of dispatch',
    ],
  },
  {
    id: 'seo-audit',
    title: 'The Local 3-Pack SEO Dominator',
    service: 'Local SEO & Citation Audit',
    channel: 'Email',
    dealSize: '$750 - $1,500/mo',
    subject: '3 Google Maps ranking issues spotted on {business_name}',
    body: `Hi {owner_name},\n\nWhile running a competitive audit for {category} businesses in your city, I noticed {business_name} is currently ranking on page 2 for high-intent search terms.\n\nThere are 3 quick fixes in your Google listing categories and citation consistency that could move you directly into the top 3 map positions where 70% of phone calls go.\n\nI recorded a short 2-minute video showing the exact 3 adjustments. Would you like me to send it over?\n\nBest,\n[Your Name]`,
    highlights: [
      'Specific, quantifiable promise (Top 3 map placement)',
      'Offers a personalized 2-minute loom video audit',
      'High curiosity gap that generates enthusiastic replies',
    ],
  },
];

export const AiPitchHubView: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<PitchTemplate>(templates[0]);
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);

  const sampleLead = {
    business_name: "Apex Plumbing & Heating",
    owner_name: "Mark",
    category: "plumber",
    rating: "3.9",
  };

  const previewSubject = selectedTemplate.subject
    .replace('{business_name}', sampleLead.business_name)
    .replace('{category}', sampleLead.category);

  const previewBody = selectedTemplate.body
    .replace(/{business_name}/g, sampleLead.business_name)
    .replace(/{owner_name}/g, sampleLead.owner_name)
    .replace(/{category}/g, sampleLead.category)
    .replace(/{rating}/g, sampleLead.rating);

  const handleCopySubject = () => {
    navigator.clipboard.writeText(previewSubject);
    setCopiedSubject(true);
    setTimeout(() => setCopiedSubject(false), 2000);
  };

  const handleCopyBody = () => {
    navigator.clipboard.writeText(previewBody);
    setCopiedBody(true);
    setTimeout(() => setCopiedBody(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold mb-2 border border-blue-100">
              <Sparkles size={12} />
              <span>Conversion Copy Library</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Cold Outreach Frameworks & Templates
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Battle-tested cold outreach copy written specifically for local businesses. Each template automatically pulls opportunity tags, star ratings, and category keywords directly from your CRM.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Template Selector & Live Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Template Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Proven Agency Frameworks
          </div>

          {templates.map((tmpl) => {
            const isSelected = selectedTemplate.id === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-blue-600 shadow-md ring-1 ring-blue-600/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      tmpl.channel === 'Email'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : tmpl.channel === 'SMS'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    {tmpl.channel} Outreach
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Target: {tmpl.dealSize}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900">{tmpl.title}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{tmpl.service}</div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Live Variable Inspector & Copy Engine (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {selectedTemplate.title}
                </h3>
                <span className="text-xs text-slate-400 font-medium">
                  Dynamic variables preview using sample lead: <strong className="text-slate-700">{sampleLead.business_name}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyBody}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  {copiedBody ? <Check size={13} /> : <Copy size={13} />}
                  <span>{copiedBody ? 'Copied Body' : 'Copy Pitch Body'}</span>
                </button>
              </div>
            </div>

            {/* Subject Line */}
            {selectedTemplate.channel === 'Email' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Subject Line
                  </label>
                  <button
                    onClick={handleCopySubject}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                  >
                    {copiedSubject ? <Check size={11} /> : <Copy size={11} />}
                    <span>{copiedSubject ? 'Copied' : 'Copy Subject'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 font-mono">
                  {previewSubject}
                </div>
              </div>
            )}

            {/* Body Box */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Message Body (Rendered Copy)
              </label>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-mono whitespace-pre-wrap">
                {previewBody}
              </div>
            </div>

            {/* Why this converts */}
            <div className="mt-5 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl">
              <div className="text-xs font-bold text-blue-900 mb-1.5 flex items-center gap-1.5">
                <Zap size={13} className="text-blue-600" />
                <span>Conversion Psychology Breakdown</span>
              </div>
              <ul className="space-y-1 text-[11px] text-blue-900/80">
                {selectedTemplate.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-500 font-bold">&bull;</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Dynamic tags: &#123;business_name&#125;, &#123;category&#125;, &#123;rating&#125;, &#123;phone&#125;</span>
            <span className="text-slate-500 font-medium">Ready for direct CRM injection</span>
          </div>
        </div>
      </div>
    </div>
  );
};
