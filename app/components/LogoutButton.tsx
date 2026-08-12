"use client";

import { apiFetch } from "@/lib/api-client";

type LogoutButtonProps = {
  className?: string;
  redirectTo?: string;
};

export function LogoutButton({ className = "ghost", redirectTo = "/" }: LogoutButtonProps) {
  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.assign(redirectTo);
  }

  return (
    <button className={className} type="button" onClick={logout}>
      Sign out
    </button>
  );
}
