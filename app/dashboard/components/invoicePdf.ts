import { loadScript, sanitizeFilename } from "./richPdfDownload";

/**
 * Client-side GST invoice / receipt PDF, rendered with the same pdfMake vendor
 * bundle the notes download uses. The document is a pure function of the stored
 * invoice snapshot — regenerating it any time produces the identical bill.
 *
 * Amounts print as "Rs" (codebase convention) to avoid any font dependency for
 * the rupee glyph.
 */

export type InvoiceData = {
  doc_type: "tax_invoice" | "receipt";
  invoice_number: string;
  fy: string;
  seller: {
    legal_name: string;
    gstin: string;
    address: string;
    state_name: string;
    state_code: string;
  };
  place_of_supply: string;
  buyer: { email: string; phone: string };
  description: string;
  sac_code: string;
  currency: string;
  gross_paise: number;
  taxable_paise: number;
  cgst_paise: number;
  sgst_paise: number;
  igst_paise: number;
  gst_rate_bps: number;
  reverse_charge: boolean;
  created_at: string;
  payment_order_id: string;
};

type PdfMakeLike = {
  createPdf: (doc: unknown) => { download: (filename: string) => void };
  fonts?: Record<string, unknown>;
};

// pdfmake.min.js ships with NO fonts; unicode_fonts.js registers the vendored
// DejaVuSans/NotoDevanagari vfs onto window.pdfMake, so both must load, in order.
const PDF_SCRIPTS = [
  "/notes-pdf/vendor/pdfmake.min.js",
  "/notes-pdf/vendor/unicode_fonts.js"
];

// NotesBanao brand tones — keep in sync with :root in globals.css
// (--text, --muted, --accent, --line).
const INK = "#171a2c";
const MUTED = "#687189";
const BRAND = "#5b5cf6";
const LINE = "#d6dff2";

export async function downloadInvoicePdf(invoice: InvoiceData) {
  const pdfMake = await ensurePdfMake();
  const doc = buildInvoiceDoc(invoice);
  pdfMake.createPdf(doc).download(`${sanitizeFilename(invoice.invoice_number.replace(/\//g, "-"))}.pdf`);
}

function rupees(paise: number) {
  return `Rs ${(Math.round(paise) / 100).toFixed(2)}`;
}

function ratePercent(bps: number, halfRate?: boolean) {
  const value = (halfRate ? bps / 2 : bps) / 100;
  return `${value % 1 === 0 ? value : value.toFixed(2)}%`;
}

