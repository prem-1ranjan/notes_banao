# NotesBanao Portal — demo build

The NotesBanao user portal, packaged to run on its own.

NotesBanao records a lecture, transcribes it on your own device, and turns the
transcript into study notes. This repository is the **web portal** part of that
product: sign-in, the dashboard (notes, NB Points, billing, profile, downloads),
and the public marketing and policy pages.

The production portal talks to a backend API for all of its data. That backend
is not part of this repository. In its place is a small **demo backend** that
stores everything in a local SQLite file, so the whole portal is clickable
offline with nothing to install and no accounts to create.

---

## Requirements

- **Node.js 22.5 or newer.** The demo backend uses Node's built-in
  `node:sqlite` module, which does not exist in older versions. Check with
  `node --version`; install the current LTS from <https://nodejs.org> if needed.
- Any modern browser.

There is no database server, no Docker, and no native build step.

## Getting started

```bash
npm install
```

```bash
npm run dev
```

Open <http://127.0.0.1:3000>.

Sign in with **any email address** and **any password of 8 or more characters**.
There is no real authentication — the email you type simply becomes the demo
account's email.

On the first request the app creates `demo.db` in the project root and fills it
from the JSON files in `demo-backend/data/`. That file is git-ignored, so your
experiments never end up in a commit.

## Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload, on port 3000 |
| `npm run build` | Production build (this is what CI would run) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no output files |
| `npm run db:reset` | Delete `demo.db` so the seed data comes back (stop the dev server first) |

`POST /api/demo/reset` does the same reset without stopping the server:

```bash
curl -X POST http://127.0.0.1:3000/api/demo/reset
```

## Demo cheat sheet

| Thing | Value |
|---|---|
| Sign in | Any email, any password of 8+ characters |
| Mobile OTP | Always `123456` (also shown on screen when you request it) |
| Coupon — 25% off a pack | `DEMO25` |
| Coupon — free NB Points | `FREE10` |
| Coupon — rejection state | `EXPIRED` |
| Payment | "Demo Payments" settles instantly; no real gateway is involved |
| Google sign-in | Not available — the button explains why |

Things worth clicking: generate notes from the "Unfinished Recording Found"
card (it charges NB Points using the rules on the Billing screen), download a
note as a PDF (rendered in your browser, not on a server), download an invoice
for a recharge you just made, and claim the trial points.

---

## How the project is laid out

```
app/                     the UI — pages and React components
  api/                   the demo backend's HTTP layer (route handlers)
  components/            shared UI pieces
  dashboard/             the signed-in dashboard and its panels
  ...                    landing, pricing, downloads, policy pages
lib/                     UI-side helpers
  api-client.ts            >> the boundary: every API call the browser makes
  session.ts               >> the boundary: who is signed in, server-side
  business-info.ts         brand, contact and GST details (placeholders here)
  downloads-info.ts        the app download cards
demo-backend/            the fake backend — delete this when you have a real one
  db.ts                    SQLite connection, schema, seeding
  queries.ts               every SQL statement, one function each
  session.ts               the demo session cookie
  data/*.json              the seed data
public/notes-pdf/        vendored PDF renderer used for note downloads
```

### The UI does not touch the database

That separation is deliberate, and worth keeping:

```
React components ──► lib/api-client.ts ──► HTTP ──► app/api/* ──► demo-backend/
   (browser)                                      (route handlers)   (SQLite)
```

- No file under `app/` imports from `demo-backend/`, except the `app/api/*`
  route handlers (which *are* the backend) and `lib/session.ts`.
- Components never call `fetch` directly. They go through `apiFetch` /
  `apiJson` in [`lib/api-client.ts`](lib/api-client.ts).

Which means the whole front end can be pointed at a different backend — written
in any language — by setting one environment variable:

```
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

With that set, the same requests go to that server instead of this app's own
route handlers, and `demo-backend/` plus `app/api/` can be deleted outright.
Every endpoint, request shape and response shape is written down in
[API-CONTRACT.md](API-CONTRACT.md).

### The demo backend

`demo-backend/db.ts` opens `demo.db`, applies the schema, and seeds it from
`demo-backend/data/*.json` the first time it runs. `demo-backend/queries.ts`
holds every SQL statement as a small named function; the route handlers in
`app/api/` do nothing but check the session, call one of those functions, and
shape the JSON.

To change what the portal shows on a fresh start, edit the JSON in
`demo-backend/data/` and run `npm run db:reset`.

Because it is a real database file, your changes survive a restart — add a note,
spend some points, and it is all still there tomorrow.

---

## How this differs from the production portal

This is a real copy of the portal UI, not a mock-up. What is missing is
everything that needs a server we cannot ship:

- **No real authentication.** No password checking, email verification,
  password reset emails, or Google sign-in.
- **No real payments.** The demo gateway settles instantly. No Razorpay or
  PhonePe integration, no signature verification, no webhooks.
- **No LLM.** Generating notes from a recovered transcript writes a templated
  document instead of calling a model.
- **No object storage.** The Windows installer and Android APK downloads are
  disabled, and note PDFs are rendered in the browser.
- **No staff tooling.** The admin and support consoles, and the bug bounty and
  institution features, are not part of this repository.
- **Placeholder business details.** The registered name, address, GSTIN and
  support contacts in `lib/business-info.ts` are made up. The GST invoice is
  generated from them, so it is structurally real but commercially meaningless.
- **Single shared account.** There is one row in the `users` table. Signing in
  with a different email renames it rather than creating a second account.

## Ideas for things to work on

- Notes-generation jobs never progress: the seeded job sits at "generating"
  forever. Give jobs a lifecycle in the demo backend so a new job moves through
  queued → generating → done and produces a note.
- `npm run lint` reports warnings for panels that set state inside an effect
  (`WalletPanel`, `TrialClaimControl`, the dashboard's `?section=` handling).
  Computing that state during render instead is a good refactor.
- The dashboard reloads whole lists after every change. Update the local state
  in place and see how much snappier it feels.
- The notes list has no empty state worth the name — delete every note and see.
- Nothing is responsive below about 900px. The sidebar in particular.
- Add a search or filter to the notes list; the backend has no such endpoint
  yet, so you would design one, write it in `demo-backend/queries.ts`, and wire
  it up.

## Conventions

- TypeScript everywhere, `strict` on. `npm run typecheck` must stay clean.
- `npm run lint` must stay free of **errors**; warnings are tracked, not fatal.
- Comments explain *why*, not *what*. Match the tone of the code around you.
- Keep the UI/backend boundary: if a component needs data, add an endpoint —
  do not import from `demo-backend/`.
