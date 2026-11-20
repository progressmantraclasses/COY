# Coy · Discover

A swipe-based **Discover** tab (like Tinder/Bumble) for [Coy](https://app.getcoy.com), built for the **Coy SDE Intern assignment**.

**GitHub repo:** https://github.com/progressmantraclasses/COY

| Part | What it is | Where |
| --- | --- | --- |
| **Part A** | Two core features I'd add to Coy, and why | [`FEATURES.md`](./FEATURES.md) |
| **Part B** | The Discover tab app (frontend + backend + tests) | `frontend/` and `backend/` |

**Tech stack**

- **Frontend:** Next.js 15 (App Router, TypeScript), framer-motion (swipe animations), lucide-react (icons). Mobile-first.
- **Backend:** NestJS 10 on Node.js **with Express** (`@nestjs/platform-express`), with input validation through `class-validator`.
- **Database:** MongoDB (e.g. a free MongoDB Atlas cluster), through the official `mongodb` Node.js driver. Profiles, swipes and matches are all stored there. **No MongoDB?** The app still runs: without `MONGODB_URI` it falls back to in-memory storage.
- **Profiles:** 32 starter profiles are seeded on startup. When the feed runs low, more real-looking profiles (name, age, city, photo) are fetched from [randomuser.me](https://randomuser.me).
- **Auth:** none. The app assumes one logged-in user, as the assignment says.

### Assignment checklist

| Requirement | Where / how |
| --- | --- |
| Part A: two core features, with reasons | [`FEATURES.md`](./FEATURES.md): Verified Circles, and a safe in-app space after the match |
| Tab bar with a blank **Home** and a **Discover** tab | `frontend/components/TabBar.tsx`, `frontend/app/page.tsx` (blank) |
| Next.js, mobile-first | Next.js 15 App Router, 480px mobile sheet, touch drag |
| Node.js + Express backend | NestJS on Express (`backend/`) |
| ≥ 30 seeded profiles (name, age, photo, bio, city/college, interests) | 32 in `backend/src/seed/profiles.seed.ts`, plus real profiles fetched from randomuser.me when the feed runs low |
| Some profiles already liked the user | 9 seed profiles (`likedMe: true`) and ~30% of fetched ones |
| One card at a time; drag on mobile, buttons on desktop | `SwipeCard.tsx` (framer-motion drag), ✕ / ♥ buttons and ← / → keys |
| Smooth animations and clear feedback | Card tilt and fly-out, LIKE / NOPE stamps, a toast after every swipe |
| A swiped profile never appears again | Enforced on the server (`GET /feed` filters swipes; a second swipe gets `409`) |
| Clear empty state | "You're all caught up" card with **See matches** and **Reset demo** |
| Match only when both liked; "It's a match!" screen | `DiscoverService.swipe` + `MatchReveal.tsx` |
| Matches view | `/discover/matches` |
| Never reveal who liked the user unless mutual | [Section 9](#9-privacy-how-never-reveal-who-liked-you-is-enforced), covered by tests |
| `GET /feed`, `POST /swipe`, `GET /matches` | [Section 8](#8-api-reference) |
| Swipes and matches persist across reloads | Stored in MongoDB ([section 5](#5-the-database)) |
| Clean, tested backend logic | 30 tests: 24 unit + 6 end-to-end ([section 7](#7-run-the-tests)) |

---

## Table of contents

1. [What you need before starting](#1-what-you-need-before-starting)
2. [Run the app: step by step](#2-run-the-app-step-by-step)
3. [Try the demo](#3-try-the-demo)
4. [Environment variables (.env)](#4-environment-variables-env)
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

### Step 4: Connect MongoDB (recommended)

Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to your MongoDB connection string. See [section 4](#4-environment-variables-env).

> **Just want to try it quickly?** Skip this step. Without `MONGODB_URI` the backend uses in-memory storage and prints a warning. Everything works and swipes survive page reloads, but they are lost when you stop the server.

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

The app starts with **32 seed profiles**. **9 of them have already (secretly) liked you**, so you can get a match:

> Aanya, Ishita, Rohan, Neel, Ayaan, Myra, Avni, Shaurya, Sara

(The app itself never shows this list. That's the whole point of Coy. It's listed here only so reviewers can test matching.)

What to try:

1. **Swipe right to like, left to pass.** Drag the card with your mouse or finger, tap the pink ♥ / white ✕ buttons, or press the **→** / **←** arrow keys on a keyboard. A **LIKE** or **NOPE** stamp appears while you drag, and a small message confirms each swipe.
2. **Get a match.** Like one of the 9 people above (with the default settings and a fresh database, **Sara is the 3rd card**). A full-screen pink **"It's a match!"** screen appears.
3. **See your matches.** Tap the ♥ button at the top right of Discover (it shows a count), or **See your matches** on the match screen. Only mutual likes are listed.
4. **Reload the page.** Swiped profiles never come back, and your matches are still there. Everything is saved.
5. **Keep swiping.** When fewer than 5 cards are left, new real profiles (from randomuser.me) are added to the deck automatically, with no reload needed. About 30% of them have liked you.
6. **Reach the end.** New profiles stop once there are 100 in total (`MAX_PROFILES`), or straight away if randomuser.me can't be reached. Swipe through the rest and you'll see the **"You're all caught up"** empty state.
7. **Start over.** Press **Reset demo** on that screen (or see [Resetting the data](#resetting-the-data)).
8. The **Home** tab in the bottom bar is intentionally blank, as the assignment asks.

---

## 4. Environment variables (.env)

Set `MONGODB_URI` to save data in MongoDB. Everything else has a sensible default. Without `MONGODB_URI`, the backend still runs, using in-memory storage (data is lost when the server stops).

| Example file | Copy it to | Used by |
| --- | --- | --- |
| `backend/.env.example` | `backend/.env` | Backend (read automatically on start) |
| `frontend/.env.example` | `frontend/.env` | Frontend (read automatically by Next.js) |

### How to create them

Run these from inside the `COY` folder.

**Windows (Command Prompt):**

```bat
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

**Windows (PowerShell):**

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

**macOS / Linux:**

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Then open the new files in any text editor and change the values. The format is one `NAME=value` per line, with no spaces around `=` and no quotes needed.

> After changing a `.env` file, **stop the app (`Ctrl + C`) and run `npm run dev` again** so the change is picked up.

### Backend variables (`backend/.env`)

| Variable | Default | What it does |
| --- | --- | --- |
| `MONGODB_URI` | (none: in-memory) | MongoDB connection string. In MongoDB Atlas: **Connect → Drivers**, copy the `mongodb+srv://...` string and put your password in it. In Atlas **Network Access**, allow your IP address. |
| `MONGODB_DB` | `coy_discover` | Database name inside the cluster. It is created automatically. |
| `PORT` | `4000` | Port the API runs on. |
| `CORS_ORIGIN` | `http://localhost:3000` | Which frontend URL(s) may call the API. Separate several with commas, e.g. `http://localhost:3000,http://192.168.1.5:3000`. |
| `FEED_SEED` | `20261119` | Number that decides the (fixed) order of the feed. Change it to get a different order. |
| `PROFILE_REFILL` | `true` | When fewer than 5 profiles are left, fetch up to 20 real ones from randomuser.me. Set to `false` to turn it off. |
| `MAX_PROFILES` | `100` | Stop fetching once this many profiles are stored, so the feed can end. |

Example `backend/.env`:

```env
PORT=4000
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
MONGODB_DB=coy_discover
FEED_SEED=20261119
PROFILE_REFILL=true
MAX_PROFILES=100
```

### Frontend variables (`frontend/.env`)

| Variable | Default | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Address of the backend. **It must use the same port as the backend's `PORT`.** |

### Example: change the backend port to 5000

1. `backend/.env` → `PORT=5000`
2. `frontend/.env` → `NEXT_PUBLIC_API_URL=http://localhost:5000`
3. Stop the app and run `npm run dev` again.

> `.env` files are in `.gitignore`, so they are never pushed to GitHub. **Never commit `backend/.env`: it contains your database password.** Only the `.env.example` files are committed.

---

## 5. The database

All data lives in **MongoDB**, in the database named by `MONGODB_DB` (default `coy_discover`). Collections and indexes are created automatically on startup. (Without `MONGODB_URI`, the same data is kept in memory instead.)

| Collection | One document per | Example |
| --- | --- | --- |
| `profiles` | person in the feed (unique `id`) | `{ "id": "p21", "name": "Avni", "age": 22, "photo": "...", "city": "Indore", "interests": [...], "likedMe": true }` |
| `swipes` | swiped profile (unique `profileId`) | `{ "profileId": "p21", "action": "like", "at": "2026-11-19T09:30:05.000Z" }` |
| `matches` | mutual match (unique `profileId`) | `{ "profileId": "p21", "matchedAt": "2026-11-19T09:30:05.000Z" }` |

- **Seed profiles:** the 32 profiles in `backend/src/seed/profiles.seed.ts` are added on every startup if they're missing. Existing ones are never overwritten or duplicated.
- **Real profiles:** fetched from randomuser.me (Indian names, ages 18–30, real photos) when the feed runs low, up to `MAX_PROFILES` in total. randomuser.me has no bios or interests, so those are picked from a small list. Their IDs start with `ru-`.
- **Safe swipes:** the unique index on `swipes.profileId` blocks double swipes even if two requests race. A swipe and its match are saved together in one **transaction**.
- `likedMe` is stored in MongoDB but **never** sent to the browser (see [Privacy](#9-privacy-how-never-reveal-who-liked-you-is-enforced)).

### Resetting the data

Any one of these clears all swipes and matches (profiles are kept, including fetched ones):

- In the app: swipe until **"You're all caught up"**, then press **Reset demo**.
- While the app is running, in a **second** terminal inside `COY`: `npm run reset` (it reads `PORT` from `backend/.env`).
- In MongoDB Atlas: delete the `swipes` and `matches` collections (or drop the whole database to also remove fetched profiles).

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
| `npm run reset` | Clears all swipes and matches. The backend must be running. |

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

This runs **30 backend tests** (24 unit tests + 6 end-to-end API tests) and takes about a minute. You should see:

```
Tests:       24 passed, 24 total
Tests:       6 passed, 6 total
```

The tests cover:

- A match happens **only** when both people liked each other.
- A one-sided like and a pass return **exactly the same response**, so nothing leaks.
- A swiped profile **never** comes back in the feed. Swiping the same profile twice is rejected (`409`).
- Unknown profiles give `404`. Invalid input (or extra fields like `likedMe`) gives `400`.
- No API response ever contains the secret `likedMe` field.
- The feed doesn't put "people who liked you" first.
- Data **survives a restart**, and seeding on every startup never duplicates profiles.
- When the feed runs low, new profiles are fetched and can be swiped and matched. Fetching stops at the profile cap, so the empty state is reachable. If fetching fails, the remaining feed is still served.
- The app starts and works without `MONGODB_URI` (in-memory fallback).

The tests use an in-memory store and a fake profile source, so they **need no database or internet** and never touch your real MongoDB data.

---

## 8. API reference

Base URL: `http://localhost:4000`

| Method | Path | Request body | Response |
| --- | --- | --- | --- |
| `GET` | `/feed` | | `{ "profiles": Profile[] }`: profiles you haven't swiped on yet |
| `POST` | `/swipe` | `{ "profileId": "p21", "action": "like" }` (`action` is `"like"` or `"pass"`) | `{ "matched": false }` or `{ "matched": true, "match": Match }` |
| `GET` | `/matches` | | `{ "matches": Match[] }`: mutual matches, newest first |
| `POST` | `/reset` | | `{ "ok": true }`: demo helper that clears all swipes and matches |

`GET /feed` also tops up the feed with real profiles from randomuser.me when fewer than 5 are left (up to `MAX_PROFILES`). The frontend calls it again when its deck runs low, so new cards appear without a reload.

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
3. **Feed order doesn't leak.** The feed order is a seeded hash of each profile's ID that ignores who liked you. Putting likers first is a common "boost", but it would let you guess who liked you from the order.
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
│   ├── .env.example        # copy to .env and set MONGODB_URI
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
│   │   ├── store/
│   │   │   ├── store.service.ts    # storage contract
│   │   │   ├── mongo.store.ts      # MongoDB implementation (indexes, transactions)
│   │   │   └── memory.store.ts     # in-memory version (tests + fallback without MONGODB_URI)
│   │   ├── profiles/profile-source.ts  # fetches real profiles from randomuser.me
│   │   └── seed/profiles.seed.ts   # 32 starter profiles
│   └── test/
│       ├── discover.e2e-spec.ts    # end-to-end API tests
│       └── stub-source.ts          # fake profile source, so tests need no internet
└── frontend/               # Next.js app (port 3000)
    ├── .env.example        # copy to .env (optional)
    ├── app/
    │   ├── layout.tsx              # font, global styles, bottom tab bar
    │   ├── globals.css             # Coy design tokens + all styles
    │   ├── page.tsx                # Home tab (blank)
    │   └── discover/
    │       ├── page.tsx            # Discover tab (swipe deck)
    │       └── matches/page.tsx    # Matches view
    ├── components/                 # SwipeCard, MatchReveal, TabBar, Avatar, Toast
    ├── hooks/useDiscover.ts        # feed, optimistic swipes, deck top-up, match state
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
| `EADDRINUSE` / "port 3000 (or 4000) is already in use" | Another program, often an old copy of this app, is using the port. Close other terminals running the app and try again. To find and stop it: **Windows** `netstat -ano \| findstr :4000`, then `taskkill /PID <number> /F`. **macOS/Linux** `lsof -i :4000`, then `kill <PID>`. Or change the port in `.env` ([section 4](#4-environment-variables-env)). |
| Log says `MONGODB_URI is not set: using in-memory storage` | The app works, but data is lost when the server stops. To keep it, create `backend/.env` from `backend/.env.example` and set `MONGODB_URI` ([section 4](#4-environment-variables-env)). |
| API exits with `Server selection timed out` / `bad auth` | Check the username and password in `MONGODB_URI`, and in MongoDB Atlas **Network Access**, allow your current IP address. |
| Changed a `.env` value but nothing happened | Stop the app (`Ctrl + C`) and run `npm run dev` again. Env files are only read at startup. |
| Profile photos don't load (letters show instead) | Photos come from randomuser.me and need internet. Without it, the app shows coloured initials instead. Everything else still works. |
| Want to open it on your phone (same Wi-Fi) | Find your computer's IP (`ipconfig` on Windows, `ifconfig` / `ip a` on macOS/Linux), e.g. `192.168.1.5`. Set `NEXT_PUBLIC_API_URL=http://192.168.1.5:4000` in `frontend/.env` and `CORS_ORIGIN=http://localhost:3000,http://192.168.1.5:3000` in `backend/.env`, restart, then open `http://192.168.1.5:3000/discover` on the phone. Your firewall may need to allow Node.js. |
| I want to start the demo over | See [Resetting the data](#resetting-the-data). |

---

## 13. Trade-offs and next steps

- **MongoDB behind a small `StoreService` contract.** All storage goes through it, so tests (and the no-database fallback) use an in-memory version. With many users I'd add a `userId` to swipes and matches, with a unique `(userId, profileId)` index, and build the feed with a database query instead of in memory.
- **`likedMe` models the other users' swipes** in this single-user demo. In production it would be a lookup into the swipes table (`target_id = me AND action = 'like'`) at swipe time. The API responses would stay exactly the same.
- **Profiles and photos** come from randomuser.me, with a coloured-initials fallback. Their bios and interests are picked from a small list, because randomuser.me doesn't provide them.
