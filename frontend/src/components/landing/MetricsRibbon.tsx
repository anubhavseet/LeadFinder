import React from 'react';

export const MetricsRibbon: React.FC = () => {
  const specs = [
    { label: 'Client-side extraction', detail: 'No Google Places API bills' },
    { label: 'Human-speed scrolling', detail: 'Built-in rate limiting (1.8–3.8s jitter)' },
    { label: 'Opportunity scoring', detail: 'Automated 0–100 gap detection' },
    { label: 'Free SMS outreach', detail: 'AT&T, Verizon & T-Mobile carrier gateways' },
    { label: 'Persistent storage', detail: 'GraphQL backend with MongoDB' },
  ];

  return (
    <div className="w-full border-y border-gray-200 bg-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {specs.map((item) => (
            <div key={item.label} className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-ink">
                {item.label}
              </span>
              <span className="text-xs text-muted">
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
