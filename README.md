# Coy · Discover

A swipe-based **Discover** tab (like Tinder/Bumble) for [Coy](https://app.getcoy.com), built for the **Coy SDE Intern assignment**.

**GitHub repo:** https://github.com/progressmantraclasses/COY

| Part | What it is | Where |
| --- | --- | --- |
| **Part A** | Two core features I'd add to Coy, and why | [`FEATURES.md`](./FEATURES.md) |
| **Part B** | The Discover tab app (frontend + backend + tests) | `frontend/` and `backend/` |

**Tech stack**

- **Frontend:** Next.js 15 (App Router, TypeScript), framer-motion (swipe animations), lucide-react (icons). Mobile-first.
- **Backend:** NestJS 10 (Node.js), with input validation through `class-validator`.
- **Database:** a JSON file (`backend/data/db.json`). It is created automatically, so **there is nothing to install or set up**.
- **Auth:** none. The app assumes one logged-in user, as the assignment says.

---

## Table of contents

1. [What you need before starting](#1-what-you-need-before-starting)
2. [Run the app: step by step](#2-run-the-app-step-by-step)
3. [Try the demo](#3-try-the-demo)
4. [Environment variables (.env): optional](#4-environment-variables-env-optional)
5. [The database](#5-the-database)
6. [All commands](#6-all-commands)
7. [Run the tests](#7-run-the-tests)
8. [API reference](#8-api-reference)
9. [Privacy: how "never reveal who liked you" is enforced](#9-privacy-how-never-reveal-who-liked-you-is-enforced)
10. [Design](#10-design)
11. [Project structure](#11-project-structure)
12. [Troubleshooting](#12-troubleshooting)
13. [Trade-offs and next steps](#13-trade-offs-and-next-steps)

---

## 1. What you need before starting

You need **three things** installed on your computer:

| Tool | Version | Download | How to check it's installed |
| --- | --- | --- | --- |
| **Node.js** | **20.12 or newer** (22 LTS recommended) | https://nodejs.org (pick the "LTS" button) | `node -v` |
| **npm** | comes with Node.js | (installed with Node.js) | `npm -v` |
| **Git** | any recent version | https://git-scm.com/downloads | `git --version` |

Open a terminal and run the three check commands:

- **Windows:** press `Win`, type **cmd** or **PowerShell**, press Enter.
- **macOS:** open **Terminal**.
- **Linux:** open your terminal.

```bash
node -v
npm -v
git --version
```

Each one should print a version number. For example, `node -v` should print `v22.x.x` or at least `v20.12.0`. If you get a "not recognized" or "command not found" error, install that tool from the link above, **close the terminal, open a new one**, and check again.

---

## 2. Run the app: step by step

Type these commands **one at a time** in your terminal.

### Step 1: Download (clone) the code

```bash
git clone https://github.com/progressmantraclasses/COY.git
```

This creates a new folder called **`COY`** containing the project.

### Step 2: Go into the project folder

```bash
cd COY
```

> Every command from here on must be run **inside this `COY` folder**. If you open a new terminal later, `cd` into it again first.

### Step 3: Install the dependencies

```bash
npm install
```

This installs the libraries for **both** the backend and the frontend in one go (the project uses npm workspaces). It takes 1–3 minutes the first time. Some `warn` lines are normal; only a red `ERR!` means something went wrong (see [Troubleshooting](#12-troubleshooting)).

### Step 4 (optional): Environment variables

**You can skip this step.** The app works with its defaults. If you want to change ports or other settings, see [section 4](#4-environment-variables-env-optional).

### Step 5: Start the app

```bash
npm run dev
```

This starts **both** servers together in one terminal:

| Server | URL | Log label |
| --- | --- | --- |
| Backend API (NestJS) | http://localhost:4000 | `[api]` (magenta) |
| Frontend (Next.js) | http://localhost:3000 | `[web]` (cyan) |

Wait until you see both of these lines:

```
[api] Coy Discover API listening on http://localhost:4000
[web]  ✓ Ready in ...
```

### Step 6: Open the app

Open your browser at **http://localhost:3000/discover**.

> **Tip:** the app is mobile-first. On a computer, press `F12` and click the phone/tablet icon (device toolbar) to see it at phone size. You can also open it on your phone if it's on the same Wi-Fi; see [Troubleshooting](#12-troubleshooting).

### Step 7: Stop the app

Click the terminal and press **`Ctrl + C`**. This stops both servers. To start again later, run `npm run dev` again from inside the `COY` folder. Your swipes and matches are kept.

### Getting the latest code later

```bash
cd COY
git pull
npm install
npm run dev
```

---

## 3. Try the demo

The app has **32 mock profiles**. **9 of them have already (secretly) liked you**, so you can get a match:

> Aanya, Ishita, Rohan, Neel, Ayaan, Myra, Avni, Shaurya, Sara

(The app itself never shows this list. That's the whole point of Coy. It's listed here only so reviewers can test matching.)

What to try:

1. **Swipe right to like, left to pass.** Drag the card with your mouse or finger, tap the pink ♥ / white ✕ buttons, or press the **→** / **←** arrow keys on a keyboard. A **LIKE** or **NOPE** stamp appears while you drag, and a small message confirms each swipe.
2. **Get a match.** Like one of the 9 people above (with the default settings, **Avni is the 3rd card**). A full-screen pink **"It's a match!"** screen appears.
3. **See your matches.** Tap the ♥ button at the top right of Discover (it shows a count), or **See your matches** on the match screen. Only mutual likes are listed.
4. **Reload the page.** Swiped profiles never come back, and your matches are still there. Everything is saved.
5. **Swipe through everyone.** You'll see the **"You're all caught up"** screen.
6. **Start over.** Press **Reset demo** on that screen (or see [Resetting the data](#resetting-the-data)).
7. The **Home** tab in the bottom bar is intentionally blank, as the assignment asks.

---

## 4. Environment variables (.env): optional

**Nothing is required.** Every setting has a sensible default. Only create these files if you want to change something (for example, a port that's already in use).

The repo includes two example files you can copy:

| Example file | Copy it to | Used by |
| --- | --- | --- |
| `backend/.env.example` | `backend/.env` | Backend (read automatically on start) |
| `frontend/.env.example` | `frontend/.env.local` | Frontend (read automatically by Next.js) |

### How to create them

Run these from inside the `COY` folder.

**Windows (Command Prompt):**

```bat
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
```

**Windows (PowerShell):**

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env.local
```

**macOS / Linux:**

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

Then open the new files in any text editor (VS Code, Notepad, …) and change the values. The format is one `NAME=value` per line, with no spaces around `=` and no quotes needed.

> After changing a `.env` file, **stop the app (`Ctrl + C`) and run `npm run dev` again** so the change is picked up.

### Backend variables (`backend/.env`)

| Variable | Default | What it does |
| --- | --- | --- |
| `PORT` | `4000` | Port the API runs on. |
| `CORS_ORIGIN` | `http://localhost:3000` | Which frontend URL(s) may call the API. Separate several with commas, e.g. `http://localhost:3000,http://192.168.1.5:3000`. |
| `DATA_FILE` | `./data/db.json` | Where swipes and matches are saved, relative to the `backend` folder. The file and folder are created automatically. |
| `FEED_SEED` | `20261119` | Number that decides the (fixed) shuffle order of the feed. Change it to get a different order. |

Example `backend/.env`:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000
DATA_FILE=./data/db.json
FEED_SEED=20261119
```

### Frontend variables (`frontend/.env.local`)

| Variable | Default | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Address of the backend. **It must use the same port as the backend's `PORT`.** |

Example `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Example: change the backend port to 5000

1. `backend/.env` → `PORT=5000`
2. `frontend/.env.local` → `NEXT_PUBLIC_API_URL=http://localhost:5000`
3. Stop the app and run `npm run dev` again.

> `.env` and `.env.local` are in `.gitignore`, so they are never pushed to GitHub. Only the `.env.example` files are committed.

---

## 5. The database

There is **no database server to install** (no MySQL, MongoDB or Postgres).

- Swipes and matches are saved in a JSON file: **`backend/data/db.json`**.
- The file is **created automatically** on your first swipe.
- Every write is **atomic**: the app writes a temporary file first, then renames it, so a crash can't corrupt the data.
- The 32 profiles are seed data in `backend/src/seed/profiles.seed.ts`. They are read-only and don't need importing.
- `backend/data/` is in `.gitignore`, so your local swipes are never pushed to GitHub.

The file looks like this:

```json
{
  "swipes": [
    { "profileId": "p04", "action": "pass", "at": "2026-11-19T09:30:00.000Z" },
    { "profileId": "p21", "action": "like", "at": "2026-11-19T09:30:05.000Z" }
  ],
  "matches": [
    { "profileId": "p21", "matchedAt": "2026-11-19T09:30:05.000Z" }
  ]
}
```

### Resetting the data

Any one of these starts you over with all 32 profiles:

- In the app: swipe until **"You're all caught up"**, then press **Reset demo**.
- While the app is running, in a **second** terminal inside `COY`: `npm run reset`
- While the app is **stopped**: delete the file `backend/data/db.json`.

---

## 6. All commands

Run these from the **root `COY` folder**:

| Command | What it does |
| --- | --- |
| `npm install` | Installs everything (backend + frontend). Run once, and again after `git pull`. |
| `npm run dev` | Starts the backend (:4000) and frontend (:3000) in development mode. **Use this one.** |
| `npm test` | Runs all backend tests (unit + end-to-end). |
| `npm run build` | Makes production builds of both apps. |
| `npm start` | Runs the production builds. Run `npm run build` first. |
| `npm run reset` | Clears all swipes and matches. The backend must be running on port 4000. |

### Running backend and frontend in separate terminals (optional)

If you'd rather see each log on its own, use two terminals, both inside `COY`:

```bash
# Terminal 1: backend
npm run dev -w backend
```

```bash
# Terminal 2: frontend
npm run dev -w frontend
```

### Production mode (optional)

```bash
npm run build
npm start
```

Then open http://localhost:3000/discover.

---

## 7. Run the tests

```bash
npm test
```

This runs **21 backend tests** (16 unit tests + 5 end-to-end API tests) and takes about a minute. You should see:

```
Tests:       16 passed, 16 total
Tests:       5 passed, 5 total
```

The tests cover:

- A match happens **only** when both people liked each other.
- A one-sided like and a pass return **exactly the same response**, so nothing leaks.
- A swiped profile **never** comes back in the feed. Swiping the same profile twice is rejected (`409`).
- Unknown profiles give `404`. Invalid input (or extra fields like `likedMe`) gives `400`.
- No API response ever contains the secret `likedMe` field.
- The feed doesn't put "people who liked you" first.
- Data **survives a restart**, and a corrupt data file doesn't crash the server.

The tests use temporary files, so they never touch your real `backend/data/db.json`.

---

## 8. API reference

Base URL: `http://localhost:4000`

| Method | Path | Request body | Response |
| --- | --- | --- | --- |
| `GET` | `/feed` | | `{ "profiles": Profile[] }`: profiles you haven't swiped on yet |
| `POST` | `/swipe` | `{ "profileId": "p21", "action": "like" }` (`action` is `"like"` or `"pass"`) | `{ "matched": false }` or `{ "matched": true, "match": Match }` |
| `GET` | `/matches` | | `{ "matches": Match[] }`: mutual matches, newest first |
| `POST` | `/reset` | | `{ "ok": true }`: demo helper that clears all swipes and matches |

- `Profile` = `{ id, name, age, photo, bio, city, college?, interests[] }`
- `Match` = `Profile` + `{ matchedAt }`

**Errors:** `400` invalid body (including unknown extra fields), `404` profile not found, `409` already swiped on this profile.

### Try the API from the terminal (optional)

With the app running, open a second terminal:

```bash
curl http://localhost:4000/feed
curl http://localhost:4000/matches
```

To send a swipe:

macOS / Linux / Git Bash:

```bash
curl -X POST http://localhost:4000/swipe -H "Content-Type: application/json" -d '{"profileId":"p21","action":"like"}'
```

Windows PowerShell:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:4000/swipe -ContentType "application/json" -Body '{"profileId":"p21","action":"like"}'
```

---

## 9. Privacy: how "never reveal who liked you" is enforced

This is Coy's core promise, so it's enforced on the **server**, not just hidden in the UI:

1. **Allow-list serialisation.** `toPublicProfile()` (`backend/src/discover/profile.mapper.ts`) copies only named public fields. The secret `likedMe` flag can't leak, even if new internal fields are added later.
2. **Identical responses unless mutual.** A pass and a one-sided like both return exactly `{ "matched": false }`, whether or not the other person liked you.
3. **Feed order doesn't leak.** The feed is a fixed shuffle that ignores who liked you. Putting likers first is a common "boost", but it would let you guess who liked you from the order.
4. **No re-swipes.** A swiped profile never returns to `/feed`, and a second swipe is rejected (`409`). That blocks "pass, then like to probe" tricks.
5. **Matches list mutual likes only.**

---

## 10. Design

The UI reuses **Coy's own design tokens**, taken from app.getcoy.com's stylesheet, so the tab feels like part of Coy:

- Bricolage Grotesque font, ink `#15121d`, pink `#ff3d81`, with yellow / lilac / mint / sky / peach accents.
- 2px ink borders, hard offset "pop" shadows, and pill buttons that press in when tapped.
- A 480px mobile sheet, the `coy●` wordmark, a full-screen pink match reveal, and yellow status cards.

**Accessibility:**

- SVG icons with labels.
- Touch targets of 44px or more.
- A visible pink keyboard-focus ring and arrow-key swiping.
- A focus-trapped match dialog (Esc closes it).
- Screen-reader announcements for toasts.
- `prefers-reduced-motion` support: cards fade instead of flying, and there's no confetti.

---

## 11. Project structure

```
COY/
├── package.json            # root: npm workspaces + dev/test/build/start/reset scripts
├── README.md               # this file
├── FEATURES.md             # Part A
├── backend/                # NestJS API (port 4000)
│   ├── .env.example        # copy to .env (optional)
│   ├── data/db.json        # created automatically, git-ignored
│   ├── src/
│   │   ├── main.ts                 # starts the server, loads .env, CORS, validation
│   │   ├── app.module.ts           # wires everything together
│   │   ├── discover/
│   │   │   ├── discover.controller.ts  # GET /feed, POST /swipe, GET /matches, POST /reset
│   │   │   ├── discover.service.ts     # core logic (feed, swipe, matching)
│   │   │   ├── discover.service.spec.ts# unit tests
│   │   │   ├── profile.mapper.ts       # privacy allow-list
│   │   │   ├── profile.types.ts        # TypeScript types
│   │   │   └── dto/swipe.dto.ts        # request validation
│   │   ├── store/store.service.ts  # JSON-file storage (atomic writes)
│   │   └── seed/profiles.seed.ts   # 32 mock profiles
│   └── test/discover.e2e-spec.ts   # end-to-end API tests
└── frontend/               # Next.js app (port 3000)
    ├── .env.example        # copy to .env.local (optional)
    ├── app/
    │   ├── layout.tsx              # font, global styles, bottom tab bar
    │   ├── globals.css             # Coy design tokens + all styles
    │   ├── page.tsx                # Home tab (blank)
    │   └── discover/
    │       ├── page.tsx            # Discover tab (swipe deck)
    │       └── matches/page.tsx    # Matches view
    ├── components/                 # SwipeCard, MatchReveal, TabBar, Avatar, Toast
    ├── hooks/useDiscover.ts        # feed, optimistic swipes, match state
    └── lib/api.ts                  # typed API client
```

---

## 12. Troubleshooting

| Problem | Fix |
| --- | --- |
| `'node' is not recognized` / `command not found: node` | Install Node.js from https://nodejs.org, then **open a new terminal**. |
| `npm install` fails or warns `EBADENGINE`, or your `backend/.env` settings are ignored | Your Node.js is too old (check with `node -v`). Install **20.12 or newer** (22 LTS recommended), then delete the `node_modules` folder and run `npm install` again. |
| PowerShell: `npm.ps1 cannot be loaded because running scripts is disabled` | Use **Command Prompt (cmd)** instead of PowerShell. Or, if you're comfortable changing it, run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` in PowerShell yourself. |
| The app shows **"Can't reach Discover"** | The backend isn't running. Make sure `npm run dev` is running and shows `[api] Coy Discover API listening on http://localhost:4000`, then press **Retry**. If you changed the port, check that `NEXT_PUBLIC_API_URL` matches it. |
| `EADDRINUSE` / "port 3000 (or 4000) is already in use" | Another program, often an old copy of this app, is using the port. Close other terminals running the app and try again. To find and stop it: **Windows** `netstat -ano \| findstr :4000`, then `taskkill /PID <number> /F`. **macOS/Linux** `lsof -i :4000`, then `kill <PID>`. Or change the port in `.env` ([section 4](#4-environment-variables-env-optional)). |
| Changed a `.env` value but nothing happened | Stop the app (`Ctrl + C`) and run `npm run dev` again. Env files are only read at startup. |
| Profile photos don't load (letters show instead) | Photos come from randomuser.me and need internet. Without it, the app shows coloured initials instead. Everything else still works. |
| Want to open it on your phone (same Wi-Fi) | Find your computer's IP (`ipconfig` on Windows, `ifconfig` / `ip a` on macOS/Linux), e.g. `192.168.1.5`. Set `NEXT_PUBLIC_API_URL=http://192.168.1.5:4000` in `frontend/.env.local` and `CORS_ORIGIN=http://localhost:3000,http://192.168.1.5:3000` in `backend/.env`, restart, then open `http://192.168.1.5:3000/discover` on the phone. Your firewall may need to allow Node.js. |
| I want to start the demo over | See [Resetting the data](#resetting-the-data). |

---

## 13. Trade-offs and next steps

- **JSON file instead of SQLite/Postgres.** This avoids native builds and makes setup zero-config. All storage goes through `StoreService`, so swapping in a real database is a contained change. With many users I'd add a unique `(user_id, target_id)` constraint on swipes and a symmetric matches table.
- **`likedMe` models the other users' swipes** in this single-user demo. In production it would be a lookup into the swipes table (`target_id = me AND action = 'like'`) at swipe time. The API responses would stay exactly the same.
- **Placeholder photos** come from randomuser.me, with a coloured-initials fallback.
