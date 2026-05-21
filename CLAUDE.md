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

ClearHead has **two modes and one shared close**. The user picks the mode; the close is the same either way.

### Mode 1 — Get It Out (default, one-pass)

1. Open the app, pick voice or text.
2. Dump what's stuck. No back-and-forth.
3. Tap **Done**.

### Mode 2 — Talk It Through (premium, voice-back)

1. Open the app, pick Talk It Through.
2. Talk; ClearHead talks back out loud and asks one useful follow-up at a time, helping the user go a layer deeper — toward a close and a lighter exit, never endless excavation.
3. The user decides when to stop and taps **Done**. No adaptive "sense when you're finished" detection in V1 — no forced ending, no clingy continuation, no abrupt cutoff.

### Shared close

After **Done**, the app cleans up the mess and returns the 3-part reflection:

- **What you said** — the dump cleaned up. Clear, tight, 1–3 sentences.
- **What's underneath** — one plain sentence naming the real thing the user is circling. Bounded to what they SAID; never diagnose who they ARE.
- **One thing to let go of** — a short grounding line they can put down. Grounding, not advice. Never "you should," never a fix, never clinical.

The user then chooses **Save it** / **Let it go** / **Keep talking**.

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

- **Mode 1 — Get It Out:** voice dump, text dump, one-pass release
- **Mode 2 — Talk It Through:** live voice-back conversation
- Shared close: AI clean-up + 3-part output
- Save it / Let it go / Keep talking
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
