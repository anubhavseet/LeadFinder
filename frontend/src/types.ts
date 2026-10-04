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

export type DashboardTab = 'crm' | 'engine' | 'intelligence' | 'pitches' | 'billing';

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  apiKey?: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  name?: string;
  avatar?: string;
  currentPassword?: string;
  newPassword?: string;
}
