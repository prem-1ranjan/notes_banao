import type { ReactNode } from "react";
import { LandingFooter } from "./LandingFooter";
import { LandingNav } from "./LandingNav";

type PublicPageShellProps = {
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
};

type PolicySectionProps = {
  title: string;
  children: ReactNode;
};

export function PublicPageShell({ eyebrow, title, description, children }: PublicPageShellProps) {
  return (
    <main className="landing-page">
      <LandingNav sourceQuery="" />
      <section className="landing-band public-page">
        <header className="public-page-header">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          <p>{description}</p>
        </header>
        <div className="public-page-content">{children}</div>
      </section>
      <LandingFooter />
    </main>
  );
}

export function PolicySection({ title, children }: PolicySectionProps) {
  return (
    <section className="panel policy-section">
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}

export function PageNote({ children }: { children: ReactNode }) {
  return <div className="panel page-note">{children}</div>;
}
