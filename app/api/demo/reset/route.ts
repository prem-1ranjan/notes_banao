import { NextResponse } from "next/server";
import { reseed } from "@/demo-backend/db";

/**
 * Throw away everything in `demo.db` and load `demo-backend/data/*.json` again.
 *
 *     curl -X POST http://127.0.0.1:3000/api/demo/reset
 *
 * Handy after you have deleted all the notes or spent all the NB Points. The
 * equivalent from a terminal is `npm run db:reset`.
 */
export async function POST() {
  reseed();
  return NextResponse.json({ ok: true, message: "Demo data reset from demo-backend/data/*.json." });
}
