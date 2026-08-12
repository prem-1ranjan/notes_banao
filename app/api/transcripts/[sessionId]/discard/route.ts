import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { discardTranscript } from "@/demo-backend/queries";

type RouteContext = {
  params: Promise<{ sessionId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }

  const { sessionId } = await context.params;
  if (!discardTranscript(sessionId)) {
    return NextResponse.json({ ok: false, message: "That recovery item is already gone." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
