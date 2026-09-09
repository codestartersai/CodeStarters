# 🧬 NEO — THE COMPLETE MASTER PLAN (v3)

### *"One idea in. A full company out. Every task, its own agent."*

---

---

---

## 1. WHAT IS NEO?

Neo is an autonomous AI system that takes a **single sentence idea** from a human and builds an **entire tech/AI startup** — the product, the brand, the landing page, a cinematic launch video, and daily social media marketing — all without human intervention (unless you choose to intervene).

The core innovation is **how** it does this: not one AI doing everything, not one orchestrator dispatching sub-tasks, but a **swarm of 30+ specialized AI agents**, each responsible for exactly **one task**, all communicating in a **real-time Slack-style chatroom** with a corporate hierarchy enforcing order.

You open Neo in your browser. You type *"Build me a SaaS that helps freelancers track invoices."* Then you sit back and watch a living company assemble itself — agents chatting, debating, building, designing, posting — all in real-time.

When it's done, you have:

- A **deployed, working product** at a real URL
- A **brand identity** (name, logo, colors, typography)
- A **landing page** with the product embedded
- A **cinematic launch video** built with Remotion motion graphics
- **Daily TikTok/Instagram/YouTube content** already posting and self-optimizing
- **Revenue tracking** with conversion analytics feeding back into marketing

---

---

---

## 2. THE CORE PRINCIPLE — ONE AGENT, ONE TASK

This is the rule that defines Neo and separates it from every other AI agent project.

**Every single task gets its own dedicated agent.** No agent multi-tasks. No agent "does marketing." One agent writes a TikTok hook. A different agent generates the slideshow images. A different agent posts it. A different agent tracks the analytics. A different agent iterates the strategy based on what worked.

This mirrors how a real company works. No single employee does everything. A company is dozens of specialists who communicate, hand off work, check each other's output, and escalate problems up the chain.

Neo doesn't simulate a company. **Neo IS a company.** Every employee is an AI agent.

---

---

---

## 3. THE FOUR AI MODELS — WHO DOES WHAT AND WHY

Neo has access to exactly four AI models. Each is assigned to specific roles based on its strengths. This section is the single source of truth for all model assignments.

### 3.1 Claude Opus 4.6 → **ALL CODING (Backend, Infrastructure, Systems, Video Engineering)**

Opus is the most powerful reasoning model available. It excels at sustaining long, complex workflows. In Neo, Opus handles **every line of code that isn't UI** — backend logic, database schemas, system architecture, DevOps, authentication, the Remotion video codebase, and all other engineering work. It also serves as the **CEO agent**, holding the entire company vision and making all strategic decisions.

**Assigned to:**

- 👑 CEO (strategy, vision, all final decisions)
- 🏗 Architect (system design, tech stack, ERD)
- 🗄 Database (schema, migrations, Supabase setup)
- ⚙️ Backend (API routes, server logic, business logic)
- 🔑 Auth (authentication, OAuth, session management)
- 🚀 DevOps (CI/CD, deployment, infrastructure)
- 🏗 Remotion Builder (all Remotion/React video code)
- ✨ Transition Agent (custom transition code for videos)
- 📝 Docs (README, API docs, onboarding guides)
- ⚖️ Legal Boilerplate (Terms of Service, Privacy Policy)

### 3.2 Gemini 3 Pro → **ALL UI, ALL DESIGN, ALL MARKETING & CONTENT**

Gemini 3 Pro has the broadest input/output modality support — text, images, audio, video, PDFs — making it the ideal model for anything visual, creative, or user-facing. In Neo, Gemini handles **every pixel the user sees** — the product's frontend UI, the landing page, all brand design, all marketing content, all social media, and all video creative direction. It's also the most cost-efficient for high-volume output, critical for daily TikTok content at scale.

**Assigned to:**

- 🖥 Frontend (React/Next.js components, pages, layouts, all UI code)
- 🎨 Logo (logo generation)
- 🌈 Color Palette (brand colors, typography)
- 📄 Landing Page Design (landing page layout, sections, hero)
- 📱 Social Template (social media visual templates)
- 🖌 UI/UX (product interface design, user flows, wireframes)
- 📣 CMO (marketing strategy leadership)
- 🔍 Market Research (competitor analysis via Larry)
- 🧠 Strategy (content strategy via Larry)
- ✍️ Hook Writer (TikTok hooks via Larry)
- 🎨 Slideshow (AI image generation via Larry)
- 📤 Posting (Postiz posting via Larry)
- 🎵 Audio — Larry (trending sound flagging)
- 📊 Analytics (daily performance reports via Larry)
- 🔄 Iteration (strategy optimization via Larry)
- ✏️ Brand Naming (company/product name generation)
- 📝 Copywriting (landing page copy, email copy)
- 🔎 SEO (keyword research, meta tags)
- 📰 Blog Writer (content marketing blog posts)
- 📧 Email Marketing (drip campaigns, waitlist emails)
- 🚀 Product Hunt (launch page drafts)
- 🐦 Twitter Thread (launch threads, engagement tweets)
- 🐦 Twitter Posting (posting via Twitter API)
- 🎬 Director (video treatment, scene breakdown)
- ✍️ Script — Video (on-screen text for launch video)
- 🎨 Visual Design (visual direction for launch video)
- 🔊 Audio — Video (background music selection/placement)
- 💲 Pricing (pricing model research)
- 📈 Financial Model (revenue projections)
- 💰 CFO (finance leadership)

### 3.3 GPT 5.4 → **REVIEW AGENT (Code Review, QA, Quality Gates)**

GPT 5.4 serves a singular, critical purpose in Neo: **it reviews everything.** Every piece of code Opus writes gets reviewed by GPT 5.4 before it ships. Every UI component Gemini builds gets reviewed by GPT 5.4 before it merges. Every video gets QA tested by GPT 5.4 before it renders. GPT 5.4 is the gatekeeper — the quality control layer that ensures nothing ships broken, buggy, or subpar. It doesn't build. It judges.

**Assigned to:**

- 🧪 QA (tests all product code, files bugs, blocks bad deploys)
- 🧪 QA — Video (runs the 6 video quality tests before render)
- 👁 Code Review Agent (reviews all PRs/code from Opus and Gemini before merge)
- 🔍 Brand Scraper (scrapes brand data with Firecrawl — a review/extraction task, not creative)
- 🚀 Render Agent (final render pipeline — validates before export)

### 3.4 gpt-5-nano (via OpenAI API) → **IN-APP AI FEATURES**

If the product Neo builds has **AI features built into it** (e.g., "AI-powered invoice generation," "smart categorization," "AI assistant"), those features use the **OpenAI API with the `gpt-5-nano` model**. This is the model running inside the deployed product itself — what end users interact with. It's cheap, fast, and good enough for production AI features in a hackathon context. The API key is wired into the product's environment variables during deployment.

