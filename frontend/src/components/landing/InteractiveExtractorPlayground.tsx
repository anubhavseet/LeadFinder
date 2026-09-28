import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RefreshCw, X, Copy, Check, Sparkles, ArrowRight, ExternalLink } from 'lucide-react';

interface MockListing {
  id: string;
  name: string;
  category: string;
  address: string;
  phone: string;
  website: string | null;
  rating: number;
  reviews: number;
  opportunityScore: number;
  tags: string[];
  carrier: string;
  lineType: string;
  pitchSubject: string;
  pitchBody: string;
}

const PRESET_MARKETS: Record<string, MockListing[]> = {
  'Austin, TX — Roofing': [
    {
      id: 'atx-1',
      name: 'Apex Precision Roofing & Gutters',
      category: 'Roofing Contractor',
      address: '1402 S Congress Ave, Austin, TX 78704',
      phone: '(512) 555-0198',
      website: null,
      rating: 3.8,
      reviews: 6,
      opportunityScore: 90,
      tags: ['NO_WEBSITE', 'LOW_RATING', 'FEW_REVIEWS'],
      carrier: 'Verizon Wireless',
      lineType: 'MOBILE',
      pitchSubject: 'Quick Website & Customer Inbound Opportunity for Apex Precision Roofing',
      pitchBody: 'Hi Apex Precision Team,\n\nI was looking up top residential roofing contractors in South Congress and noticed your Google listing has solid feedback, but no active mobile website.\n\nOver 78% of homeowners search on mobile for emergency roof inspections. Having a fast, high-converting one-page site with instant quote forms could double your weekly inbound calls.\n\nWould you be open to a 3-minute video walkthrough of a custom mock-up we made for Apex Precision?\n\nBest regards,\nLocal Growth Engineering Team',
    },
    {
      id: 'atx-2',
      name: 'Travis County Metal Roofers',
      category: 'Roofing Contractor',
      address: '810 Barton Springs Rd, Austin, TX 78704',
      phone: '(512) 555-4421',
      website: null,
      rating: 4.4,
      reviews: 9,
      opportunityScore: 70,
      tags: ['NO_WEBSITE', 'FEW_REVIEWS'],
      carrier: 'AT&T Mobility',
      lineType: 'MOBILE',
      pitchSubject: 'Digital Portfolio & Direct Estimate Portal for Travis County Metal Roofers',
      pitchBody: 'Hi Travis County Metal Roofers,\n\nYour 4.4-star reviews are impressive, but without a direct website link on Google Maps, prospective clients are clicking competitors right next to your pin.\n\nWe build high-speed commercial and metal roofing landing pages that turn searchers into scheduled estimates.\n\nCould we send over a preview link this afternoon?',
    },
    {
      id: 'atx-3',
      name: 'Hill Country Roof Restore',
      category: 'Roofing Contractor',
      address: '3201 E 7th St, Austin, TX 78702',
      phone: '(512) 555-9114',
      website: 'http://hillcountryrestore-old.tripod.com',
      rating: 3.3,
      reviews: 14,
      opportunityScore: 55,
      tags: ['LOW_RATING', 'FEW_REVIEWS'],
      carrier: 'T-Mobile USA',
      lineType: 'MOBILE',
      pitchSubject: 'Reputation Shield & Modern Mobile Redesign for Hill Country Roof Restore',
      pitchBody: 'Hi Hill Country Team,\n\nWe noticed your existing web link is unencrypted and not formatted for smartphones. With an automated 5-star review collector and refreshed mobile layout, your Google Maps rank can jump into the top 3.\n\nAre you available for a brief chat Thursday?',
    },
  ],
  'Miami, FL — Dentists': [
    {
      id: 'mia-1',
      name: 'Biscayne Bay Cosmetic Dentistry',
      category: 'Cosmetic Dentist',
      address: '1200 Brickell Ave, Miami, FL 33131',
      phone: '(305) 555-2244',
      website: null,
      rating: 3.9,
      reviews: 8,
      opportunityScore: 85,
      tags: ['NO_WEBSITE', 'LOW_RATING', 'FEW_REVIEWS'],
      carrier: 'AT&T Mobility',
      lineType: 'MOBILE',
      pitchSubject: 'High-Ticket Veneers & Implant Booking Page for Biscayne Bay Cosmetic',
      pitchBody: 'Hi Dr. Team at Biscayne Bay Cosmetic,\n\nHigh-value cosmetic dentistry patients in Brickell demand seamless online scheduling and before-and-after smile galleries. Your Google listing currently lacks a website link.\n\nWe engineer luxury dental landing pages that convert affluent patients on mobile.\n\nWould you like to see a custom smile gallery concept for your practice?',
    },
    {
      id: 'mia-2',
      name: 'Coral Gables Family Dental Studio',
      category: 'Dentist',
      address: '450 Miracle Mile, Coral Gables, FL 33134',
      phone: '(305) 555-8833',
      website: null,
      rating: 4.6,
      reviews: 12,
      opportunityScore: 70,
      tags: ['NO_WEBSITE', 'FEW_REVIEWS'],
      carrier: 'Verizon Wireless',
      lineType: 'MOBILE',
      pitchSubject: 'Online Patient Intake Portal for Coral Gables Family Dental',
      pitchBody: 'Hi Coral Gables Family Dental,\n\nYour 4.6-star patient satisfaction is fantastic. Adding a direct online appointment booking portal to your Google Maps profile can capture emergency weekend bookings effortlessly.\n\nOpen to reviewing our 2-minute demo?',
    },
  ],
  'Chicago, IL — Plumbers': [
    {
      id: 'chi-1',
      name: 'Wicker Park 24/7 Emergency Plumbing',
      category: 'Plumber',
      address: '1540 N Milwaukee Ave, Chicago, IL 60622',
      phone: '(312) 555-7790',
      website: null,
      rating: 3.7,
      reviews: 5,
      opportunityScore: 90,
      tags: ['NO_WEBSITE', 'LOW_RATING', 'FEW_REVIEWS'],
      carrier: 'T-Mobile USA',
      lineType: 'MOBILE',
      pitchSubject: '24/7 Emergency Dispatch Landing Page for Wicker Park Plumbing',
      pitchBody: 'Hi Wicker Park Plumbing Team,\n\nWhen a pipe bursts in freezing weather, homeowners tap the first Google Maps listing with a "Call Now" and instant dispatch button. Without a dedicated mobile landing page, you are losing high-ticket emergency calls.\n\nLet us show you a working prototype built specifically for Chicago emergency plumbers.',
    },
  ],
};

