import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Compass, Flame, Radio, Copy, Check } from 'lucide-react';

const COMMANDS = [
  'leadfinder crawl --region="Austin, TX" --niche="Roofing" --filter="website==null"',
  'leadfinder score --eval="gap_matrix" --min-score=70 --strict',
  'leadfinder enrich --osint="duckduckgo" --resolve-email=true',
  'leadfinder dispatch --channel="carrier_sms" --carrier="verizon" --template="web_gap"',
];

interface AutoSortingItem {
  id: string;
  name: string;
  category: string;
  score: number;
  gap: string;
}

export const BentoFeatures: React.FC = () => {
  // Command typewriter
  const [cmdIndex, setCmdIndex] = useState<number>(0);
  const [displayedText, setDisplayedText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  // Auto-sorting list
  const [leadsList, setLeadsList] = useState<AutoSortingItem[]>([
    { id: '1', name: 'Apex Precision Roofing', category: 'Roofing', score: 92, gap: 'No website (+45)' },
    { id: '2', name: 'Travis Metal Systems', category: 'Roofing', score: 78, gap: 'Low reviews (+15)' },
    { id: '3', name: 'Hill Country HVAC', category: 'HVAC', score: 86, gap: 'Rating 3.2 (+20)' },
    { id: '4', name: 'Guadalupe Plumbing Co.', category: 'Plumbing', score: 95, gap: 'Missing web & phone (+50)' },
  ]);

  const liveTicker = [
    { city: 'Austin, TX', name: 'Apex Roofing', gap: 'Missing website', score: '92' },
    { city: 'Miami, FL', name: 'Biscayne Dental', gap: 'No SSL / bad mobile', score: '84' },
    { city: 'Chicago, IL', name: 'Wicker Plumbing', gap: 'Unclaimed listing', score: '88' },
    { city: 'Denver, CO', name: 'Peak Auto Works', gap: 'Missing phone + web', score: '95' },
  ];

  // Typewriter loop
  useEffect(() => {
    let timeout: any;
    const targetCmd = COMMANDS[cmdIndex];

    if (isTyping) {
      if (displayedText.length < targetCmd.length) {
        timeout = setTimeout(() => {
          setDisplayedText(targetCmd.slice(0, displayedText.length + 1));
        }, 28);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 2600);
      }
    } else {
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(targetCmd.slice(0, displayedText.length - 2));
        }, 14);
      } else {
        setIsTyping(true);
        setCmdIndex((prev) => (prev + 1) % COMMANDS.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isTyping, cmdIndex]);

  // Auto-sorting simulation with smooth layout animations
  useEffect(() => {
    const sortTimer = setInterval(() => {
      setLeadsList((prev) => {
        const copy = prev.map((item) => {
          const delta = (Math.random() - 0.48) * 8;
          return {
            ...item,
            score: Math.min(99, Math.max(68, Math.round(item.score + delta))),
          };
        });
        return copy.sort((a, b) => b.score - a.score);
      });
    }, 2800);

    return () => clearInterval(sortTimer);
  }, []);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(COMMANDS[cmdIndex]);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <section id="features" className="relative py-24 bg-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-14">
        {/* Section heading */}
        <div className="flex flex-col gap-2 max-w-xl">
          <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
            Built for freelance deal-flow
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Automated detection, live scoring, carrier resolution, and direct outreach — each step removes
            a bottleneck in your client acquisition.
          </p>
        </div>

        {/* Asymmetric grid: 7/5 then 5/7 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Feature 1 (8 cols): Command terminal — dark */}
          <div className="lg:col-span-8 flex flex-col gap-2">
            <div className="bg-[#0D1117] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between gap-5 min-h-[300px]">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-blue-400" />
                  <span className="text-gray-200 font-medium">LeadFinder Core CLI</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyCommand}
                    className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {copiedCmd ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-400 text-[11px]">Ready</span>
                  </div>
                </div>
              </div>

              {/* Typewriter */}
              <div className="bg-[#0A0D12] border border-gray-800/90 rounded-xl p-5 font-mono text-xs sm:text-sm text-gray-200 min-h-[85px] flex items-center justify-between gap-2">
                <div className="flex items-center flex-1">
                  <span className="text-blue-500 select-none mr-2 font-bold">&gt;</span>
                  <span className="text-gray-100">{displayedText}</span>
                  <span className="w-2 h-4 bg-blue-500 ml-1 inline-block animate-pulse" />
                </div>
              </div>

              {/* Clickable command tags */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-gray-500 mr-1 font-mono">Quick load:</span>
                {['crawl', 'score', 'enrich', 'dispatch'].map((verb, idx) => (
                  <button
                    key={verb}
                    onClick={() => {
                      setCmdIndex(idx);
                      setDisplayedText('');
                      setIsTyping(true);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                      cmdIndex === idx
                        ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                        : 'bg-gray-800/60 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                    }`}
                  >
                    --{verb}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-800/60">
                <span>Crawl, score, enrich, dispatch — all from CLI</span>
                <span className="text-gray-400 font-mono">0.12ms execution</span>
              </div>
            </div>

            <div className="px-1 pt-1">
              <h3 className="font-semibold text-sm text-ink">The extraction engine</h3>
              <p className="text-xs text-muted mt-0.5">
                Execute complex crawl parameters across any Google Maps viewport.
              </p>
            </div>
          </div>

          {/* Feature 2 (4 cols): Radar — dark */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <div className="bg-[#0D1117] border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between gap-5 min-h-[300px]">
              <div className="flex items-center justify-between border-b border-gray-800/80 pb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Radio size={13} className="text-blue-400" />
                  <span className="text-gray-200 font-medium">Area radar</span>
                </div>
                <span className="text-blue-400 text-[11px]">30.26° N, 97.74° W</span>
              </div>

              {/* Radar visual with animated scan beam */}
              <div className="relative w-36 h-36 mx-auto rounded-full border border-gray-800 flex items-center justify-center my-2 overflow-hidden">
                <div className="absolute inset-0 rounded-full border border-blue-500/10 animate-ping opacity-25" />
                
                {/* Rotating radar sweep */}
                <motion.div
                  className="absolute inset-0 origin-center bg-gradient-to-tr from-blue-500/20 via-transparent to-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                />

                <div className="w-24 h-24 rounded-full border border-gray-700/60 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-gray-600 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3B82F6]" />
                  </div>
                </div>

                {/* Radar target blips */}
                <motion.div
                  className="absolute top-4 right-8 w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                />
                <motion.div
                  className="absolute bottom-6 left-6 w-2 h-2 rounded-full bg-blue-400"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 0.5 }}
                />
                <motion.div
                  className="absolute top-12 left-8 w-1.5 h-1.5 rounded-full bg-amber-400"
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-gray-400 border-t border-gray-800/60 pt-2">
                <span>Radius: 25 km active</span>
                <span className="text-emerald-400 font-medium">3 blips locked</span>
              </div>
            </div>

            <div className="px-1 pt-1">
              <h3 className="font-semibold text-sm text-ink">Geographic targeting</h3>
              <p className="text-xs text-muted mt-0.5">
                Continuous monitoring across your chosen radius.
              </p>
            </div>
          </div>

          {/* Feature 3 (5 cols): Auto-sorting priority queue with layout spring physics */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between gap-4 min-h-[320px]">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-blue-600" />
                  <span className="text-ink font-semibold">Priority deal queue</span>
                </div>
                <span className="text-muted text-[11px]">Real-time sorting</span>
              </div>

              <div className="flex flex-col gap-2 my-1">
                {leadsList.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-muted w-4 font-mono">
                        {idx + 1}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-ink truncate max-w-[150px]">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-blue-600 font-medium">
                          {item.gap}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 border border-blue-200 text-blue-700 font-mono tabular-nums">
                      {item.score}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-[11px] text-muted border-t border-gray-200 pt-2 flex justify-between">
                <span>Auto-weighted by closing signals</span>
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live ranking
                </span>
              </div>
            </div>

            <div className="px-1 pt-1">
              <h3 className="font-semibold text-sm text-ink">Smart prioritization</h3>
              <p className="text-xs text-muted mt-0.5">
                Leads re-sort in real-time by highest closing probability.
              </p>
            </div>
          </div>

          {/* Feature 4 (7 cols): Data stream — light */}
          <div className="lg:col-span-7 flex flex-col gap-2">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between gap-4 min-h-[320px] overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 text-xs">
                <span className="text-ink font-semibold">Multi-market feed</span>
                <span className="text-emerald-600 font-medium text-[11px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Streaming active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
                {liveTicker.map((t) => (
                  <motion.div
                    key={t.name}
                    whileHover={{ scale: 1.02 }}
                    className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex flex-col gap-1.5 transition-shadow hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted">{t.city}</span>
                      <span className="text-blue-600 font-semibold font-mono">{t.score}</span>
                    </div>
                    <span className="font-semibold text-xs text-ink truncate">{t.name}</span>
                    <span className="text-[10px] text-muted">{t.gap}</span>
                  </motion.div>
                ))}
              </div>

              <div className="text-[11px] text-muted border-t border-gray-200 pt-2 flex justify-between">
                <span>SMS dispatch via carrier gateways</span>
                <span className="text-ink font-medium">100% free SMTP delivery</span>
              </div>
            </div>

            <div className="px-1 pt-1">
              <h3 className="font-semibold text-sm text-ink">Carrier SMS outreach</h3>
              <p className="text-xs text-muted mt-0.5">
                Direct email-to-SMS routing through AT&T, Verizon, and T-Mobile gateways.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
