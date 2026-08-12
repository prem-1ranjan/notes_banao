# API contract

Every HTTP call the portal UI makes. The demo backend in `demo-backend/`
implements all of it; a replacement backend in any language only has to match
what is written here.

## Conventions

- **Base URL.** Paths are relative to `NEXT_PUBLIC_API_BASE_URL`, or to the
  portal's own origin when that variable is unset. See `lib/api-client.ts`.
- **Authentication.** A session cookie, sent with every request
  (`credentials: "include"`). The demo build uses a plain `notesbanao_demo_session`
  cookie; a real backend would issue whatever it likes, as long as the browser
  keeps sending it. Requests without a valid session get **401**.
- **Cross-origin.** If the API is on another origin it must answer with
  `Access-Control-Allow-Credentials: true` and an explicit
  `Access-Control-Allow-Origin` (not `*`), and handle `OPTIONS` preflight.
- **Success.** `200` with a JSON body. Most endpoints include `"ok": true`.
- **Failure.** A 4xx status **and/or** `"ok": false`. The UI treats either as an
  error, and shows `message`:

  ```json
  { "ok": false, "message": "This coupon has expired." }
  ```

  `401` and `403` are special: the UI treats them as "signed out" and returns
  the user to the login screen.

- **Rich errors.** An endpoint may add a `userMessage` object when the failure
  deserves more than a sentence:

  ```json
  {
    "ok": false,
    "message": "This recording costs 4 NB Points and you have 1.",
    "userMessage": {
      "title": "Not enough NB Points",
      "message": "Add points to generate these notes.",
      "severity": "attention",
      "action": "recharge"
    }
  }
  ```

  `severity` is `info` | `success` | `attention`. `action` is `none` |
  `sign_in` | `recharge` | `retry` | `open_dashboard`.

- **Money** is always in **paise** (integer, ₹1 = 100). **NB Points** are whole
  numbers. **Timestamps** are ISO 8601 strings in UTC.
- **Pagination** looks the same everywhere:

  ```json
  { "page": 1, "pageSize": 10, "total": 42, "totalPages": 5 }
  ```

---

## Authentication

### `POST /api/auth/login`

```json
{ "email": "student@example.com", "password": "hunter2000" }
```

→ `{ "ok": true, "user": User }`, or `{ "ok": true, "user": User, "termsRequired": true }`
when the account has not accepted the current terms. The UI sends the user to
the terms screen in that case.

### `POST /api/auth/signup`

```json
{ "email": "…", "password": "…", "accepted_terms": true, "referral_email": "…" }
```

`accepted_terms` must be `true`. `referral_email` is optional.

→ `{ "ok": true, "user": User, "needsEmailVerification": false }`. Return
`needsEmailVerification: true` instead if your backend sends a verification
email — the UI then shows a "check your email" screen rather than signing in.

### `POST /api/auth/logout`
→ `{ "ok": true }`, and the session cookie is cleared.

### `GET /api/auth/me`
→ `{ "ok": true, "user": User }`, or `401`. Used by server-rendered pages to
decide between the dashboard and the login screen.

### `POST /api/auth/password`
```json
{ "current_password": "…", "new_password": "…" }
```
→ `{ "ok": true, "message": "Password changed." }`

### `POST /api/auth/password/reset/start`
```json
{ "email": "…" }
```
→ `{ "ok": true, "message": "…" }` — **always the same reply**, whether or not
the address has an account, so the endpoint cannot be used to discover users.

### `POST /api/auth/password/reset/complete`
```json
{ "token": "…", "new_password": "…" }
```
→ `{ "ok": true, "message": "…" }`

### `POST /api/auth/terms/accept`
→ `{ "ok": true }`. Sets `terms_accepted_current` on the account.

### `GET /api/google/start`
→ `{ "ok": true, "authUrl": "https://accounts.google.com/…" }`. The browser is
then sent to `authUrl`. The demo build answers `501` with an explanation.

### The `User` object

```json
{
  "id": "usr_demo_1",
  "email": "student@example.com",
  "email_verified": true,
  "has_password": true,
  "phone_e164": "+919876543210",
  "phone_verified": true,
  "status": "active",
  "terms_accepted_current": true
}
```

---

## NB Points wallet

### `GET /api/wallet/overview?page=1&limit=5`

```json
{
  "ok": true,
  "wallet": { "user_id": "usr_demo_1", "balance_points": 240, "reserved_points": 0 },
  "activities": [ Activity ],
  "pagination": { "page": 1, "pageSize": 5, "total": 9, "totalPages": 2 }
}
```

An `Activity` is one movement, newest first:

```json
{
  "id": "act_demo_8",
  "type": "point",
  "kind": "capture",
  "point_type": "usage",
  "amount_paise": 0,
  "base_points": null,
  "bonus_points": null,
  "total_points": null,
  "points_delta": -3,
  "balance_after_points": 240,
  "reserved_after_points": 0,
  "currency": "INR",
  "status": "completed",
  "provider": null,
  "provider_order_id": null,
  "source_id": "note_demo_1",
  "reference_id": "note_demo_1",
  "note_title": "Operating Systems - Process Scheduling",
  "duration_seconds": 3120,
  "created_at": "2026-08-11T14:32:00.000Z"
}
```

