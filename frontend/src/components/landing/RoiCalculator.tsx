import React, { useState } from 'react';

interface RoiCalculatorProps {
  onLaunchCrm: () => void;
}

export const RoiCalculator: React.FC<RoiCalculatorProps> = ({ onLaunchCrm }) => {
  const [weeklyScraped, setWeeklyScraped] = useState<number>(150);
  const [noWebRate, setNoWebRate] = useState<number>(35);
  const [dealSize, setDealSize] = useState<number>(1200);
  const [closeRate, setCloseRate] = useState<number>(4);

  const monthlyScraped = weeklyScraped * 4;
  const primeTargetsMonthly = Math.round(monthlyScraped * (noWebRate / 100));
  const estimatedDealsMonthly = Math.max(1, Math.round(primeTargetsMonthly * (closeRate / 100)));
  const monthlyRevenue = estimatedDealsMonthly * dealSize;

  return (
    <section id="calculator" className="relative py-24 bg-page border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        {/* Section heading */}
        <div className="flex flex-col gap-2 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
            Estimate your pipeline value
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Conservative projections based on Google Maps crawl volume and cold outreach conversion rates.
          </p>
        </div>

        {/* Calculator grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Sliders (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex flex-col gap-7">
              {/* Slider 1 */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink font-medium">Weekly extracted volume</span>
                  <span className="font-semibold text-ink font-mono">{weeklyScraped} leads</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="500"
                  step="25"
                  value={weeklyScraped}
                  onChange={(e) => setWeeklyScraped(parseInt(e.target.value, 10))}
                  className="w-full cursor-pointer"
                />
                <span className="text-xs text-muted">
                  About 4 minutes of automated crawling on Google Maps.
                </span>
              </div>

              {/* Slider 2 */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink font-medium">Missing website rate</span>
                  <span className="font-semibold text-blue-600 font-mono">{noWebRate}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={noWebRate}
                  onChange={(e) => setNoWebRate(parseInt(e.target.value, 10))}
                  className="w-full cursor-pointer"
                />
                <span className="text-xs text-muted">
                  Benchmark average across US home-service and medical contractors.
                </span>
              </div>

              {/* Slider 3 */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink font-medium">Average project size</span>
                  <span className="font-semibold text-ink font-mono">${dealSize.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="4000"
                  step="100"
                  value={dealSize}
                  onChange={(e) => setDealSize(parseInt(e.target.value, 10))}
                  className="w-full cursor-pointer"
                />
                <span className="text-xs text-muted">
                  Typical contract for a modern 1–3 page responsive site.
                </span>
              </div>

              {/* Slider 4 */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-ink font-medium">Outreach conversion rate</span>
                  <span className="font-semibold text-blue-600 font-mono">{closeRate}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={closeRate}
                  onChange={(e) => setCloseRate(parseInt(e.target.value, 10))}
                  className="w-full cursor-pointer"
                />
                <span className="text-xs text-muted">
                  Conservative SMS response rate with personalized pitch copy.
                </span>
              </div>
            </div>
          </div>

          {/* Revenue output (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6 shadow-sm">
            <div className="flex flex-col gap-5">
              <span className="text-xs text-muted">
                Monthly projection
              </span>

              {/* Big number */}
              <div className="flex flex-col">
                <span className="text-xs text-muted">
                  Estimated revenue
                </span>
                <span className="font-mono text-4xl sm:text-5xl font-bold text-ink tracking-tight mt-1">
                  ${monthlyRevenue.toLocaleString()}
                </span>
                <span className="text-xs text-muted mt-1.5">
                  Based on ~{estimatedDealsMonthly} closed projects per month
                </span>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 text-sm">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted text-xs">Prime targets</span>
                  <span className="font-semibold text-ink font-mono">
                    {primeTargetsMonthly}/mo
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted text-xs">Total extracted</span>
                  <span className="font-semibold text-ink font-mono">
                    {monthlyScraped}/mo
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onLaunchCrm}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors active:scale-[0.98]"
            >
              Start finding leads
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
