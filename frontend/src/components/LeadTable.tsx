import React, { useState } from 'react';
import { Star, Globe, Phone, ExternalLink, Mail, Trash2, ChevronLeft, ChevronRight, Search, Loader2, Send, CheckSquare, Square } from 'lucide-react';
import { Lead } from '../types';
import { generateMailtoLink, generateSmsPitchText } from '../utils/smsGateway';

interface LeadTableProps {
  leads: Lead[];
  totalCount: number;
  page: number;
  totalPages: number;
  limit: number;
  loading?: boolean;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onOpenPitch: (lead: Lead) => void;
  onUpdateStatus: (id: string, status: string) => void;
  onDeleteLead: (id: string) => void;
  onFindEmail?: (id: string) => Promise<void>;
  onSendSmsPitch?: (id: string) => Promise<void>;
  onBatchSendSmsPitches?: (ids: string[]) => Promise<void>;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  totalCount,
  page,
  totalPages,
  limit,
  loading,
  onPageChange,
  onLimitChange,
  onOpenPitch,
  onUpdateStatus,
  onDeleteLead,
  onFindEmail,
  onSendSmsPitch,
  onBatchSendSmsPitches,
}) => {
  const [findingEmailId, setFindingEmailId] = useState<string | null>(null);
  const [sendingSmsId, setSendingSmsId] = useState<string | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [batchSending, setBatchSending] = useState<boolean>(false);

  const handleFindEmail = async (id: string) => {
    if (!onFindEmail) return;
    setFindingEmailId(id);
    try {
      await onFindEmail(id);
    } finally {
      setFindingEmailId(null);
    }
  };

  const handleAutoSendSms = async (id: string) => {
    if (!onSendSmsPitch) return;
    setSendingSmsId(id);
    try {
      await onSendSmsPitch(id);
    } finally {
      setSendingSmsId(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    if (selectedLeadIds.includes(id)) {
      setSelectedLeadIds(selectedLeadIds.filter((item) => item !== id));
    } else {
      setSelectedLeadIds([...selectedLeadIds, id]);
    }
  };

  const handleBatchSend = async () => {
    if (!onBatchSendSmsPitches || selectedLeadIds.length === 0) return;
    setBatchSending(true);
    try {
      await onBatchSendSmsPitches(selectedLeadIds);
      setSelectedLeadIds([]);
    } finally {
      setBatchSending(false);
    }
  };

  if (leads.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg">
        <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/80 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400">
          <Globe size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-200 mb-1">No Leads Found</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          No leads match your current search or filter criteria. Use the Chrome Extension on Google Maps to scrape new targets or reset your filters!
        </p>
      </div>
    );
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Batch Actions Bar (Visible when rows are selected) */}
      {selectedLeadIds.length > 0 && (
        <div className="bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border-b border-blue-500/30 px-6 py-3 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-200">
            <CheckSquare size={16} className="text-blue-400" />
            <span>{selectedLeadIds.length} Leads Selected for Automated Email-to-SMS Dispatch</span>
          </div>
          <button
            onClick={handleBatchSend}
            disabled={batchSending}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {batchSending ? (
              <>
                <Loader2 size={14} className="animate-spin text-white" />
                <span>Sending Batch SMS...</span>
              </>
            ) : (
              <>
                <Send size={14} />
                <span>Auto-Send SMS to {selectedLeadIds.length} Selected Leads</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-white/10 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-4 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedLeadIds.length > 0 && selectedLeadIds.length === leads.length}
                  onChange={toggleSelectAll}
                  className="rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-4 px-5">Business Name &amp; Category</th>
              <th className="py-4 px-5">Contact &amp; Website</th>
              <th className="py-4 px-5">Rating &amp; Reviews</th>
              <th className="py-4 px-5">Opportunity Signals</th>
              <th className="py-4 px-5">Score</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-sm">
            {leads.map((lead) => {
              const hasNoWebsite = !lead.website || lead.website.trim() === '';
              const isSelected = selectedLeadIds.includes(lead.id);
              const scoreColor =
                lead.opportunityScore >= 70
                  ? 'from-amber-400 to-emerald-400 text-emerald-400'
                  : lead.opportunityScore >= 40
                  ? 'from-blue-500 to-indigo-500 text-blue-400'
                  : 'from-slate-600 to-slate-500 text-slate-400';

              const pitchText = generateSmsPitchText(lead.name, lead.category, lead.address, lead.rating);
              const mailtoSmsUrl = lead.phone ? generateMailtoLink(lead.phone, pitchText) : '#';

              return (
                <tr
                  key={lead.id}
                  className={`transition-colors ${
                    isSelected ? 'bg-blue-900/20' : 'hover:bg-slate-800/40'
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-3.5 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(lead.id)}
                      className="rounded border-white/20 bg-slate-900 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* Business Name & Category */}
                  <td className="py-3.5 px-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-100 text-sm leading-snug">{lead.name}</span>
                      <span className="text-xs text-blue-400 font-medium mt-0.5">{lead.category || 'Local Business'}</span>
                      {lead.address && <span className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{lead.address}</span>}
                    </div>
                  </td>

                  {/* Contact & Website */}
                  <td className="py-3.5 px-5">
                    <div className="flex flex-col gap-1.5 text-xs">
                      {lead.phone ? (
                        <span className="inline-flex items-center gap-1.5 text-slate-200 font-medium">
                          <Phone size={12} className="text-blue-400 shrink-0" />
                          {lead.phone}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">No Phone</span>
                      )}

                      {!hasNoWebsite && lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium hover:underline truncate max-w-[200px]"
                        >
                          <Globe size={12} className="shrink-0" />
                          <span className="truncate">{(lead.website || '').replace(/^https?:\/\/(www\.)?/, '')}</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/15 text-amber-300 border border-amber-500/30 w-max">
                          NO WEBSITE
                        </span>
                      )}

                      {/* Email OSINT Discovery */}
                      {lead.email ? (
                        <div className="flex items-center gap-1 mt-0.5">
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold hover:underline truncate max-w-[180px] text-[11px]"
                            title={lead.email}
                          >
                            <Mail size={12} className="shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </a>
                          {lead.emailSource && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-white/5">
                              {lead.emailSource}
                            </span>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleFindEmail(lead.id)}
                          disabled={findingEmailId === lead.id}
                          className="inline-flex items-center gap-1 mt-0.5 px-2 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold transition-all disabled:opacity-50 w-max"
                        >
                          {findingEmailId === lead.id ? (
                            <>
                              <Loader2 size={10} className="animate-spin text-indigo-400" />
                              Finding Email...
                            </>
                          ) : (
                            <>
                              <Search size={10} className="text-indigo-400" />
                              Find Email
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Rating & Reviews */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-1.5">
                      <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />
                      <span className="font-extrabold text-slate-100 text-xs">{lead.rating || 'N/A'}</span>
                      <span className="text-[11px] text-slate-400">
                        ({lead.reviewCount !== null && lead.reviewCount !== undefined ? `${lead.reviewCount}` : '0'})
                      </span>
                    </div>
                  </td>

                  {/* Opportunity Signals */}
                  <td className="py-3.5 px-5">
                    <div className="flex flex-wrap gap-1">
                      {hasNoWebsite && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 rounded">
                          No Website
                        </span>
                      )}
                      {lead.rating && lead.rating < 4.0 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 rounded">
                          Low Rating
                        </span>
                      )}
                      {lead.reviewCount !== undefined && lead.reviewCount < 15 && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 rounded">
                          Few Reviews
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Lead Score Bar */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5 min-w-[100px]">
                      <span className="font-extrabold text-xs text-slate-200 w-6 text-right">
                        {lead.opportunityScore}
                      </span>
                      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${scoreColor} rounded-full transition-all duration-500`}
                          style={{ width: `${lead.opportunityScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3.5 px-5">
                    <select
                      value={lead.status}
                      onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                      className="bg-slate-950 border border-white/10 text-slate-200 text-xs font-bold rounded-lg px-2.5 py-1 outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="NEW">NEW</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Automated Backend SMS Pitch */}
                      {lead.phone && (
                        <button
                          onClick={() => handleAutoSendSms(lead.id)}
                          disabled={sendingSmsId === lead.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-50"
                          title="Automated Email-to-SMS via Backend SMTP"
                        >
                          {sendingSmsId === lead.id ? (
                            <Loader2 size={12} className="animate-spin text-white" />
                          ) : (
                            <Send size={12} />
                          )}
                          <span>Auto SMS</span>
                        </button>
                      )}

                      {/* Manual Gmail SMS Mailto Link */}
                      {lead.phone && (
                        <a
                          href={mailtoSmsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all border border-white/10"
                          title="Launch Gmail to Send Text via Email"
                        >
                          <Mail size={12} className="text-amber-400" />
                          <span>Gmail SMS</span>
                        </a>
                      )}

                      {/* Standard Pitch Button */}
                      <button
                        onClick={() => onOpenPitch(lead)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-sm active:scale-95"
                      >
                        <Mail size={12} />
                        <span>Pitch</span>
                      </button>

                      {/* Google Maps Link */}
                      {lead.googleMapsUrl && (
                        <a
                          href={lead.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          title="View on Google Maps"
                        >
                          <ExternalLink size={14} />
                        </a>
                      )}

                      {/* Delete Lead */}
                      <button
                        onClick={() => onDeleteLead(lead.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete Lead"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-950/80 border-t border-white/10 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span>
            Showing <strong className="text-slate-200">{startItem}</strong> to{' '}
            <strong className="text-slate-200">{endItem}</strong> of{' '}
            <strong className="text-slate-200">{totalCount}</strong> leads
          </span>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px]">Rows:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-slate-900 border border-white/10 text-slate-200 font-semibold rounded px-2 py-0.5 text-xs outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 transition-all"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="font-semibold text-slate-200 px-2">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:hover:bg-slate-800 transition-all"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
