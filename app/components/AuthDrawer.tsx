import { Suspense } from "react";
import { LoginClient } from "../LoginClient";

type AuthMode = "login" | "signup" | "terms";

type AuthDrawerProps = {
  closeHref: string;
  initialMode: AuthMode;
};

export function AuthDrawer({ closeHref, initialMode }: AuthDrawerProps) {
  return (
    <section className="auth-modal" role="dialog" aria-modal="true" aria-label="Account access">
      <div className="auth-modal-panel">
        <a className="ghost link-button auth-modal-close" href={closeHref}>Close</a>
        <Suspense fallback={<section className="panel"><p className="message">Loading...</p></section>}>
          <LoginClient initialMode={initialMode} />
        </Suspense>
      </div>
    </section>
  );
}
