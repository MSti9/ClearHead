# Opportunity Shortlist — pre-validation strategy layer

> **Status: UNVALIDATED.** This is reasoned market analysis from public knowledge of these
> niches — *not* AppKittie data. No dollar figures are asserted because none have been pulled
> from a tool call yet. Every line below is a **lead to confirm** with `search_apps` +
> `get_app_detail` before it earns a place in a real report. Connect the MCP (see README),
> run `prompts/research-prompt.md`, and let the data promote or kill each item.

The job of this doc: point the expensive, credit-burning validation pass at the highest-EV
targets first, so you don't waste `get_app_detail` calls on dead niches.

---

## Top 5 niches by opportunity (could scale a solo-built app to $10k/mo)

Ranked on: validated demand × weak/bloated incumbents × simple loop × a marketing path a
solo founder can actually run. Build/distro are 1–10 (10 = hardest).

### 1. AI photo calorie / food logging (Weight loss)
- **Why:** the photo-→-macros loop went viral (Cal AI is the reference case) and proved people
  will pay weekly for a *simpler* tracker. Incumbent (MyFitnessPal) is bloated and widely
  resented — classic weak-incumbent setup.
- **Loop:** snap meal → instant macros → daily target. Dead simple.
- **Wedge:** accuracy + a non-diet, non-shaming tone + clean onboarding; kill the friction
  MyFitnessPal is hated for.
- **Marketing:** TikTok/AI-UGC is wide open ("I let AI count my calories for a week").
- **Build 6 · Distro 3** — needs a vision model, but the loop is tiny.
- **Validate:** Cal AI, YAZIO, Simple, Lose It!, Fastic, Lifesum.

### 2. Screen time / dopamine detox
- **Why:** Opal and one sec proved willingness-to-pay to block your own apps. Universal,
  recurring pain; incumbents win on mechanism but are beatable on copy/positioning/delight.
- **Loop:** friction screen / breath before a target app opens; weekly stats.
- **Wedge:** taste + identity ("reclaim your attention") + better stats; or niche it to one
  enemy (short-form video specifically — "brain rot blocker").
- **Marketing:** faceless + UGC is huge ("I deleted my dopamine for 30 days").
- **Build 6 · Distro 3** — Screen Time / Family Controls API is the main lift.
- **Validate:** Opal, one sec, Clearspace, ScreenZen, Jomo, Brick, Roots.

### 3. Faith / prayer
- **Why:** Hallow is a category whale — demand is proven and deep. The opportunity is the
  **underserved edges** Hallow doesn't own: specific denominations, Spanish/other languages,
  teens/Gen-Z aesthetic, kids.
- **Loop:** daily guided audio + streak + content cadence.
- **Wedge:** community + a tradition Hallow treats as an afterthought; founder-led trust.
- **Marketing:** founder-led + community/influencer within the faith vertical.
- **Build 4 · Distro 4** — mostly content + an audio player.
- **Validate:** Hallow, Pray.com, Glorify, Abide, YouVersion, Pause.

### 4. No-contact / breakup recovery (Relationship tracking)
- **Why:** sharp, acute emotional pain + a streak/counter loop that's trivially shippable.
  Mostly novelty/churny incumbents → wide open for better taste and real retention.
- **Loop:** "days no contact" counter + check-in prompt + a reason-to-stay-strong feed.
- **Wedge:** dry, steady, non-saccharine tone (the *opposite* of the cutesy incumbents) +
  genuine recovery structure instead of a bare number.
- **Marketing:** breakup TikTok is enormous — strongest organic UGC pull on this list.
- **Build 2 · Distro 2** — about as easy as it gets.
- **Validate:** search "no contact", "breakup recovery", "stop texting ex"; confirm which
  named apps actually clear the bar (lots of pretenders here).

### 5. ADHD habit / routine (Productivity × Self-improvement)
- **Why:** Finch proved emotional framing turns habit-tracking into elite retention; the
  ADHD time-boxing sub-niche (Routinery, Tiimo, Llama Life) is a sharp, loyal, paying painkiller.
- **Loop:** build a routine → guided/timed execution (body-doubling) → gentle streak.
- **Wedge:** ADHD-specific design (low friction, forgiving, dopamine-aware) + a companion/tone
  that isn't another sterile checklist.
- **Marketing:** ADHD TikTok community + founder-led is a firehose.
- **Build 5 · Distro 3.**
- **Validate:** Finch, Routinery, Tiimo, Llama Life, Structured, Habitica.

---

## 25 replicable opportunities to validate

