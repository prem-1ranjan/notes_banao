import { NextResponse } from "next/server";
import { getCurrentUser } from "@/demo-backend/session";
import { listJobs, listNotes, notesFingerprint, setting } from "@/demo-backend/queries";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ ok: false, message: "Not logged in." }, { status: 401 });
  }

  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || 1) || 1);
  const limit = Math.max(1, Math.min(Number(url.searchParams.get("limit") || 10) || 10, 50));

  // Conditional request: when nothing about the list has changed, answer 304
  // with no body. The dashboard polls this while a job is running.
  const etag = notesFingerprint();
  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag, "Cache-Control": "no-store" } });
  }

  const notes = listNotes(page, limit);
  const jobs = listJobs(page, limit);

  return NextResponse.json(
    {
      ok: true,
      notes: notes.items,
      jobs: jobs.items,
      retentionDays: Number(setting("retention_days")) || 30,
      maxRecordingMinutes: Number(setting("max_recording_minutes")) || 180,
      pagination: notes.pagination,
      jobsPagination: jobs.pagination
    },
    { headers: { ETag: etag, "Cache-Control": "no-store" } }
  );
}
