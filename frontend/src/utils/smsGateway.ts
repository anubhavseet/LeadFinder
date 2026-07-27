/**
 * Helper utilities for US Carrier Email-to-SMS Gateways
 */

export function sanitizeUSPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.substring(1);
  }
  return digits;
}

export function getCarrierGatewayEmails(phone: string): string[] {
  const cleanDigits = sanitizeUSPhone(phone);
  if (cleanDigits.length !== 10) return [];
  return [
    `${cleanDigits}@vtext.com`,               // Verizon
    `${cleanDigits}@txt.att.net`,             // AT&T
    `${cleanDigits}@tmomail.net`,             // T-Mobile
    `${cleanDigits}@mms.cricketwireless.net`, // Cricket
  ];
}

export function generateSmsPitchText(businessName: string, category?: string, address?: string, rating?: number): string {
  const ratingStr = rating ? ` (${rating}⭐)` : '';
  const locationStr = address ? ` in ${address.split(',')[0]}` : '';
  return `Hi! Saw ${businessName}${ratingStr}${locationStr} on Google Maps—great reputation! Noticed you don't have a website listed yet. I build modern 1-page sites to double customer calls. Open to seeing a 60-sec video demo?`;
}

export function generateMailtoLink(phone: string, pitchText: string): string {
  const gateways = getCarrierGatewayEmails(phone);
  if (gateways.length === 0) return '#';
  const recipients = gateways.join(',');
  return `mailto:${recipients}?subject=&body=${encodeURIComponent(pitchText)}`;
}
