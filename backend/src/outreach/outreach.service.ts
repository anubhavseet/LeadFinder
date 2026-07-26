import { Injectable, NotFoundException } from '@nestjs/common';
import { LeadsService } from '../leads/leads.service';
import { OutreachPitch } from './models/pitch.model';

@Injectable()
export class OutreachService {
  constructor(private readonly leadsService: LeadsService) {}

  async generatePitch(leadId: string, serviceType?: string): Promise<OutreachPitch> {
    const lead = await this.leadsService.findOne(leadId);
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const businessName = lead.name;
    const category = lead.category || 'local business';
    const address = lead.address ? `in ${lead.address.split(',')[1] || lead.address}` : 'locally';

    let subject = '';
    let body = '';
    let keyHighlights: string[] = [];
    const type = serviceType || (lead.opportunityTags.includes('NO_WEBSITE') ? 'web_design' : 'reputation_management');

    if (type === 'web_design' || lead.opportunityTags.includes('NO_WEBSITE')) {
      subject = `Quick question regarding ${businessName}'s online presence`;
      body = `Hi ${businessName} Team,

I was searching for top-rated ${category} businesses ${address} on Google Maps and noticed ${businessName} has great reviews, but I couldn't find a website link attached to your profile.

In today's market, over 75% of local customers check a business website before calling or visiting. Without a dedicated mobile-friendly site, you might be losing high-value clients to competitors.

I build fast, high-converting, modern websites for ${category} businesses that help convert Google Maps searchers into paying customers.

I created a quick 2-minute mockup concept tailored specifically for ${businessName}. 

Would you be open to seeing it this week?

Best regards,
Your Name | Freelance Web Designer & Developer`;

      keyHighlights = [
        `Highlighted missing website on Google Maps profile`,
        `Emphasized loss of 75%+ local customers searching online`,
        `Offered free low-friction 2-minute visual mockup concept`,
      ];
    } else if (type === 'reputation_management' || lead.opportunityTags.includes('LOW_RATING') || lead.opportunityTags.includes('FEW_REVIEWS')) {
      subject = `Idea to boost ${businessName}'s Google Maps ranking & reviews`;
      body = `Hi ${businessName} Team,

I recently came across ${businessName} while researching local ${category} providers. You have a solid presence, but I noticed your Google Maps review score (${lead.rating || 'N/A'} stars with ${lead.reviewCount || 0} reviews) leaves room to dominate your local market.

Top-ranked businesses on Google Maps get 5x more phone calls simply by having an automated system that collects 5-star Google reviews from happy customers on autopilot.

I help ${category} businesses setup automated review collectors and clean up negative feedback.

Would you be open to a 5-minute chat to see how we can get ${businessName} into the top 3 3-Pack results on Google Maps?

Best regards,
Your Name | Local SEO & Reputation Specialist`;

      keyHighlights = [
        `Referenced exact rating (${lead.rating || 'N/A'}) & review count (${lead.reviewCount || 0})`,
        `Targeted Google Maps 3-Pack ranking improvement`,
        `Offered automated review collection system`,
      ];
    } else {
      subject = `Growth opportunity for ${businessName}`;
      body = `Hi ${businessName} Team,

I found ${businessName} on Google Maps while analyzing high-potential ${category} businesses.

I specialize in helping local businesses upgrade their digital marketing, revamp their website experience, and automate client booking.

I'd love to share a free audit of your current digital footprint with actionable tips to increase your lead volume.

Are you available for a brief call tomorrow or Thursday?

Best regards,
Your Name | Small Business Digital Consultant`;

      keyHighlights = [
        `General small business digital audit pitch`,
        `Focus on client acquisition & booking automation`,
      ];
    }

    return {
      leadId,
      businessName,
      serviceType: type,
      subject,
      body,
      keyHighlights,
    };
  }
}