interface InteractiveExtractorPlaygroundProps {
  onLaunchCrm: () => void;
}

export const InteractiveExtractorPlayground: React.FC<InteractiveExtractorPlaygroundProps> = ({ onLaunchCrm }) => {
  const [selectedMarket, setSelectedMarket] = useState<string>('Austin, TX — Roofing');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedList, setExtractedList] = useState<MockListing[]>(PRESET_MARKETS['Austin, TX — Roofing']);
  const [noWebsiteOnly, setNoWebsiteOnly] = useState<boolean>(false);
  const [inspectedPitch, setInspectedPitch] = useState<MockListing | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const handleStartExtraction = () => {
    setIsExtracting(true);
    setExtractedList([]);
    setTimeout(() => {
      const fullList = PRESET_MARKETS[selectedMarket] || PRESET_MARKETS['Austin, TX — Roofing'];
      const filtered = noWebsiteOnly ? fullList.filter((l) => !l.website) : fullList;
      setExtractedList(filtered);
      setIsExtracting(false);
    }, 1100);
  };

  const handleCopyPitch = () => {
    if (!inspectedPitch) return;
    navigator.clipboard.writeText(`Subject: ${inspectedPitch.pitchSubject}\n\n${inspectedPitch.pitchBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="simulator" className="relative py-24 bg-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        {/* Section heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600">
              <Sparkles size={14} />
              <span>Interactive Scraper Engine Sandbox</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
              Test the extraction engine
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              Pick a market, run the crawler, and inspect the generated outreach pitch for each lead.
            </p>
          </div>

          <button
            onClick={onLaunchCrm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-ink hover:bg-gray-50 border border-gray-200 text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
          >
            <span>Open live CRM</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Console — dark interactive element */}
        <div className="bg-[#0D1117] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
          {/* Console toolbar */}
          <div className="bg-[#161B22] px-6 py-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 flex-wrap">
              {Object.keys(PRESET_MARKETS).map((market) => (
                <button
                  key={market}
                  onClick={() => {
                    setSelectedMarket(market);
                    const list = PRESET_MARKETS[market];
                    setExtractedList(noWebsiteOnly ? list.filter((l) => !l.website) : list);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedMarket === market
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-800/80 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                >
                  {market}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-gray-300 hover:text-white select-none text-xs">
                <input
                  type="checkbox"
                  checked={noWebsiteOnly}
                  onChange={(e) => {
                    setNoWebsiteOnly(e.target.checked);
                    const fullList = PRESET_MARKETS[selectedMarket];
                    setExtractedList(e.target.checked ? fullList.filter((l) => !l.website) : fullList);
                  }}
                  className="rounded bg-gray-800 border-gray-700 text-blue-600 focus:ring-0"
                />
                <span>Missing website only</span>
              </label>

              <button
                onClick={handleStartExtraction}
                disabled={isExtracting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <RefreshCw size={13} className={isExtracting ? 'animate-spin' : ''} />
                <span>{isExtracting ? 'Scraping DOM...' : 'Run extraction'}</span>
              </button>
            </div>
          </div>

          {/* Results table */}
          <div className="overflow-x-auto min-h-[220px]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D1117] border-b border-gray-800 text-[11px] text-gray-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-6 font-medium">Business entity</th>
                  <th className="py-3 px-6 font-medium">Opportunity gap</th>
                  <th className="py-3 px-6 font-medium">Contact & Carrier</th>
                  <th className="py-3 px-6 font-medium">Score</th>
                  <th className="py-3 px-6 text-right font-medium">Outreach action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-xs">
                {isExtracting ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-400">
                      <div className="inline-flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                        <span className="text-sm font-medium text-gray-300">
                          Intercepting Google Maps viewport nodes in {selectedMarket.split(' — ')[0]}...
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          Evaluating web status, carrier routing, and review delta
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {extractedList.map((lead, idx) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.08, duration: 0.3 }}
                        className="hover:bg-gray-900/60 transition-colors group"
                      >
                        <td className="py-4 px-6">
                          <div className="font-semibold text-gray-100 group-hover:text-blue-400 transition-colors text-sm">
                            {lead.name}
                          </div>
                          <div className="text-[11px] text-gray-400 mt-0.5">{lead.address}</div>
                        </td>

                        <td className="py-4 px-6">
                          {lead.website ? (
                            <span className="text-gray-400 truncate max-w-[200px] block">{lead.website}</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-semibold">
                              No website (+45)
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          <span className="text-gray-200 font-mono text-xs">{lead.phone}</span>
                          <div className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{lead.carrier}</span>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-2">
                            <span className="font-bold text-sm text-gray-100 font-mono">{lead.opportunityScore}</span>
                            <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${lead.opportunityScore}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => setInspectedPitch(lead)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-lg text-xs font-medium transition-all active:scale-[0.98]"
                          >
                            <span>Inspect pitch</span>
                            <ArrowRight size={12} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pitch modal */}
        <AnimatePresence>
          {inspectedPitch && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-ink">
                      Tailored outreach pitch
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      Target lead: <span className="font-medium text-ink">{inspectedPitch.name}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => setInspectedPitch(null)}
                    className="p-1.5 text-gray-400 hover:text-ink hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-xs text-muted">
                    Subject: <span className="text-ink font-semibold">{inspectedPitch.pitchSubject}</span>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs text-ink leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                    {inspectedPitch.pitchBody}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-muted">
                    Carrier route: <span className="text-ink font-medium">{inspectedPitch.carrier}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyPitch}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-ink text-xs font-medium rounded-lg border border-gray-200 transition-all active:scale-[0.98]"
                    >
                      {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setInspectedPitch(null);
                        onLaunchCrm();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all active:scale-[0.98]"
                    >
                      <span>Open in CRM</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