Each is a concrete, solo-buildable, subscription-shaped app concept anchored to a niche with
existing earners. Confirm the "$10k×2–3 competitors" bar in AppKittie before committing.
(B = build difficulty, D = distribution difficulty, 1–10.)

| # | Opportunity | Niche | Core loop | Differentiation wedge | B | D |
|---|---|---|---|---|---|---|
| 1 | AI photo calorie tracker | Weight loss | snap → macros | accuracy + non-diet tone | 6 | 3 |
| 2 | AI fasting coach + photo log | Weight loss | timer + meal photos | coaching tone, not just a clock | 5 | 3 |
| 3 | "Just walk" weight loss | Weight loss | steps → trend | zero-effort framing, big TikTok hook | 3 | 3 |
| 4 | App-blocking friction app | Screen time | block screen + stats | UI delight + identity copy | 6 | 3 |
| 5 | Short-form "brain rot" blocker | Screen time | block reels/TikTok only | one sharp enemy, not all apps | 6 | 2 |
| 6 | Snore recorder | Sleep/snoring | record → proof clips | shareable evidence, partner mode | 5 | 3 |
| 7 | Smart alarm + sleep sounds | Sleep | track → wake | crowded — only if a hard wedge | 5 | 5 |
| 8 | Guided prayer, underserved tradition | Faith | daily audio + streak | own an edge Hallow ignores | 4 | 4 |
| 9 | Gen-Z devotional + streak | Faith | daily verse + share | aesthetic + lock-screen widget | 3 | 4 |
| 10 | No-contact streak tracker | Relationship | counter + check-in | dry, steady tone; real structure | 2 | 2 |
| 11 | "Days together" + check-ins | Relationship | counter + prompts | couples retention, not novelty | 3 | 4 |
| 12 | Habit tracker w/ companion | Habit | habit → care loop | a non-Finch emotional hook | 5 | 3 |
| 13 | ADHD time-boxing / body-double | Productivity | plan → timed run | ADHD-native, forgiving design | 5 | 3 |
| 14 | Morning routine + audio guide | Self-improvement | routine → guided run | Fabulous, but less preachy | 4 | 4 |
| 15 | Affirmations for one identity | Self-improvement | daily affirmation feed | niche identity + widget | 3 | 4 |
| 16 | Gym workout logger | Gym/lifting | log sets fast | speed + UX over Hevy/Strong | 5 | 4 |
| 17 | AI lifting program generator | Gym/lifting | answer → program | price + coaching tone vs Fitbod | 6 | 4 |
| 18 | Water / hydration nudge | Health | log → reminder | tiny MVP, paywall on stats | 2 | 5 |
| 19 | Cold-shower / discipline streak | Self-improvement | daily check + streak | masculine discipline UGC angle | 2 | 2 |
| 20 | Voice-first brain dump | Journaling | talk → cleaned reflection | anti-streak, "get it out, move on" | 5 | 3 |
| 21 | Gratitude journal + widget | Journaling | prompt → entry | lock-screen widget loop | 3 | 4 |
| 22 | Mewing / face-fitness tracker | Health | daily check + photos | proven weird-UGC niche | 3 | 2 |
| 23 | Posture reminder + camera check | Health | reminder + self-check | wearable-free, cheap MVP | 3 | 5 |
| 24 | Quit-vaping/porn/sugar streak | Self-improvement | sobriety-style streak | sharp pain, strong UGC | 2 | 2 |
| 25 | AI message/"rizz" helper | Dating/social | paste → suggestion | proven viral BUT crowded + policy risk | 5 | 2 |

**Notes on the tail of the list:** #7 (sleep sounds) and #18/#23 (passive health nudges) are
included for completeness but are either crowded or weak-paywall — likely `study`, not `build`,
once validated. #25 (rizz) converts on TikTok but is saturated and carries App Review / content
risk — go in eyes-open. #20 maps directly to your own Spillway thesis (voice-first, anti-streak
brain dump), so it's the one where you already hold the taste/positioning edge.

---

## Suggested first validation pass (budget-aware)

1. Run `search_apps` for niches **1–5** above (subscription + revenue/rating floor, limit ~25 each).
2. `get_app_detail` on the top 3–6 weak-incumbent earners per niche to confirm the $10k×2–3 bar.
3. Promote survivors into `runs/<date>/opportunities.csv` + write teardowns for `build candidate`s.
4. Only then spend keyword credits on the single niche you're most serious about.

Expected spend: ~125 search rows + ~25 detail calls ≈ **150 credits** for a strong first pass.