**Assigned to:** The deployed product's AI features (not an agent — a runtime dependency)

**Configuration:**

```env
# In the deployed product's .env
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5-nano
```

```typescript
// In the product's codebase (written by Backend Agent / Opus)
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await openai.chat.completions.create({
  model: "gpt-5-nano",
  messages: [{ role: "user", content: userPrompt }],
});
```

---

### MODEL ASSIGNMENT SUMMARY TABLE


| Model               | Role in Neo                                 | What It Touches                                                                                                          |
| ------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Claude Opus 4.6** | CEO + All backend/systems coding            | Strategy, architecture, database, backend, auth, devops, remotion code, transitions, docs, legal                         |
| **Gemini 3 Pro**    | All UI + All design + All marketing/content | Frontend, UI/UX, brand, landing page, all Larry agents, all video creative, all social media, all copy, pricing, finance |
| **GPT 5.4**         | Review agent + QA + Quality gates           | Code review, product QA, video QA, brand scraping, render validation                                                     |
| **gpt-5-nano**      | In-app AI features (runtime)                | AI features inside the deployed product that end users interact with                                                     |


---

---

---

## 4. THE AGENT ROSTER — ALL 30+ AGENTS

Every agent listed below is a **separate OpenClaw instance** with its own model connection, its own context/memory, and its own installed skills. They communicate through the shared chatroom.

### 4.1 LEVEL 1 — THE CEO


| Agent      | Task                                                                                                                                                                                                                                      | Model               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **👑 CEO** | Receives the user's idea. Sets the company vision. Creates the master plan. Delegates to C-level agents. Resolves all conflicts. Issues final approvals on major decisions (company name, pricing, launch timing). Broadcasts milestones. | **Claude Opus 4.6** |


The CEO is the only Level 1 agent. It can address any agent at any level directly. No agent can override the CEO. The CEO is the final decision-maker on everything.

### 4.2 LEVEL 2 — THE C-SUITE


| Agent      | Task                                                                                                                                                                                                                                                                                                       | Model               |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **🔧 CTO** | Owns the entire product. Decides tech stack. Writes the technical spec. Delegates to engineering agents. Reviews architecture. Approves deployments. NOTE: The CTO is a **strategic/coordination** role — Opus handles this because it requires long-context reasoning about the full system, not UI work. | **Claude Opus 4.6** |
| **📣 CMO** | Owns all marketing and brand. Runs the Larry skill pipeline. Runs the Video Generator pipeline. Delegates to marketing/design agents. Approves all content before posting.                                                                                                                                 | **Gemini 3 Pro**    |
| **💰 CFO** | Owns finance and operations. Sets pricing strategy. Builds financial projections. Handles legal boilerplate.                                                                                                                                                                                               | **Gemini 3 Pro**    |


C-level agents can **direct** their reports (Level 3 agents under them) but can only **request** from each other. If the CTO and CMO disagree on priority, the CEO arbitrates.

### 4.3 LEVEL 3 — ENGINEERING AGENTS (Report to CTO)


| Agent              | One Task                                                                                                                                                                                  | Model               | Rationale                          |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------- |
| **🏗 Architect**   | Designs system architecture. Picks tech stack. Creates ERD. Produces the architecture document.                                                                                           | **Claude Opus 4.6** | Systems design = complex reasoning |
| **🗄 Database**    | Designs schema. Writes migrations. Sets up Supabase tables, RLS, relationships.                                                                                                           | **Claude Opus 4.6** | Database code, not UI              |
| **🖥 Frontend**    | Builds the user interface. React/Next.js components, pages, layouts, client-side state, CSS, all visual code.                                                                             | **Gemini 3 Pro**    | Everything the user sees = Gemini  |
| **⚙️ Backend**     | Builds API routes and server-side logic. Business logic, data validation, server actions. Wires `gpt-5-nano` for any in-app AI features.                                                  | **Claude Opus 4.6** | Server code = Opus                 |
| **🔑 Auth**        | Implements authentication. Supabase Auth, OAuth providers, session management, protected routes.                                                                                          | **Claude Opus 4.6** | Auth logic = Opus                  |
| **🚀 DevOps**      | Sets up CI/CD. Deploys to Vercel or Railway. Configures env vars, domains, preview deployments. Wires the `OPENAI_API_KEY` and `OPENAI_MODEL=gpt-5-nano` into the production environment. | **Claude Opus 4.6** | Infrastructure = Opus              |
| **🧪 QA**          | Writes and runs tests. Reports bugs. Blocks deployment until all tests pass. Does NOT write product code — only test code and reviews.                                                    | **GPT 5.4**         | Review/gatekeeper role             |
| **👁 Code Review** | Reviews ALL code from ALL engineering agents (Opus and Gemini) before it merges. Checks for bugs, security issues, performance problems, code quality. Can request changes or approve.    | **GPT 5.4**         | Review/gatekeeper role             |
| **📝 Docs**        | Writes README, API documentation, onboarding guides.                                                                                                                                      | **Claude Opus 4.6** | Technical writing = Opus           |


### 4.4 LEVEL 3 — MARKETING AGENTS: LARRY PIPELINE (Report to CMO)

These agents run the **Larry skill**. Each agent owns one phase of the Larry Loop. All are Gemini — this is content and creative work.


| Agent                  | One Task (Larry Phase)                                                                                                                                             | Model            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| **🔍 Market Research** | Uses Larry's browser-based competitor research to scan TikTok for competing accounts, viral hooks, content gaps, audience insights.                                | **Gemini 3 Pro** |
| **🧠 Strategy**        | Takes competitor data + app profile and builds content strategy: hook templates, posting schedule, content categories, cross-posting plan.                         | **Gemini 3 Pro** |
| **✍️ Hook Writer**     | Writes viral hooks and captions following Larry's 500+ line ruleset. Follows [person] + [conflict] → reveal formula.                                               | **Gemini 3 Pro** |
| **🎨 Slideshow**       | Generates 6 portrait AI images (1024×1536) per post using gpt-image API. Consistent scenes. Text overlays. ~$0.50/slideshow.                                       | **Gemini 3 Pro** |
| **📤 Posting**         | Posts completed slideshows to TikTok as drafts via Postiz API. Cross-posts to IG Reels, YT Shorts, Threads.                                                        | **Gemini 3 Pro** |
| **🎵 Audio (Larry)**   | Flags TikTok drafts needing trending sounds. DMs the user when a draft is ready for manual audio addition.                                                         | **Gemini 3 Pro** |
| **📊 Analytics**       | Runs daily analytics cron. Pulls Postiz data (views, likes, comments, shares) + RevenueCat data (downloads, trials, paid subs, MRR, churn). Produces daily report. | **Gemini 3 Pro** |
| **🔄 Iteration**       | Takes Analytics reports, updates strategy. Retires dead hooks. Promotes converting patterns. Updates ruleset. Generates new hook batches. The self-improving loop. | **Gemini 3 Pro** |


