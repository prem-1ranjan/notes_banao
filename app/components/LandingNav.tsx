import Link from "next/link";
import { LogoutButton } from "./LogoutButton";

type LandingNavProps = {
  sourceQuery: string;
  /** Marks a top-nav destination as the current page (e.g. "downloads"). */
  active?: "downloads";
  /** When set, the visitor is signed in: show Dashboard + Logout instead of the
   *  Sign in / Sign up buttons, so the page reads as "logged in". */
  user?: { email: string } | null;
};

export function LandingNav({ sourceQuery, active, user }: LandingNavProps) {
  const downloadsActive = active === "downloads";
  return (
    <nav className="landing-nav" aria-label="NotesBanao">
      <Link className="landing-logo" href="/">
        <img className="logo-mark" src="/icon.png" alt="" aria-hidden="true" />
        <span>NotesBanao</span>
      </Link>
      <div className="landing-actions">
        <a
          className={`ghost link-button${downloadsActive ? " is-active" : ""}`}
          href="/downloads"
          aria-current={downloadsActive ? "page" : undefined}
        >
          Apps &amp; Downloads
        </a>
        {user ? (
          <>
            <span className="landing-user" title={user.email}>{user.email}</span>
            <a className="primary link-button" href="/dashboard">Dashboard</a>
            <LogoutButton className="ghost link-button" />
          </>
        ) : (
          <>
            <a className="ghost link-button" href={`/?auth=login${sourceQuery}`}>Sign in</a>
            <a className="primary link-button" href={`/?auth=signup${sourceQuery}`}>Sign up</a>
          </>
        )}
      </div>
    </nav>
  );
}
