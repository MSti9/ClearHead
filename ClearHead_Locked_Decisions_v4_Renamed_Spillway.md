# ClearHead — Locked Decisions v4
## Renamed to Spillway

**Status:** Canonical transition source of truth. Supersedes `ClearHead_Locked_Decisions_v3.md` while preserving the core product architecture. Read this before changing product direction, copy, UI, scope, naming, onboarding, paywall strategy, or build plans.

**Working file name:** `ClearHead_Locked_Decisions_v4_Renamed_Spillway.md`

**Future file name after repo/app rename:** `Spillway_Locked_Decisions_v1.md`

**Why keep “ClearHead” in this file name for now:** continuity. Claude Code, Gemini, ChatGPT, and the repo all still contain ClearHead-era references. This v4 file is the bridge document: it tells every model and implementation session that the old product direction survives, but the name and brand spine have changed.

---

## What v4 changes

ClearHead is dead as a launch name because the App Store already contains conflicting ClearHead/ClearThought-style territory. The product is now **Spillway**.

This is not a surface rename.

v4 makes five changes:

1. **The brand north star changes from “clear head” to “controlled release.”**
2. **The product architecture from v3 stays intact:** two modes, one shared close.
3. **Confide becomes the closest competitor to watch, not the brand to copy.**
4. **The visual identity shifts from warm minimal journaling to Industrial Calm / Cockpit for the Mind.**
5. **Spillway is treated as a private release mechanism, not a relationship, not a journal, not a productivity recorder.**

---

## One-line promise

Say what’s stuck. Spillway helps you make sense of it. Then you keep it or let it go.

**Anchor / build copy:** Brain dumps, cleaned up.

**Plain-English product sentence:** Spillway is a private voice-first app where you dump what’s stuck in your head, get a clean three-part reflection, and either save it, keep talking, or let it disappear.

---

## Product thesis

Spillway is not a journal, not therapy, not an AI companion, and not a productivity app.

It is a private release app for people who want to talk something out without talking to a person.

The name matters because it reframes the app. A spillway is not a friend, therapist, diary, or archive. It is a controlled release mechanism. Pressure builds. The user opens the release. The system stays intact.

That is the product.

Sometimes the user needs one pass. Sometimes they need the app to talk back. Spillway supports both. The conversation opens the loop; the reflection closes it. The clean close is what keeps the product safe, bounded, useful, and distinct from AI companion dependency.

---

## The brand spine

**Spillway is where pressure goes before it comes out sideways.**

This is the internal brand idea. It should guide product, design, and marketing. It should not be over-explained in every UI screen.

### What the name should communicate

- controlled release
- pressure leaving safely
- private place to put what is building
- strong structure, not fragility
- relief through control
- clean exit, not endless exploration

### What the name must not become

- water/dam cosplay
- literal engineering UI
- blue wave visuals
- pipe/droplet iconography
- “flow state” wellness language
- cold masculine overcorrection

The metaphor is the brand logic. The app UI should remain plain, human, and obvious.

---

## Core buyer

The self-reliant person who bottles things up because unloading on another person has a cost.

- They do not want to burden a friend.
- They do not want to poison someone else’s view of their spouse, boss, kid, parent, coworker, or situation.
- They do not want a therapist-feeling app.
- They do not want an AI bestie.
- They do not want a cartoon wellness world, streaks, pets, guilt, or identity flattery.
- They do not want a “second brain” productivity recorder.

They want a private place to say the thing out loud, see it clearly, and feel lighter.

The download trigger is disillusionment, not crisis:

> “I tried the others. They were too much. None of them just let me get it out.”

This guides the product. It does **not** go directly in the headline. The copy stays simple and lets the user fill in the rest.

---

## Positioning relative to Confide

Confide is the closest competitor in mechanics and market proof. It validates demand for voice/video-first emotional processing, AI feedback, memory, and personal reflection.

But Spillway must be the anti-Confide in framing.

### Confide

- “Tell your AI bestie your story.”
- Video journal that talks back.
- AI companion / bestie.
- Relationship data built from journal entries.
- Warm, emotional, girlfriend-adjacent tone.
- Young-woman journaling / self-improvement aesthetic.
- Memory makes the AI feel like a person.
- Social/UGC energy comes from emotional authenticity and shareable AI responses.
- Risks: companion dependency, therapy-adjacent positioning, pricing confusion, data loss, retroactive feature gating, AI-safety scrutiny.

