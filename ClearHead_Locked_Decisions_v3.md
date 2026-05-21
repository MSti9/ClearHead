# ClearHead — Locked Decisions v3

**Status:** Canonical source of truth. Supersedes v2. Read this before changing product direction, copy, UI, scope, or build plans. Do not relitigate what's locked unless Michael explicitly reopens it.

**What v3 reconciles:** v2 framed ClearHead as a one-shot brain dump (dump → reflection → close). The original February build had a conversational "talk it through" flow. v3 is not either/or — ClearHead has **two modes and one shared close.**

---

## One-line promise

Say what's stuck in your head. ClearHead helps you make sense of it. Then you save it or let it go.

**Anchor (build copy):** Brain dumps, cleaned up.

---

## Product thesis

ClearHead is not a journal, not therapy, and not an AI companion.

It is a private, voice-first release app for people who want to talk something out without talking to a person.

Sometimes they need one pass. Sometimes they need the app to talk back. ClearHead supports both. The conversation opens the loop; the reflection closes it. The clean close is what makes the product safe, bounded, useful — and what keeps it a release valve, not a dependency.

---

## Core buyer

The self-reliant person who bottles things up because unloading on another person has a cost.

- They don't want to burden a friend.
- They don't want to poison someone else's view of their spouse, boss, kid, parent, coworker, or situation.
- They don't want a therapist-feeling app.
- They don't want a cartoon wellness world, streaks, pets, or guilt.

They want a private place to say the thing out loud and feel lighter. The download trigger is disillusionment, not crisis: "I tried the others, they were too much."

*This guides the product. It does NOT go in the headline — the copy stays simple and lets the user fill in the rest.*

---

## Product architecture — two modes, one close

### Mode 1: Get It Out (default, cheap, high-margin)
Fast one-pass release. User picks **voice or text**, dumps what's on their mind. ClearHead takes it in, cleans it up, returns the 3-part reflection, and lets them save it or let it go. For quick vents, brain dumps, "I just need to say this." No back-and-forth.

### Mode 2: Talk It Through (premium, voice-back)
Live conversation. User talks; ClearHead **talks back out loud** and asks one useful follow-up at a time to help them go a layer deeper — *toward a close and a lighter exit, never endless excavation.* For when one pass isn't enough. The user controls when it ends.

### Shared ending loop
Both modes end the same way. **The user controls the close by tapping "Done."** No adaptive "sense when you're finished" detection in V1 — no forced ending, no clingy continuation, no abrupt cutoff. After Done, the reflection generates.

---

## The reflection — the 3-part output

The feature that makes this more than a prettier Notes app. After Done, return three things — never just a transcript:

1. **What you said** — the dump cleaned up. Clear, tight, 1–3 sentences. Their words untangled, nothing added.
2. **What's underneath** — one plain sentence naming the real thing they're circling. **Bounded to what they SAID — name it plainly, never diagnose who they ARE.** ("It's not the meeting — it's that you don't feel heard," not "you feel inadequate.")
3. **One thing to let go of** — a short grounding line they can put down. Grounding, not advice. Never "you should," never a fix, never clinical.

Then: **Save it / Let it go / Keep talking.**

### The voice
Light, dry, steady. Warm not tender, calm not somber, blunt without cold. Meet the user's intensity, then lift — never heavier than what they brought in. Light in, light touch; heavy in, one honest beat of acknowledgment, then still aim up. Always lighter on the way out. A smart friend texting back — never a therapist, coach, or wellness app. Test: if a line could come from a therapist, coach, or wellness app, it's wrong.

### The contract (backend → app)
```
{ what_you_said, whats_underneath, let_go_of (string|null),
  support_message (string|null), safety_flag (bool) }
```
Zod-validated. The server enforces the safety invariant: `safety_flag === true` requires `let_go_of === null` and a non-empty `support_message`.

---

## Safety — non-negotiable

ClearHead is not a crisis service, but it must never harm a user in crisis.

When a dump signals self-harm, suicidal intent, abuse, or intent to harm someone, the reflection engine sets `safety_flag` and the app:
- **Drops the "let it go" payoff.** Never tell someone in crisis to let it go.
- Shows a brief, plain acknowledgment + a clear path to real support: **988** (call/text) and **Crisis Text Line** (text HOME to 741741); if in immediate danger, emergency services. **Never promise confidentiality.**
- Offers a **safe exit** ("I'm safe right now") so a false positive never traps a user.
- Keeps the tone calm and grounded — held, not alarmed.

**The crisis path is a hard pre-ship gate.** Reliable detection and the support UX get dedicated, careful review — ideally with clinical input — before launch. Only the branch + support routing ship before that review.

---

## Companion guardrails

ClearHead may sound intelligent, warm, and specific *inside a session*. It must never become a companion.

**Never:** say "I missed you" / "I'm always here for you"; create a named persona; pretend to love, miss, need, or remember the user; reopen old pain unprompted; push notifications about prior topics; build a friendship loop; reward dependence; use streaks; gamify distress; use clinical/diagnosis language; present itself as therapy.

**Always:** keep history pull-only; let the user initiate; let the user end; close every session cleanly; treat the app as a private release valve, not a relationship.

