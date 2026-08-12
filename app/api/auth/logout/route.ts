import { NextResponse } from "next/server";
import { signOut } from "@/demo-backend/session";

export async function POST() {
  await signOut();
  return NextResponse.json({ ok: true });
}
