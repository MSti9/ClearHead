# ClearHead

## Read this first

`ClearHead_Locked_Decisions_v3.md` is the canonical source of truth for product direction, tone, scope, and language. Read it before changing product copy, UI, features, or implementation plans. v3 supersedes v2 — v2 is kept in the repo for history only; do not read or cite it as canon.

Do not relitigate locked positioning unless Michael explicitly asks to reopen it.

---

## What this app is

ClearHead is a **brain dump app for people who don't journal**.

**Working subtitle / build-copy anchor:**

> Brain dumps, cleaned up.

**One-liner:**

> Journaling for people who don't journal. Talk or type what's stuck in your head, and the app turns the mess into something clean you can actually use.

**Core promise:**

> Get it out. Move on.

ClearHead is not a therapy app, not a clinical mental-health tool, not a wellness dashboard, and not a journaling analytics platform.

---

## Hero loop

The V1 hero loop is:

1. Open the app.
2. Talk or type the mess.
3. AI cleans it up.
4. The app returns the 3-part output:
   - **What you said** — the cleaned-up version of the ramble.
   - **What's underneath** — the core thing the user is circling.
   - **One thing to let go of** — a short, grounding line.
5. User chooses **Save it** or **Let it go**.

Everything else is secondary.

---

## Hard rule

ClearHead never re-opens the lid.

No notifications, nudges, or surfaces may resurface the user's pain without the user intentionally going looking for it. History is pull-only. Pattern surfacing is secondary, opt-in, and never the point of the home screen.

The release must stay a release.

---

## Tone

Tone is non-negotiable:

- Light, dry, steady.
- Warm, not tender.
- Calm, not somber.
- Blunt without being cold.
- Never clinical, diagnostic, therapeutic, or identity-flattering.
- Market the lift, never the spiral.

Avoid copy that sounds like:

- "You're the strong one everyone leans on."
- "Are you anxious and overwhelmed?"
- "Begin your healing journey."
- "Track your emotional patterns."
- "Maintain your streak."

Prefer copy that sounds like:

- "What do you need to get out?"
- "Talk it out."
- "Write it down."
- "No streaks. No pressure. Just a place to put the thought."
- "Cleaning up your brain dump."

---

## V1 scope

### IN — hero

- Voice dump
- Text dump
- AI clean-up
- 3-part output
- Save it / Let it go
- Simple onboarding
- Paywall

### IN — secondary

These may exist only as supporting features and must never crowd the core loop:

- Session history
- Pull-only pattern surfacing
- Sleep / white-noise sounds
- Breathing tool

### CUT

Do not add or surface:

- Streaks
- Sentiment scores
- Visible auto-tags
- Mood charts
- Pattern insights as a home-screen element
- Gamification
- Pets
- Celebrity content
- Clinical language
- Social features
- "Use it for anything" junk-drawer expansion

---

## Language map

| Old February DNA | Use instead |
|---|---|
| Start journaling | What do you need to get out? / Clear your head |
| Voice note | Talk it out — say what's stuck |
| Write | Write it down — type the mess |
| Voice Coach | Clean reflection |
| Processing your words | Cleaning up your brain dump |
| Patterns & insights | Pull-only clarity |
| Save entry | Save it / Let it go |
| Mental wellness | Clear your head |

---

## Monorepo structure

```text
backend/   — Bun + Hono API server
mobile/    — React Native + Expo SDK 53 app
```

See `backend/CLAUDE.md` and `mobile/CLAUDE.md` for implementation details.

---

## Tech stack

**Mobile:** React Native 0.79, Expo SDK 53, Expo Router, NativeWind v4, Zustand v5, TanStack Query v5
**Backend:** Bun runtime, Hono 4.6, Zod 4
**AI:** Anthropic Claude, OpenAI Whisper, OpenAI TTS nova
**Monetization:** RevenueCat (`react-native-purchases`)

---

## Environment variables

**`backend/.env`**

```env
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
PORT=3000
```

**`mobile/.env`**

```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
EXPO_PUBLIC_VIBECODE_REVENUECAT_TEST_KEY=
EXPO_PUBLIC_VIBECODE_REVENUECAT_APPLE_KEY=
EXPO_PUBLIC_VIBECODE_REVENUECAT_GOOGLE_KEY=
```

---

## Running locally

```bash
# Backend
cd backend && bun run dev

# Mobile
cd mobile && bunx expo start
cd mobile && bunx expo start --ios
cd mobile && bunx expo start --android

# Type check / lint (mobile)
cd mobile && bun run typecheck
cd mobile && bun lint
```
