# ClearHead

**Brain dumps, cleaned up.**

ClearHead is journaling for people who don't journal. Talk or type what's stuck in your head, and the app turns the mess into something clean you can actually use.

No streaks. No pressure. No mood charts. Just a fast way to clear your head and move on.

---

## The product

ClearHead is a simple, calming brain dump app.

The hero loop is:

1. **Talk or type the mess** — open the app and get what's stuck in your head out.
2. **AI cleans it up** — the app turns the ramble into something clearer and easier to use.
3. **Get the 3-part output** — what you said, what's underneath, and one thing to let go of.
4. **Save it or let it go** — keep the cleaned-up session in history or let it dissolve.

The point is one sitting, no audience, less noise in your head.

---

## What ClearHead is not

ClearHead is not a therapy app, not a clinical mental-health tool, and not a wellness dashboard.

It does not center:

- Streaks
- Mood charts
- Sentiment scores
- Visible auto-tags
- Social features
- Gamification
- A broad "use it for anything" productivity system

History and pull-only pattern surfacing can exist as quiet secondary features, but the hero is always the dump-and-clean-up loop.

---

## Current V1 scope

### Hero features

- Voice brain dump
- Text brain dump
- AI clean-up and reflection
- Save it / let it go flow
- Simple onboarding
- Subscription / paywall

### Secondary features

- Session history
- Pull-only pattern surfacing
- Breathing / calming tools
- Sleep or white-noise support

Secondary features should never crowd the core loop.

---

## Tech stack

### Mobile app

- **Framework:** React Native with Expo SDK 53
- **Navigation:** Expo Router
- **Styling:** NativeWind
- **State management:** Zustand
- **Async/server state:** TanStack Query
- **UI:** Custom React Native components with Lucide icons
- **Animations:** React Native Reanimated
- **Monetization:** RevenueCat

### Backend

- **Runtime:** Bun
- **Framework:** Hono
- **Validation:** Zod
- **AI proxy:** Backend-routed API calls so client secrets are not exposed

### AI integrations

- **OpenAI Whisper** for speech-to-text transcription
- **Anthropic Claude** for clean-up/reflection
- **OpenAI TTS** for voice playback where applicable

---

## Project structure

```text
ClearHead/
├── mobile/                 # React Native mobile app
│   ├── src/
│   │   ├── app/            # Expo Router screens
│   │   ├── components/     # Reusable UI components
│   │   ├── lib/            # Utilities and helpers
│   │   └── stores/         # Zustand state management
│   ├── public/             # Static assets
│   └── package.json
│
├── backend/                # Bun backend server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   └── lib/            # Backend utilities
│   └── package.json
│
└── shared/                 # Shared code between mobile and backend
```

---

## Source of truth

Read `ClearHead_Locked_Decisions_v3.md` before changing product direction, copy, UI hierarchy, or scope.

That file controls the positioning, tone, two-mode architecture, hero loop, safety branch, and cut list. v3 supersedes v2; v2 is kept in the repo for history only.

---

## Getting started

### Prerequisites

- [Bun](https://bun.sh) v1.0+
- [Node.js](https://nodejs.org) v18+
- iOS Simulator, Android Emulator, or Expo Go on a physical device

### Install

```bash
git clone https://github.com/MSti9/ClearHead.git
cd ClearHead

cd backend
bun install

cd ../mobile
bun install
```

### Environment variables

Create `.env` files in `backend/` and `mobile/`.

**backend/.env**

```env
PORT=3000
OPENAI_API_KEY="your-openai-key"
ANTHROPIC_API_KEY="your-anthropic-key"
```

**mobile/.env**

```env
EXPO_PUBLIC_BACKEND_URL="http://localhost:3000"
EXPO_PUBLIC_VIBECODE_REVENUECAT_TEST_KEY=""
EXPO_PUBLIC_VIBECODE_REVENUECAT_APPLE_KEY=""
EXPO_PUBLIC_VIBECODE_REVENUECAT_GOOGLE_KEY=""
```

### Run locally

Start the backend:

```bash
cd backend
bun run dev
```

Start the mobile app:

```bash
cd mobile
bunx expo start
```

Then open in iOS Simulator, Android Emulator, or Expo Go.

---

## Development notes

```bash
cd mobile
bun run typecheck
bun lint
```

Commit small, working changes. Keep documentation and implementation aligned.

---

## License

Private and proprietary. All rights reserved.
