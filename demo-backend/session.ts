/**
 * Demo session handling.
 *
 * The real portal exchanges an email and password with an auth service and
 * stores short-lived access/refresh tokens in httpOnly cookies. This build has
 * no auth service, so "signing in" drops a marker cookie that points at the
 * single account in the demo database.
 *
 * Any email and any password of 8+ characters are accepted, and the email you
 * type becomes the demo account's email so the dashboard shows something
 * familiar.
 */

import { cookies } from "next/headers";
import { portalUser, setUserEmail, type PortalUser } from "@/demo-backend/queries";

const SESSION_COOKIE = "notesbanao_demo_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type { PortalUser };

/** The signed-in user, or null when there is no demo session cookie. */
export async function getCurrentUser(): Promise<PortalUser | null> {
  const jar = await cookies();
  if (!jar.get(SESSION_COOKIE)?.value) {
    return null;
  }
  return portalUser();
}

/** Start a demo session and adopt the email typed at the login form. */
export async function signIn(email: string): Promise<PortalUser> {
  const cleaned = email.trim().toLowerCase();
  if (cleaned) {
    setUserEmail(cleaned);
  }
  const user = portalUser();
  const jar = await cookies();
  jar.set(SESSION_COOKIE, user.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
  return user;
}

export async function signOut() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
