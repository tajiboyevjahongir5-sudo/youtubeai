export interface InvoiceLineItem {
  id: string;
  description: string;
  category: 'video_integration' | 'pinned_link' | 'community_post' | 'shorts_cut';
  quantity: number;
  unitPriceUSD: number;
  totalUSD: number;
}

export interface WirePaymentDetails {
  bankName: string;
  swiftBic: string;
  iban: string;
  accountHolder: string;
  country: string;
  deelHandle?: string;
  payoneerEmail?: string;
  usdtTrc20Address?: string;
}

export interface SponsorInvoice {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paymentTerms: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue';
  creatorInfo: {
    channelName: string;
    handle: string;
    ownerName: string;
    email: string;
    taxId: string;
    country: string;
  };
  sponsorInfo: {
    brandName: string;
    contactPerson: string;
    contactEmail: string;
    billingAddress: string;
  };
  items: InvoiceLineItem[];
  subtotalUSD: number;
  taxOrDiscountUSD: number;
  totalAmountUSD: number;
  wireDetails: WirePaymentDetails;
  notes: string;
}

export class SponsorInvoiceGeneratorService {
  public generateInvoice(contentId: string, brand?: string): SponsorInvoice {
    const selectedBrand = brand || "Cursor AI / Anysphere Inc.";
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const items: InvoiceLineItem[] = [
      {
        id: "item_1",
        description: "60-Second Dedicated In-Video Sponsorship Integration (Autonomous AI Video)",
        category: "video_integration",
        quantity: 1,
        unitPriceUSD: 3500,
        totalUSD: 3500
      },
      {
        id: "item_2",
        description: "Pinned Top Comment + Description First-Fold Referral Link (30 Days)",
        category: "pinned_link",
        quantity: 1,
        unitPriceUSD: 750,
        totalUSD: 750
      },
      {
        id: "item_3",
        description: "YouTube Community Tab Dedicated Sponsor Feature & Callout",
        category: "community_post",
        quantity: 1,
        unitPriceUSD: 450,
        totalUSD: 450
      }
    ];

    const subtotalUSD = items.reduce((acc, it) => acc + it.totalUSD, 0);

    return {
      invoiceNumber: `INV-2026-NPAI-0089`,
      issueDate: today,
      dueDate: dueDate,
      paymentTerms: "Net-15 Days (Direct Wire / Deel / Payoneer)",
      status: "issued",
      creatorInfo: {
        channelName: "Neural Pulse AI",
        handle: "@NeuralPulseAI-m3e",
        ownerName: "Neural Pulse Media Studio (Jahongir T.)",
        email: "partners@neuralpulse.ai",
        taxId: "TAX-UZB-9982481029",
        country: "Uzbekistan / Remote Global"
      },
      sponsorInfo: {
        brandName: selectedBrand,
        contactPerson: "Growth & Partnerships Lead",
        contactEmail: `sponsor@${selectedBrand.toLowerCase().includes('cursor') ? 'cursor.com' : 'partner.io'}`,
        billingAddress: "450 Townsend St, San Francisco, CA 94107, USA"
      },
      items,
      subtotalUSD,
      taxOrDiscountUSD: 0,
      totalAmountUSD: subtotalUSD,
      wireDetails: {
        bankName: "Kapitalbank JSC (International Wire via Correspondent Bank NY)",
        swiftBic: "KAPBUZ22",
        iban: "UZ8400000000202084001928374",
        accountHolder: "Jahongir T. (Neural Pulse AI)",
        country: "Uzbekistan",
        deelHandle: "deel.me/jahongir-ai",
        payoneerEmail: "payoneer@neuralpulse.ai",
        usdtTrc20Address: "TQn9Y2khEsLJW1ChVWFMSMeSTow5Kaxxxx"
      },
      notes: "Direct wire transfer or Deel contractor invoice payment. 100% of the funds go directly to the creator with zero YouTube revenue share deduction."
    };
  }
}

export const sponsorInvoiceGeneratorService = new SponsorInvoiceGeneratorService();
