import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { noteMarkdown } from "@/demo-backend/queries";

type RouteContext = {
  params: Promise<{ noteId: string }>;
};

// Serves the note body as Markdown. The dashboard fetches this and renders the
// PDF in the browser with the vendored pdfmake bundle in `public/notes-pdf`.
export async function GET(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }

  const { noteId } = await context.params;
  const note = noteMarkdown(noteId);
  if (!note) {
    return NextResponse.json({ ok: false, message: "That note no longer exists." }, { status: 404 });
  }

  return new NextResponse(note.markdown, {
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "content-disposition": `attachment; filename="${filename(note.title)}.md"`
    }
  });
}

function filename(title: string) {
  return title.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "notes";
}
