# Seed Watchlist — leads to validate, NOT findings

These are real, publicly known apps per priority category — **starting points to look up in
AppKittie**, not validated opportunities. **No revenue/download numbers appear here on
purpose.** Pull every figure live with `get_app_detail` before it enters a report. Treat this
as "where to point `search_apps` first," then let the data decide what survives the bar.

Where a niche's specific app names are uncertain, search terms are given instead of guesses.

---

### Health & Fitness (broad)
Use `search_apps` filtered to the Health & Fitness category + subscription, sorted by revenue.
Watch for single-purpose painkillers, not all-in-one platforms.

### Weight loss / calorie & fasting
Cal AI, Lose It!, MyFitnessPal, YAZIO, Fastic, Zero, Simple, Noom, Lifesum
*(AI calorie-photo logging and fasting timers are the hot, TikTok-driven sub-niches.)*

### Gym / lifting
Hevy, Strong, Fitbod, Boostcamp, JuggernautAI, Liftin', Gymshark (Liftoff)
*(Logger vs. AI-programming vs. follow-a-coach are distinct loops — classify which.)*

### Habit tracking
Finch, Habitica, Streaks, Way of Life, Done, Habit Tracker, HabitNow, TickTick (habits)
*(Finch's "care for a pet" framing is the retention outlier — study, don't blindly copy.)*

### Screen time / dopamine detox
Opal, one sec, Clearspace, ScreenZen, Brick, Jomo, Roots
*(Friction-before-app-open is the core loop; paywalls gate strictness/stats.)*

### Journaling / brain dump
Day One, Stoic, Reflectly, How We Feel, Rosebud, Mindsera, Stoic., Finch (journaling)
*(Relevant to Spillway — note what they do badly on the "don't reopen the lid" axis.)*

### Prayer / faith
Hallow, Pray.com, Glorify, Abide, YouVersion Bible, Pause
*(Hallow is the whale; look for under-served denominations/languages as wedges.)*

### Relationship / no-contact tracking
Search terms: "no contact", "breakup recovery", "stop texting ex", "relationship counter",
"sobriety-style streak" + relationship. Validate which named apps actually clear the bar —
don't assume; this niche has churny novelty apps mixed with real painkillers.

### Sleep / snoring
SnoreLab, ShutEye, Pillow, Sleep Cycle, Rise, BetterSleep, Sleep Monitor
*(Snore-recording has a strong "show me the proof" UGC hook; sounds/white-noise is crowded.)*

### Self-improvement
Fabulous, I Am (affirmations), Motivation, Stoic, Finch, Mimo (adjacent), Headway (summaries)
*(Affirmations + daily-content cadence are easy loops with strong paywall leverage.)*

### Productivity
Structured, Routinery, Sunsama, Akiflow, Saner.ai, Tiimo, Llama Life
*(ADHD-focused time-boxing is a sharp, under-served painkiller sub-niche.)*

---

**How to use:** run `search_apps` per category (subscription + revenue/rating floor, low limit),
cross-reference these names, shortlist the weak-incumbent + strong-demand ones, then
`get_app_detail` only on the shortlist. Anything not confirmed by a tool call stays out of the report.