### Spillway

- “Dump what’s building. Get the clear version. Put it down.”
- Private voice-first release valve.
- Tool, not companion.
- Readout, not chat bubble.
- Pattern memory only when useful and user-pulled.
- Industrial calm / cockpit for the mind.
- No bestie. No soulmate. No named AI friend. No relationship loop.
- The app earns trust through reliability, clarity, and clean closure.

### What to steal from Confide

- Low-friction voice input.
- “No writing required” energy.
- A fast minimum viable action.
- AI output that feels specific enough to create word of mouth.
- Personal context and memory, but only as structural pattern recognition.
- The idea that the user will pay if the app helps them process something they cannot easily give to another person.

### What not to steal from Confide

- AI bestie language.
- Named persona relationship.
- Soulmate / romantic companion features.
- Chat-first interface.
- Emotional dependency loops.
- Streak pressure.
- Mood tracking as the point.
- Confusing pricing tiers.
- Retroactive feature removal.
- Any trust-eroding data practices.
- Video-diary aesthetics.
- TikTok “come journal with me” softness.

---

## Product architecture — two modes, one close

v3 architecture is preserved.

### Mode 1: Get It Out

Default, cheap, high-margin, fast.

The user picks **voice or text**, dumps what is on their mind, and Spillway turns it into the 3-part reflection.

Use cases:

- quick vent
- brain dump
- angry email/text they should not send
- end-of-day pressure
- looping thought before sleep
- “I just need to say this”

No back-and-forth. No companion energy. One pass, clean output, close.

### Mode 2: Talk It Through

Premium, voice-back, bounded.

The user talks. Spillway talks back out loud and asks one useful follow-up at a time to help them go one layer deeper.

Purpose:

- go deeper when one pass is not enough
- clarify what is actually bothering them
- move toward a lighter exit
- avoid dumping on another person

Guardrail:

Talk It Through must move toward closure, not endless excavation. The user controls when it ends.

### Shared ending loop

Both modes end the same way.

The user taps **Done**.

Then Spillway generates the reflection.

No adaptive “sense when you are finished” detection in V1. No forced ending. No clingy continuation. No abrupt cutoff.

After the reflection:

- **Save it**
- **Let it go / Let it disappear**
- **Keep talking**

---

## The reflection — the 3-part output

This is the feature that makes Spillway more than a prettier Voice Memos, Notes, or AI transcription app.

After Done, return three things — never just a transcript:

1. **What you said**  
   The dump cleaned up. Clear, tight, 1–3 sentences. Their words untangled, nothing added.

2. **What’s underneath**  
   One plain sentence naming the real thing they are circling. Bounded to what they said. Name the pressure point, never diagnose the person.

3. **One thing to put down**  
   A short grounding line they can release. Grounding, not advice. Never “you should.” Never a fix. Never clinical.

Then:

**Save it / Let it go / Keep talking.**

### Reflection UI rule

The reflection must look like a **readout**, not a chat response.

Use structured cards or panels.

Avoid:

- chat bubbles
- avatars
- fake empathy blocks
- “I hear you” paragraphs
- advice lists
- therapy-session formatting

Preferred framing:

- **What you said**
- **What’s underneath**
- **What to put down**

or, in the shorter Talk / Reflect / Keep system:

- **Talk** — what stood out
- **Reflect** — what it means
- **Keep** — what is worth keeping

---

## The voice

Light, dry, steady.

Warm not tender. Calm not somber. Blunt without cold. Meet the user’s intensity, then lift. Never heavier than what they brought in.

Light in, light touch.

Heavy in, one honest beat of acknowledgment, then still aim toward release.

**Always lighter on the way out.**

The voice should feel like a smart friend texting back, but the app must never become “a friend.”

Test:

> If a line could come from a therapist, coach, or wellness app, it is probably wrong.

### Good language

- “Say the messy version.”
- “What needs somewhere to go?”
- “Here’s the clear version.”
- “That sounds like the part worth naming.”
- “Keep what matters. Put the rest down.”
- “Gone.”

### Bad language

