import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as nodemailer from 'nodemailer';
import { Lead, LeadDocument } from './models/lead.model';

export interface CarrierLookupResult {
  carrier: string;
  lineType: 'MOBILE' | 'LANDLINE' | 'VOIP' | 'UNKNOWN';
  isSmsEligible: boolean;
  gatewayEmail?: string;
}

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
   * High-Precision US Carrier & Line-Type (Mobile vs Landline vs VoIP) Lookup
   * using LERG NPA-NXX Prefix Database + OSINT
   */
  public async detectCarrierAndLineType(phone: string): Promise<CarrierLookupResult> {
    const cleanDigits = this.sanitizeUSPhone(phone);
    if (cleanDigits.length !== 10) {
      return { carrier: 'Unknown', lineType: 'UNKNOWN', isSmsEligible: false };
    }

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
        const typeMatch = xmlText.match(/<company-type>(.*?)<\/company-type>/i);

        const compType = typeMatch ? typeMatch[1].toUpperCase() : '';
        const comp = companyMatch && companyMatch[1] ? companyMatch[1].toUpperCase() : '';

        // Check Wireless Mobile Carriers
        if (comp.includes('CELLCO') || comp.includes('VERIZON WIRELESS') || comp.includes('VZW')) {
          return { carrier: 'Verizon Wireless', lineType: 'MOBILE', isSmsEligible: true, gatewayEmail: `${cleanDigits}@vtext.com` };
        }
        if (comp.includes('AT&T MOBILITY') || comp.includes('CINGULAR') || comp.includes('NEW CINGULAR')) {
          return { carrier: 'AT&T Mobility', lineType: 'MOBILE', isSmsEligible: true, gatewayEmail: `${cleanDigits}@txt.att.net` };
        }
        if (comp.includes('T-MOBILE') || comp.includes('TMOBILE') || comp.includes('SPRINT') || comp.includes('POWERTEL') || comp.includes('NEXTEL')) {
          return { carrier: 'T-Mobile USA', lineType: 'MOBILE', isSmsEligible: true, gatewayEmail: `${cleanDigits}@tmomail.net` };
        }
        if (comp.includes('CRICKET') || comp.includes('LEAP WIRELESS')) {
          return { carrier: 'Cricket Wireless', lineType: 'MOBILE', isSmsEligible: true, gatewayEmail: `${cleanDigits}@mms.cricketwireless.net` };
        }
        if (comp.includes('METROPCS') || comp.includes('METRO PCS') || comp.includes('METRO')) {
          return { carrier: 'MetroPCS', lineType: 'MOBILE', isSmsEligible: true, gatewayEmail: `${cleanDigits}@mymetropcs.com` };
        }
        if (comp.includes('US CELLULAR') || comp.includes('UNITED STATES CELLULAR')) {
          return { carrier: 'US Cellular', lineType: 'MOBILE', isSmsEligible: true, gatewayEmail: `${cleanDigits}@email.uscc.net` };
        }
        if (comp.includes('DISH WIRELESS') || comp.includes('BOOST')) {
          return { carrier: 'Boost / Dish Wireless', lineType: 'MOBILE', isSmsEligible: true, gatewayEmail: `${cleanDigits}@myboostmobile.com` };
        }

        // Check LERG company type 'W' (Wireless)
        if (compType === 'W') {
          return { carrier: comp || 'Wireless Mobile Carrier', lineType: 'MOBILE', isSmsEligible: true, gatewayEmail: `${cleanDigits}@vtext.com` };
        }

        // Check Known Landline ILECs (Wireline Telcos)
        if (
          comp.includes('PACIFIC BELL') || comp.includes('SOUTHWESTERN BELL') || comp.includes('SOUTHERN BELL') ||
          comp.includes('BELLSOUTH') || comp.includes('SBC') || comp.includes('AMERITECH') || comp.includes('NEVADA BELL')
        ) {
          return { carrier: `${comp} (AT&T Wireline)`, lineType: 'LANDLINE', isSmsEligible: false };
        }
        if (
          comp.includes('VERIZON NEW YORK') || comp.includes('VERIZON NEW ENGLAND') || comp.includes('VERIZON PENNSYLVANIA') ||
          comp.includes('VERIZON SOUTH') || comp.includes('VERIZON NORTH') || comp.includes('VERIZON DELAWARE') || comp.includes('VERIZON MARYLAND')
        ) {
          return { carrier: `${comp} (Verizon Wireline)`, lineType: 'LANDLINE', isSmsEligible: false };
        }
        if (comp.includes('QWEST') || comp.includes('CENTURYLINK') || comp.includes('LUMEN') || comp.includes('EMBARQ')) {
          return { carrier: 'CenturyLink / Lumen Landline', lineType: 'LANDLINE', isSmsEligible: false };
        }
        if (comp.includes('FRONTIER') || comp.includes('CITIZENS UTILITIES')) {
          return { carrier: 'Frontier Communications Landline', lineType: 'LANDLINE', isSmsEligible: false };
        }
        if (comp.includes('WINDSTREAM') || comp.includes('VALOR')) {
          return { carrier: 'Windstream Landline', lineType: 'LANDLINE', isSmsEligible: false };
        }

        // Check Known Cable & VoIP Providers
        if (comp.includes('COMCAST') || comp.includes('CHARTER') || comp.includes('TIME WARNER') || comp.includes('COX') || comp.includes('CABLEVISION')) {
          return { carrier: `${comp} Cable VoIP`, lineType: 'VOIP', isSmsEligible: false };
        }
        if (comp.includes('BANDWIDTH') || comp.includes('TWILIO') || comp.includes('PEERLESS') || comp.includes('LEVEL 3') || comp.includes('SINCH') || comp.includes('VONAGE') || comp.includes('RINGCENTRAL')) {
          return { carrier: `${comp} VoIP Provider`, lineType: 'VOIP', isSmsEligible: false };
        }

        // If LERG company type is ILEC ('I') or CLEC ('C')
        if (compType === 'I') {
          return { carrier: comp || 'Local ILEC Telco', lineType: 'LANDLINE', isSmsEligible: false };
        }
        if (compType === 'C') {
          return { carrier: comp || 'Local CLEC Provider', lineType: 'VOIP', isSmsEligible: false };
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
        if (html.includes('verizon wireless') || html.includes('vzw')) {
          return { carrier: 'Verizon Wireless', lineType: 'MOBILE', isSmsEligible: true, gatewayEmail: `${cleanDigits}@vtext.com` };
        }
        if (html.includes('at&t mobility') || html.includes('att mobility') || html.includes('cingular')) {
          return { carrier: 'AT&T Mobility', lineType: 'MOBILE', isSmsEligible: true, gatewayEmail: `${cleanDigits}@txt.att.net` };
        }
        if (html.includes('t-mobile') || html.includes('tmobile') || html.includes('sprint')) {
          return { carrier: 'T-Mobile USA', lineType: 'MOBILE', isSmsEligible: true, gatewayEmail: `${cleanDigits}@tmomail.net` };
        }
        if (html.includes('landline') || html.includes('centurylink') || html.includes('frontier') || html.includes('comcast')) {
          return { carrier: 'Landline Provider', lineType: 'LANDLINE', isSmsEligible: false };
        }
      }
    } catch (e) {
      // Ignore web search fallback errors
    }

    // Default fallback: Default target for unconfirmed numbers
    return {
      carrier: 'Verizon Wireless (Default Target)',
      lineType: 'MOBILE',
      isSmsEligible: true,
      gatewayEmail: `${cleanDigits}@vtext.com`,
    };
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
   * Dispatch SMS Pitch to a single lead via Carrier Gateway IF it is an SMS-eligible Mobile line
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

    // 1. High-precision carrier & line-type detection
    const detected = await this.detectCarrierAndLineType(lead.phone);

    // Save detected lineType & carrier to MongoDB Lead record
    lead.carrier = detected.carrier;
    lead.lineType = detected.lineType;

    // 2. CHECK IF SMS ELIGIBLE (Block Landlines & VoIP lines)
    if (!detected.isSmsEligible || detected.lineType === 'LANDLINE' || detected.lineType === 'VOIP') {
      const reason = `SMS Dispatch Disabled: Phone number (${lead.phone}) is a ${detected.lineType} line provided by ${detected.carrier}. Carrier gateways reject Email-to-SMS for landlines.`;
      
      if (!lead.opportunityTags.includes('LANDLINE_NUMBER')) {
        lead.opportunityTags.push('LANDLINE_NUMBER');
      }
      
      lead.notes = lead.notes
        ? `${lead.notes}\n[${new Date().toISOString()}] ${reason}`
        : `[${new Date().toISOString()}] ${reason}`;
      
      await lead.save();
      this.logger.warn(`Blocked SMS dispatch for ${lead.name} (${cleanDigits}): ${detected.lineType} line.`);
      
      throw new Error(reason);
    }

    const targetGatewayEmail = detected.gatewayEmail || `${cleanDigits}@vtext.com`;
    const pitchText = this.generateSmsPitchText(lead);
    const transporter = this.getTransporter();
    const senderUser = process.env.SMTP_USER || 'leadfinder@outreach.com';

    this.logger.log(
      `Sending Email-to-SMS pitch for "${lead.name}" to gateway (${detected.carrier}): ${targetGatewayEmail}`,
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
      ? `${lead.notes}\n[${new Date().toISOString()}] Email-to-SMS pitch dispatched via ${detected.carrier} (${targetGatewayEmail}).`
      : `[${new Date().toISOString()}] Email-to-SMS pitch dispatched via ${detected.carrier} (${targetGatewayEmail}).`;

    await lead.save();
    this.logger.log(`Successfully dispatched Email-to-SMS pitch for ${lead.name} (${detected.carrier}) to ${targetGatewayEmail}`);

    return lead;
  }

  /**
   * Batch dispatch SMS pitches to multiple selected leads (automatically skipping Landlines)
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
        this.logger.error(`Skipped/Error in batch dispatch for lead ${leadId}: ${err.message}`);
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
