import { nbPoints } from "./format";
import type { SectionKey, User, WalletOverview } from "./types";

type DashboardSidebarProps = {
  activeSection: SectionKey;
  collapsed: boolean;
  error: boolean;
  message: string;
  user: User;
  walletOverview: WalletOverview | null;
  onSectionChange: (section: SectionKey) => void;
  onToggleCollapsed: () => void;
};

export function DashboardSidebar({
  activeSection,
  collapsed,
  error,
  message,
  user,
  walletOverview,
  onSectionChange,
  onToggleCollapsed
}: DashboardSidebarProps) {
  const wallet = walletOverview?.wallet;
  const items: Array<[SectionKey, string, string]> = [
    ["home", "Home", "First note guide"],
    ["notes", "Notes", "Past 7 days"],
    ["wallet", "NB Points", wallet ? nbPoints(wallet.balance_points) : "Available NB Points"],
    ["billing", "Billing Rule", "Usage based"],
    ["profile", "User Profile", user.phone_verified ? "Verified" : "Mobile pending"]
  ];

  return (
    <aside className="portal-sidebar">
      <div className="portal-brand">
        <img src="/icon.png" alt="" aria-hidden="true" />
        <div className="portal-brand-copy">
          <strong>NotesBanao</strong>
          <span>User portal</span>
        </div>
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="sidebar-toggle"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          type="button"
          onClick={onToggleCollapsed}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d={collapsed ? "M9 5l7 7-7 7-1.4-1.4L12.2 12 7.6 6.4 9 5Z" : "M15 5l1.4 1.4L11.8 12l4.6 5.6L15 19l-7-7 7-7Z"} />
          </svg>
        </button>
      </div>
      <nav className="side-nav" aria-label="Portal sections">
        {items.map(([key, label, hint]) => (
          <button
            className={`side-nav-item ${activeSection === key ? "active" : ""}`}
            key={key}
            onClick={() => onSectionChange(key)}
            aria-label={`${label}: ${hint}`}
            title={`${label} - ${hint}`}
            type="button"
          >
            <span className="side-nav-icon" aria-hidden="true">
              <NavIcon section={key} />
            </span>
            <span className="side-nav-copy">
              <span>{label}</span>
              <small>{hint}</small>
            </span>
          </button>
        ))}
      </nav>

      {/* A dashboard section (renders the app cards in the portal body), not a
          route — pinned to the bottom, just above the "go back to the
          extension" status, via .sidebar-download { margin-top:auto }. */}
      <button
        className={`side-nav-item sidebar-download ${activeSection === "downloads" ? "active" : ""}`}
        onClick={() => onSectionChange("downloads")}
        aria-label="Apps & Downloads: Desktop & Android"
        title="Apps & Downloads - Desktop & Android"
        type="button"
      >
        <span className="side-nav-icon" aria-hidden="true">
          <NavIcon section="downloads" />
        </span>
        <span className="side-nav-copy">
          <span>Apps &amp; Downloads</span>
          <small>Desktop &amp; Android</small>
        </span>
      </button>

      <div className="sidebar-status">
        <span className={error ? "status-dot error" : "status-dot"} />
        <p>{message}</p>
      </div>
    </aside>
  );
}

function NavIcon({ section }: { section: SectionKey }) {
  switch (section) {
    case "downloads":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M12 3a1 1 0 0 1 1 1v8.6l2.3-2.3 1.4 1.4L12 16.4l-4.7-4.7 1.4-1.4L11 12.6V4a1 1 0 0 1 1-1ZM5 18h14v2H5v-2Z" />
        </svg>
      );
    case "home":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M4 10.5 12 3l8 7.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-9.5Zm2 .9V19h2v-6h8v6h2v-7.6l-6-5.63-6 5.63Z" />
        </svg>
      );
    case "wallet":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h10A2.5 2.5 0 0 1 19 7.5v1H7.5A2.5 2.5 0 0 0 5 11v5.5A2.5 2.5 0 0 0 7.5 19h11A2.5 2.5 0 0 1 16 21H6.5A4.5 4.5 0 0 1 2 16.5v-9A4.5 4.5 0 0 1 6.5 3h10A4.5 4.5 0 0 1 21 7.5V9h-2v-1.5A2.5 2.5 0 0 0 16.5 5h-10A2.5 2.5 0 0 0 4 7.5Zm3 3.5h13a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H7.5A.5.5 0 0 1 7 17.5V11Zm12 4.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" />
        </svg>
      );
    case "notes":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M7 3h7.5L20 8.5V19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm7 2.5V9h3.5L14 5.5ZM8 12h8v2H8v-2Zm0 4h8v2H8v-2Z" />
        </svg>
      );
    case "billing":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5v1.1c1.7.3 3 1.4 3 2.9h-2c0-.6-.7-1-2-1s-2 .4-2 1 .5.9 2.4 1.2C15 12.7 16 13.6 16 15c0 1.6-1.2 2.7-3 3v1h-2v-1c-1.8-.3-3-1.4-3-3h2c0 .7.8 1.1 2 1.1 1.4 0 2-.4 2-1s-.5-.8-2.4-1.2C9 13.4 8 12.4 8 11c0-1.5 1.2-2.6 3-2.9V7h2Z" />
        </svg>
      );
    case "profile":
      return (
        <svg viewBox="0 0 24 24">
          <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.4 0-8 2.4-8 5.3V21h16v-1.7C20 16.4 16.4 14 12 14Z" />
        </svg>
      );
  }
}