- “I’m here for you.”
- “I missed you.”
- “Your healing journey.”
- “Let’s process your emotions together.”
- “You are safe with me.”
- “I know how hard this has been for you.”
- “As your AI companion...”
- “Your feelings are valid.”

Some of those may be true, but they put the product in the wrong category.

---

## Backend → app reflection contract

Keep the v3 contract unless engineering requires a narrow change.

```ts
{
  what_you_said: string,
  whats_underneath: string,
  let_go_of: string | null,
  support_message: string | null,
  safety_flag: boolean
}
```

Server invariant:

```ts
safety_flag === true requires let_go_of === null and support_message !== null
```

---

## Safety — non-negotiable

Spillway is not a crisis service, but it must never harm a user in crisis.

When a dump signals self-harm, suicidal intent, abuse, or intent to harm someone, the reflection engine sets `safety_flag` and the app:

- drops the “let it go” payoff
- never tells someone in crisis to let it go
- shows a brief, plain acknowledgment
- points to real support: **988** call/text and **Crisis Text Line** text HOME to 741741
- says to contact emergency services if in immediate danger
- offers a safe exit such as **I’m safe right now** so false positives do not trap the user
- keeps tone calm and grounded — held, not alarmed

The crisis path is a hard pre-ship gate. Detection, routing, and support UX require dedicated review before launch.

---

## Companion guardrails

Spillway may sound intelligent, warm, and specific inside a session.

It must never become a companion.

### Never

- “I missed you.”
- “I’m always here for you.”
- named AI persona
- bestie language
- soulmate mode
- relationship mode
- fake love, missing, needing, or emotional attachment
- reminders about old painful topics
- push notifications that reopen prior pain
- friendship loops
- dependence rewards
- streaks
- gamified distress
- clinical/diagnosis language
- therapy framing

### Always

- user initiates
- user controls close
- history is pull-only
- sessions end cleanly
- old material is never resurfaced without user request
- memory is structural, not relational
- the app is a private release valve, not a relationship

**Hard rule:** Spillway never re-opens the lid.

This governs across sessions. It does not forbid useful context inside a session. The release stays a release.

---

## Memory and patterning

Confide proves that memory is sticky. Spillway should use memory differently.

Confide memory makes the AI feel like a person.

Spillway memory should make the user feel like they understand themselves better.

### Allowed memory

- pull-only history
- user-initiated look-back
- pattern surfacing when the user asks
- “this keeps coming up” readouts
- theme recurrence
- saved reflections
- optional search

### Forbidden memory

- “I remember you said...” without user request
- push notifications about old subjects
- emotional continuity hooks
- “we’ve been through a lot together” language
- daily guilt loops
- streaks as identity

Good pattern framing:

> “This has come up three times this month. The common thread is feeling unrecognized.”

Bad pattern framing:

> “You’re still struggling with your boss. Want to talk about that again?”

---

## Visual identity

### North star

**Industrial Calm / Cockpit for the Mind.**

The app should feel capable, private, controlled, and premium.

Not pretty for the sake of pretty. Not soft. Not cozy. Not wellness dark mode. Not masculine cosplay.

The right word is:

**Capable.**

The user should feel:

> “This thing is built to take pressure.”

### Visual references

- premium hardware
- inside of a quiet car at night
- field recorder
- cockpit instrument
- pressure gauge restraint
- Apple Notes simplicity
- Rimowa / Linear / Dieter Rams restraint

### Palette

Working palette, subject to Gemini/design refinement:

- Dark graphite: `#111111`
- Charcoal surface: `#1B1A18`
- Warm bone: `#F4EFE7`
- Concrete canvas: `#E6E0D7`
- Text light: `#F7F2EA`
- Text dark: `#191817`
- Muted text: `#8D8982`
- Border: `#2A2926`
- Copper / ember accent: `#B86A3C`
- Muted amber variant: `#C9833A`
- Settled stone/sage: `#6E7568`

Avoid pure black/pure white when possible. Avoid bright safety orange unless used deliberately and sparingly. The accent should feel like a pilot light, not a construction sign.

### Typography

Clean, legible sans-serif for everything the user reads or types.

The reflection must land blunt and direct, not literary or precious.

Preferred direction:

- Inter
- Geist
- SF Pro
- Helvetica Neue

Avoid decorative serif in reflection cards, input text, or functional UI.

### Icon direction

