/**
 * Delete the demo database so the next request re-creates and re-seeds it from
 * demo-backend/data/*.json.
 *
 *     npm run db:reset
 *
 * Stop the dev server first — Windows will not delete a file that is open.
 */

import { rmSync } from "node:fs";
import path from "node:path";

const base = process.env.DEMO_DB_PATH || path.join(process.cwd(), "demo.db");

// SQLite in WAL mode keeps two sidecar files next to the database.
for (const file of [base, `${base}-wal`, `${base}-shm`]) {
  try {
    rmSync(file, { force: true });
  } catch (error) {
    console.error(`Could not delete ${file}: ${error.message}`);
    console.error("Stop the dev server (Ctrl+C) and run this again.");
    process.exit(1);
  }
}

console.log("Demo database deleted. It will be rebuilt from demo-backend/data/*.json on the next request.");