### 4.5 LEVEL 3 — MARKETING AGENTS: VIDEO GENERATOR PIPELINE (Report to CMO)

These agents run the **Video Generator skill**. Each agent owns one phase of the Remotion video production pipeline.


| Agent                   | One Task                                                                                                                                                                                              | Model               | Rationale                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------------------------------------- |
| **🔍 Brand Scraper**    | Runs `firecrawl.sh` on deployed product URL. Extracts brand data: name, tagline, colors, logo, screenshots. Downloads assets to `public/images/brand/`.                                               | **GPT 5.4**         | Data extraction/validation task — review model |
| **🎬 Director**         | Writes director's treatment: vibe, emotional arc, camera style. Full scene-by-scene breakdown with durations and transition types.                                                                    | **Gemini 3 Pro**    | Creative direction = Gemini                    |
| **✍️ Script (Video)**   | Writes all on-screen text for every scene. Short, punchy, scannable. No full sentences.                                                                                                               | **Gemini 3 Pro**    | Creative copywriting = Gemini                  |
| **🎨 Visual Design**    | Defines visual direction using Firecrawl brand data as primary palette. Typography, animation style, layout approach.                                                                                 | **Gemini 3 Pro**    | Visual/design = Gemini                         |
| **🏗 Remotion Builder** | Scaffolds the Remotion project. Writes ALL React/Remotion code — Root.tsx, main video component, all scene components, all reusable components. Implements Sequences, interpolate, spring animations. | **Claude Opus 4.6** | Remotion code = complex engineering = Opus     |
| **✨ Transition**        | Codes all custom transitions — morph/scale, clip-path reveals, zoom-throughs, 3D perspective flips. Spring physics only. Overlapping Sequences.                                                       | **Claude Opus 4.6** | Transition code = complex engineering = Opus   |
| **🔊 Audio (Video)**    | Sources royalty-free background music. Places `<Audio>` components with volume and beat-sync timing.                                                                                                  | **Gemini 3 Pro**    | Creative selection = Gemini                    |
| **🧪 QA (Video)**       | Runs the 6 quality tests: mute test, squint test, timing test, consistency test, slideshow test, loop test. Must pass ALL 6 before render.                                                            | **GPT 5.4**         | Review/gatekeeper = GPT 5.4                    |
| **🚀 Render**           | Starts Remotion Studio (`npm run dev`), exposes via Cloudflare tunnel, sends preview URL. After approval + QA pass, runs `npx remotion render` → final MP4. Distributes to all channels.              | **GPT 5.4**         | Validation + render pipeline = review model    |


### 4.6 LEVEL 3 — DESIGN AGENTS (Report to CMO)

All design work is Gemini. Every pixel = Gemini.


| Agent                      | One Task                                                                                                                                                | Model            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **🎨 Logo**                | Generates the company logo using brand direction from Color Palette agent.                                                                              | **Gemini 3 Pro** |
| **🌈 Color Palette**       | Picks brand colors and typography. Defines the complete brand color system used by all agents.                                                          | **Gemini 3 Pro** |
| **📄 Landing Page Design** | Designs the landing page — layout, sections, hero area (where launch video embeds), features grid, CTA placement. Then BUILDS the frontend code for it. | **Gemini 3 Pro** |
| **📱 Social Template**     | Creates reusable visual templates for IG posts, TikTok covers, Twitter headers.                                                                         | **Gemini 3 Pro** |
| **🖌 UI/UX**               | Designs the product's user interface — user flows, component layouts, interaction patterns. Hands off to Frontend agent.                                | **Gemini 3 Pro** |


### 4.7 LEVEL 3 — GENERAL MARKETING AGENTS (Report to CMO)


| Agent                  | One Task                                                                                                         | Model            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------- |
| **✏️ Brand Naming**    | Generates company/product name options. Checks domain + social availability. Recommends to CMO for CEO approval. | **Gemini 3 Pro** |
| **📝 Copywriting**     | Writes all marketing copy — landing page headlines, CTAs, email subject lines, PH descriptions.                  | **Gemini 3 Pro** |
| **🔎 SEO**             | Keyword research, meta tags, page titles, blog topic outlines.                                                   | **Gemini 3 Pro** |
| **📰 Blog Writer**     | Writes full blog posts. SEO-optimized per SEO agent's research.                                                  | **Gemini 3 Pro** |
| **📧 Email Marketing** | Writes drip campaigns, waitlist emails, launch announcements.                                                    | **Gemini 3 Pro** |
| **🚀 Product Hunt**    | Drafts PH launch page — tagline, description, first comment, maker story. Attaches launch video.                 | **Gemini 3 Pro** |
| **🐦 Twitter Thread**  | Writes launch threads and engagement tweets.                                                                     | **Gemini 3 Pro** |
| **🐦 Twitter Posting** | Posts and schedules tweets via Twitter API.                                                                      | **Gemini 3 Pro** |


### 4.8 LEVEL 3 — FINANCE AGENTS (Report to CFO)


| Agent                    | One Task                                                                                                                                                                                             | Model               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| **💲 Pricing**           | Researches competitor pricing. Models freemium vs paid tiers. Recommends pricing structure. NOTE: No Stripe integration is built — pricing is a **documented feature and plan**, not wired payments. | **Gemini 3 Pro**    |
| **📈 Financial Model**   | Builds 12-month revenue projections, cost estimates, break-even analysis.                                                                                                                            | **Gemini 3 Pro**    |
| **⚖️ Legal Boilerplate** | Generates Terms of Service, Privacy Policy, compliance docs.                                                                                                                                         | **Claude Opus 4.6** |


---

---

---

## 5. PAYMENTS — HACKATHON SCOPE

**Stripe integration is NOT built for the hackathon.** No payment processing, no webhook handling, no subscription enforcement.

Instead:

- The **Pricing Agent** (Gemini) researches competitors and defines pricing tiers (e.g., Free / Pro $12/mo / Team $29/mo)
- The **Landing Page** displays the pricing table as a visual feature
- The **Frontend** shows a "pricing page" in the product with tier cards and a "Coming Soon" or "Upgrade" button that doesn't process payment
- The **Product Hunt** launch copy mentions pricing
- The **Financial Model Agent** projects revenue based on the pricing tiers

**Payments exist as a designed, documented, visible feature** — the brand has a pricing strategy, the UI shows it, the financial model is built around it — but no actual Stripe code runs. This is explicitly a future feature, clearly scoped out for the hackathon.

