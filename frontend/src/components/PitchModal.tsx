import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Sparkles, Send, Globe, Mail } from 'lucide-react';
import { Lead, OutreachPitch } from '../types';
import { generateOutreachPitch } from '../api/graphqlClient';

interface PitchModalProps {
  lead: Lead;
  onClose: () => void;
}

export const PitchModal: React.FC<PitchModalProps> = ({ lead, onClose }) => {
  const [serviceType, setServiceType] = useState<string>('Web Development');
  const [pitch, setPitch] = useState<OutreachPitch | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchPitch = async (type: string) => {
    setLoading(true);
    try {
      const res = await generateOutreachPitch(lead.id, type);
      setPitch(res);
    } catch (err) {
      console.warn('Backend pitch generation fallback:', err);
      // Fallback local generator if backend endpoint unreachable
      setPitch({
        leadId: lead.id,
        businessName: lead.name,
        serviceType: type,
        subject: `Quick Website & Digital Opportunity for ${lead.name}`,
        body: `Hi ${lead.name} Team,\n\nI was looking up top local businesses in ${
          lead.address || 'your area'
        } and noticed your Google listing.\n\n` +
        `I specialize in high-converting modern website design and local SEO automation. ${
          !lead.website ? 'Having a custom responsive website could instantly double your inbound calls and customer inquiries.' : 'Updating your site speed and review system can significantly boost your Google Maps ranking.'
        }\n\nWould you be open to a quick 5-minute chat or demo video on how we can implement this?\n\nBest regards,\nFreelance Lead Intelligence Team`,
        keyHighlights: [
          'No responsive website found',
          'Mobile optimization opportunity',
          'Google Review auto-responder pitch',
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPitch(serviceType);
  }, [lead.id, serviceType]);

  const handleCopy = () => {
    if (!pitch) return;
    const fullText = `Subject: ${pitch.subject}\n\n${pitch.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl shadow-blue-500/10 p-6 flex flex-col gap-5 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="font-display text-xl font-extrabold text-white">
                Outreach Pitch Generator
              </h2>
              <p className="text-xs text-slate-400">
                Tailored pitch for <span className="text-blue-400 font-semibold">{lead.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pitch Service Type Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Pitch Angle:</span>
          {['Web Development', 'SEO & Reputation', 'Review Automation'].map((type) => (
            <button
              key={type}
              onClick={() => setServiceType(type)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                serviceType === type
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                  : 'bg-slate-800 text-slate-400 border-white/10 hover:bg-slate-700 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Pitch Content Box */}
        {loading ? (
          <div className="p-12 text-center bg-slate-950/80 border border-white/10 rounded-xl text-slate-400 text-sm animate-pulse">
            Generating tailored outreach pitch...
          </div>
        ) : pitch ? (
          <div className="flex flex-col gap-3">
            {/* Subject Line */}
            <div className="p-3 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-slate-200 flex items-center justify-between gap-2">
              <div>
                <span className="font-bold text-slate-400">Subject: </span>
                <span className="font-medium text-white">{pitch.subject}</span>
              </div>
              {lead.email && (
                <a
                  href={`mailto:${lead.email}?subject=${encodeURIComponent(pitch.subject)}&body=${encodeURIComponent(pitch.body)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-all shrink-0 shadow-md shadow-emerald-600/30"
                >
                  <Send size={12} />
                  Send to {lead.email}
                </a>
              )}
            </div>

            {/* Email Body */}
            <div className="p-4 bg-slate-950/90 border border-white/10 rounded-xl font-mono text-xs text-slate-200 leading-relaxed whitespace-pre-wrap max-h-[260px] overflow-y-auto">
              {pitch.body}
            </div>

            {/* Key Pitch Highlights */}
            {pitch.keyHighlights && pitch.keyHighlights.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Signals:
                </span>
                {pitch.keyHighlights.map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-md"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-1">
          <span className="text-xs text-slate-400">
            Copy pitch to send via Email or LinkedIn
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-white/10 transition-all"
            >
              Close
            </button>

            <button
              onClick={handleCopy}
              disabled={!pitch || loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-600/30 active:scale-95"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Pitch'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
