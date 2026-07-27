import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './models/lead.model';
import { ScrapedLeadInput, SyncLeadsInput, UpdateLeadStatusInput } from './dto/sync-leads.input';
import { LeadFilterInput, PaginationInput } from './dto/lead-filter.input';
import { LeadStats, SyncLeadsResult } from './dto/lead-stats.object';

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

  async syncScrapedLeads(input: SyncLeadsInput): Promise<SyncLeadsResult> {
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
      const queryFilter = scrapedLead.address
        ? { name: scrapedLead.name.trim(), address: scrapedLead.address.trim() }
        : scrapedLead.phone
        ? { name: scrapedLead.name.trim(), phone: scrapedLead.phone.trim() }
        : { name: scrapedLead.name.trim() };

      const existingLead = await this.leadModel.findOne(queryFilter);

      // Preserve existing website if incoming scrapedLead has null
      const finalWebsite = cleanWebsite || existingLead?.website || null;
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
      };

      if (existingLead) {
        await this.leadModel.updateOne({ _id: existingLead._id }, { $set: updateData });
        updatedCount++;
      } else {
        await this.leadModel.create({
          ...updateData,
          status: 'NEW',
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

  async findAll(filter?: LeadFilterInput, pagination?: PaginationInput) {
    const conditions: any[] = [];

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
    }

    const mongoQuery = conditions.length > 0 ? { $and: conditions } : {};

    const page = pagination?.page || 1;
    const limit = pagination?.limit || 15;
    const skip = (page - 1) * limit;

    const sortBy = pagination?.sortBy || 'opportunityScore';
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

  async findOne(id: string): Promise<Lead> {
    return this.leadModel.findById(id).exec();
  }

  async updateStatus(input: UpdateLeadStatusInput): Promise<Lead> {
    return this.leadModel
      .findByIdAndUpdate(
        input.id,
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

  async deleteLead(id: string): Promise<boolean> {
    const res = await this.leadModel.findByIdAndDelete(id).exec();
    return !!res;
  }

  async getStats(): Promise<LeadStats> {
    const totalLeads = await this.leadModel.countDocuments().exec();
    const noWebsiteCount = await this.leadModel.countDocuments({
      $or: [{ website: null }, { website: '' }],
    }).exec();

    const lowRatingCount = await this.leadModel.countDocuments({
      rating: { $gt: 0, $lt: 4.0 },
    }).exec();

    const lowReviewsCount = await this.leadModel.countDocuments({
      reviewCount: { $lt: 15 },
    }).exec();

    const highPriorityLeadsCount = await this.leadModel.countDocuments({
      opportunityScore: { $gte: 60 },
    }).exec();

    let avgOpportunityScore = 0;
    try {
      const avgScoreResult = await this.leadModel.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$opportunityScore' } } },
      ]).exec();
      avgOpportunityScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;
    } catch (err) {
      // Fallback in case MongoDB instance restricts aggregate command or requires auth for aggregate
      const leads = await this.leadModel.find({}, { opportunityScore: 1 }).lean().exec();
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

  async updateEmail(id: string, email: string, emailSource?: string): Promise<Lead> {
    const lead = await this.leadModel.findById(id).exec();
    if (!lead) {
      throw new Error(`Lead with ID ${id} not found`);
    }
    lead.email = email;
    if (emailSource) lead.emailSource = emailSource;
    return lead.save();
  }
}
