import React, { useState, useEffect } from 'react';
import { Pause, Play, Zap, ChevronRight } from 'lucide-react';

interface ScrapedEntity {
  name: string;
  category: string;
  address: string;
  score: number;
  gap: string;
  carrier: string;
  lat: number;
  lng: number;
}

const LIVE_TARGETS: ScrapedEntity[] = [
  {
    name: 'Apex Precision Roofing & Gutters',
    category: 'Roofing Contractor',
    address: '1402 S Congress Ave, Austin, TX',
    score: 85,
    gap: 'No website (+45)',
    carrier: 'Verizon Wireless',
    lat: 44,
    lng: 28,
  },
  {
    name: 'Travis County Metal Roofers',
    category: 'Roofing Contractor',
    address: '810 Barton Springs Rd, Austin, TX',
    score: 75,
    gap: 'No website (+45)',
    carrier: 'AT&T Mobility',
    lat: 68,
    lng: 36,
  },
  {
    name: 'Hill Country HVAC Specialists',
    category: 'HVAC Contractor',
    address: '3201 E 7th St, Austin, TX',
    score: 70,
    gap: 'Rating 3.4 (+20)',
    carrier: 'T-Mobile USA',
    lat: 30,
    lng: 62,
  },
  {
    name: 'Lone Star Collision & Paint',
    category: 'Auto Repair',
    address: '4509 Menchaca Rd, Austin, TX',
    score: 60,
    gap: 'Few reviews (+15)',
    carrier: 'Spectrum Mobile',
    lat: 78,
    lng: 70,
  },
];

export const ExtractorHUDDemo: React.FC = () => {
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isCrawling, setIsCrawling] = useState<boolean>(true);
  const [nodesScraped, setNodesScraped] = useState<number>(47);
  const [noWebCount, setNoWebCount] = useState<number>(19);
  const [logs, setLogs] = useState<string[]>([
    'Attached observer to div[role="feed"]',
    'Intercepted: Apex Precision — no website found (+45)',
    'Carrier resolved: (512) 555-0198 — Verizon [mobile]',
  ]);

  useEffect(() => {
    if (!isCrawling) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % LIVE_TARGETS.length);
      setNodesScraped((prev) => prev + 1);
      if (Math.random() > 0.4) {
        setNoWebCount((prev) => prev + 1);
      }

      const nextTarget = LIVE_TARGETS[(activeIdx + 1) % LIVE_TARGETS.length];
      setLogs((prev) => [
        `Intercepted: ${nextTarget.name} — ${nextTarget.gap}`,
        `Carrier: ${nextTarget.carrier}`,
        ...prev.slice(0, 3),
      ]);
    }, 2800);

    return () => clearInterval(interval);
  }, [isCrawling, activeIdx]);

  const current = LIVE_TARGETS[activeIdx];

  return (
    <div className="relative w-full rounded-2xl bg-[#0D1117] border border-gray-800 shadow-2xl overflow-hidden select-none">
      {/* Console header */}
      <div className="bg-[#161B22] px-4 py-2.5 border-b border-gray-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-gray-200 font-medium">LeadFinder extraction</span>
          <span className="text-gray-600">v1.2</span>
        </div>

        <div className="flex items-center gap-3 text-gray-500 font-mono text-[11px]">
          <span>{isCrawling ? 'Crawling' : 'Paused'}</span>
          <span>30.27° N, 97.74° W</span>
        </div>
      </div>

      {/* Map area */}
      <div className="relative h-[400px] w-full bg-[#0D1117] overflow-hidden">
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />

        {/* Road geometry */}
        <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M-20 180 L 700 120" stroke="#334155" strokeWidth="2" fill="none" />
          <path d="M140 -20 L 260 500" stroke="#334155" strokeWidth="2" fill="none" />
          <path d="M-20 320 Q 240 260 500 360" stroke="#2563eb" strokeWidth="1.5" fill="none" />
          <path d="M380 -20 L 320 500" stroke="#1e293b" strokeWidth="1" fill="none" />
          <circle cx="260" cy="200" r="140" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" fill="none" />
        </svg>

        {/* Scan pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-blue-500/10 pointer-events-none">
          <div className="w-full h-full rounded-full border border-blue-500/5 animate-ping opacity-20" />
        </div>

        {/* Pins */}
        {LIVE_TARGETS.map((item, idx) => {
          const isActive = idx === activeIdx;
          return (
            <div
              key={item.name}
              style={{ top: `${item.lat}%`, left: `${item.lng}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                isActive ? 'scale-110 z-20' : 'scale-90 opacity-50 z-10'
              }`}
            >
              <div className="relative flex items-center justify-center">
                {isActive && (
                  <span className="absolute w-8 h-8 rounded-full bg-blue-500/20 animate-ping" />
                )}
                <div
                  className={`w-3 h-3 rounded-full border-2 transition-colors ${
                    isActive
                      ? 'bg-blue-500 border-white shadow-lg'
                      : 'bg-gray-700 border-gray-600'
                  }`}
                />
              </div>

              {isActive && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900/95 border border-gray-700 rounded px-2 py-0.5 text-[10px] text-gray-200 shadow-xl">
                  {item.name}
                </div>
              )}
            </div>
          );
        })}

        {/* Stats overlay */}
        <div className="absolute top-4 right-4 w-[260px] bg-[#161B22]/95 border border-gray-800/80 rounded-xl p-4 shadow-2xl backdrop-blur-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
            <span className="text-xs font-semibold text-gray-200">Live extraction</span>
            <span className="text-[10px] text-gray-500 font-mono">jitter 2.2s</span>
          </div>

          {/* Numbers */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0D1117] border border-gray-800/60 rounded-lg p-2.5">
              <span className="text-[10px] text-gray-500 block">Extracted</span>
              <span className="text-lg font-bold text-white font-mono">{nodesScraped}</span>
            </div>
            <div className="bg-[#0D1117] border border-gray-800/60 rounded-lg p-2.5">
              <span className="text-[10px] text-blue-400 block">No website</span>
              <span className="text-lg font-bold text-blue-400 font-mono">{noWebCount}</span>
            </div>
          </div>

          {/* Current target */}
          <div className="bg-[#0D1117] border border-gray-800/80 rounded-lg p-2.5 text-[11px] flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-[10px]">Current</span>
              <span className="text-green-400 font-semibold font-mono">{current.score}/100</span>
            </div>
            <span className="font-medium text-gray-200 truncate">{current.name}</span>
            <div className="flex items-center justify-between text-[10px] text-gray-400 pt-0.5">
              <span className="text-blue-400">{current.gap}</span>
              <span className="text-gray-500">{current.carrier}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              onClick={() => setIsCrawling(!isCrawling)}
              className="flex-1 py-1.5 px-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              {isCrawling ? <Pause size={12} /> : <Play size={12} />}
              <span>{isCrawling ? 'Pause' : 'Resume'}</span>
            </button>

            <button
              onClick={() => alert(`Synced ${nodesScraped} leads to CRM.`)}
              className="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            >
              <Zap size={12} />
              <span>Sync to CRM</span>
            </button>
          </div>
        </div>

        {/* Event log */}
        <div className="absolute bottom-0 inset-x-0 bg-[#0D1117]/90 border-t border-gray-800 px-4 py-2 text-[10px] text-gray-400 flex flex-col gap-0.5 backdrop-blur-md font-mono">
          {logs.slice(0, 2).map((log, i) => (
            <div key={i} className="truncate flex items-center gap-1.5">
              <ChevronRight size={10} className="text-blue-500 shrink-0" />
              <span className={i === 0 ? 'text-gray-200' : 'text-gray-500'}>{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
