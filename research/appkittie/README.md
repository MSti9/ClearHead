# AppKittie Opportunity Research

A repeatable workflow for finding **validated** iOS app opportunities — categories where
real apps already make money — then tearing down their onboarding, paywall, loop, marketing,
and weaknesses so you can build a differentiated version with better taste, UX, copy, and
distribution.

> Strategy in one line: don't chase original ideas, chase **weak incumbents in proven,
> painkiller niches** and out-execute them.

This workflow lives at `research/appkittie/` inside the ClearHead repo and is otherwise
self-contained — run the commands below from this folder (`cd research/appkittie`). The only
external dependency is an AppKittie account.

---

## 1. Best technical setup (recommended: official MCP)

AppKittie ships an **official MCP server**, so Claude Code can query live data directly —
no scraping, no browser automation, no ToS gymnastics. This is the supported, preferred path.

| Property | Value |
|---|---|
| Endpoint | `https://mcp.appkittie.com` |
| Transport | Streamable HTTP (Cloudflare) |
| Auth | `Authorization: Bearer <API_KEY>` |
| API key | Create at https://appkittie.com/settings/api-keys (**shown once** — store it now) |
| Plan | Requires a paid AppKittie plan (Pro ~$49/mo at time of writing) |
| Skills repo | https://github.com/appkittie/aso-mcp-skills |

### Connect it (pick one)

**Option A — register via the CLI (recommended; user-scoped, works in every project):**

```bash
export APPKITTIE_API_KEY="ak_live_xxx"   # put in your shell profile, NOT in git
./scripts/setup-mcp.sh
claude mcp list   # verify "appkittie" shows ✓ connected
```

**Option B — project-scoped config.**
A ready-to-use example lives at `mcp.config.json`. Note that Claude Code only auto-loads a
`.mcp.json` placed at the **ClearHead repo root**, not in this subfolder — and since this is
the product repo, that root config is deliberately left out of git so AppKittie never loads
repo-wide by default. Use Option A unless you specifically want it bound to ClearHead; if you
do, copy the example to the repo root yourself:

```bash
cp research/appkittie/mcp.config.json .mcp.json   # from ClearHead root; gitignored, opt-in
export APPKITTIE_API_KEY="ak_live_xxx"
claude                                            # offers to enable the "appkittie" server
```

> The API key is **never** committed. Configs only contain the `${APPKITTIE_API_KEY}`
> placeholder, expanded from your shell environment at launch.

### Tools the MCP exposes (and what they cost)

| Tool | Returns | Credit cost |
|---|---|---|
| `search_apps` | Filter App Store / Play apps, 30+ params | **1 credit per returned row** |
| `get_app_detail` | Metadata, revenue, ads, IAPs, creators, contacts, history | **1 credit per call** |
| `get_keyword_difficulty` | One keyword: popularity, difficulty, traffic, top apps | **10 credits per call** |
| `batch_keyword_difficulty` | Up to 10 keywords ranked by opportunity | **10 credits per keyword** |
| `get_supported_countries` | Valid storefront codes | free |

### Credit discipline (this is also how you respect rate limits)

Credits are real money and the prompt is told to stay inside a budget. The cheap path:

1. **Cast wide, cheap:** one `search_apps` per priority category with tight filters
   (subscription apps, min revenue, min rating count). Cap `limit` low (20–30 rows).
2. **Go deep only on the shortlist:** `get_app_detail` only on the 3–6 apps per category
   that survive the first cut. This is where revenue/ads/IAP truth lives.
3. **Keyword tools last and rarely:** 10 credits each — only on a finalist niche you'd
   seriously build in, not for browsing.

Never loop `get_app_detail` over a whole search result. Shortlist first.

---

## 2. Fallback: safe logged-in browser use (when MCP can't answer)

Use this **only** for things the MCP doesn't expose (e.g. eyeballing ad creatives,
screenshots, or store listings) — and do it **manually in your own logged-in browser**.

- Log into your own AppKittie / App Store account in a normal browser session.
- Read what your plan already grants you. Do **not** automate clicks to multiply quota,
  rotate accounts, defeat pagination caps, or pull data your plan doesn't include.
- Don't scrape behind paywalls or rate limits; don't share/borrow keys.
- Paste findings into the run's `notes` fields by hand.

If a question needs data you can't get within permitted use, record it as "unverified"
rather than working around the control.

---

## 3. Run the workflow

```bash
./scripts/new-run.sh          # scaffold a dated output folder from the templates
```

Then in Claude Code:

> Read `prompts/research-prompt.md` and run the AppKittie opportunity research workflow.
> Write results into the latest folder under `runs/`.

The prompt drives the whole pass: discovery → shortlist → teardown → scoring → final report.

---

## 4. What you get (outputs)

Each run writes into `runs/<date>/`:

- `opportunities.csv` — one row per app, all scored fields (sort/filter in a spreadsheet)
- `final-report.md` — ranked table + top-5 build candidates + easiest MVPs + best UGC plays
  + best paywall plays + a concrete next step
- `<app-name>-teardown.md` (optional) — long-form teardown per finalist

## 5. Repo layout

```
.
├── README.md                       ← you are here
├── mcp.config.json                 ← example project MCP config (copy to .mcp.json to use)
├── seed-watchlist.md               ← starter apps per category to VALIDATE (no numbers yet)
├── prompts/
│   └── research-prompt.md          ← the reusable research prompt (the engine)
├── templates/
│   ├── opportunities.csv           ← CSV schema (header row)
│   ├── opportunity-teardown.md     ← per-app long-form teardown template
│   └── final-report.md             ← final ranked report template
├── scripts/
│   ├── setup-mcp.sh                ← register the MCP server from $APPKITTIE_API_KEY
│   └── new-run.sh                  ← scaffold a dated run folder from templates
└── runs/                           ← generated outputs (created on first run)
```

---

## Guardrails baked into this workflow

- **No fabricated numbers.** Every revenue/download figure is an AppKittie estimate and is
  labeled as such. If the data isn't there, the field says `unverified`, never a guess.
- **No blind cloning.** Output always includes "what NOT to copy" and a differentiation angle.
- **Painkillers over novelty.** Scoring favors validated, simple-loop, subscription apps with
  weak incumbents — exactly where better taste/UX/copy/distribution wins.
- **Respect the platform.** MCP-first; permitted logged-in use only; stay inside credit budget.
