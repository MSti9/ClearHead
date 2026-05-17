# ClearHead

## What this app is

ClearHead is a **voice-first brain dump app**. The core promise:

> Get thoughts out of your head fast.

Users speak or type what is stuck in their mind. The AI returns a short, calm reflection that helps them feel clearer and less mentally overloaded. That's it.

**Not** a therapy app. **Not** a clinical mental-health tool. **Not** a journaling analytics platform.

---

## Monorepo structure

```
backend/   — Bun + Hono API server (AI proxy, health check)
mobile/    — React Native + Expo SDK 53 app
```

See `backend/CLAUDE.md` and `mobile/CLAUDE.md` for implementation details.

---

## Tech stack

**Mobile:** React Native 0.79, Expo SDK 53, Expo Router, NativeWind v4, Zustand v5, TanStack Query v5
**Backend:** Bun runtime, Hono 4.6, Zod 4
**AI:** Anthropic Claude (reflection/chat), OpenAI Whisper (transcription), OpenAI TTS nova (voice playback)
**Monetization:** RevenueCat (`react-native-purchases`)

---

## Environment variables

**`backend/.env`**
```
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
PORT=3000
```

**`mobile/.env`**
```
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

---

## V1 scope

Keep V1 tightly scoped to:
- Voice brain dump
- Text brain dump
- AI reflection response
- Saved entry history
- Simple onboarding
- Subscription / paywall

Defer anything that doesn't directly serve: **tap → vent → clarity**.

Features to avoid expanding into: advanced emotion analytics, dashboards, therapy-style coaching flows, pattern graphs, clinical language, social features.

---

## AI response tone

Responses must be:
- Calm, concise, reflective, emotionally validating
- Non-clinical and non-diagnostic

**Avoid:** "you are experiencing symptoms of…", "this indicates anxiety…", "treatment", "diagnosis", "trauma processing"

**Prefer:** "It sounds like…", "You may be carrying…", "A simpler way to look at this might be…", "For right now, the next small step could be…"