The **Payments Agent from the previous plan is REMOVED.** No 💳 Payments agent exists. The Auth agent does NOT handle billing. The Backend agent does NOT wire Stripe.

---

---

---

## 6. THE HIERARCHY — ORDER IN SOCIETY

### 6.1 THE FOUR LEVELS

```
LEVEL 0  ── You (the human founder — above everyone)
LEVEL 1  ── CEO Agent (full authority over all agents)
LEVEL 2  ── C-Suite (CTO, CMO, CFO — department heads)
LEVEL 3  ── Specialist Agents (all 25+ task-specific agents)
```

### 6.2 COMMUNICATION RULES


| Rule                               | Description                                                                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **⬇️ Downward = Directives**       | Higher-level agents issue tasks to agents below them. CEO can direct anyone.                                                   |
| **⬆️ Upward = Reports & Blockers** | Lower-level agents report status upward. Escalate blockers to their manager.                                                   |
| **↔️ Sideways = Requests**         | Same-level agents can request from each other but cannot command.                                                              |
| **🚫 Skip-Level = Forbidden**      | Level 3 agents cannot message the CEO directly — must go through their Level 2 manager.                                        |
| **🚨 Conflict Escalation**         | Two Level 3 agents disagree → Level 2 resolves. Two Level 2 agents disagree → CEO resolves.                                    |
| **🤝 Handoffs = Explicit**         | When one agent finishes, it explicitly hands off to the next agent with full context and files.                                |
| **👁 Code Review = Mandatory**     | ALL code from Opus (backend) and Gemini (frontend) passes through the GPT 5.4 Code Review Agent before merging. No exceptions. |
| **👤 You = God Mode**              | You can message any agent at any level at any time, override any decision, intervene however you want. Or do nothing.          |


### 6.3 THE REVIEW GATE

This is new and critical. GPT 5.4 acts as an **independent quality gate** across the entire company:

```
    Opus writes backend code ──→ GPT 5.4 Code Review ──→ Approved? ──→ Merge
    Gemini writes frontend code ──→ GPT 5.4 Code Review ──→ Approved? ──→ Merge
    Opus writes Remotion code ──→ GPT 5.4 QA (Video) ──→ Approved? ──→ Render
    All agents ship product ──→ GPT 5.4 QA ──→ All tests pass? ──→ Deploy
```

GPT 5.4 **never writes product code**. It only writes tests, reviews, and quality reports. This separation ensures accountability — the builder and the reviewer are always different models with different perspectives.

### 6.4 MESSAGE PROTOCOL

Every message between agents follows a structured format:

```json
{
  "from": "backend-agent",
  "to": "code-review-agent",
  "cc": ["cto-agent"],
  "level": 3,
  "type": "review-request",
  "content": "API routes for invoice CRUD complete. Requesting review before merge.",
  "attachments": ["src/app/api/invoices/route.ts"],
  "status": "awaiting-review"
}
```


| Field           | Purpose                                                                                                    |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| **from**        | Which agent sent it                                                                                        |
| **to**          | Who it's addressed to                                                                                      |
| **cc**          | Who should see it but doesn't need to act                                                                  |
| **level**       | Sender's hierarchy level (0–3)                                                                             |
| **type**        | `directive`, `request`, `status`, `blocker`, `handoff`, `approval`, `review-request`, `review-result`      |
| **content**     | The message text                                                                                           |
| **attachments** | Files being shared                                                                                         |
| **status**      | `active`, `awaiting-review`, `awaiting-downstream`, `blocked`, `approved`, `changes-requested`, `complete` |


---

---

---

## 7. THE WEB UI — SLACK, BUT EVERY EMPLOYEE IS AN AI

### 7.1 WHAT IT IS

When you open Neo in your browser, you see a full **Slack-style workspace**. Left sidebar with channels. Center panel with the active chat. Right panel with threads. Bottom status bar with real-time metrics.

### 7.2 LAYOUT

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  🧬 NEO — Involy Workspace                                    [👤 You] [⚙] │
├─────────────┬────────────────────────────────────────┬───────────────────────┤
│             │                                        │                       │
│  CHANNELS   │          #general                      │   🧵 THREAD           │
│             │                                        │                       │
│ ▼ Company   │  👑 CEO (Opus)     12:01 PM            │   RE: API Review      │
│  #general   │  New mission. Building an invoice      │                       │
│  #announcements│  SaaS. CTO — scope MVP.            │   👁 Code Review      │
│  #standup   │  CMO — competitive research.           │      (GPT 5.4) 12:18  │
│  #blockers  │  CFO — pricing model.                  │   3 issues found:     │
│             │                                        │   1. Missing input     │
│ ▼ Engineerng│  🔧 CTO (Opus)    12:02 PM            │      validation on    │
│  #architecture│  @Architect — system design.         │      invoice amount   │
│  #frontend  │  @Database — schema after arch done.   │   2. No rate limiting │
│  #backend   │                                        │      on API routes    │
│  #database  │  📣 CMO (Gemini)  12:02 PM             │   3. SQL injection    │
│  #devops    │  Running competitor analysis.           │      risk in search   │
│  #qa        │  @Market-Research pull top 5.           │                       │
│  #code-review│                                       │   ⚙️ Backend (Opus)   │
│  #bugs      │  💰 CFO (Gemini)  12:03 PM             │      12:20 PM         │
│             │  @Pricing — model freemium vs flat.     │   All 3 fixed. Re-   │
│ ▼ Marketing │                                        │   requesting review.  │
│  #marketing-larry│                                   │                       │
│  #larry-hooks│  👁 Code Review (GPT 5.4) 12:18 PM   │   👁 Code Review      │
│  #larry-analytics│  Review of Backend API routes:    │      (GPT 5.4) 12:22  │
│  #launch-video│  ❌ 3 ISSUES FOUND                   │   ✅ All issues        │
│  #video-preview│  Sending back with changes needed.  │   resolved. APPROVED. │
│             │  See thread →                          │                       │
│ ▼ Design    │                                        │                       │
│  #brand     │  🧪 QA (GPT 5.4)  12:25 PM            │                       │
│  #ui-ux     │  Running test suite on approved code.  │                       │
│  #assets    │  14/14 tests passing. ✅                │                       │
│             │  Clear for deploy.                     │                       │
│ ▼ Finance   │                                        │                       │
│  #pricing   │                                        │                       │
│  #legal     │                                        │                       │
│             │                                        │                       │
│ ▼ DMs       │                                        │                       │
│  👑↔🔧     │                                        │                       │
│  📣↔🎬     │                                        │                       │
│  👤↔👑     │                                        │                       │
│             │ ┌────────────────────────────────────┐ │                       │
│             │ │ 💬 Message #general          [Send] │ │                       │
│             │ └────────────────────────────────────┘ │                       │
├─────────────┴────────────────────────────────────────┴───────────────────────┤
│ 🟢 32 agents │ 📊 Phase 2/5 │ ⏱ 14m 22s │ 💬 247 msgs │ 🐛 0 bugs │ 👁 3 reviews │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 ALL CHANNELS