- `type: "payment"` — a recharge. The UI reads `status` (`created`, `pending`,
  `paid`, `failed`, `cancelled`, `refunded`) and `base_points`/`bonus_points`.
- `type: "point"` — a points movement. The UI reads `kind` (`reserve`,
  `capture`, `release`, `grant`) and `points_delta`.

### `POST /api/wallet/recharge`

```json
{ "package_code": "regular_200", "gateway": "demo_gateway", "coupon_code": "DEMO25" }
```

`coupon_code` is optional. Three shapes of reply are accepted:

1. **Redirect gateway** — `{ "ok": true, "payment_url": "https://…" }`; the
   browser navigates there.
2. **In-page gateway** — `{ "ok": true, "order": {...}, "razorpay_checkout": {...} }`.
3. **Settled immediately** (what the demo backend does):

   ```json
   {
     "ok": true,
     "order": { "id": "ord_…", "amount_paise": 3675, "currency": "INR",
                "base_points": 50, "bonus_points": 0, "total_points": 50 },
     "wallet": { … },
     "activities": [ … ],
     "pagination": { … }
   }
   ```

### `POST /api/wallet/coupon/validate`

```json
{ "code": "DEMO25", "package_code": "starter_50" }
```

Preview only — nothing is claimed. Free-points coupon:

```json
{
  "ok": true,
  "coupon": { "code": "FREE10", "kind": "free_points", "description": "…" },
  "preview": { "kind": "free_points", "requires_payment": false, "free_points": 10 }
}
```

Percentage coupon:

```json
{
  "ok": true,
  "coupon": { "code": "DEMO25", "kind": "percent_off", "description": "…" },
  "preview": {
    "kind": "percent_off",
    "requires_payment": true,
    "percent_off": 25,
    "package_code": "starter_50",
    "currency": "INR",
    "original_amount_paise": 4900,
    "discounted_amount_paise": 3675,
    "original_total_points": 50,
    "total_points": 50
  }
}
```

### `POST /api/wallet/coupon/redeem`

```json
{ "code": "FREE10" }
```
→ `{ "ok": true, "points_credited": 10 }`. Free-points coupons only.

---

## Billing

### `GET /api/billing/config`

What a note costs, by recording length — this is what the Billing screen shows.

```json
{
  "ok": true,
  "rule_sets": [
    { "id": "rs_demo_1", "code": "note_duration_v1", "product_code": "note_generation",
      "billing_mode": "duration", "active": 1 }
  ],
  "duration_rules": [
    { "id": "dr_demo_1", "rule_set_code": "note_duration_v1",
      "min_duration_seconds": 0, "max_duration_seconds": 1800,
      "charge_points": 1, "label": "Up to 30 minutes", "sort_order": 1, "active": 1 }
  ],
  "referral_reward": { "code": "referral_v1", "points_amount": 15, "active": true }
}
```

The UI only displays rule sets with `product_code: "note_generation"`.
`max_duration_seconds: null` means "and above".

### `GET /api/billing/packages`

```json
{
  "ok": true,
  "packages": [
    { "code": "regular_200", "name": "Regular", "price_paise": 19900, "currency": "INR",
      "base_points": 200, "bonus_points": 20, "total_points": 220 }
  ],
  "payment_gateways": [
    { "code": "demo_gateway", "display_name": "Demo Payments", "provider_type": "demo",
      "environment": "demo", "active": true, "sort_order": 1 }
  ]
}
```

### `GET /api/billing/invoice/{orderId}`

A GST invoice snapshot for a paid recharge. The PDF is built in the browser from
this JSON, so regenerating it later must produce the identical document.

```json
{
  "ok": true,
  "doc_type": "tax_invoice",
  "invoice_number": "DEMO/2026/ABC123",
  "fy": "2026-27",
  "seller": { "legal_name": "…", "gstin": "…", "address": "…",
              "state_name": "Karnataka", "state_code": "29" },
  "place_of_supply": "Karnataka",
  "buyer": { "email": "…", "phone": "…" },
  "description": "NB Points recharge",
  "sac_code": "998434",
  "currency": "INR",
  "gross_paise": 3675,
  "taxable_paise": 3114,
  "cgst_paise": 281,
  "sgst_paise": 280,
  "igst_paise": 0,
  "gst_rate_bps": 1800,
  "reverse_charge": false,
  "created_at": "2026-08-12T06:06:00.000Z",
  "payment_order_id": "ord_…"
}
```

`doc_type` is `tax_invoice` or `receipt`. Prices are GST-inclusive, so
`taxable_paise` is backed out of `gross_paise`.

---

## Notes

### `GET /api/notes/recent?page=1&limit=8`