The ClearHead brain asset was loved, but Spillway needs a more abstract symbol.

Direction:

- preserve the memory of head/brain DNA
- reduce it into geometric form
- show contained pressure with one clean release channel
- make it feel like a pressure-chamber glyph, not a medical brain

Avoid:

- literal brain diagram
- dam
- water
- pipe
- droplet
- heart
- journal
- therapy mascot
- wellness icon

The mark should work as a dark onyx app icon and as a simple one-color glyph.

### UI rules

- One primary action per screen.
- Big central voice action.
- Minimal chrome.
- No chat bubbles.
- No avatars.
- No emotional mascot.
- No “How are you feeling today?” home screen.
- No mood graph as the primary object.
- No streak-first dashboard.
- Reflection outputs are cards/readouts.
- Saved history is quiet and pull-only.
- “Let it disappear” is a first-class action.

### Core navigation language

Lock as working direction:

**Talk / Reflect / Keep**

Talk = get it out.  
Reflect = get the clear version.  
Keep = save what matters.

This may appear as navigation, readout stages, or product language. Do not force every screen into the metaphor; UI should stay obvious.

---

## Motion and haptics

Motion should express:

**build → release → clear**

### Recording

- waveform responds to voice
- restrained copper center line or progress ring
- subtle haptic when recording starts
- record button should feel like a heavy switch, not a playful tap

### Reflection reveal

- staggered fade / slide for the three cards
- no bouncy animations
- no confetti
- no gamified completion

### Let it disappear

This is a signature product moment.

The motion should feel final.

Preferred direction:

- original dump collapses into a single line
- line clears or wipes off screen
- screen settles to near-black or clean blank
- one firm haptic
- final state: **Gone.**

Avoid:

- glitter
- vapor/mist if it feels wellness-coded
- fire/burning if it feels aggressive
- shredder/paranoia visuals unless very restrained
- celebratory reward animation

The user should feel relief through control.

---

## Home screen

The home screen should not ask “How are you feeling today?”

That is wellness/Confide territory.

Preferred opening line candidates:

- “What needs somewhere to go?”
- “Say the messy version.”
- “What’s taking up space?”
- “Open Spillway.”

Primary actions:

- **Talk**
- **Type**

Secondary:

- **Talk It Through**
- recent saved reflections, if any

Keep the dashboard quiet. No analytics wall. No mood meter. No daily streak. No “your AI remembers you” relationship framing.

---

## Recording screen

The recording screen is the product’s cockpit.

It should be the most controlled, minimal, premium screen in the app.

Required elements:

- large voice control
- waveform or audio visualizer
- timer
- pause/resume if needed
- done/cancel
- minimal brand mark

Copy:

- “Say the messy version.”
- “No one hears it. Nothing has to sound right.”
- “Talk. We’ll clean it up.”

Avoid:

- “journal your feelings”
- “talk to your AI”
- “confide in us”
- “tell your bestie”

---

## Reflection screen

The reflection screen is where Spillway becomes worth paying for.

It should feel like a clear readout after the release.

Header candidates:

- “The clear version”
- “What came through”
- “Here’s what matters”

Cards:

1. **What you said**
2. **What’s underneath**
3. **What to put down**

Actions:

- **Save it**
- **Let it disappear**
- **Keep talking**

No fake conversation. No AI face. No paragraph bloat.

---

## Talk It Through

Talk It Through is not a chatbot. It is a bounded voice-back loop.

The app may ask useful follow-ups. It must not act like a person.

Use framing like:

**Spillway asks:**

Then one focused question.

Good follow-ups:

- “What part of this are you still carrying?”
- “What are you trying not to say out loud?”
- “What would change if you did not have to solve this tonight?”
- “What is the part you keep circling?”

Bad follow-ups:

- “I’m here with you.”
- “That must feel so hard.”
- “Tell me more, I care.”
- “You are not alone.”

Talk It Through should help the user arrive at a close, not keep them in the app forever.

---

## Disappear mode

Disappear mode is not delete-as-maintenance. It is deliberate forgetting as a feature.

Use cases:

- user vents about spouse/boss/friend and does not want a record
- user says something ugly and wants it out, not archived
- user needs the lesson, not the raw dump
- user fears a child/spouse/coworker finding the rant

Rules:

