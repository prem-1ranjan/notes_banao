"use client";

import type { User } from "./types";

type DashboardTopBarProps = {
  title: string;
  subtitle: string;
  user: User;
  onLogout: () => void;
};

export function DashboardTopBar({ title, subtitle, user, onLogout }: DashboardTopBarProps) {
  const displayName = user.email;
  const initial = displayName.slice(0, 1).toUpperCase();

  return (
    <header className="portal-topbar">
      <div className="topbar-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="account-chip" aria-label={`Signed in as ${displayName}`}>
        <span className="avatar" aria-hidden="true">{initial}</span>
        <span className="account-identity">
          <span>Signed in</span>
          <strong title={displayName}>{displayName}</strong>
        </span>
        <button className="account-logout" onClick={onLogout} type="button">Logout</button>
      </div>
    </header>
  );
}
