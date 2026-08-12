import { NextResponse } from "next/server";
import { businessInfo } from "@/lib/business-info";
import { getCurrentUser } from "@/demo-backend/session";
import { paymentOrder, portalUser } from "@/demo-backend/queries";

type RouteContext = {
  params: Promise<{ orderId: string }>;
};

const GST_RATE_BPS = 1800;

/**
 * Demo GST invoice. The real portal returns a stored invoice snapshot; here the
 * document is derived from the paid order in the demo database, using the
 * placeholder seller details in `lib/business-info.ts`.
 */
export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }

  const { orderId } = await context.params;
  const order = paymentOrder(orderId);
  if (!order) {
    // Only recharges made in this demo session have an invoice; the seeded
    // history rows are there to give the activity list something to show.
    return NextResponse.json(
      { ok: false, message: "No invoice exists for this payment. Buy an NB Points pack to generate one." },
      { status: 404 }
    );
  }
  if (order.status !== "paid") {
    return NextResponse.json({ ok: false, message: "An invoice is only issued for a completed payment." }, { status: 400 });
  }

  // Prices are GST-inclusive, so the taxable value is backed out of the total.
  const taxablePaise = Math.round((order.amount_paise * 10000) / (10000 + GST_RATE_BPS));
  const gstPaise = order.amount_paise - taxablePaise;
  const cgstPaise = Math.round(gstPaise / 2);
  const account = portalUser();

  return NextResponse.json({
    ok: true,
    doc_type: "tax_invoice",
    invoice_number: `DEMO/${new Date(order.created_at).getFullYear()}/${order.id.slice(-6).toUpperCase()}`,
    fy: financialYear(order.created_at),
    seller: {
      legal_name: businessInfo.legalOwner,
      gstin: businessInfo.gstin,
      address: businessInfo.address,
      state_name: businessInfo.stateName,
      state_code: businessInfo.stateCode
    },
    place_of_supply: businessInfo.stateName,
    buyer: { email: account.email, phone: account.phone_e164 || "" },
    description: "NB Points recharge",
    sac_code: "998434",
    currency: order.currency,
    gross_paise: order.amount_paise,
    taxable_paise: taxablePaise,
    cgst_paise: cgstPaise,
    sgst_paise: gstPaise - cgstPaise,
    igst_paise: 0,
    gst_rate_bps: GST_RATE_BPS,
    reverse_charge: false,
    created_at: order.created_at,
    payment_order_id: order.id
  });
}

function financialYear(iso: string) {
  const date = new Date(iso);
  const year = date.getUTCFullYear();
  // The Indian financial year runs April to March.
  const start = date.getUTCMonth() >= 3 ? year : year - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}
