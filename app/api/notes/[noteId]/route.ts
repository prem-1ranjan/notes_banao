import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { deleteNote } from "@/demo-backend/queries";

type RouteContext = {
  params: Promise<{ noteId: string }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }

  const { noteId } = await context.params;
  if (!deleteNote(noteId)) {
    return NextResponse.json({ ok: false, message: "That note no longer exists." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
