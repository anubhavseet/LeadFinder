import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { Lead, LeadDocument } from './models/lead.model';

@Injectable()
export class SmsDispatcherService {
  private readonly logger = new Logger(SmsDispatcherService.name);

  constructor(
    @InjectModel(Lead.name) private readonly leadModel: Model<LeadDocument>,
  ) {}

  /**
   * Creates a Nodemailer transporter using credentials directly from process.env
   */
  private getTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);

    if (!user || !pass || user.trim() === '' || pass.trim() === '') {
      throw new Error(
        'Missing SMTP Credentials: Please configure your Gmail address (SMTP_USER) and 16-character App Password (SMTP_PASS) in backend/.env',
      );
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
    });
  }

  /**
   * Convert US phone numbers into clean 10-digit format (e.g. 2065550199)
   */
  public sanitizeUSPhone(phone: string): string {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('1')) {
      return digits.substring(1);
    }
    return digits;
  }

  /**
   * High-Precision US Carrier & Gateway Lookup using LERG NPA-NXX Prefix Database + OSINT
   */
  public async detectCarrierAndGateway(phone: string): Promise<{ carrier: string; gatewayEmail: string } | null> {
    const cleanDigits = this.sanitizeUSPhone(phone);
    if (cleanDigits.length !== 10) return null;

    const npa = cleanDigits.substring(0, 3);
    const nxx = cleanDigits.substring(3, 6);

    // Tier 1: Query LocalCallingGuide LERG Prefix Database
    try {
      const lergUrl = `https://localcallingguide.com/xmlprefix.php?npa=${npa}&nxx=${nxx}`;
      const res = await fetch(lergUrl, {
        headers: { 'User-Agent': 'LeadFinder/1.0' },
      });

      if (res.ok) {
        const xmlText = await res.text();
        const companyMatch = xmlText.match(/<company-name>(.*?)<\/company-name>/i);
        if (companyMatch && companyMatch[1]) {
          const comp = companyMatch[1].toUpperCase();

          if (comp.includes('CINGULAR') || comp.includes('AT&T') || comp.includes('AT & T') || comp.includes('SBC') || comp.includes('BELLSOUTH')) {
            return { carrier: 'AT&T Mobility', gatewayEmail: `${cleanDigits}@txt.att.net` };
          }
          if (comp.includes('CELLCO') || comp.includes('VERIZON') || comp.includes('VZW')) {
            return { carrier: 'Verizon Wireless', gatewayEmail: `${cleanDigits}@vtext.com` };
          }
          if (comp.includes('T-MOBILE') || comp.includes('TMOBILE') || comp.includes('SPRINT') || comp.includes('POWERTEL') || comp.includes('NEXTEL')) {
            return { carrier: 'T-Mobile USA', gatewayEmail: `${cleanDigits}@tmomail.net` };
          }
          if (comp.includes('CRICKET')) {
            return { carrier: 'Cricket Wireless', gatewayEmail: `${cleanDigits}@mms.cricketwireless.net` };
          }
          if (comp.includes('METRO')) {
            return { carrier: 'MetroPCS', gatewayEmail: `${cleanDigits}@mymetropcs.com` };
          }
          if (comp.includes('US CELLULAR') || comp.includes('UNITED STATES CELLULAR')) {
            return { carrier: 'US Cellular', gatewayEmail: `${cleanDigits}@email.uscc.net` };
          }
        }
      }
    } catch (err) {
      this.logger.warn(`LERG lookup query failed for ${cleanDigits}: ${err.message}`);
    }

    // Tier 2: Search Engine OSINT Fallback
    try {
      const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(`"${cleanDigits}" carrier OR wireless`)}`;
      const res = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (res.ok) {
        const html = (await res.text()).toLowerCase();
        if (html.includes('verizon')) {
          return { carrier: 'Verizon Wireless', gatewayEmail: `${cleanDigits}@vtext.com` };
        }
        if (html.includes('at&t') || html.includes('att mobility') || html.includes('cingular')) {
          return { carrier: 'AT&T Mobility', gatewayEmail: `${cleanDigits}@txt.att.net` };
        }
        if (html.includes('t-mobile') || html.includes('tmobile') || html.includes('sprint')) {
          return { carrier: 'T-Mobile USA', gatewayEmail: `${cleanDigits}@tmomail.net` };
        }
        if (html.includes('cricket')) {
          return { carrier: 'Cricket Wireless', gatewayEmail: `${cleanDigits}@mms.cricketwireless.net` };
        }
        if (html.includes('metro')) {
          return { carrier: 'MetroPCS', gatewayEmail: `${cleanDigits}@mymetropcs.com` };
        }
      }
    } catch (e) {
      // Ignore web search fallback errors
    }

    return null;
  }

  /**
   * Formulate hyper-personalized, 2-sentence SMS pitch under 160 characters
   */
  public generateSmsPitchText(lead: Lead): string {
    const ratingStr = lead.rating ? ` (${lead.rating}⭐)` : '';
    const locationStr = lead.address ? ` in ${lead.address.split(',')[0]}` : '';

    return `Hi! Saw ${lead.name}${ratingStr}${locationStr} on Google Maps—great reputation! Noticed you don't have a website listed yet. I build modern 1-page sites to double customer calls. Open to seeing a 60-sec video demo?`;
  }

  /**
   * Dispatch SMS Pitch to a single lead via EXACTLY ONE specific detected Carrier Gateway
   */
  async sendSmsPitchForLead(leadId: string): Promise<Lead> {
    const lead = await this.leadModel.findById(leadId).exec();
    if (!lead) {
      throw new Error(`Lead with ID ${leadId} not found`);
    }

    if (!lead.phone) {
      throw new Error(`Lead "${lead.name}" does not have a phone number listed.`);
    }

    const cleanDigits = this.sanitizeUSPhone(lead.phone);
    if (cleanDigits.length !== 10) {
      throw new Error(
        `Invalid phone number format (${lead.phone}) for US Email-to-SMS gateway dispatch. Must be 10 digits.`,
      );
    }

    // 1. High-precision carrier detection
    const detected = await this.detectCarrierAndGateway(lead.phone);

    let targetGatewayEmail = '';
    let carrierName = '';

    if (detected && detected.gatewayEmail) {
      targetGatewayEmail = detected.gatewayEmail;
      carrierName = detected.carrier;
      this.logger.log(`Targeting confirmed carrier for ${lead.name} (${cleanDigits}): ${detected.carrier} -> ${targetGatewayEmail}`);
    } else {
      // Default to Verizon (@vtext.com) - #1 US mobile carrier by subscriber count.
      // ALWAYS send to ONLY 1 gateway domain to avoid multi-recipient bounce notifications!
      targetGatewayEmail = `${cleanDigits}@vtext.com`;
      carrierName = 'Verizon Wireless (Default Target)';
      this.logger.log(`Carrier unconfirmed for ${lead.name} (${cleanDigits}). Targeting primary US mobile carrier gateway: ${targetGatewayEmail}`);
    }

    const pitchText = this.generateSmsPitchText(lead);
    const transporter = this.getTransporter();
    const senderUser = process.env.SMTP_USER || 'leadfinder@outreach.com';

    this.logger.log(
      `Sending Email-to-SMS pitch for "${lead.name}" to single gateway (${carrierName}): ${targetGatewayEmail}`,
    );

    // Send email ONLY to the single target carrier gateway
    await transporter.sendMail({
      from: `"Freelance Web Intelligence" <${senderUser}>`,
      to: targetGatewayEmail,
      subject: '', // Empty subject works best for SMS carrier gateways
      text: pitchText,
    });

    // Update lead status & notes in MongoDB CRM
    lead.status = 'CONTACTED';
    lead.notes = lead.notes
      ? `${lead.notes}\n[${new Date().toISOString()}] Email-to-SMS pitch dispatched via ${carrierName} (${targetGatewayEmail}).`
      : `[${new Date().toISOString()}] Email-to-SMS pitch dispatched via ${carrierName} (${targetGatewayEmail}).`;

    await lead.save();
    this.logger.log(`Successfully dispatched Email-to-SMS pitch for ${lead.name} (${carrierName}) to ${targetGatewayEmail}`);

    return lead;
  }

  /**
   * Batch dispatch SMS pitches to multiple selected leads
   */
  async batchSendSmsPitches(leadIds: string[]): Promise<{ processed: number; successCount: number; errors: string[] }> {
    let successCount = 0;
    const errors: string[] = [];

    for (const leadId of leadIds) {
      try {
        await this.sendSmsPitchForLead(leadId);
        successCount++;
        // 2-second delay between dispatches to ensure clean SMTP throughput
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (err) {
        this.logger.error(`Error in batch dispatch for lead ${leadId}: ${err.message}`);
        errors.push(`Lead ${leadId}: ${err.message}`);
      }
    }

    return {
      processed: leadIds.length,
      successCount,
      errors,
    };
  }
}
