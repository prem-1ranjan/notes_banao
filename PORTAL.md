# Working on the portal

A short tour of how this project is put together and where to start changing it.
If you have not got it running yet, do [README.md](README.md) first.

---

## The one rule

**The UI never touches the database.** It asks a server over HTTP, the same way
it would in production.

```
React components ──► lib/api-client.ts ──► HTTP ──► app/api/* ──► demo-backend/
    (browser)            (the boundary)          (route handlers)    (SQLite)
```

Everything to the left of the arrow could be deployed on its own against a
completely different backend. Keep it that way:

- Components never call `fetch` directly — they use `apiFetch` / `apiJson` from
  [`lib/api-client.ts`](lib/api-client.ts).
- Nothing under `app/` imports from `demo-backend/`, except the `app/api/*`
  route handlers (which *are* the backend) and [`lib/session.ts`](lib/session.ts).
- If a screen needs data it cannot get, **add an endpoint** — do not reach into
  the database from a component.

Why it matters: the backend here is a stand-in. Point
`NEXT_PUBLIC_API_BASE_URL` at a real API and the entire front end talks to that
instead, with no component changes. [API-CONTRACT.md](API-CONTRACT.md) writes
down every endpoint so that backend can be built in any language.

## The map

```
app/                        the UI
  page.tsx                  landing page + the sign-in drawer
  layout.tsx                shell that wraps every page
  globals.css               ALL the styling — there is no CSS framework
  components/               pieces shared across pages
  dashboard/
    page.tsx                server component: is anyone signed in?
    DashboardClient.tsx     the dashboard's brain — loads data, holds state
    components/             one file per panel (Notes, Wallet, Billing, …)
  downloads/, pricing/, privacy-policy/, …   public pages
  api/                      the demo backend's HTTP layer

lib/                        UI-side helpers
  api-client.ts             >> every API call the browser makes
  session.ts                >> who is signed in, for server components
  business-info.ts          brand, contact, GST details (placeholders here)
  downloads-info.ts         the app download cards

demo-backend/               the fake backend — delete it when a real one exists
  db.ts                     SQLite connection, table definitions, seeding
  queries.ts                every SQL statement, one named function each
  session.ts                the demo session cookie
  data/*.json               the sample data

public/notes-pdf/           vendored PDF renderer (third-party, don't edit)
```

## Follow one thing end to end

The best way in. Here is how the NB Points balance reaches the screen — five
files, in order:

1. **[`app/dashboard/page.tsx`](app/dashboard/page.tsx)** — a server component.
   Calls `getCurrentUser()`; sends you to the login page if there is no session,
   otherwise renders `DashboardClient`.

2. **[`app/dashboard/DashboardClient.tsx`](app/dashboard/DashboardClient.tsx)** —
   runs in the browser. On mount it calls `loadWalletOverview()`, which does:

   ```ts
   const data = await apiJson(`/api/wallet/overview?page=${page}&limit=${pageSize}`);
   ```

   and stores the result in React state.

3. **[`lib/api-client.ts`](lib/api-client.ts)** — turns that path into a real
   URL, attaches the session cookie, and throws a useful error if the response
   is a failure.

4. **[`app/api/wallet/overview/route.ts`](app/api/wallet/overview/route.ts)** —
   the endpoint. Checks the session, reads the page/limit query parameters,
   calls two query functions, returns JSON.

5. **[`demo-backend/queries.ts`](demo-backend/queries.ts)** — `walletSummary()`
   and `listActivities()`. Plain SQL against the tables defined in
   [`demo-backend/db.ts`](demo-backend/db.ts).

Then back up the chain: `DashboardClient` passes the data to
`components/WalletPanel.tsx`, which draws it.

Every other feature follows the same five steps. Read them once and the rest of
the codebase stops being surprising.

## Recipes

### Change how something looks

All styling is plain CSS in [`app/globals.css`](app/globals.css) (plus two CSS
modules in the dashboard). Class names are descriptive — search the file for the
class you see in the component.

### Add a field to a note

Touch these, in this order:

1. `demo-backend/data/notes.json` — add it to the sample data.
2. `demo-backend/db.ts` — add the column to the `notes` table.
3. `demo-backend/queries.ts` — return it from `listNotes()`.
4. `app/dashboard/components/types.ts` — add it to the `RecentNote` type.
5. `app/dashboard/components/NotesPanel.tsx` — display it.
6. `npm run db:reset`, because step 1 and 2 only apply to a fresh database.

### Add a new endpoint

1. Write the query in `demo-backend/queries.ts`.
2. Create `app/api/<your-path>/route.ts`. Copy an existing one — they all follow
   the same shape: check the session, do the work, return JSON.
3. Call it from a component with `apiJson("/api/<your-path>")`.
4. Write it down in [API-CONTRACT.md](API-CONTRACT.md), so whoever builds the
   real backend knows it exists.

### Look inside the database

`demo.db` is an ordinary SQLite file. Open it with any SQLite browser, or:

```bash
node -e "const{DatabaseSync}=require('node:sqlite');console.table(new DatabaseSync('demo.db').prepare('SELECT id,title,duration_seconds FROM notes').all())"
```

## What is real and what is pretend

Real, and worth trusting:

- Every screen, component, and interaction — this is the production UI.
- The pagination, ETag caching on the notes list, and error handling.
- NB Points arithmetic: generating notes charges the right amount, using the
  duration rules the Billing screen displays.
- The GST invoice maths.

Pretend:

- **Authentication.** No password is checked or stored. No email is ever sent,
  so verification, password reset and referral invites all just say they worked.
- **Payments.** The demo gateway settles instantly. No real gateway, no
  signature verification, no webhooks.
- **Notes generation.** There is no AI model here. Generating notes from a
  recovered transcript writes a templated document.
- **File storage.** The Windows installer and Android APK downloads are disabled.
- **Accounts.** There is exactly one row in the `users` table. Signing in with a
  different email renames it rather than creating a second account.

Not in this repository at all: the admin and support consoles, the bug bounty and
institution features, and the capture apps (browser extension, Windows app,
Android app).

The business details in `lib/business-info.ts` — name, address, GSTIN, phone —
are made up. Do not put real ones there.

## Good first tasks

Roughly easiest first:

1. **Clear the lint warnings.** `npm run lint` flags a few panels that set state
   inside an effect (`WalletPanel`, `TrialClaimControl`, and the dashboard's
   `?section=` handling). React would rather that state were computed during
   render. Fixing them is a real refactor with a visible payoff.
2. **Write a proper empty state.** Delete every note and look at the Notes
   screen. It deserves better.
3. **Make it work on a phone.** Nothing below about 900px wide is usable — the
   dashboard sidebar in particular.
4. **Stop reloading whole lists.** After deleting a note the dashboard re-fetches
   everything. Update the local state in place instead and feel the difference.
5. **Give jobs a lifecycle.** The seeded notes-generation job sits at
   "generating" forever, because nothing advances it. Make a new job move
   queued → generating → done in the demo backend, producing a note at the end.
6. **Add search to the notes list.** No endpoint exists for this, so you would
   design one, write the SQL, add the route, wire up the UI, and document it in
   API-CONTRACT.md. That is the whole stack in one task.

## House rules

- TypeScript everywhere, `strict` on. `npm run typecheck` must stay clean.
- `npm run lint` must stay free of **errors**. Warnings are tracked, not fatal.
- Comments explain *why*, not *what*. Match the tone of the code around you —
  and if a comment would just restate the line below it, leave it out.
- Small commits with a message that says what changed and why.
- Keep the boundary at the top of this file. It is the thing most worth
  protecting in this codebase.
