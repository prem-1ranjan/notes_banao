/**
 * Who is signed in, from a server component.
 *
 * This is the server-side half of the UI's API boundary (the client-side half
 * is `lib/api-client.ts`). Pages call `getCurrentUser()` to decide whether to
 * render the dashboard or bounce to the login screen.
 *
 * Two modes, chosen by NEXT_PUBLIC_API_BASE_URL:
 *
 *  - unset (default) — ask the bundled demo backend directly. No network hop.
 *  - set             — GET {base}/api/auth/me on the real API, forwarding the
 *                      browser's cookies, exactly as a separate front end
 *                      deployment would.
 *
 * Nothing else in `app/` imports from `demo-backend/`, so deleting the demo
 * backend only breaks this file and the `app/api/*` handlers.
 */

import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/api-client";
import { getCurrentUser as demoCurrentUser } from "@/demo-backend/session";

export type PortalUser = {
  id: string;
  email: string;
  email_verified: boolean;
  has_password: boolean;
  phone_e164: string | null;
  phone_verified: boolean;
  status: string;
  terms_accepted_current: boolean;
};

export async function getCurrentUser(): Promise<PortalUser | null> {
  if (!API_BASE_URL) {
    return demoCurrentUser();
  }

  try {
    const jar = await cookies();
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { cookie: jar.toString() },
      cache: "no-store"
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json().catch(() => null);
    return (data?.user as PortalUser) || null;
  } catch {
    // A backend that is down must not crash the page — render it signed out.
    return null;
  }
}
