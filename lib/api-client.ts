/**
 * The one place the UI talks to a server.
 *
 * Every screen goes through these helpers instead of calling `fetch` directly,
 * so the whole front end can be pointed at a different backend by changing a
 * single environment variable — no component has to be touched.
 *
 *   .env.local
 *   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
 *
 * With the variable unset (the default) requests go to this app's own
 * `/api/*` route handlers, which are the demo backend in `demo-backend/`.
 * Set it, and the exact same requests go to your REST service instead — the
 * paths and payloads are documented in API-CONTRACT.md.
 *
 * `credentials: "include"` is always sent so the session cookie travels even
 * when the API lives on another origin. A cross-origin API must answer with
 * `Access-Control-Allow-Credentials: true` and an explicit
 * `Access-Control-Allow-Origin` (not `*`).
 */

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");

/** Absolute URL for an API path. `apiUrl("/api/notes/recent")`. */
export function apiUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}

/** `fetch`, aimed at the API and carrying the session cookie. */
export function apiFetch(path: string, init: RequestInit = {}) {
  return fetch(apiUrl(path), { credentials: "include", ...init });
}

/** A message the API asked us to show the user, rather than a raw error. */
export type ApiUserMessage = {
  title?: string;
  message: string;
  severity?: "info" | "success" | "attention";
  action?: "none" | "sign_in" | "recharge" | "retry" | "open_dashboard";
};

export class ApiError extends Error {
  status: number;
  userMessage: ApiUserMessage | null;

  constructor(message: string, status: number, userMessage: ApiUserMessage | null = null) {
    super(userMessage?.message || message);
    this.name = "ApiError";
    this.status = status;
    this.userMessage = userMessage;
  }
}

/** True when the session is gone and the user has to sign in again. */
export function isSessionExpired(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

/**
 * GET/POST JSON and throw an ApiError on anything that is not a success.
 * The API signals failure either with an HTTP status or with `ok: false`.
 */
export async function apiJson(path: string, init: RequestInit = {}) {
  const response = await apiFetch(path, init);
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.ok === false) {
    throw new ApiError(
      data.message || data.error || data.detail || "Request failed.",
      response.status,
      normalizeUserMessage(data.userMessage || data.details?.userMessage)
    );
  }
  return data;
}

/** POST a JSON body. */
export function postJson(path: string, body: unknown) {
  return apiJson(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
}

function normalizeUserMessage(value: unknown): ApiUserMessage | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const candidate = value as Partial<ApiUserMessage>;
  const message = String(candidate.message || "").trim();
  if (!message) {
    return null;
  }
  return {
    title: String(candidate.title || "").trim(),
    message,
    severity: ["info", "success", "attention"].includes(String(candidate.severity || ""))
      ? candidate.severity
      : "attention",
    action: ["none", "sign_in", "recharge", "retry", "open_dashboard"].includes(String(candidate.action || ""))
      ? candidate.action
      : "none"
  };
}