#### 🏢 Company-Wide Channels


| Channel            | What Happens Here                                                                  | Who's In         |
| ------------------ | ---------------------------------------------------------------------------------- | ---------------- |
| **#general**       | Main boardroom. CEO announcements. Major decisions. Cross-department coordination. | ALL agents + You |
| **#announcements** | CEO-only broadcast. Milestones, approvals, pivots. Read-only for non-CEO.          | CEO → All        |
| **#standup**       | Every agent posts status at regular intervals.                                     | ALL agents       |
| **#blockers**      | Blocker escalation. Relevant manager MUST respond.                                 | ALL agents       |


#### 🔧 Engineering Channels


| Channel           | What Happens Here                                                 | Who's In                                                     |
| ----------------- | ----------------------------------------------------------------- | ------------------------------------------------------------ |
| **#architecture** | System design, tech stack, ERD reviews.                           | CTO (Opus), Architect (Opus)                                 |
| **#frontend**     | UI components, pages, layouts, CSS, client-side.                  | CTO (Opus), Frontend (Gemini), UI/UX (Gemini)                |
| **#backend**      | API routes, server logic, business logic, gpt-5-nano integration. | CTO (Opus), Backend (Opus), Auth (Opus)                      |
| **#database**     | Schema, migrations, Supabase setup, RLS.                          | CTO (Opus), Database (Opus)                                  |
| **#devops**       | Deployments, CI/CD, env vars, domain config.                      | CTO (Opus), DevOps (Opus)                                    |
| **#qa**           | Test results, coverage, deploy sign-offs.                         | QA (GPT 5.4), CTO (Opus)                                     |
| **#code-review**  | ALL code review requests and results. Every PR goes through here. | Code Review (GPT 5.4), ALL engineering agents                |
| **#bugs**         | Bug reports from QA. Fixes from engineers. Re-test cycles.        | QA (GPT 5.4), Frontend (Gemini), Backend (Opus), Auth (Opus) |


#### 📣 Marketing Channels — Larry Pipeline


| Channel               | What Happens Here                                        | Who's In                            |
| --------------------- | -------------------------------------------------------- | ----------------------------------- |
| **#marketing-larry**  | Main marketing war room. Larry Loop coordination.        | CMO + ALL Larry agents (all Gemini) |
| **#larry-hooks**      | Hook drafts, A/B testing, approval.                      | Hook Writer, Strategy, CMO          |
| **#larry-slideshows** | Image gen progress, visual QA, overlays.                 | Slideshow, CMO                      |
| **#larry-posting**    | Postiz drafts, scheduling, cross-platform confirmations. | Posting, Audio (Larry), CMO         |
| **#larry-analytics**  | Daily reports, views vs conversions, revenue.            | Analytics, Iteration, CMO           |
| **#larry-iterations** | Strategy updates, rule changes, hook retirements.        | Iteration, Strategy, CMO            |


#### 🎬 Marketing Channels — Video Generator Pipeline


| Channel            | What Happens Here                                       | Who's In                                                                            |
| ------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| **#launch-video**  | Hero video coordination. End-to-end pipeline.           | CMO (Gemini) + ALL Video agents                                                     |
| **#video-scenes**  | Scene discussion, treatment, scripts, visual direction. | Director (Gemini), Script (Gemini), Visual Design (Gemini), Remotion Builder (Opus) |
| **#video-preview** | Tunnel preview links, CEO feedback, QA results.         | Render (GPT 5.4), QA Video (GPT 5.4), CEO (Opus), CMO (Gemini)                      |


#### 🎨 Design Channels


| Channel     | What Happens Here                                 | Who's In                                            |
| ----------- | ------------------------------------------------- | --------------------------------------------------- |
| **#brand**  | Logo, colors, typography, brand guidelines.       | CMO (Gemini), Logo (Gemini), Color Palette (Gemini) |
| **#ui-ux**  | Product interface design, wireframes, user flows. | CTO (Opus), UI/UX (Gemini), Frontend (Gemini)       |
| **#assets** | Central asset library — all generated files.      | ALL design agents (Gemini)                          |


#### 💰 Finance Channels


| Channel          | What Happens Here                                  | Who's In                               |
| ---------------- | -------------------------------------------------- | -------------------------------------- |
| **#pricing**     | Pricing model (NO Stripe — documented tiers only). | CFO (Gemini), Pricing (Gemini)         |
| **#projections** | Revenue forecasts, cost models, break-even.        | CFO (Gemini), Financial Model (Gemini) |
| **#legal**       | ToS, Privacy Policy, compliance.                   | CFO (Gemini), Legal (Opus)             |


#### 📨 General Marketing


| Channel           | What Happens Here                               | Who's In                                  |
| ----------------- | ----------------------------------------------- | ----------------------------------------- |
| **#strategy**     | High-level marketing plan, positioning.         | CMO, Market Research                      |
| **#content**      | Blog posts, email campaigns, landing page copy. | CMO, Copywriting, Blog Writer, SEO, Email |
| **#twitter**      | Launch threads, tweets.                         | CMO, Twitter Thread, Twitter Posting      |
| **#product-hunt** | PH launch page draft.                           | CMO, Product Hunt                         |


### 7.4 DMs

Any two agents can have private 1-on-1 conversations. Key DM patterns:


| DM                                               | Why It's Private                                 |
| ------------------------------------------------ | ------------------------------------------------ |
| **👑 CEO (Opus) ↔ 🔧 CTO (Opus)**                | Strategic gut checks before public announcements |
| **📣 CMO (Gemini) ↔ ✍️ Hook Writer (Gemini)**    | Creative direction without channel noise         |
| **🔧 CTO (Opus) ↔ 👁 Code Review (GPT 5.4)**     | "Is this bug critical or can we ship?"           |
| **👁 Code Review (GPT 5.4) ↔ ⚙️ Backend (Opus)** | Detailed code feedback too long for channel      |
| **👤 You ↔ 👑 CEO (Opus)**                       | You pivot the company. CEO cascades.             |
| **👤 You ↔ ANY agent**                           | Direct intervention. God mode.                   |


### 7.5 THREADS

Any message can become a thread. Code reviews happen almost entirely in threads — the Code Review agent posts a summary in #code-review, and the detailed back-and-forth with the engineer happens in the thread.

### 7.6 SPECIAL UI FEATURES


