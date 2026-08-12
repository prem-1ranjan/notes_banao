import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import {
  addActivity,
  coupon,
  createOrder,
  creditPoints,
  listActivities,
  paymentOrder,
  pointPackage,
  randomId,
  walletSummary
} from "@/demo-backend/queries";

/**
 * Demo recharge. The real portal creates a payment order and hands the browser
 * to a payment gateway; here the points are credited immediately and the
 * response carries the refreshed wallet, which is the branch the dashboard
 * takes when no gateway is involved.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const packageCode = String(body?.package_code || "").trim();
  const couponCode = String(body?.coupon_code || "").trim().toUpperCase();
  const pack = pointPackage(packageCode);
  if (!pack) {
    return NextResponse.json({ ok: false, message: "Pick an NB Points pack." }, { status: 400 });
  }

  let amountPaise = pack.price_paise;
  if (couponCode) {
    const applied = coupon(couponCode);
    if (!applied || !applied.active) {
      return NextResponse.json({ ok: false, message: "That coupon is not valid." }, { status: 400 });
    }
    if (applied.kind === "percent_off") {
      amountPaise = Math.round(pack.price_paise * (1 - applied.percent_off / 100));
    }
  }

  const orderId = createOrder({
    packageCode: pack.code,
    amountPaise,
    currency: pack.currency,
    basePoints: pack.base_points,
    bonusPoints: pack.bonus_points,
    totalPoints: pack.total_points
  });

  creditPoints(pack.total_points);
  addActivity({
    type: "payment",
    kind: "recharge",
    point_type: "recharge",
    amount_paise: amountPaise,
    base_points: pack.base_points,
    bonus_points: pack.bonus_points,
    total_points: pack.total_points,
    points_delta: pack.total_points,
    currency: pack.currency,
    status: "paid",
    provider: "demo_gateway",
    provider_order_id: `demo_${randomId()}`,
    source_id: orderId,
    reference_id: orderId
  });

  const { items, pagination } = listActivities(1, 5);
  return NextResponse.json({
    ok: true,
    order: paymentOrder(orderId),
    wallet: walletSummary(),
    activities: items,
    pagination
  });
}
