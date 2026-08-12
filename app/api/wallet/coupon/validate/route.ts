import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { coupon, couponRedeemed, pointPackage } from "@/demo-backend/queries";

// Preview what a coupon would do, without applying it. Try DEMO25 (percent off)
// or FREE10 (free points); EXPIRED exercises the rejection state.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }

  const payload = await request.json().catch(() => ({}));
  const code = String(payload?.code || "").trim().toUpperCase();
  const packageCode = String(payload?.package_code || "").trim();
  if (!code) {
    return NextResponse.json({ ok: false, message: "Enter a coupon code." }, { status: 400 });
  }

  const found = coupon(code);
  if (!found) {
    return NextResponse.json({ ok: false, message: "That coupon code was not recognised." }, { status: 400 });
  }
  if (!found.active) {
    return NextResponse.json({ ok: false, message: "This coupon has expired." }, { status: 400 });
  }
  if (couponRedeemed(found.code)) {
    return NextResponse.json({ ok: false, message: "You have already used this coupon." }, { status: 400 });
  }

  if (found.kind === "free_points") {
    return NextResponse.json({
      ok: true,
      coupon: { code: found.code, kind: found.kind, description: found.description },
      preview: {
        kind: "free_points",
        requires_payment: false,
        free_points: found.free_points
      }
    });
  }

  const pack = pointPackage(packageCode);
  if (!pack) {
    return NextResponse.json({ ok: false, message: "Pick an NB Points pack first." }, { status: 400 });
  }
  const discounted = Math.round(pack.price_paise * (1 - found.percent_off / 100));

  return NextResponse.json({
    ok: true,
    coupon: { code: found.code, kind: found.kind, description: found.description },
    preview: {
      kind: "percent_off",
      requires_payment: true,
      percent_off: found.percent_off,
      package_code: pack.code,
      currency: pack.currency,
      original_amount_paise: pack.price_paise,
      discounted_amount_paise: discounted,
      original_total_points: pack.total_points,
      total_points: pack.total_points
    }
  });
}