Supports conditional requests. Answer `304` with no body when the client's
`If-None-Match` matches the current `ETag`; the dashboard polls this while a job
is running.

```json
{
  "ok": true,
  "notes": [
    { "id": "note_demo_1", "title": "…", "created_at": "…", "duration_seconds": 3120,
      "billing_mode": "duration", "preview_limited": false, "preview_limit_minutes": null }
  ],
  "jobs": [
    { "id": "job_demo_1", "title": "…", "status": "generating", "error_code": "",
      "error_message": "", "notes_id": null, "created_at": "…", "updated_at": "…",
      "duration_seconds": 2400 }
  ],
  "retentionDays": 30,
  "maxRecordingMinutes": 180,
  "pagination": { … },
  "jobsPagination": { … }
}
```

Job `status` values the UI understands:

| Status | Meaning |
|---|---|
| `recording`, `recording_paused` | Capture still running on the device |
| `queued`, `reserving_points`, `generating`, `saving` | In progress; the UI polls |
| `completed` | Done — `notes_id` points at the note |
| `failed`, `cancelled`, `expired` | Terminal; `error_code` / `error_message` shown |

### `DELETE /api/notes/{noteId}`
→ `{ "ok": true }`, or `404`.

### `GET /api/notes/{noteId}/download?format=md`

Returns the note body as **Markdown** — `text/markdown; charset=utf-8` with a
`content-disposition` filename. Not JSON. The browser turns it into a PDF
locally, so no server-side rendering is needed.

---

## Transcripts

A transcript that was uploaded by a capture app but never turned into notes.

### `GET /api/transcripts/recoverable?page=1&limit=10`

Note the **camelCase** field names here, unlike the notes list.

```json
{
  "ok": true,
  "sessions": [
    {
      "id": "ts_demo_1",
      "title": "Compiler Design - Lexical Analysis",
      "status": "uploaded",
      "mode": "continuous",
      "segmentCount": 42,
      "uploadedDurationMs": 2520000,
      "totalDurationMs": 2700000,
      "recoveryReason": "network_lost",
      "recoveryWarning": "The last 3 minutes were not uploaded…",
      "recoveryAvailableAt": "2026-08-12T03:20:00.000Z",
      "updatedAt": "2026-08-12T03:15:00.000Z"
    }
  ],
  "pagination": { … }
}
```

### `POST /api/transcripts/{sessionId}/generate`

Charge NB Points and start generating notes.
→ `{ "ok": true, "notes_id": "note_…", "points_charged": 2 }`

On an insufficient balance, answer `402` with the `userMessage` shape above and
`action: "recharge"`. **Nothing may be charged on a failure.**

### `POST /api/transcripts/{sessionId}/discard`
→ `{ "ok": true }`. Dismisses the recovery item without generating anything.

---

## Trial and referrals

### `GET /api/trial/status`
```json
{ "ok": true, "claimed": false, "points_amount": 30,
  "phone_e164": null, "phone_verified": false }
```

### `POST /api/trial/start`
```json
{ "phone": "9876543210" }
```
→ `{ "ok": true, "status": "otp_sent", "can_claim_trial": true, "dev_otp": "123456" }`

`dev_otp` is only for non-production builds; omit it and the UI simply stops
showing the code. If the number cannot be used, answer `200` with
`can_claim_trial: false` and a `message` — that is a normal outcome, not an error.

### `POST /api/trial/verify`
```json
{ "phone": "9876543210", "otp": "123456" }
```
→ `{ "ok": true, "points_credited": 30 }`. The UI then re-reads
`/api/trial/status` to refresh the profile.

### `POST /api/referrals/invite`
```json
{ "referral_email": "friend@example.com" }
```
→ `{ "ok": true, "message": "…", "signup_url": "https://…/?auth=signup&ref=…", "points_amount": 15 }`

---

## Account deletion

### `GET /api/account/deletion-request`
→ `{ "ok": true, "pending": true, "request": { "reason": "…", "requestedAt": "…", "eligibleAt": "…" } }`
`request` is `null` when nothing is pending.

### `POST /api/account/deletion-request`
```json
{ "reason": "…" }
```
A reason is required. → `{ "ok": true, "pending": true, "request": { … } }`

### `POST /api/account/deletion-request/revoke`
→ `{ "ok": true, "pending": false }`

### `POST /api/public/account-deletion/request`

**No session required** — this is the deletion URL listed on the app store
pages. Optionally carries `turnstileToken` from a Cloudflare Turnstile captcha.

```json
{ "email": "…", "reason": "…", "turnstileToken": "…" }
```

→ `{ "ok": true, "message": "…" }` — again, the same reply whether or not the
account exists.

### `POST /api/public/account-deletion/verify`
```json
{ "token": "…" }
```
→ `{ "ok": true, "message": "…" }`

---

## Demo-only

### `POST /api/demo/reset`

Wipes the demo database and re-seeds it from `demo-backend/data/*.json`. This
endpoint exists only in the demo backend and has no production counterpart —
do not implement it in a real API.
