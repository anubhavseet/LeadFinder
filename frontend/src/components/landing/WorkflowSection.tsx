import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface PipelineStep {
  step: string;
  title: string;
  tagline: string;
  description: string;
  codeSnippet: string;
}

const STEPS: PipelineStep[] = [
  {
    step: '1',
    title: 'Search Google Maps',
    tagline: 'Pick your niche and geography',
    description: 'Open Google Maps and search for your target market — for example, "Roofing Contractors in Austin, TX." The LeadFinder extension hooks the live results feed without creating external automated sessions.',
    codeSnippet: `// Hook the live Maps viewport
window.leadFinder.hookViewport({
  query: "Commercial Roofing Austin TX",
  feedSelector: 'div[role="feed"]',
  antiBotJitter: [1800, 3800] // ms
});`,
  },
  {
    step: '2',
    title: 'Extract business data',
    tagline: 'Client-side DOM parsing',
    description: 'The scraper simulates natural scrolling speed, extracts business names, phone numbers, review counts, and checks whether each listing has a linked website.',
    codeSnippet: `// Parse each listing from the feed
const entity = {
  name: "Apex Precision Roofing",
  phone: "(512) 555-0198",
  website: null, // no website found
  rating: 3.8,
  reviews: 6
};`,
  },
  {
    step: '3',
    title: 'Score each opportunity',
    tagline: '0–100 priority index',
    description: 'The scoring engine awards points for each gap: +45 for no website, +20 for rating below 4.0, +15 for few reviews. It also resolves phone carriers for SMS dispatch.',
    codeSnippet: `// Compute the opportunity score
const score = evaluateGap(entity);
// -> Score: 85/100 [high priority]
// Carrier: Verizon Wireless [mobile]
// Gateway: 5125550198@vtext.com`,
  },
  {
    step: '4',
    title: 'Send your pitch',
    tagline: 'Free carrier-gateway SMS',
    description: 'Dispatch a personalized outreach message through free carrier email-to-SMS gateways — AT&T, Verizon, T-Mobile. No Twilio bills, no API costs.',
    codeSnippet: `// Send through carrier gateway
await smsGateway.send({
  to: "5125550198@vtext.com",
  subject: "Web design opportunity",
  body: "Hi Apex Precision, noticed your Google
    profile has no mobile site..."
});`,
  },
];

interface WorkflowSectionProps {
  onLaunchCrm: () => void;
}

export const WorkflowSection: React.FC<WorkflowSectionProps> = ({ onLaunchCrm }) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const current = STEPS[activeStep];

  return (
    <section id="pipeline" className="relative py-24 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-14">
        {/* Section heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
          <div className="flex flex-col gap-2 max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
              From map pin to closed retainer
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Four steps, no manual data entry. The pipeline handles extraction, scoring, enrichment, and
              outreach.
            </p>
          </div>

          <button
            onClick={onLaunchCrm}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors active:scale-[0.98]"
          >
            Open dashboard
          </button>
        </div>

        {/* Split: step selector + code console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Step selector (5 cols) */}
          <div className="lg:col-span-5 flex flex-col divide-y divide-gray-200 border-y border-gray-200">
            {STEPS.map((s, idx) => {
              const isActive = idx === activeStep;
              return (
                <div
                  key={s.step}
                  onClick={() => setActiveStep(idx)}
                  className={`py-5 px-3 cursor-pointer transition-all duration-200 flex items-start justify-between group ${
                    isActive ? 'bg-blue-50/60' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`text-sm font-semibold mt-0.5 font-mono ${
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                      }`}
                    >
                      {s.step}
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span
                        className={`text-sm font-semibold tracking-tight ${
                          isActive ? 'text-ink' : 'text-gray-600 group-hover:text-ink'
                        }`}
                      >
                        {s.title}
                      </span>
                      <span className="text-xs text-muted">{s.tagline}</span>
                    </div>
                  </div>

                  <ChevronRight
                    size={16}
                    className={`transition-transform mt-1 ${
                      isActive ? 'text-blue-600 translate-x-1' : 'text-gray-400'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Code panel (7 cols) — dark */}
          <div className="lg:col-span-7 bg-[#0D1117] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between gap-5">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-400 font-mono">
                    Step {current.step}
                  </span>
                  <span className="text-gray-600">·</span>
                  <span className="text-xs font-medium text-gray-200">{current.title}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{current.description}</p>
            </div>

            {/* Code box */}
            <div className="bg-[#0A0D12] border border-gray-800 rounded-xl p-4 font-mono text-xs text-gray-300">
              <pre className="text-gray-200 overflow-x-auto leading-relaxed">
                <code>{current.codeSnippet}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