function formatDate(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function buildInvoiceDoc(invoice: InvoiceData) {
  const isTax = invoice.doc_type === "tax_invoice";
  const title = isTax ? "TAX INVOICE" : "RECEIPT";

  const taxRows = isTax
    ? [
        ["Taxable value", rupees(invoice.taxable_paise)],
        [`CGST @ ${ratePercent(invoice.gst_rate_bps, true)}`, rupees(invoice.cgst_paise)],
        [`SGST @ ${ratePercent(invoice.gst_rate_bps, true)}`, rupees(invoice.sgst_paise)]
      ]
    : [];

  return {
    pageSize: "A4",
    pageMargins: [40, 44, 40, 50],
    // DejaVuSans is the vendored vfs family — pdfMake's built-in default is
    // Roboto, which is NOT in the bundle and would throw at render time.
    defaultStyle: { font: "DejaVuSans", fontSize: 10, color: INK, lineHeight: 1.25 },
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          text: "This is a computer-generated document and does not require a signature.",
          color: MUTED,
          fontSize: 8
        },
        { text: `${currentPage} / ${pageCount}`, alignment: "right", color: MUTED, fontSize: 8 }
      ],
      margin: [40, 12, 40, 0]
    }),
    content: [
      {
        columns: [
          [
            { text: "NotesBanao", color: BRAND, fontSize: 20, bold: true },
            { text: invoice.seller.legal_name, bold: true, margin: [0, 6, 0, 0] },
            ...(invoice.seller.address
              ? [{ text: invoice.seller.address, color: MUTED, fontSize: 9 }]
              : []),
            ...(invoice.seller.state_name
              ? [{ text: `${invoice.seller.state_name} (${invoice.seller.state_code})`, color: MUTED, fontSize: 9 }]
              : []),
            ...(isTax ? [{ text: `GSTIN: ${invoice.seller.gstin}`, bold: true, fontSize: 9, margin: [0, 3, 0, 0] }] : [])
          ],
          [
            { text: title, alignment: "right", fontSize: 15, bold: true, color: BRAND },
            { text: invoice.invoice_number, alignment: "right", bold: true, margin: [0, 6, 0, 0] },
            // No separate FY line — the financial year is already part of the
            // invoice number itself.
            { text: `Date: ${formatDate(invoice.created_at)}`, alignment: "right", color: MUTED, fontSize: 9 }
          ]
        ]
      },
      { canvas: [{ type: "line", x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: LINE }], margin: [0, 14, 0, 14] },
      {
        columns: [
          [
            { text: "Billed to", color: MUTED, fontSize: 8, bold: true },
            { text: invoice.buyer.email || "NotesBanao customer", margin: [0, 2, 0, 0] },
            ...(invoice.buyer.phone ? [{ text: invoice.buyer.phone, color: MUTED, fontSize: 9 }] : [])
          ],
          [
            ...(isTax
              ? [
                  { text: "Place of supply", color: MUTED, fontSize: 8, bold: true, alignment: "right" },
                  { text: invoice.place_of_supply, alignment: "right", margin: [0, 2, 0, 0] },
                  {
                    text: `Reverse charge: ${invoice.reverse_charge ? "Yes" : "No"}`,
                    alignment: "right",
                    color: MUTED,
                    fontSize: 9
                  }
                ]
              : [])
          ]
        ],
        margin: [0, 0, 0, 16]
      },
      {
        table: {
          headerRows: 1,
          widths: ["*", 62, 80],
          body: [
            [
              { text: "Description", style: "th" },
              { text: isTax ? "SAC" : "", style: "th" },
              { text: "Amount", style: "th", alignment: "right" }
            ],
            [
              { text: invoice.description, margin: [0, 6, 0, 6] },
              { text: isTax ? invoice.sac_code : "", margin: [0, 6, 0, 6] },
              { text: rupees(invoice.gross_paise), alignment: "right", margin: [0, 6, 0, 6] }
            ]
          ]
        },
        layout: {
          hLineWidth: () => 0.7,
          vLineWidth: () => 0,
          hLineColor: () => LINE
        }
      },
      {
        columns: [
          { width: "*", text: "" },
          {
            width: 240,
            margin: [0, 12, 0, 0],
            table: {
              widths: ["*", 90],
              body: [
                ...taxRows.map(([label, value]) => [
                  { text: label, color: MUTED, border: [false, false, false, false] },
                  { text: value, alignment: "right", border: [false, false, false, false] }
                ]),
                [
                  { text: isTax ? "Total (incl. GST)" : "Total", bold: true, border: [false, true, false, false] },
                  { text: rupees(invoice.gross_paise), alignment: "right", bold: true, border: [false, true, false, false] }
                ]
              ]
            },
            layout: { hLineWidth: () => 0.7, hLineColor: () => LINE, vLineWidth: () => 0 }
          }
        ]
      },
      {
        text: isTax
          ? "Price is inclusive of GST. Tax is borne by NotesBanao and shown as a break-up of the amount paid."
          : "Amount received in full. This receipt is issued without tax lines.",
        color: MUTED,
        fontSize: 8,
        margin: [0, 18, 0, 0]
      },
      {
        text: `Payment reference: ${invoice.payment_order_id}`,
        color: MUTED,
        fontSize: 8,
        margin: [0, 3, 0, 0]
      }
    ],
    styles: {
      th: { bold: true, fontSize: 9, color: MUTED, margin: [0, 4, 0, 4] }
    }
  };
}

let pdfMakeLoad: Promise<PdfMakeLike> | null = null;

function ensurePdfMake(): Promise<PdfMakeLike> {
  const existing = (window as { pdfMake?: PdfMakeLike }).pdfMake;
  if (existing?.createPdf && existing.fonts?.DejaVuSans) {
    return Promise.resolve(existing);
  }
  pdfMakeLoad ||= (async () => {
    for (const src of PDF_SCRIPTS) {
      await loadScript(src);
    }
    const loaded = (window as { pdfMake?: PdfMakeLike }).pdfMake;
    if (!loaded?.createPdf || !loaded.fonts?.DejaVuSans) {
      pdfMakeLoad = null;
      throw new Error("PDF engine did not load.");
    }
    return loaded;
  })().catch((error) => {
    pdfMakeLoad = null;
    throw error;
  });
  return pdfMakeLoad;
}
