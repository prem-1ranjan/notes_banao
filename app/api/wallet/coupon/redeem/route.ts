import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { addActivity, coupon, couponRedeemed, creditPoints, redeemCoupon } from "@/demo-backend/queries";

// Claim a free-points coupon. Percent-off coupons are not claimed here — they
// are applied to a recharge instead.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const code = String(payload?.code || "").trim().toUpperCase();
  const found = coupon(code);
  if (!found || !found.active) {
    return NextResponse.json({ ok: false, message: "That coupon is not valid." }, { status: 400 });
  }
  if (found.kind !== "free_points") {
    return NextResponse.json(
      { ok: false, message: "This coupon applies a discount at payment — pick a pack and pay to use it." },
      { status: 400 }
    );
  }
  if (couponRedeemed(found.code)) {
    return NextResponse.json({ ok: false, message: "You have already used this coupon." }, { status: 400 });
  }

  redeemCoupon(found.code);
  creditPoints(found.free_points);
  addActivity({
    type: "point",
    kind: "grant",
    point_type: "grant",
    points_delta: found.free_points,
    status: "completed",
    source_id: `coupon_${found.code}`,
    reference_id: found.code
  });

  return NextResponse.json({ ok: true, points_credited: found.free_points });
}
