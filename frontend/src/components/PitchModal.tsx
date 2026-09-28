import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Sparkles, Send } from 'lucide-react';
import { Lead, OutreachPitch } from '../types';
import { generateOutreachPitch } from '../api/graphqlClient';

interface PitchModalProps {
  lead: Lead;
  onClose: () => void;
  onSendSmsPitch?: (id: string) => Promise<void>;
}

export const PitchModal: React.FC<PitchModalProps> = ({ lead, onClose, onSendSmsPitch }) => {
  const [serviceType, setServiceType] = useState<string>('Web Development');
  const [pitch, setPitch] = useState<OutreachPitch | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [sendingSms, setSendingSms] = useState<boolean>(false);

  const handleAutoSendSms = async () => {
    if (!onSendSmsPitch) return;
    setSendingSms(true);
    try {
      await onSendSmsPitch(lead.id);
      alert(`Automated SMS pitch dispatched to carrier gateways for ${lead.name}`);
    } catch (err) {
      alert(`Error sending SMS: ${err}`);
    } finally {
      setSendingSms(false);
    }
  };

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
        subject: `Website opportunity for ${lead.name}`,
        body: `Hi ${lead.name} team,\n\nI was looking up top local businesses in ${
          lead.address || 'your area'
        } and came across your Google listing.\n\n` +
        `I specialize in clean, high-performing websites and local SEO for businesses in your field. ${
          !lead.website ? 'Having a dedicated responsive website could significantly increase your direct customer calls and search visibility.' : 'Improving your mobile page speed and local review capture can boost your Google Maps ranking.'
        }\n\nWould you be open to a 5-minute chat or brief walkthrough on how to set this up?\n\nBest regards,\nFreelance Lead Intelligence Team`,
        keyHighlights: [
          'No website detected',
          'Mobile presence opportunity',
          'Local search visibility',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-xl p-6 flex flex-col gap-5 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-950">
                Outreach pitch generator
              </h2>
              <p className="text-xs text-gray-500">
                Tailored outreach for <span className="font-medium text-gray-900">{lead.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pitch Service Type Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">Angle:</span>
          {['Web Development', 'SEO & Reputation', 'Review Automation'].map((type) => (
            <button
              key={type}
              onClick={() => setServiceType(type)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                serviceType === type
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Pitch Content Box */}
        {loading ? (
          <div className="p-12 text-center bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-xs animate-pulse">
            Generating outreach pitch...
          </div>
        ) : pitch ? (
          <div className="flex flex-col gap-3">
            {/* Subject Line */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-900 flex items-center justify-between gap-2">
              <div>
                <span className="font-medium text-gray-500">Subject: </span>
                <span className="font-semibold text-gray-950">{pitch.subject}</span>
              </div>
              {lead.email && (
                <a
                  href={`mailto:${lead.email}?subject=${encodeURIComponent(pitch.subject)}&body=${encodeURIComponent(pitch.body)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded text-xs transition-colors shrink-0"
                >
                  <Send size={11} />
                  <span>Send to email</span>
                </a>
              )}
            </div>

            {/* Email Body */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs text-gray-800 leading-relaxed whitespace-pre-wrap max-h-[240px] overflow-y-auto">
              {pitch.body}
            </div>

            {/* Key Pitch Highlights */}
            {pitch.keyHighlights && pitch.keyHighlights.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-gray-500">
                  Opportunity signals:
                </span>
                {pitch.keyHighlights.map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200 rounded"
                  >
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : null}

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-1">
          <span className="text-xs text-gray-500">
            Copy pitch for direct email or LinkedIn message
          </span>

          <div className="flex items-center gap-2">
            {lead.phone && onSendSmsPitch && (
              <button
                onClick={handleAutoSendSms}
                disabled={sendingSms || lead.lineType === 'LANDLINE' || lead.lineType === 'VOIP' || lead.opportunityTags?.includes('LANDLINE_NUMBER')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  lead.lineType === 'LANDLINE' || lead.lineType === 'VOIP' || lead.opportunityTags?.includes('LANDLINE_NUMBER')
                    ? 'SMS disabled: phone number is a landline'
                    : 'Dispatch automated SMS'
                }
              >
                <Send size={13} />
                <span>
                  {sendingSms
                    ? 'Sending SMS...'
                    : lead.lineType === 'LANDLINE' || lead.lineType === 'VOIP' || lead.opportunityTags?.includes('LANDLINE_NUMBER')
                    ? 'Landline'
                    : 'Send SMS'}
                </span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg border border-gray-200 transition-colors"
            >
              Close
            </button>

            <button
              onClick={handleCopy}
              disabled={!pitch || loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy pitch'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
