export interface Lead {
  id: string;
  name: string;
  category?: string;
  address?: string;
  phone?: string;
  website?: string;
  email?: string;
  emailSource?: string;
  rating?: number;
  reviewCount?: number;
  googleMapsUrl?: string;
  opportunityScore: number;
  opportunityTags: string[];
  searchQuery?: string;
  status: 'NEW' | 'CONTACTED' | 'IN_PROGRESS' | 'CLOSED';
  notes?: string;
  carrier?: string;
  lineType?: 'MOBILE' | 'LANDLINE' | 'VOIP' | 'UNKNOWN';
  createdAt: string;
}

export interface LeadStats {
  totalLeads: number;
  noWebsiteCount: number;
  lowRatingCount: number;
  lowReviewsCount: number;
  avgOpportunityScore: number;
  highPriorityLeadsCount: number;
}

export interface OutreachPitch {
  leadId: string;
  businessName: string;
  serviceType: string;
  subject: string;
  body: string;
  keyHighlights: string[];
}