| Feature                       | Description                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ |
| **🔴 Live Typing Indicators** | *"👁 Code Review (GPT 5.4) is reviewing..."* — multiple agents typing simultaneously across channels   |
| **📎 Inline File Previews**   | Code with syntax highlighting, images, SVGs, markdown, videos, clickable links                         |
| **🔔 Notifications**          | Pings when: @mentioned, milestone hit, blocker escalated, review needs your approval                   |
| **🔍 Full-Text Search**       | Search all channels, DMs, threads, files                                                               |
| **📌 Pinned Messages**        | CEO pins key decisions. Company name, tech stack, live URL, pricing model                              |
| **👁 Agent Profiles**         | Click avatar → model used, role, reports-to, status, current task, messages sent, review stats         |
| **🔊 Optional Sounds**        | Message pop, deployment chime, milestone fanfare. Toggleable.                                          |
| **🏷 Model Badges**           | Every message shows a small badge: `Opus` `Gemini` `GPT 5.4` so you always know which model is talking |


### 7.7 ALTERNATE VIEWS


| View                | What It Shows                                                                                                                        |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **💬 Chat**         | Full Slack-style workspace (default)                                                                                                 |
| **🗺 Org Chart**    | Visual hierarchy with live message flow + model badges on each node                                                                  |
| **📁 Files**        | All generated files — code, images, docs, videos                                                                                     |
| **📊 Timeline**     | Gantt-style showing phases, what's complete, what's blocked                                                                          |
| **👁 Review Board** | NEW: Shows all pending code reviews, their status (pending/approved/changes-requested), and which model wrote vs reviewed each piece |


### 7.8 VISUAL IDENTITY