**The hard rule:** ClearHead never re-opens the lid. This governs *across sessions* (no resurfacing, no pushed history) — it does not forbid a real conversation *within* a session. The release stays a release.

---

## Visual identity

**Aesthetic:** Stark, quiet, adult, private. An empty, well-lit room. No clutter, no gamification, no loud color. Minimal is the point — and a moat: what your buyer hates about Calm/Finch is exactly what you avoid.

**Palette ("Stone & Shadow"):** warm off-white canvas (~#F7F5F2), deep charcoal text (~#1C1917, never pure black), warm gray for muted text. Accents reserved for the breathing orb and key states. Dark, grounding background for the safety state.

**Typography (principle):** clean, legible sans for everything the user reads or types — **the reflection must land blunt and direct, not literary or precious.** Any serif is reserved at most for the large greeting as a flourish — never the reflection, never input text. (Exact font families are Gemini's to finalize within this principle.)

**Spacing & motion:** extreme whitespace; slow, earnest motion (600–800ms, ease-in-out); no bouncy/gamified physics. The ending screen reveals the 3 parts in a staggered fade; "Let it go" dissolves the screen to near-black as a deliberate palate cleanser.

**Icon (locked):** keep the brain logo (the February asset Michael wants). Render it **stark on a dark/onyx canvas** — not warm-cream, not abstract. The warm-cream pastel read as a clinic; a stark charcoal brain reads as a premium, private utility. Recognizable + on-brand.

---

## Positioning & hooks

**Market it as:** a private place to say what you can't unload on someone else; a voice-first brain dump that talks back when you need it; a release valve with a clean close.

**Do NOT market it as:** AI companion, AI therapist, chatbot friend, mental-health treatment, mood tracker, self-care pet, or a journaling habit app.

**Subtitle A/B (decide on launch data, don't pre-pick):**
- Lane A — *Brain dumps, cleaned up.* (feature-forward; default build copy)
- Lane B — *Say it. Feel lighter.* (value-forward)

**Hook lane:** behavior over identity. Never flatter the identity ("you're the strong one"). Market the lift, never the spiral. Examples: "Say the thing you can't unsay — without saying it to a person." / "For the thoughts you don't want to hand to someone else." / "Not therapy. Not a chatbot friend. Just a place to put it down."

---

## Monetization

- **$19.99/month** (premium AI-tool anchor)
- **$149.99/year** launch price (~37% undercut on the monthly — the "founder's rate")
- Later test: **$179.99/year** if retention/voice usage justify it

**Logic:** Get It Out supports a limited free experience; Talk It Through (voice-back) is the premium unlock and justifies the price; the cheap one-pass default protects margins. Two-step paywall per the playbook.

**Open conversion question (for Atlas):** users won't pay for voice-back they've never felt — design a *taste* of Talk It Through before the hard gate so conversion doesn't tank.

---

## Tech stack

- **Mobile:** React Native + Expo (Expo Router, NativeWind, Zustand, TanStack Query)
- **Backend:** Bun + Hono, Zod validation, backend-routed AI calls (no client secrets)
- **AI:** Anthropic Claude (the brain / reflection), OpenAI Whisper (STT)
- **Voice-back:** a replaceable **VoiceBackService**. V1 = OpenAI TTS (cheaper, faster, consolidates with Whisper). Re-evaluate OpenAI vs ElevenLabs after the Talk It Through prototype exists. The vendor is an implementation detail; the requirement is "talks back out loud in a calm, natural voice."
- **Monetization:** RevenueCat (already wired)

---

## Build sequence

**Phase 1 — Core release loop (BUILT, in review):** Mode 1 "Get It Out" (voice + text) + the shared ending loop + the safety branch. PR `hero-loop-mode-1`. Pending: typecheck, run the test plan (safety branch first), merge; then the follow-up cleanup (kill the legacy voice-coach path, land this doc as canonical, minor leftovers).

**Phase 2 — Talk It Through:** live voice-back. User taps Talk It Through → app opens out loud → user responds → Claude generates one follow-up → TTS speaks it → loop until "Done" → same shared ending loop. The hard part (the February sticking point); gets its own focused design pass.

**Phase 3 — Refinement:** voice pacing, follow-up styles, optional talk-back modes, saved-history polish, pull-only look-back, cost controls, provider testing.

**Pre-ship gates (the "110%" list):** the crisis/safety path (reliable detection + support UX, ideally with clinical input); a "not therapy" disclaimer + ToS reviewed by an actual lawyer; gold-standard reflection tests across light / heavy / crisis / false-alarm dumps.

---

## Success criteria (V1)

1. A first-time user completes a Get It Out session in under 60 seconds.
2. The 3-part reflection produces an "oh, that's it" moment.
3. "Let it go" feels emotionally distinct from delete — and actually discards.
4. "Save it" feels optional, not required.
5. Talk It Through feels useful without feeling like a companion.
6. The app never pressures the user to return to old pain.
7. The user leaves feeling lighter, not more attached to the app.

---

## Anti-patterns — cut anything that turns ClearHead into:

A therapy replacement · a daily habit tracker · a mood-analytics dashboard · a companion relationship · a generic AI chatbot · a productivity app · a journaling app with voice bolted on · a wellness app with vague affirmations.

ClearHead is not trying to maximize time in app. It is trying to create a completed release.
