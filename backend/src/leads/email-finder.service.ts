import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './models/lead.model';

@Injectable()
export class EmailFinderService {
  private readonly logger = new Logger(EmailFinderService.name);

  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
  ) {}

  /**
   * Search OSINT / Web sources for a business lead's contact email.
   * Particularly effective for local businesses without official websites.
   */
  async findEmailForLead(leadId: string): Promise<Lead> {
    const lead = await this.leadModel.findById(leadId).exec();
    if (!lead) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }

    if (lead.email) {
      this.logger.log(`Lead ${lead.name} already has email: ${lead.email}`);
      return lead;
    }

    const businessName = lead.name.trim();
    // Clean up address to get city/state if present
    const location = lead.address ? lead.address.replace(/[\d+#]+/g, '').trim() : '';

    this.logger.log(`Searching email for business: "${businessName}" location: "${location}"`);

    // 1. Formulate search queries
    const searchQueries = [
      `"${businessName}" ${location} email OR contact OR gmail.com`,
      `"${businessName}" facebook email OR contact`,
    ];

    let foundEmail: string | null = null;
    let foundSource: string | null = null;

    for (const query of searchQueries) {
      if (foundEmail) break;

      try {
        const results = await this.performWebSearch(query);
        const { email, source } = this.extractEmailFromText(results.text, results.urls);
        if (email) {
          foundEmail = email;
          foundSource = source || 'Web OSINT Search';
        }
      } catch (err) {
        this.logger.warn(`Search failed for query "${query}": ${err.message}`);
      }
    }

    if (foundEmail) {
      lead.email = foundEmail;
      lead.emailSource = foundSource || 'OSINT Search';
      await lead.save();
      this.logger.log(`Found email for ${businessName}: ${foundEmail} (${lead.emailSource})`);
    } else {
      this.logger.log(`No public email found for ${businessName}`);
    }

    return lead;
  }

  /**
   * Batch search emails for all leads missing an email address
   */
  async batchFindMissingEmails(limit = 10): Promise<{ processed: number; foundCount: number }> {
    const leadsWithoutEmail = await this.leadModel
      .find({
        $or: [{ email: { $exists: false } }, { email: null }, { email: '' }],
      })
      .limit(limit)
      .exec();

    let foundCount = 0;
    for (const lead of leadsWithoutEmail) {
      try {
        const updated = await this.findEmailForLead(lead.id);
        if (updated.email) foundCount++;
      } catch (err) {
        this.logger.error(`Error finding email for lead ${lead.id}: ${err.message}`);
      }
    }

    return { processed: leadsWithoutEmail.length, foundCount };
  }

  /**
   * Perform HTTP GET to public search engine (DuckDuckGo HTML endpoint)
   */
  private async performWebSearch(query: string): Promise<{ text: string; urls: string[] }> {
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      throw new Error(`DuckDuckGo HTTP ${response.status}`);
    }

    const html = await response.text();
    
    // Extract external links embedded in search results
    const urlRegex = /href="([^"]+)"/gi;
    const urls: string[] = [];
    let match: RegExpExecArray | null;
    while ((match = urlRegex.exec(html)) !== null) {
      if (match[1] && match[1].includes('http')) {
        urls.push(match[1]);
      }
    }

    return { text: html, urls };
  }

  /**
   * Extract email matching business or webmail formats from HTML text and links
   */
  private extractEmailFromText(text: string, urls: string[]): { email: string | null; source: string | null } {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
    const matches = text.match(emailRegex) || [];

    const excludedDomains = [
      'example.com',
      'domain.com',
      'sentry.io',
      'wixpress.com',
      'schema.org',
      'google.com',
      'github.com',
      'duckduckgo.com',
      'w3.org',
      'cloudfront.net',
      'gravatar.com',
      'png',
      'jpg',
      'jpeg',
      'svg',
      'webp',
    ];

    const validEmails: string[] = [];

    for (const rawEmail of matches) {
      const email = rawEmail.toLowerCase().trim();
      const parts = email.split('@');
      if (parts.length !== 2) continue;

      const domain = parts[1];
      if (excludedDomains.some((ex) => domain.includes(ex) || email.endsWith(`.${ex}`))) {
        continue;
      }

      // Must have valid TLD
      if (!domain.includes('.')) continue;

      if (!validEmails.includes(email)) {
        validEmails.push(email);
      }
    }

    if (validEmails.length === 0) {
      return { email: null, source: null };
    }

    // Prioritize webmail addresses (@gmail, @yahoo, @outlook, @hotmail) since these leads have no custom domain website
    const webmail = validEmails.find((e) =>
      /@(gmail|yahoo|outlook|hotmail|icloud|aol)\./i.test(e),
    );

    const selectedEmail = webmail || validEmails[0];
    
    let source = 'Web Search';
    if (/@(gmail|yahoo|outlook|hotmail)\./i.test(selectedEmail)) {
      source = 'Webmail OSINT';
    } else if (text.toLowerCase().includes('facebook.com')) {
      source = 'Facebook Profile';
    }

    return { email: selectedEmail, source };
  }
}
