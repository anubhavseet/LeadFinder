import { Lead, LeadStats, OutreachPitch } from '../types';

const GRAPHQL_ENDPOINT = 'http://localhost:4000/graphql';

export async function fetchGraphQL<T>(query: string, variables: Record<string, any> = {}): Promise<T> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (json.errors && json.errors.length > 0) {
    console.error('[GraphQL Error]', JSON.stringify(json.errors, null, 2));
    throw new Error(json.errors[0].message);
  }
  return json.data;
}

export interface PaginatedLeadsResult {
  items: Lead[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export async function getLeads(
  filter?: Record<string, any>,
  pagination?: { page?: number; limit?: number; sortBy?: string; sortOrder?: string }
): Promise<PaginatedLeadsResult> {
  // Build clean filter — only include keys with actual values
  const cleanFilter: Record<string, any> = {};
  let hasFilter = false;
  if (filter) {
    if (filter.search && filter.search.trim() !== '') {
      cleanFilter.search = filter.search.trim();
      hasFilter = true;
    }
    if (filter.noWebsiteOnly === true) {
      cleanFilter.noWebsiteOnly = true;
      hasFilter = true;
    }
    if (filter.lowRatingOnly === true) {
      cleanFilter.lowRatingOnly = true;
      hasFilter = true;
    }
    if (filter.status && filter.status.trim() !== '') {
      cleanFilter.status = filter.status.trim();
      hasFilter = true;
    }
    if (filter.minOpportunityScore !== undefined && filter.minOpportunityScore !== null) {
      cleanFilter.minOpportunityScore = filter.minOpportunityScore;
      hasFilter = true;
    }
    if (filter.category && filter.category.trim() !== '') {
      cleanFilter.category = filter.category.trim();
      hasFilter = true;
    }
    if (filter.lowReviewsOnly === true) {
      cleanFilter.lowReviewsOnly = true;
      hasFilter = true;
    }
  }

  // Build clean pagination object — sortOrder must be the enum value unquoted
  const paginationVars = {
    page: pagination?.page || 1,
    limit: pagination?.limit || 15,
    sortBy: pagination?.sortBy || 'opportunityScore',
    sortOrder: pagination?.sortOrder || 'DESC',
  };

  const query = `
    query GetLeads($filter: LeadFilterInput, $pagination: PaginationInput) {
      leads(filter: $filter, pagination: $pagination) {
        items {
          id
          name
          category
          address
          phone
          website
          email
          emailSource
          rating
          reviewCount
          googleMapsUrl
          opportunityScore
          opportunityTags
          searchQuery
          status
          notes
          createdAt
        }
        totalCount
        page
        totalPages
      }
    }
  `;

  try {
    const variables: Record<string, any> = {
      pagination: paginationVars,
    };
    // Only send filter if it has actual values — prevents empty {} from causing issues
    if (hasFilter) {
      variables.filter = cleanFilter;
    }

    const data = await fetchGraphQL<{ leads: PaginatedLeadsResult }>(query, variables);
    return data.leads;
  } catch (err) {
    console.warn('Backend fetch error:', err);
    // Fallback to localStorage
    const stored = localStorage.getItem('leadfinder_leads');
    if (stored) {
      const parsed: Lead[] = JSON.parse(stored);
      let filtered = parsed;
      if (hasFilter) {
        if (cleanFilter.search) {
          const s = cleanFilter.search.toLowerCase();
          filtered = filtered.filter(
            (l) =>
              (l.name && l.name.toLowerCase().includes(s)) ||
              (l.category && l.category.toLowerCase().includes(s)) ||
              (l.address && l.address.toLowerCase().includes(s))
          );
        }
        if (cleanFilter.noWebsiteOnly) {
          filtered = filtered.filter((l) => !l.website || l.website.trim() === '');
        }
        if (cleanFilter.lowRatingOnly) {
          filtered = filtered.filter((l) => l.rating != null && l.rating > 0 && l.rating < 4.0);
        }
        if (cleanFilter.status) {
          filtered = filtered.filter((l) => l.status === cleanFilter.status);
        }
        if (cleanFilter.minOpportunityScore != null) {
          filtered = filtered.filter((l) => (l.opportunityScore || 0) >= cleanFilter.minOpportunityScore);
        }
      }

      const limit = paginationVars.limit;
      const page = paginationVars.page;
      const start = (page - 1) * limit;
      return {
        items: filtered.slice(start, start + limit),
        totalCount: filtered.length,
        page,
        totalPages: Math.ceil(filtered.length / limit) || 1,
      };
    }
    return { items: [], totalCount: 0, page: 1, totalPages: 1 };
  }
}

export async function getLeadStats(): Promise<LeadStats> {
  const query = `
    query GetLeadStats {
      leadStats {
        totalLeads
        noWebsiteCount
        lowRatingCount
        lowReviewsCount
        avgOpportunityScore
        highPriorityLeadsCount
      }
    }
  `;

  try {
    const data = await fetchGraphQL<{ leadStats: LeadStats }>(query);
    return data.leadStats;
  } catch (err) {
    return {
      totalLeads: 0,
      noWebsiteCount: 0,
      lowRatingCount: 0,
      lowReviewsCount: 0,
      avgOpportunityScore: 0,
      highPriorityLeadsCount: 0,
    };
  }
}

export async function updateLeadStatus(id: string, status: string, notes?: string): Promise<Lead> {
  const query = `
    mutation UpdateLeadStatus($input: UpdateLeadStatusInput!) {
      updateLeadStatus(input: $input) {
        id
        status
        notes
      }
    }
  `;
  const data = await fetchGraphQL<{ updateLeadStatus: Lead }>(query, {
    input: { id, status, notes },
  });
  return data.updateLeadStatus;
}

export async function deleteLead(id: string): Promise<boolean> {
  const query = `
    mutation DeleteLead($id: ID!) {
      deleteLead(id: $id)
    }
  `;
  const data = await fetchGraphQL<{ deleteLead: boolean }>(query, { id });
  return data.deleteLead;
}

export async function generateOutreachPitch(leadId: string, serviceType?: string): Promise<OutreachPitch> {
  const query = `
    mutation GeneratePitch($leadId: ID!, $serviceType: String) {
      generatePitch(leadId: $leadId, serviceType: $serviceType) {
        leadId
        businessName
        serviceType
        subject
        body
        keyHighlights
      }
    }
  `;
  const data = await fetchGraphQL<{ generatePitch: OutreachPitch }>(query, { leadId, serviceType });
  return data.generatePitch;
}

export async function findEmailForLead(id: string): Promise<Lead> {
  const query = `
    mutation FindEmailForLead($id: ID!) {
      findEmailForLead(id: $id) {
        id
        name
        email
        emailSource
      }
    }
  `;
  const data = await fetchGraphQL<{ findEmailForLead: Lead }>(query, { id });
  return data.findEmailForLead;
}

export async function sendSmsPitchForLead(id: string): Promise<Lead> {
  const query = `
    mutation SendSmsPitchForLead($id: ID!) {
      sendSmsPitchForLead(id: $id) {
        id
        name
        status
        notes
      }
    }
  `;
  const data = await fetchGraphQL<{ sendSmsPitchForLead: Lead }>(query, { id });
  return data.sendSmsPitchForLead;
}

export async function batchSendSmsPitches(leadIds: string[]): Promise<{ updatedCount: number; totalProcessed: number }> {
  const query = `
    mutation BatchSendSmsPitches($leadIds: [ID!]!) {
      batchSendSmsPitches(leadIds: $leadIds) {
        updatedCount
        totalProcessed
      }
    }
  `;
  const data = await fetchGraphQL<{ batchSendSmsPitches: { updatedCount: number; totalProcessed: number } }>(query, { leadIds });
  return data.batchSendSmsPitches;
}