- user chooses whether to save or disappear each time
- if user lets it disappear, no saved record remains
- final confirmation must be clear but not guilt-inducing
- after disappearance, show a clean close

Best final state:

**Gone.**

Subcopy:

**Nothing saved. Nothing to reopen.**

---

## Scope — V1

### In

- Get It Out: voice + text dump
- AI transcription / processing
- 3-part reflection
- Talk It Through voice-back mode
- user-controlled Done
- Save it / Let it go / Keep talking ending loop
- saved history
- pull-only look-back
- simple onboarding
- basic paywall infrastructure
- safety path
- privacy-forward data handling
- industrial calm visual system
- disappear mode or at least the first buildable version of it

### Cut

- gamification
- pets
- streaks
- celebrity content
- social features
- feed
- chat friend framing
- named AI persona
- soulmate / romantic analysis
- mood tracking as the product
- analytics dashboard as the product
- “use it for anything” junk drawer
- productivity exports as a core promise
- task lists / to-dos / second-brain positioning
- clinical language
- therapy claims
- companion claims

Test for every feature:

> Does it serve the same person’s same pain, and does it respect the close-the-book principle?

If not, cut it.

---

## Retention without dependency

Spillway should not retain users by making them dependent on an AI relationship.

Retention should come from utility rituals.

### Approved ritual lanes

- **Driveway dump** — before walking into the house
- **Pre-send dump** — before sending the angry text/email
- **Night drain** — when the loop will not stop before sleep
- **Friday release** — end-of-week reset
- **Before the hard conversation** — clarify the real issue first

### Reminder rule

Reminders, if used, must be generic and opt-in. They must never reference old pain.

Good:

> “Something taking up space?”

Bad:

> “Still thinking about your boss?”

---

## Positioning hooks

Use behavior over identity.

Never flatter the identity too directly. Avoid “you are the strong one” as front-facing copy unless it is very carefully handled. Market the lift, not the spiral.

### Strong hooks

- “Brain dumps, cleaned up.”
- “Say what’s stuck. Get the clear version.”
- “Say the thing you can’t unsay — without saying it to a person.”
- “For the thoughts you don’t want to hand to someone else.”
- “Talk it out before it comes out sideways.”
- “Keep what matters. Put the rest down.”
- “Not therapy. Not a chatbot friend. Just a place to put it down.”
- “Some things need somewhere to go.”

### Avoid

- “Start your healing journey.”
- “Your AI bestie.”
- “Mood tracking made simple.”
- “Daily journaling habit.”
- “Self-care companion.”
- “Never feel alone again.”
- “Meet your AI therapist.”

---

## App Store positioning

### Default subtitle candidate

**Brain dumps, cleaned up.**

### Alternate subtitle candidates

- Say it. Put it down.
- Private voice reflection.
- Talk it out. Let it go.
- Get the clear version.

### First screenshot direction

**Say what’s stuck.**

### Screenshot sequence

1. **Say what’s stuck.**  
   Talk or type the thing taking up space.

2. **Get the clear version.**  
   What you said. What’s underneath. One thing to put down.

3. **Keep it or let it disappear.**  
   Save what matters. Release the rest.

4. **Keep talking when one pass is not enough.**  
   A focused follow-up. Not an AI friend.

5. **Private by design.**  
   No audience. No feed. No fallout.

---

## Distribution and UGC

Spillway should not rely on journaling TikTok aesthetics. Confide can live there. Spillway needs more adult, moment-based UGC.

The content format should sell the occasion:

- before sending the text
- sitting in the driveway
- after a hard workday
- before a meeting
- when the brain will not stop at night
- when you do not want to dump on your spouse/friend/mom

Creator language:

- “I don’t journal.”
- “I didn’t need advice. I needed somewhere to put it.”
- “This cleaned up my rant into what I actually meant.”
- “Before I send the paragraph, I dump it here.”
- “I use this before I bring the whole day into the house.”

Avoid:

- “mental health app”
- “therapy app”
- “AI journal”
- “mood tracker”
- “self-care routine”
- “bestie”
- “healing”

---

## Monetization

**Paused / not re-locked in this v4 pass.**

Known prior direction:

- $19.99/month
- $149.99/year
- annual-first positioning
- RevenueCat already wired
- two-step paywall concept exists

Known competitive warning:

