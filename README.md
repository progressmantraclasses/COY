# Coy · Discover

A swipe-based **Discover** tab for [Coy](https://app.getcoy.com), built for the Coy SDE Intern assignment.

- **Frontend:** Next.js 15 (App Router, TypeScript), framer-motion, lucide-react, mobile-first.
- **Backend:** NestJS 10 with `class-validator` DTOs.
- **Data:** JSON file store (`backend/data/db.json`), written atomically. Single logged-in user, no auth.
- **Part A** (two feature suggestions): see [`FEATURES.md`](./FEATURES.md).

## Quick start

```bash
npm install          # installs both workspaces
npm run dev          # API on :4000, web on :3000
```

Open **http://localhost:3000/discover**. To start the demo from scratch, run `npm run reset` (or use the "Reset demo" button on the empty state).

```bash
npm test             # backend unit + e2e tests (21 tests)
npm run build        # production builds of both apps
```

Environment (all optional): `PORT` (4000), `CORS_ORIGIN` (`http://localhost:3000`), `DATA_FILE`, `FEED_SEED` for the backend; `NEXT_PUBLIC_API_URL` (`http://localhost:4000`) for the frontend.

## What's in the app

| Area | Details |
| --- | --- |
| Tab bar | **Home** (intentionally blank) and **Discover**. |
| Swiping | One card at a time with a peeking next card. Drag on touch/mouse (rotation follows the drag, **LIKE**/**NOPE** stamps fade in, commits on distance *or* flick velocity, springs back otherwise). Round Pass/Like buttons and **← / →** keys on desktop. A toast confirms every swipe. |
| Matching | Liking someone who already liked you opens a full-screen pink **"It's a match!"** reveal (focus-trapped, Esc to close). The matches badge in the header updates. |
| Matches view | `/discover/matches`: mutual matches only, newest first. |
| States | Loading skeleton, a clear "You're all caught up" empty state, an API-unreachable state with retry, and a rollback plus toast if a swipe fails to save. |
| Seed data | 32 profiles (name, age, photo, bio, city/college, interests). 9 of them have already liked the user, so matches happen during a demo. |

## API

| Method | Path | Body | Response |
| --- | --- | --- | --- |
| `GET` | `/feed` | | `{ profiles: Profile[] }`: profiles not yet swiped on |
| `POST` | `/swipe` | `{ profileId: string, action: "like" \| "pass" }` | `{ matched: false }` or `{ matched: true, match: Match }` |
| `GET` | `/matches` | | `{ matches: Match[] }`: mutual matches, newest first |
| `POST` | `/reset` | | `{ ok: true }`: demo helper that clears swipes and matches |

Errors: `400` invalid body (unknown fields are rejected too), `404` unknown profile, `409` profile already swiped.

`Profile = { id, name, age, photo, bio, city, college?, interests[] }`. `Match = Profile & { matchedAt }`.

## Privacy: "never reveal who liked you unless it's mutual"

This is Coy's core promise, so it's enforced on the server rather than trusted to the UI:

1. **Explicit allow-list serialisation.** `toPublicProfile()` (`backend/src/discover/profile.mapper.ts`) copies named fields only. The internal `likedMe` flag can't leak, even if new internal fields are added later. Tests assert that no response body contains `likedMe`.
2. **Responses are indistinguishable unless mutual.** A pass and a one-sided like both return exactly `{ matched: false }`, whether or not the other person liked you. Only a mutual like returns a match.
3. **Feed order doesn't leak.** The feed is a seeded, deterministic shuffle computed independently of who liked you. Boosting likers to the top is a common trick, but it would let users infer who liked them from position alone. A test guards this.
4. **No re-swipes.** A swiped profile never comes back in `/feed`, and a second swipe on it is rejected with `409`. That stops "pass, then like to probe" patterns from changing state.
5. **Matches only ever list mutual likes.**

## Design

The UI reuses **Coy's own design tokens** (taken from app.getcoy.com's stylesheet) so the tab feels native: Bricolage Grotesque, `#15121d` ink, `#ff3d81` pink with yellow/lilac/mint/sky/peach accents, 2px ink borders, hard offset "pop" shadows, 999px pill buttons that press in on tap, a 480px mobile sheet, the `coy●` wordmark, a pink full-screen reveal sheet and yellow status cards.

Accessibility: SVG icons with labels (no emoji icons), 44px+ touch targets, a visible pink focus ring, keyboard swiping, a focus-trapped match dialog, `aria-live` toasts, and `prefers-reduced-motion` support (cards fade instead of flying, no confetti).

## Project structure

```
backend/
  src/discover/      controller, service (core logic), DTO, mapper, types, unit tests
  src/store/         JSON-file repository (atomic writes)
  src/seed/          32 mock profiles
  test/              e2e tests (supertest)
frontend/
  app/               layout + tab bar, Home, /discover, /discover/matches
  components/        SwipeCard, MatchReveal, TabBar, Avatar, Toast
  hooks/useDiscover  feed, optimistic swipes, match state
  lib/api.ts         typed API client
```

## Trade-offs and next steps

- I used a JSON file instead of SQLite to avoid native builds. All storage goes through `StoreService`, so swapping in SQLite/Postgres is a contained change. With multiple users I'd add a `(user_id, target_id)` unique constraint on swipes and a symmetric match table.
- The `likedMe` flag models the other users' swipes for the single-user demo. In production it would be a lookup into the swipes table (`target_id = me AND action = like`) at swipe time. The response contract would stay the same.
- Placeholder photos come from randomuser.me, with a coloured-initials fallback if they fail to load.
