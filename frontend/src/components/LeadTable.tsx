import React, { useState } from 'react';
import { Star, Globe, Phone, ExternalLink, Mail, Trash2, ChevronLeft, ChevronRight, Search, Loader2, Send, CheckSquare } from 'lucide-react';
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
      <div className="p-12 text-center bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="w-12 h-12 mx-auto mb-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
          <Globe size={22} />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">No leads found</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          No leads match your current search or filter criteria. Scrape new targets via the extension or clear active filters.
        </p>
      </div>
    );
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, totalCount);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Batch Actions Bar (Visible when rows are selected) */}
      {selectedLeadIds.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-900">
            <CheckSquare size={15} className="text-blue-600" />
            <span>{selectedLeadIds.length} leads selected for outreach</span>
          </div>
          <button
            onClick={handleBatchSend}
            disabled={batchSending}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-lg transition-colors disabled:opacity-50"
          >
            {batchSending ? (
              <>
                <Loader2 size={13} className="animate-spin text-white" />
                <span>Sending SMS...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Send SMS to {selectedLeadIds.length} leads</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-medium uppercase tracking-wider text-gray-500">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedLeadIds.length > 0 && selectedLeadIds.length === leads.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </th>
              <th className="py-3 px-4">Business</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Gaps</th>
              <th className="py-3 px-4">Score</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {leads.map((lead) => {
              const hasNoWebsite = !lead.website || lead.website.trim() === '';
              const isSelected = selectedLeadIds.includes(lead.id);
              const scoreColor =
                lead.opportunityScore >= 70
                  ? 'bg-emerald-600'
                  : lead.opportunityScore >= 40
                  ? 'bg-blue-600'
                  : 'bg-gray-400';

              const pitchText = generateSmsPitchText(lead.name, lead.category, lead.address, lead.rating);
              const mailtoSmsUrl = lead.phone ? generateMailtoLink(lead.phone, pitchText) : '#';

              return (
                <tr
                  key={lead.id}
                  className={`transition-colors ${
                    isSelected ? 'bg-blue-50/50' : 'hover:bg-gray-50/60'
                  }`}
                >
                  {/* Select Checkbox */}
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectRow(lead.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </td>

                  {/* Business Name & Category */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-950 text-xs">{lead.name}</span>
                      <span className="text-[11px] text-gray-500 mt-0.5">{lead.category || 'Local business'}</span>
                      {lead.address && <span className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{lead.address}</span>}
                    </div>
                  </td>

                  {/* Contact & Website */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1 text-xs">
                      {lead.phone ? (
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-gray-700">
                            <Phone size={11} className="text-gray-400 shrink-0" />
                            {lead.phone}
                          </span>
                          {lead.lineType === 'LANDLINE' || lead.lineType === 'VOIP' || lead.opportunityTags?.includes('LANDLINE_NUMBER') ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                              Landline
                            </span>
                          ) : lead.lineType === 'MOBILE' ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Mobile
                            </span>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-[11px]">No phone</span>
                      )}

                      {!hasNoWebsite && lead.website ? (
                        <a
                          href={lead.website}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[180px] text-[11px]"
                        >
                          <Globe size={11} className="shrink-0 text-gray-400" />
                          <span className="truncate">{(lead.website || '').replace(/^https?:\/\/(www\.)?/, '')}</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 w-max">
                          No website
                        </span>
                      )}

                      {/* Email Discovery */}
                      {lead.email ? (
                        <div className="flex items-center gap-1">
                          <a
                            href={`mailto:${lead.email}`}
                            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium hover:underline truncate max-w-[160px] text-[11px]"
                            title={lead.email}
                          >
                            <Mail size={11} className="shrink-0 text-emerald-600" />
                            <span className="truncate">{lead.email}</span>
                          </a>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleFindEmail(lead.id)}
                          disabled={findingEmailId === lead.id}
                          className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-500 hover:text-gray-800 w-max"
                        >
                          {findingEmailId === lead.id ? (
                            <>
                              <Loader2 size={10} className="animate-spin text-gray-400" />
                              <span>Searching...</span>
                            </>
                          ) : (
                            <>
                              <Search size={10} className="text-gray-400" />
                              <span>Find email</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Rating & Reviews */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Star size={13} className="text-amber-500 fill-amber-500 shrink-0" />
                      <span className="font-semibold text-gray-900 text-xs">{lead.rating || 'N/A'}</span>
                      <span className="text-[11px] text-gray-400">
                        ({lead.reviewCount !== null && lead.reviewCount !== undefined ? `${lead.reviewCount}` : '0'})
                      </span>
                    </div>
                  </td>

                  {/* Opportunity Signals */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {hasNoWebsite && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded">
                          No site
                        </span>
                      )}
                      {lead.rating && lead.rating < 4.0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-rose-50 text-rose-800 border border-rose-200 rounded">
                          &lt;4.0 rating
                        </span>
                      )}
                      {lead.reviewCount !== undefined && lead.reviewCount < 15 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-purple-50 text-purple-800 border border-purple-200 rounded">
                          Few reviews
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Lead Score Bar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <span className="font-medium text-xs text-gray-900 w-5 text-right tabular-nums">
                        {lead.opportunityScore}
                      </span>
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${scoreColor} rounded-full transition-all duration-300`}
                          style={{ width: `${lead.opportunityScore}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="py-3 px-4">
                    <select
                      value={lead.status}
                      onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                      className="bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg px-2 py-1 outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="NEW">New</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="IN_PROGRESS">In progress</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Automated Backend SMS Pitch */}
                      {lead.phone && (
                        <button
                          onClick={() => handleAutoSendSms(lead.id)}
                          disabled={sendingSmsId === lead.id || lead.lineType === 'LANDLINE' || lead.lineType === 'VOIP' || lead.opportunityTags?.includes('LANDLINE_NUMBER')}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title={
                            lead.lineType === 'LANDLINE' || lead.lineType === 'VOIP' || lead.opportunityTags?.includes('LANDLINE_NUMBER')
                              ? 'SMS disabled: landline number'
                              : 'Dispatch automated SMS'
                          }
                        >
                          {sendingSmsId === lead.id ? (
                            <Loader2 size={11} className="animate-spin text-white" />
                          ) : (
                            <Send size={11} />
                          )}
                          <span>SMS</span>
                        </button>
                      )}

                      {/* Manual Gmail SMS */}
                      {lead.phone && (
                        <a
                          href={mailtoSmsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium rounded-lg transition-colors border border-gray-200"
                          title="Open mail client for SMS gateway"
                        >
                          <Mail size={11} className="text-gray-500" />
                          <span>Gmail</span>
                        </a>
                      )}

                      {/* Pitch Generator Button */}
                      <button
                        onClick={() => onOpenPitch(lead)}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        <Mail size={11} />
                        <span>Pitch</span>
                      </button>

                      {/* Google Maps Link */}
                      {lead.googleMapsUrl && (
                        <a
                          href={lead.googleMapsUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View on Google Maps"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}

                      {/* Delete Lead */}
                      <button
                        onClick={() => onDeleteLead(lead.id)}
                        className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete lead"
                      >
                        <Trash2 size={13} />
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
      <div className="bg-gray-50/80 border-t border-gray-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-4">
          <span>
            Showing <strong className="text-gray-900 font-medium">{startItem}</strong> to{' '}
            <strong className="text-gray-900 font-medium">{endItem}</strong> of{' '}
            <strong className="text-gray-900 font-medium">{totalCount}</strong> leads
          </span>

          <div className="flex items-center gap-1.5">
            <span>Rows:</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-white border border-gray-200 text-gray-700 font-medium rounded px-2 py-0.5 text-xs outline-none focus:border-blue-500 cursor-pointer"
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
            className="p-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="font-medium text-gray-700 px-1">
            Page {page} of {totalPages}
          </span>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="p-1.5 rounded-lg bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 disabled:opacity-40 disabled:hover:bg-white transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
