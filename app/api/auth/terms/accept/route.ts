import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { acceptTerms } from "@/demo-backend/queries";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Please sign in to continue." }, { status: 401 });
  }
  acceptTerms();
  return NextResponse.json({ ok: true });
}