Confide created backlash through confusing tiers, add-ons, AI call-time gating, diamonds, and retroactive feature movement. Spillway should be clean, stable, and explicit about what premium includes.

Do not finalize detailed free allowance, trial structure, hard/soft gate placement, or downsell logic in this document until Michael reopens monetization.

Placeholder principle:

> Do not let monetization break trust. No fake timers. No false scarcity. No retroactive feature removal.

---

## Taste-slice / free allowance

**Paused / not re-locked in this v4 pass.**

Known prior working direction from the current build conversation:

- free Get It Out reflections
- one free Talk It Through taste
- gate before a new dump, never after the user has poured something out
- paywall at a moment of action, not after emotional vulnerability has already been spent

This needs a separate monetization pass before being made canonical.

---

## Brand metaphor intensity

**Paused / not re-locked in this v4 pass.**

Open question:

How much should the product UI use Spillway-specific language like “Open Spillway,” “Keep Spillway Open,” “Release,” “Pressure,” or “Overflow”?

Working guidance until decided:

- Use Spillway as the brand spine.
- Keep most UI language plain and human.
- Avoid over-metaphorizing the app.
- Do not turn the interface into a dam/water/engineering theme.

Safe UI language for now:

- Talk
- Type
- Reflect
- Keep
- Let it go
- Let it disappear
- Done
- The clear version

---

## Data trust and reliability

Spillway cannot lose user data.

Confide’s biggest execution weakness is trust: reports of bugs, failed AI responses, pricing confusion, and data loss. Spillway’s bar is higher because the user is handing over emotionally loaded material.

Reliability rules:

- Never lose an in-progress dump.
- Make upload/transcription states explicit.
- Save local draft or fail gracefully.
- If processing fails, user should still have the raw transcript/audio path if technically possible.
- Never create ambiguity about whether something was saved or disappeared.
- Privacy language must be plain.
- Do not overpromise confidentiality if AI APIs process the content.

---

## Privacy posture

Spillway must be clearer and more trustworthy than Confide.

Plain principles:

- no social feed
- no public sharing by default
- no selling user content
- no training on user entries unless explicitly disclosed and opt-in
- no pushed resurfacing of old entries
- AI processing disclosed in plain language
- privacy is not just a policy page; it is visible in product decisions

Do not say “completely private” if server-side AI processing is involved. Say what is true.

---

## Implementation guidance for Claude Code

Do not start by redesigning everything.

First update the canonical docs so future coding sessions stop drifting.

Required cascade:

1. `ClearHead_Locked_Decisions_v4_Renamed_Spillway.md`
2. `CLAUDE.md`
3. `PRD.md`
4. `APP_FLOW.md`
5. `FRONTEND_GUIDELINES.md`
6. `IMPLEMENTATION_PLAN.md`
7. app display name / bundle references / UI strings
8. README cleanup

### Renaming rule

Do not blindly replace every `ClearHead` string with `Spillway` without checking context. Some references should remain as historical notes during transition. Product-facing strings should move to Spillway. Internal migration notes can mention ClearHead.

### Current implementation posture

The repo scaffold already exists. React Native / Expo app + Bun / Hono backend. AI is already wired or partially wired: reflection, transcription, TTS, RevenueCat, settings screen. This is not starting from zero.

The next step is disciplined renaming and design-system alignment, not feature sprawl.

---

## Open decisions

These are intentionally not locked in v4 because Michael paused them.

1. **Brand metaphor intensity**  
   How much Spillway terminology appears inside the product UI versus remaining in positioning/marketing.

2. **Monetization / free allowance / taste-slice gating**  
   Final free use counts, paywall moments, trial mechanics, and monthly/yearly presentation.

3. **Final icon**  
   Direction is locked: abstract contained-pressure/release-channel mark. Exact asset is not locked until Gemini/design review.

4. **Exact palette and typography**  
   Direction is locked. Final tokens can be refined in `FRONTEND_GUIDELINES.md`.

5. **Advisor / credibility layer**  
   Confide uses mental-health professionals as credibility armor. Spillway may or may not need this. Decide later.

---

## Final north star

Spillway is not where you go to be understood by an AI.

It is where pressure goes so you can stay intact.

The product should feel like the most competent place on the phone to put what is building up.

**Say it. See it. Set it down.**

