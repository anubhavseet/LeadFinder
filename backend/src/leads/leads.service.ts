import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './models/lead.model';
import { ScrapedLeadInput, SyncLeadsInput, UpdateLeadStatusInput, SaveScraperConfigInput } from './dto/sync-leads.input';
import { LeadFilterInput, PaginationInput } from './dto/lead-filter.input';
import { LeadStats, SyncLeadsResult, ScraperConfig } from './dto/lead-stats.object';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
  ) {}

  /**
   * Opportunity Scoring Logic (0-100 score):
   * - No website: +45 points (Huge website design / web dev freelancing opportunity)
   * - Rating < 4.0: +20 points (Reputation management / SEO pitch)
   * - Review count < 15: +15 points (Local SEO / Google Review automation)
   * - Missing phone: +10 points
   * - Category present: +10 points
   */
  calculateOpportunityScore(lead: ScrapedLeadInput): { score: number; tags: string[] } {
    let score = 0;
    const tags: string[] = [];

    const hasNoWebsite = !lead.website || lead.website.trim() === '' || lead.website.toLowerCase().includes('google.com/maps');
    if (hasNoWebsite) {
      score += 45;
      tags.push('NO_WEBSITE');
    }

    if (lead.rating !== undefined && lead.rating !== null && lead.rating > 0 && lead.rating < 4.0) {
      score += 20;
      tags.push('LOW_RATING');
    }

    if (lead.reviewCount !== undefined && lead.reviewCount !== null && lead.reviewCount < 15) {
      score += 15;
      tags.push('FEW_REVIEWS');
    }

    if (!lead.phone || lead.phone.trim() === '') {
      score += 10;
      tags.push('NO_PHONE');
    }

    if (lead.category) {
      score += 10;
    }

    return {
      score: Math.min(100, score),
      tags,
    };
  }

  /**
   * OSINT Search to discover official website for a local business
   */
  async discoverOfficialWebsite(name: string, address?: string): Promise<string | null> {
    const location = address ? address.replace(/[\d+#]+/g, '').trim() : '';
    const query = `"${name}" ${location}`;
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (!res.ok) return null;
      const html = await res.text();

      const urlMatches = html.match(/href="([^"]+)"/gi) || [];
      const excludedDomains = [
        'google.', 'facebook.', 'yelp.', 'yellowpages.', 'instagram.', 'mapquest.',
        'tripadvisor.', 'bbb.org', 'linkedin.', 'twitter.', 'apple.com', 'nextdoor.',
        'chamberofcommerce.', 'merchantcircle.', 'manta.', 'duckduckgo.', 'w3.org',
        'youtube.', 'wikipedia.', 'groupon.', 'thumbtack.', 'angis.', 'houzz.'
      ];

      for (const m of urlMatches) {
        const rawHref = m.replace(/^href="/i, '').replace(/"$/, '');
        let target = rawHref;
        if (target.includes('/url?q=')) {
          const match = target.match(/[?&]q=([^&]+)/);
          if (match && match[1]) target = decodeURIComponent(match[1]);
        }

        if (target.startsWith('http://') || target.startsWith('https://')) {
          const lower = target.toLowerCase();
          if (!excludedDomains.some((ex) => lower.includes(ex))) {
            return target;
          }
        }
      }
    } catch (e) {
      // Ignore OSINT search errors
    }
    return null;
  }

  async syncScrapedLeads(input: SyncLeadsInput, userId?: string): Promise<SyncLeadsResult> {
    let addedCount = 0;
    let updatedCount = 0;

    for (const scrapedLead of input.leads) {
      if (!scrapedLead.name || scrapedLead.name.trim() === '') continue;

      // Clean & Decode website URL
      let cleanWebsite: string | null = null;
      if (scrapedLead.website) {
        let web = scrapedLead.website.trim();
        if (web.includes('google.com/url?') || web.includes('google.com/url')) {
          try {
            const urlObj = new URL(web.startsWith('http') ? web : 'https://www.google.com' + web);
            const targetQ = urlObj.searchParams.get('q');
            if (targetQ && !targetQ.includes('google.com/maps') && !targetQ.includes('google.com/search')) {
              web = targetQ;
            }
          } catch (e) {
            // Keep original string if parsing fails
          }
        }
        if (!web.toLowerCase().includes('google.com/maps') && !web.toLowerCase().includes('google.com/search')) {
          cleanWebsite = web;
        }
      }

      // Unique identifier query: match by exact name and address, or phone number if address missing
      const baseFilter = scrapedLead.address
        ? { name: scrapedLead.name.trim(), address: scrapedLead.address.trim() }
        : scrapedLead.phone
        ? { name: scrapedLead.name.trim(), phone: scrapedLead.phone.trim() }
        : { name: scrapedLead.name.trim() };

      const queryFilter = userId ? { ...baseFilter, userId } : baseFilter;

      const existingLead = await this.leadModel.findOne(queryFilter);
      const finalWebsite = cleanWebsite || existingLead?.website || null;

      // APPLY SELECTED FILTERS ON BACKEND SAVE
      if (input.filterOptions) {
        const filters = input.filterOptions;

        // Filter 1: No Website Only -> If lead has a website, skip saving!
        if (filters.noWebsiteOnly && finalWebsite && finalWebsite.trim() !== '') {
          continue;
        }

        // Filter 2: Must Have Phone -> If missing phone, skip saving!
        if (filters.mustHavePhone && (!scrapedLead.phone || scrapedLead.phone.trim() === '')) {
          continue;
        }

        // Filter 3: Max Rating Cap
        if (filters.maxRating && filters.maxRating !== 'any') {
          const maxR = parseFloat(filters.maxRating);
          if (scrapedLead.rating !== undefined && scrapedLead.rating !== null && scrapedLead.rating > maxR) {
            continue;
          }
        }

        // Filter 4: Max Reviews Cap
        if (filters.maxReviews && filters.maxReviews !== 'any') {
          const maxRev = parseInt(filters.maxReviews, 10);
          if (scrapedLead.reviewCount !== undefined && scrapedLead.reviewCount !== null && scrapedLead.reviewCount > maxRev) {
            continue;
          }
        }
      }

      const finalLeadData: ScrapedLeadInput = {
        ...scrapedLead,
        website: finalWebsite || undefined,
      };

      const { score, tags } = this.calculateOpportunityScore(finalLeadData);

      const updateData = {
        name: scrapedLead.name.trim(),
        category: scrapedLead.category || existingLead?.category,
        address: scrapedLead.address || existingLead?.address,
        phone: scrapedLead.phone || existingLead?.phone,
        website: finalWebsite,
        rating: scrapedLead.rating !== undefined && scrapedLead.rating !== null ? scrapedLead.rating : existingLead?.rating,
        reviewCount: scrapedLead.reviewCount !== undefined && scrapedLead.reviewCount !== null ? scrapedLead.reviewCount : existingLead?.reviewCount,
        googleMapsUrl: scrapedLead.googleMapsUrl || existingLead?.googleMapsUrl,
        opportunityScore: score,
        opportunityTags: tags,
        searchQuery: scrapedLead.searchQuery || existingLead?.searchQuery,
        ...(userId ? { userId } : {}),
      };

      if (existingLead) {
        await this.leadModel.updateOne({ _id: existingLead._id }, { $set: updateData });
        updatedCount++;
      } else {
        await this.leadModel.create({
          ...updateData,
          status: 'NEW',
          userId: userId || null,
        });
        addedCount++;
      }

    }

    return {
      addedCount,
      updatedCount,
      totalProcessed: input.leads.length,
    };
  }

  /**
   * Run verification scan across all stored leads missing websites
   */
  async verifyAndCleanDatabaseWebsites(): Promise<{ checked: number; updatedCount: number }> {
    const noWebsiteLeads = await this.leadModel.find({
      $or: [{ website: null }, { website: '' }],
    }).exec();

    let updatedCount = 0;

    for (const lead of noWebsiteLeads) {
      const discoveredWebsite = await this.discoverOfficialWebsite(lead.name, lead.address);
      if (discoveredWebsite) {
        lead.website = discoveredWebsite;
        const { score, tags } = this.calculateOpportunityScore({
          name: lead.name,
          website: discoveredWebsite,
          rating: lead.rating,
          reviewCount: lead.reviewCount,
          phone: lead.phone,
          category: lead.category,
        });
        lead.opportunityScore = score;
        lead.opportunityTags = tags;
        await lead.save();
        updatedCount++;
      }
    }

    return { checked: noWebsiteLeads.length, updatedCount };
  }

  /**
   * Return lightweight normalized deduplication tokens (names, phones, composite keys)
   * for all leads owned by the user. Fast projection query with lean execution.
   */
  async getExistingLeadKeys(userId?: string): Promise<string[]> {
    const filter = userId ? { userId } : {};
    const leads = await this.leadModel
      .find(filter, { name: 1, phone: 1, address: 1 })
      .lean()
      .exec();

    const keys = new Set<string>();
    for (const l of leads) {
      if (l.name) {
        const cleanName = l.name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanName) {
          keys.add(`name:${cleanName}`);
          if (l.address) {
            const cleanAddr = l.address.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (cleanAddr) keys.add(`comp:${cleanName}_${cleanAddr}`);
          }
        }
      }
      if (l.phone) {
        const cleanPhone = l.phone.replace(/[^0-9]/g, '');
        if (cleanPhone.length >= 7) {
          keys.add(`phone:${cleanPhone}`);
          if (cleanPhone.length > 7) {
            keys.add(`phone:${cleanPhone.slice(-7)}`);
          }
        }
      }
    }
    return Array.from(keys);
  }

  async findAll(filter?: LeadFilterInput, pagination?: PaginationInput, userId?: string) {
    const conditions: any[] = [];

    if (userId) {
      conditions.push({ userId });
    }

    if (filter) {
      if (filter.search && filter.search.trim() !== '') {
        const s = filter.search.trim();
        const searchRegex = { $regex: s, $options: 'i' };
        conditions.push({
          $or: [
            { name: searchRegex },
            { category: searchRegex },
            { address: searchRegex },
          ],
        });
      }

      if (filter.category && filter.category.trim() !== '') {
        conditions.push({ category: { $regex: filter.category.trim(), $options: 'i' } });
      }

      if (filter.noWebsiteOnly) {
        conditions.push({
          $or: [
            { website: { $exists: false } },
            { website: null },
            { website: '' },
          ],
        });
      }

      if (filter.lowRatingOnly) {
        conditions.push({
          rating: { $ne: null, $gt: 0, $lt: 4.0 },
        });
      }

      if (filter.lowReviewsOnly) {
        conditions.push({ reviewCount: { $lt: 15 } });
      }

      if (filter.status && filter.status.trim() !== '') {
        conditions.push({ status: filter.status.trim() });
      }

      if (filter.minOpportunityScore !== undefined && filter.minOpportunityScore !== null) {
        conditions.push({ opportunityScore: { $gte: filter.minOpportunityScore } });
      }

      if (filter.hasPhone === true) {
        conditions.push({ phone: { $exists: true, $ne: null, $nin: ['', 'N/A'] } });
      } else if (filter.hasPhone === false) {
        conditions.push({ $or: [{ phone: { $exists: false } }, { phone: null }, { phone: '' }, { phone: 'N/A' }] });
      }

      if (filter.hasEmail === true) {
        conditions.push({ email: { $exists: true, $ne: null, $nin: ['', 'N/A'] } });
      } else if (filter.hasEmail === false) {
        conditions.push({ $or: [{ email: { $exists: false } }, { email: null }, { email: '' }] });
      }
    }


    const mongoQuery = conditions.length > 0 ? { $and: conditions } : {};

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 15;
    const skip = (page - 1) * limit;

    const sortBy = pagination?.sortBy || 'createdAt';
    const sortOrder = pagination?.sortOrder === 'ASC' ? 1 : -1;

    const [items, totalCount] = await Promise.all([
      this.leadModel
        .find(mongoQuery)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.leadModel.countDocuments(mongoQuery).exec(),
    ]);

    return {
      items,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit) || 1,
    };
  }

  async findOne(id: string, userId?: string): Promise<Lead> {
    const query = userId ? { _id: id, userId } : { _id: id };
    return this.leadModel.findOne(query).exec();
  }

  async updateStatus(input: UpdateLeadStatusInput, userId?: string): Promise<Lead> {
    const query = userId ? { _id: input.id, userId } : { _id: input.id };
    return this.leadModel
      .findOneAndUpdate(
        query,
        {
          $set: {
            status: input.status,
            ...(input.notes !== undefined ? { notes: input.notes } : {}),
          },
        },
        { new: true },
      )
      .exec();
  }

  async deleteLead(id: string, userId?: string): Promise<boolean> {
    const query = userId ? { _id: id, userId } : { _id: id };
    const res = await this.leadModel.findOneAndDelete(query).exec();
    return !!res;
  }

  async deleteLeads(ids: string[], userId?: string): Promise<number> {
    const query = userId ? { _id: { $in: ids }, userId } : { _id: { $in: ids } };
    const res = await this.leadModel.deleteMany(query).exec();
    return res.deletedCount || 0;
  }

  async getStats(userId?: string): Promise<LeadStats> {
    const userQuery = userId ? { userId } : {};

    const totalLeads = await this.leadModel.countDocuments(userQuery).exec();
    const noWebsiteCount = await this.leadModel.countDocuments({
      ...userQuery,
      $or: [{ website: null }, { website: '' }],
    }).exec();

    const lowRatingCount = await this.leadModel.countDocuments({
      ...userQuery,
      rating: { $gt: 0, $lt: 4.0 },
    }).exec();

    const lowReviewsCount = await this.leadModel.countDocuments({
      ...userQuery,
      reviewCount: { $lt: 15 },
    }).exec();

    const highPriorityLeadsCount = await this.leadModel.countDocuments({
      ...userQuery,
      opportunityScore: { $gte: 60 },
    }).exec();

    let avgOpportunityScore = 0;
    try {
      const matchStage = userId ? [{ $match: { userId } }] : [];
      const avgScoreResult = await this.leadModel.aggregate([
        ...matchStage,
        { $group: { _id: null, avgScore: { $avg: '$opportunityScore' } } },
      ]).exec();
      avgOpportunityScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;
    } catch (err) {
      // Fallback in case MongoDB instance restricts aggregate command or requires auth for aggregate
      const leads = await this.leadModel.find(userQuery, { opportunityScore: 1 }).lean().exec();

      if (leads.length > 0) {
        const sum = leads.reduce((acc, lead) => acc + (lead.opportunityScore || 0), 0);
        avgOpportunityScore = sum / leads.length;
      }
    }

    return {
      totalLeads,
      noWebsiteCount,
      lowRatingCount,
      lowReviewsCount,
      highPriorityLeadsCount,
      avgOpportunityScore: Math.round(avgOpportunityScore * 10) / 10,
    };
  }

  async updateEmail(id: string, email: string, emailSource?: string, userId?: string): Promise<Lead> {
    const query = userId ? { _id: id, userId } : { _id: id };
    const lead = await this.leadModel.findOne(query).exec();
    if (!lead) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    lead.email = email;
    if (emailSource) lead.emailSource = emailSource;
    return lead.save();
  }

  private currentScraperConfig: ScraperConfig = {
    maxLeads: 100,
    noWebsiteOnly: false,
    mustHavePhone: false,
    maxRating: 'any',
    maxReviews: 'any',
    autoStart: false,
  };

  getScraperConfig(): ScraperConfig {
    return this.currentScraperConfig;
  }

  saveScraperConfig(input: SaveScraperConfigInput): ScraperConfig {
    this.currentScraperConfig = {
      maxLeads: input.maxLeads !== undefined ? input.maxLeads : this.currentScraperConfig.maxLeads,
      noWebsiteOnly: input.noWebsiteOnly !== undefined ? input.noWebsiteOnly : this.currentScraperConfig.noWebsiteOnly,
      mustHavePhone: input.mustHavePhone !== undefined ? input.mustHavePhone : this.currentScraperConfig.mustHavePhone,
      maxRating: input.maxRating !== undefined ? input.maxRating : this.currentScraperConfig.maxRating,
      maxReviews: input.maxReviews !== undefined ? input.maxReviews : this.currentScraperConfig.maxReviews,
      autoStart: input.autoStart !== undefined ? input.autoStart : false,
    };
    return this.currentScraperConfig;
  }
}