| Element           | Design                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Theme**         | Dark mode. Neon green (#00FF41) accents — Matrix vibes.                                                                |
| **Agent Avatars** | Unique emoji + colored ring: 🟦 Engineering, 🟥 Marketing, 🟨 Design, 🟩 Finance, 👑 Gold = CEO, 🟣 Purple = Review/QA |
| **Model Badges**  | Small pill next to agent name: `Opus` = deep blue, `Gemini` = teal, `GPT 5.4` = purple                                 |
| **Review Status** | Code messages show a badge: 🔵 Pending Review → 🟡 Changes Requested → 🟢 Approved                                     |


---

---

---

## 8. THE TWO OPENCLAW SKILLS

### 8.1 THE LARRY SKILL — DAILY VOLUME MARKETING

**What it is:** Larry is an OpenClaw skill that automates TikTok slideshow marketing — competitor research, AI image generation, text overlays, posting via Postiz, cross-platform distribution, analytics, and iterative optimization.

**What it produces:** Daily TikTok slideshows (6 AI-generated portrait images with text overlays), auto cross-posted to Instagram Reels, YouTube Shorts, Threads.

**Why it matters:** The self-improving feedback loop. Postiz tracks views. RevenueCat tracks paying users. The Iteration Agent distinguishes viral-but-useless from modest-but-converting — and optimizes for revenue.

**Cost:** ~$0.50/slideshow ($0.25 batch)

**Installation:** `npx playbooks add skill openclaw/skills --skill larry`

**Required keys:** OpenAI API key (images), Postiz API key (posting), RevenueCat (conversions)

**All agents:** Gemini 3 Pro (8 agents)

### 8.2 THE VIDEO GENERATOR SKILL — CINEMATIC LAUNCH VIDEO

**What it is:** An OpenClaw skill that creates professional motion graphics videos using Remotion (React-based programmatic video). Polished, cinematic — not slideshows.

**What it produces:** One hero launch video (~30s, 9:16 or 16:9). Goes on landing page hero, TikTok (pinned), Instagram (pinned), Twitter launch thread, Product Hunt.

**Why it matters:** Larry = volume. Video Generator = quality. Every startup needs one stunning hero asset.

**The full pipeline:**


| Step | Agent            | Model           | What Happens                                                                                           |
| ---- | ---------------- | --------------- | ------------------------------------------------------------------------------------------------------ |
| 1    | Brand Scraper    | GPT 5.4         | Runs `firecrawl.sh` on live product URL → extracts brand data, colors, logo, screenshots               |
| 2    | Director         | Gemini 3 Pro    | Writes treatment — vibe, emotional arc, scene-by-scene breakdown with durations and transitions        |
| 3    | Script (Video)   | Gemini 3 Pro    | Writes all on-screen text — short, punchy, scannable                                                   |
| 4    | Visual Design    | Gemini 3 Pro    | Defines color palette from Firecrawl data, typography, animation style                                 |
| 5    | Remotion Builder | Claude Opus 4.6 | Scaffolds Remotion project, writes ALL React/Remotion code (scenes, sequences, components, animations) |
| 6    | Transition Agent | Claude Opus 4.6 | Codes custom transitions — morph, clip-path, zoom, 3D flips (spring physics, never linear)             |
| 7    | Audio (Video)    | Gemini 3 Pro    | Places royalty-free background music, syncs beats to transitions                                       |
| 8    | Remotion Builder | Claude Opus 4.6 | Starts Remotion Studio on port 3000                                                                    |
| 9    | Render Agent     | GPT 5.4         | Exposes via Cloudflare tunnel → sends preview URL to chatroom                                          |
| 10   | CEO              | Claude Opus 4.6 | Reviews in browser, gives feedback, Builder hot-reloads                                                |
| 11   | QA (Video)       | GPT 5.4         | Runs 6 quality tests (mute, squint, timing, consistency, slideshow, loop)                              |
| 12   | Render Agent     | GPT 5.4         | `npx remotion render` → final MP4 → distributes everywhere                                             |


**Video quality rules:**

- AVOID: Fade to black, centered text on solid bg, same transition repeated, linear motion, emoji icons
- PURSUE: Overlapping transitions, layered compositions, spring physics, varied timing, Lucide React icons only

### 8.3 HOW THE TWO SKILLS WORK TOGETHER


|                  | Larry                                                | Video Generator                                     |
| ---------------- | ---------------------------------------------------- | --------------------------------------------------- |
| **Frequency**    | Daily forever                                        | Once (or major updates)                             |
| **Purpose**      | Algorithmic reach, volume                            | First impression, brand anchor                      |
| **Output**       | TikTok slideshow drafts                              | MP4 rendered video                                  |
| **Models**       | Gemini (creative)                                    | Gemini (creative) + Opus (code) + GPT 5.4 (QA)      |
| **Distribution** | Postiz → TikTok, IG, YT, Threads                     | Landing page, TikTok pinned, IG pinned, Twitter, PH |
| **Shared**       | Both use Firecrawl brand data for visual consistency |                                                     |


---

---

---

## 9. THE PLATFORM — BUILT ON OPENCLAW

### 9.1 WHAT IS OPENCLAW?

OpenClaw is an open-source personal AI assistant that runs on any OS, any platform. Every agent in Neo is an OpenClaw instance.

### 9.2 HOW NEO USES OPENCLAW


| OpenClaw Feature        | How Neo Uses It                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| **Gateway**             | Chatroom backbone. Every agent connects as a node. Routes messages, feeds the web UI via websockets. |
| **Skills**              | Each agent's capability is a skill. Larry agents have `larry`. Video agents have `video-generator`.  |
| **Symphony**            | CTO uses Symphony to manage engineering — each agent gets isolated implementation runs.              |
| **Lobster Pipelines**   | Agent handoffs as composable pipelines: `firecrawl → director → script → remotion-build → render`    |
| **Multi-Model Routing** | Each agent routes to its model: Opus, Gemini, GPT 5.4 via cloud APIs.                                |
| **Compaction**          | Agents summarize their own context periodically. Critical for CEO holding full company state.        |
| **Studio Dashboard**    | Foundation for Neo's Slack-style UI. Handles gateway connections and real-time streaming.            |


---

---

---

## 10. THE FIVE PHASES — FROM IDEA TO LIVE STARTUP

### Phase 1: STRATEGY (Minutes 0–5)


| What Happens                                  | Key Agents                         | Models |
| --------------------------------------------- | ---------------------------------- | ------ |
| You type your idea into #general              | **CEO**                            | Opus   |
| CEO sets vision, target audience, master plan | **CEO**                            | Opus   |
| CMO kicks off competitor research             | **CMO → Market Research**          | Gemini |
| Brand Naming generates name options           | **Brand Naming**                   | Gemini |
| CFO starts pricing + financial model          | **CFO → Pricing, Financial Model** | Gemini |
| CEO approves company name                     | **CEO**                            | Opus   |


**Output:** Company name, target audience, competitive analysis, pricing tiers (no Stripe), master plan.

### Phase 2: BUILDING (Minutes 5–30)


| What Happens                                                                          | Key Agents      | Models                                              |
| ------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------- |
| Architect designs system + ERD                                                        | **Architect**   | Opus                                                |
| Database builds schema in Supabase                                                    | **Database**    | Opus                                                |
| Backend builds API routes + server logic                                              | **Backend**     | Opus                                                |
| Backend wires `gpt-5-nano` for any in-app AI features                                 | **Backend**     | Opus (writes code that calls gpt-5-nano at runtime) |
| Frontend builds entire UI                                                             | **Frontend**    | Gemini                                              |
| Auth implements Supabase Auth + OAuth                                                 | **Auth**        | Opus                                                |
| **Code Review reviews ALL code before merge**                                         | **Code Review** | **GPT 5.4**                                         |
| QA writes + runs tests                                                                | **QA**          | GPT 5.4                                             |
| DevOps deploys to Vercel, wires `OPENAI_API_KEY` + `OPENAI_MODEL=gpt-5-nano` into env | **DevOps**      | Opus                                                |
| Docs writes README                                                                    | **Docs**        | Opus                                                |


**Output:** Deployed, working product at a real URL. If it has AI features, they use gpt-5-nano.

### Phase 3: BRAND & DESIGN (Minutes 10–25, parallel with Phase 2)


| What Happens                                | Key Agents              | Models |
| ------------------------------------------- | ----------------------- | ------ |
| Color Palette defines brand system          | **Color Palette**       | Gemini |
| Logo generates the logo                     | **Logo**                | Gemini |
| UI/UX designs product interface             | **UI/UX**               | Gemini |
| Landing Page Design builds the landing page | **Landing Page Design** | Gemini |
| Social Template creates social assets       | **Social Template**     | Gemini |


**Output:** Complete brand kit, landing page, social templates. All Gemini.

### Phase 4: LAUNCH VIDEO + MARKETING (Minutes 20–45)


| What Happens                                        | Key Agents           | Models  |
| --------------------------------------------------- | -------------------- | ------- |
| Brand Scraper runs Firecrawl on live URL            | **Brand Scraper**    | GPT 5.4 |
| Director writes treatment + scene breakdown         | **Director**         | Gemini  |
| Script writes on-screen text                        | **Script (Video)**   | Gemini  |
| Visual Design defines direction from brand data     | **Visual Design**    | Gemini  |
| Remotion Builder codes entire video                 | **Remotion Builder** | Opus    |
| Transition Agent codes custom transitions           | **Transition**       | Opus    |
| Audio selects + places music                        | **Audio (Video)**    | Gemini  |
| Render Agent exposes preview via tunnel             | **Render**           | GPT 5.4 |
| CEO reviews, gives feedback                         | **CEO**              | Opus    |
| QA (Video) runs 6 quality tests                     | **QA (Video)**       | GPT 5.4 |
| Render Agent exports final MP4                      | **Render**           | GPT 5.4 |
| SIMULTANEOUSLY: Larry pipeline starts daily content | **All Larry agents** | Gemini  |


**Output:** Cinematic MP4 launch video. Daily TikTok slideshows posting.

### Phase 5: LIVE & OPTIMIZING (Continuous)


| What Happens                               | Key Agents      | Models  |
| ------------------------------------------ | --------------- | ------- |
| Analytics tracks daily views + conversions | **Analytics**   | Gemini  |
| Iteration updates strategy based on data   | **Iteration**   | Gemini  |
| Hook Writer generates improved hooks daily | **Hook Writer** | Gemini  |
| QA monitors for production bugs            | **QA**          | GPT 5.4 |
| CEO issues weekly board meeting summaries  | **CEO**         | Opus    |


**Output:** Self-improving daily marketing. Compounding performance.

---

---

---

## 11. FULL TECH STACK


| Layer                                   | Technology                                                 |
| --------------------------------------- | ---------------------------------------------------------- |
| **Agent Framework**                     | OpenClaw (gateway + skills + Symphony + Lobster)           |
| **Agent Communication**                 | OpenClaw Gateway + hierarchy middleware + websockets to UI |
| **Web UI**                              | Slack-style interface on OpenClaw Studio                   |
| **CEO + All Backend/Systems Code**      | Claude Opus 4.6 (Anthropic API)                            |
| **All UI + All Design + All Marketing** | Gemini 3 Pro (Google API)                                  |
| **All Reviews + All QA**                | GPT 5.4 (OpenAI API)                                       |
| **In-App AI Features**                  | gpt-5-nano (OpenAI API, wired into deployed product)       |
| **Marketing Skill (Volume)**            | Larry (OpenClaw skill)                                     |
| **Marketing Skill (Hero Video)**        | Video Generator (OpenClaw skill + Remotion)                |
| **Social Posting**                      | Postiz API (TikTok + 20 cross-post platforms)              |
| **Video Engine**                        | Remotion (React programmatic video)                        |
| **Video Preview**                       | Remotion Studio + Cloudflare Tunnels                       |
| **Brand Scraping**                      | Firecrawl API                                              |
| **Image Generation**                    | gpt-image API (via Larry)                                  |
| **Conversion Tracking**                 | RevenueCat                                                 |
| **Product Deployment**                  | Vercel or Railway                                          |
| **Database**                            | Supabase (Postgres + Auth + RLS)                           |
| **Payments**                            | ❌ NOT BUILT — pricing tiers documented/displayed only      |
| **Icons**                               | Lucide React (never emoji)                                 |


---

---

---

## 12. MODEL FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                        THE NEO MODEL MAP                         │
│                                                                  │
│                    ┌─────────────────────┐                       │
│                    │   CLAUDE OPUS 4.6   │                       │
│                    │   "The Brain"       │                       │
│                    │                     │                       │
│                    │   CEO               │                       │
│                    │   CTO               │                       │
│                    │   Architect         │                       │
│                    │   Database          │                       │
│                    │   Backend           │                       │
│                    │   Auth              │                       │
│                    │   DevOps            │                       │
│                    │   Remotion Builder  │                       │
│                    │   Transition Agent  │                       │
│                    │   Docs              │                       │
│                    │   Legal             │                       │
│                    └────────┬────────────┘                       │
│                             │ code                               │
│                             ▼                                    │
│                    ┌─────────────────────┐                       │
│                    │     GPT 5.4         │                       │
│                    │   "The Judge"       │                       │
│                    │                     │                       │
│                    │   Code Review ──────┤◄── reviews ALL code   │
│                    │   QA ──────────────┤◄── tests ALL code     │
│                    │   QA (Video) ──────┤◄── tests video        │
│                    │   Brand Scraper ───┤◄── validates data     │
│                    │   Render Agent ────┤◄── validates render   │
│                    └─────────────────────┘                       │
│                                                                  │
│                    ┌─────────────────────┐                       │
│                    │   GEMINI 3 PRO      │                       │
│                    │   "The Creator"     │                       │
│                    │                     │                       │
│                    │   Frontend (ALL UI) │                       │
│                    │   CMO, CFO          │                       │
│                    │   ALL Design agents │                       │
│                    │   ALL Larry agents  │                       │
│                    │   ALL Marketing     │                       │
│                    │   Director          │                       │
│                    │   Script (Video)    │                       │
│                    │   Visual Design     │                       │
│                    │   Audio (Video)     │                       │
│                    │   Pricing           │                       │
│                    │   Financial Model   │                       │
│                    └─────────────────────┘                       │
│                                                                  │
│                    ┌─────────────────────┐                       │
│                    │    gpt-5-nano       │                       │
│                    │   "The Product AI"  │                       │
│                    │                     │                       │
│                    │   Lives INSIDE the  │                       │
│                    │   deployed product  │                       │
│                    │   Powers AI features│                       │
│                    │   for end users     │                       │
│                    │   (NOT an agent)    │                       │
│                    └─────────────────────┘                       │
│                                                                  │
│   FLOW:                                                          │
│   Opus writes code ──→ GPT 5.4 reviews ──→ Approved? ──→ Ships  │
│   Gemini writes UI ──→ GPT 5.4 reviews ──→ Approved? ──→ Ships  │
│   Opus writes video code ──→ GPT 5.4 QAs ──→ Passed? ──→ Render │
│   Product uses gpt-5-nano at runtime for AI features             │
└──────────────────────────────────────────────────────────────────┘
```

---

---

---

## 13. THE HACKATHON DEMO (7 MINUTES)


| Time     | What You Show                   | What Judges See                                                                                                                                                                                                    |
| -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **0:00** | Pitch                           | "This is Neo. Type one sentence. Get a fully launched, self-marketing startup."                                                                                                                                    |
| **0:30** | Type the idea into #general     | *"Build me an AI-powered SaaS that helps freelancers track invoices"*                                                                                                                                              |
| **0:45** | Show chatroom lighting up       | CEO (Opus) delegates. Channels activate. Model badges visible — Opus, Gemini, GPT 5.4 all working.                                                                                                                 |
| **1:30** | Show #backend                   | Backend agent (Opus) building API routes. Wiring gpt-5-nano for AI invoice generation.                                                                                                                             |
| **2:00** | Show #code-review               | **GPT 5.4 Code Review Agent** catches 3 bugs in Opus's backend code. Sends back with changes. Opus fixes. Re-reviews. Approved. ✅                                                                                  |
| **2:30** | Show #frontend                  | Frontend agent (Gemini) building beautiful React UI simultaneously.                                                                                                                                                |
| **3:00** | Show #marketing-larry           | Larry agents (all Gemini) already researching competitors, writing hooks, generating slideshows.                                                                                                                   |
| **3:30** | Show #launch-video              | Brand Scraper (GPT 5.4) runs Firecrawl. Director (Gemini) writes scenes. Remotion Builder (Opus) codes the video.                                                                                                  |
| **4:00** | Click the live Vercel URL       | **Product works.** Type an invoice description → gpt-5-nano generates a professional invoice. Live AI feature.                                                                                                     |
| **4:30** | Click the Cloudflare tunnel URL | **Remotion preview plays.** Real motion graphics — spring animations, custom transitions, brand colors from Firecrawl.                                                                                             |
| **5:00** | Show CEO feedback loop          | CEO posts feedback in #video-preview. Opus Builder hot-reloads. GPT 5.4 QA runs 6 tests. All pass.                                                                                                                 |
| **5:30** | Show the TikTok draft           | Larry posted a real slideshow. Show the cross-posted Instagram Reel.                                                                                                                                               |
| **6:00** | Show the landing page           | Product embedded. Launch video hero. Pricing table (displayed, no Stripe). Brand-matched.                                                                                                                          |
| **6:15** | Show the Review Board view      | All code reviews visualized — Opus wrote it, Gemini designed it, GPT 5.4 judged it. Every piece accountable.                                                                                                       |
| **6:30** | Close                           | "30+ agents. 4 models. Each one with a clear role: Opus builds, Gemini designs, GPT 5.4 judges, gpt-5-nano powers the product. The Larry Loop makes it better every day. This company didn't exist 7 minutes ago." |


---

---

---

## 14. THE ONE-LINER

> **Neo: You type one sentence. Claude Opus builds the backend and codes the launch video, Gemini designs every pixel and runs daily marketing, GPT 5.4 reviews every line of code and QAs everything before it ships, and gpt-5-nano powers the AI features your users actually touch — 30+ agents, a Slack-style chatroom, two OpenClaw skills, one fully launched startup.**

