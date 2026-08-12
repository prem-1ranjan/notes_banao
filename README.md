# NotesBanao Portal — demo build

The NotesBanao web portal: sign-in, the dashboard (notes, NB Points, billing,
profile, downloads), and the public marketing and policy pages.

NotesBanao records a lecture, transcribes it on your own device, and turns the
transcript into study notes. This repository is only the **portal** — the web
app users sign in to. The production backend is not included. In its place is a
small demo backend that keeps everything in a local SQLite file, so the whole
portal works offline with nothing to install and no accounts to create.

**New here? Read [PORTAL.md](PORTAL.md) after you have it running** — it explains
how the project is put together and where to start changing things.

---

## 1. Install Node.js

You need **Node.js 22.5 or newer**. The demo backend uses Node's built-in
`node:sqlite` module, which does not exist in older versions.

Check what you have:

```bash
node --version
```

If it prints anything below `v22.5.0`, install the current LTS from
<https://nodejs.org> and open a new terminal.

Nothing else is required — no database server, no Docker, no Python, no C++
build tools.

## 2. Get the code

```bash
git clone <repository-url> notesbanao-portal
```

```bash
cd notesbanao-portal
```

## 3. Install the dependencies

```bash
npm install
```

This takes a minute or two and creates `node_modules/`, which is git-ignored.

## 4. Start the app

```bash
npm run dev
```

Wait for `✓ Ready`, then open **<http://127.0.0.1:3000>**.

The first request creates `demo.db` in the project folder and fills it with the
sample data from `demo-backend/data/`. That file is git-ignored, so nothing you
click ever ends up in a commit.

Leave this terminal running. The app reloads by itself when you save a file.

## 5. Sign in

Use **any email address** and **any password of 8 or more characters**.

There is no real authentication in this build — the email you type just becomes
the demo account's email, so the dashboard shows something familiar.

You should land on the dashboard with 240 NB Points, a few notes, and an
unfinished recording waiting to be turned into notes.

---

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload, on port 3000 |
| `npm run build` | Production build — run this before pushing |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no output files |
| `npm run db:reset` | Delete `demo.db` so the sample data comes back |

Before you push, `npm run typecheck` and `npm run build` should both pass and
`npm run lint` should report **no errors** (warnings are fine — see
[PORTAL.md](PORTAL.md)).

## Demo cheat sheet

| Thing | Value |
|---|---|
| Sign in | Any email, any password of 8+ characters |
| Mobile OTP | Always `123456` — also shown on screen when you request it |
| Coupon — 25% off a pack | `DEMO25` |
| Coupon — free NB Points | `FREE10` |
| Coupon — rejection state | `EXPIRED` |
| Payment | "Demo Payments" settles instantly; no real gateway is involved |
| Google sign-in | Not available — the button explains why |

Worth clicking on your first run:

- **Notes → Generate Notes** on the "Unfinished Recording Found" card. It really
  charges NB Points, using the rules shown on the Billing screen.
- **Notes → download** any note. The PDF is built in your browser, not on a server.
- **NB Points → Recharge**, apply `DEMO25`, and pay. Then download the invoice
  from the activity row.
- **NB Points → verify your mobile** with `123456` to claim the trial points.

## Starting over

Spent all the points, or deleted every note? Put the sample data back:

```bash
npm run db:reset
```

Stop the dev server first (`Ctrl+C`) — Windows will not delete a file that is
still open. Then `npm run dev` again.

To reset without stopping the server:

```bash
curl -X POST http://127.0.0.1:3000/api/demo/reset
```

To change what the sample data *is*, edit the JSON files in
`demo-backend/data/` and reset.

## Troubleshooting

**`node:sqlite` needs Node 22.5 or newer**
Your Node is too old. Install the current LTS from <https://nodejs.org>, close
the terminal, open a new one, and check with `node --version`.

**`EADDRINUSE: port 3000 is already in use`**
Something else is on that port — most likely an old dev server. Close it, or
run on another port:

```bash
npx next dev -H 127.0.0.1 -p 3001
```

**`npm run db:reset` says "Permission denied"**
The dev server still has the database open. Stop it with `Ctrl+C` and run the
command again.

**The app starts but every page errors**
Delete the database and let it rebuild:

```bash
npm run db:reset
```

**I edited a file in `demo-backend/data/` and nothing changed**
Those files only seed a *new* database. Run `npm run db:reset` to apply them.

**Something is badly stuck**
Delete the build cache and the installed packages, then start again. Stop the
dev server first, then delete the `.next` and `node_modules` folders — from
File Explorer, or:

```bash
rm -rf .next node_modules
```

On Windows PowerShell that command does not exist; use this instead:

```powershell
Remove-Item -Recurse -Force .next, node_modules
```

Then:

```bash
npm install
```
