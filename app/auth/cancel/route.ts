import { NextResponse } from "next/server";
import { signOut } from "@/demo-backend/session";
import { sameHostUrl } from "@/lib/request-origin";

// Closing the Terms prompt without accepting has to end the half-finished
// session, otherwise the next page load walks straight back into it.
export async function GET(request: Request) {
  const url = new URL(request.url);
  await signOut();
  return NextResponse.redirect(sameHostUrl(request, safeNextPath(url.searchParams.get("next"))));
}

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}
