# AZ-204 Prep

> Interactive exam-prep platform for the **Microsoft Azure Developer Associate (AZ-204)** certification.
> Practice 100+ hand-written questions across all five exam domains, take timed mock exams, review with flashcards, and track your readiness with analytics — all in a modern, fully responsive web app.

![Stack](https://img.shields.io/badge/Next.js-15-black) ![React](https://img.shields.io/badge/React-18-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6) ![Prisma](https://img.shields.io/badge/Prisma-5-2d3748) ![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Architecture Overview](#architecture-overview)
- [Usage Flows](#usage-flows)
- [API Reference](#api-reference)
- [Adding or Editing Questions](#adding-or-editing-questions)
- [Database](#database)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

- **114+ curated AZ-204 questions** covering every exam domain (Compute, Storage, Security, Monitor, Connect), with detailed per-option rationales and Microsoft Learn references.
- **Learning mode** — one question at a time with immediate feedback, hints, per-question notes, and bookmarking.
- **Exam simulator** — configurable length and duration, countdown timer, mark-for-review, side navigator, final score breakdown by domain, and full per-question review.
- **Flashcard mode** — 3D flip cards for spaced-recall practice.
- **Analytics dashboard** — readiness score, accuracy trends, coverage heatmaps, per-domain radar chart, per-difficulty bars.
- **Admin panel** — full CRUD for questions, including options, rationales, references, and tags.
- **Search & filter** — by domain, difficulty, free-text across prompt/topic/tags.
- **Dark / light theme** — auto-detects system preference, manually toggleable.
- **Fully responsive** — works on mobile, tablet, and desktop.
- **Local-first persistence** — SQLite file in `prisma/dev.db`; no external services required.

---

## Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| **Next.js 15** (App Router) | React framework, SSR, routing, API handlers |
| **React 18** + **TypeScript 5** | UI + type safety |
| **Tailwind CSS 3** + custom theme tokens | Styling |
| **Radix UI** (`@radix-ui/react-*`) | Accessible unstyled primitives (Dialog, Tabs, Select, etc.) |
| **shadcn-style components** | Pre-styled Radix wrappers (in `src/components/ui/`) |
| **Framer Motion** | Page / card animations |
| **Recharts** | Radar + bar charts for analytics |
| **Lucide React** | Icon set |
| **TanStack Query 5** | Client-side data fetching & cache |
| **Zustand 5** | Lightweight state (available; presently UI uses local + query state) |
| **next-themes** | Dark / light mode |

### Backend (same Next.js process)
| Library | Purpose |
|---|---|
| **Next.js Route Handlers** | HTTP API at `/api/*` |
| **Prisma 5** | Type-safe ORM, migrations, client generation |
| **SQLite** | Zero-config embedded database (`prisma/dev.db`) |

### Tooling
- **tsx** — execute TypeScript files (used by the seeder)
- **PostCSS + Autoprefixer** — CSS pipeline

---

## Prerequisites

| Requirement | Minimum | Tested |
|---|---|---|
| Node.js | 18.17 | 24.13.1 |
| npm | 9 | 11.8.0 |
| OS | Windows 10, macOS 12+, Linux | Windows 11 |
| Disk | ~400 MB for `node_modules` | — |

You do **not** need Docker, Postgres, Redis, or any cloud credentials to run this app locally.

---

## Quick Start

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd azure_developer_associate_az-204_14_may_2026

# 2. Install dependencies (also generates the Prisma client via postinstall)
npm install

# 3. Create the SQLite database schema
npx prisma db push

# 4. Seed the question bank (114 questions)
npm run db:seed

# 5. Start the dev server
npm run dev
```

Then open **<http://localhost:3000>** in your browser.

> **Windows / PowerShell users:** All commands above work as-is. If you see `'NODE_ENV' is not recognized` or similar errors, ensure you are running them from the project root and not from a sub-folder.

---

## Environment Variables

The only required variable is the database URL. It is set in `.env` at the repo root:

```ini
# .env
DATABASE_URL="file:./dev.db"
```

This points Prisma to a SQLite file at `prisma/dev.db` (relative to the schema). You generally won't need to change this.

> **Assumption:** This project does not yet have auth, external APIs, or AI integrations. When those are added, document any new vars in `.env.example` (placeholder, not yet committed) and reference them here.

If you later want to use a different database (e.g. PostgreSQL):

```ini
DATABASE_URL="postgresql://user:password@localhost:5432/az204prep"
```

…then change `provider = "sqlite"` to `provider = "postgresql"` in [prisma/schema.prisma](prisma/schema.prisma) and run `npx prisma migrate dev`.

---

## Available Scripts

All scripts are run with `npm run <name>`:

| Script | Purpose |
|---|---|
| `dev` | Start the Next.js dev server on port 3000 with hot reload |
| `build` | Production build |
| `start` | Run the production build (`next start`) — requires `build` first |
| `lint` | Run Next.js / ESLint checks |
| `db:generate` | Regenerate the Prisma client (auto-runs on `postinstall`) |
| `db:push` | Apply the Prisma schema to the SQLite DB without migrations |
| `db:seed` | Upsert all questions from `prisma/questions/*` |
| `db:reset` | Drop everything, re-create schema, re-seed |

Useful one-offs (not in `package.json`):

```bash
npx prisma studio       # Visual DB browser at http://localhost:5555
npx prisma migrate dev  # Create + apply a named migration (use when moving off SQLite)
```

---

## Project Structure

```
azure_developer_associate_az-204_14_may_2026/
├── prisma/
│   ├── schema.prisma            # DB models: Question, Option, ExamSession, Attempt, Bookmark, Note
│   ├── seed.ts                  # Idempotent upsert seeder (npm run db:seed)
│   ├── dev.db                   # SQLite file (gitignored)
│   └── questions/               # Hand-written question bank, split by domain
│       ├── types.ts             # SeedQuestion / SeedOption type definitions
│       ├── compute.ts           # Develop Azure compute solutions
│       ├── storage.ts           # Develop for Azure storage
│       ├── security.ts          # Implement Azure security
│       ├── monitor.ts           # Monitor, troubleshoot, and optimize
│       ├── connect.ts           # Connect to and consume Azure services
│       └── index.ts             # Aggregates and re-exports all questions
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── layout.tsx           # Root layout (Providers, Nav, global styles)
│   │   ├── globals.css          # Tailwind + theme tokens
│   │   ├── page.tsx             # / — Dashboard
│   │   ├── practice/page.tsx    # /practice — Learn mode
│   │   ├── exam/
│   │   │   ├── page.tsx         # /exam — Exam config
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # /exam/<id> — Exam runner
│   │   │       └── results/page.tsx
│   │   ├── flashcards/page.tsx
│   │   ├── bookmarks/page.tsx
│   │   ├── stats/page.tsx
│   │   ├── admin/page.tsx
│   │   └── api/                 # Backend HTTP handlers
│   │       ├── questions/route.ts
│   │       ├── questions/[id]/route.ts
│   │       ├── attempts/route.ts
│   │       ├── exam/route.ts
│   │       ├── exam/[id]/route.ts
│   │       ├── bookmarks/route.ts
│   │       ├── notes/route.ts
│   │       └── stats/route.ts
│   │
│   ├── components/
│   │   ├── nav.tsx              # Top navigation bar
│   │   ├── providers.tsx        # ThemeProvider + QueryClientProvider
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── question-card.tsx    # The core question UI (used in practice/exam/review)
│   │   └── ui/                  # shadcn-style primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── badge.tsx
│   │       ├── progress.tsx
│   │       ├── tabs.tsx
│   │       ├── select.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── switch.tsx
│   │
│   ├── lib/
│   │   ├── db.ts                # Prisma client singleton
│   │   ├── utils.ts             # cn(), shuffle(), arraysEqual(), formatters
│   │   └── domains.ts           # Domain constants, labels, color tokens
│   │
│   └── types/
│       └── index.ts             # Shared API + UI types
│
├── .env                         # DATABASE_URL (gitignored)
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Architecture Overview

This is a **monolithic Next.js application** — frontend and backend run in the **same process on the same port** (`http://localhost:3000`).

```
                  npm run dev
                       │
                       ▼
         ┌─────────────────────────────┐
         │      Next.js (Node.js)      │
         │        port 3000            │
         │                             │
         │  ┌───────────┐ ┌──────────┐ │
         │  │  Pages    │ │   API    │ │   ─Prisma─►  prisma/dev.db
         │  │ src/app/  │ │ src/app/ │ │
         │  │  page.tsx │ │  api/…   │ │
         │  └───────────┘ └──────────┘ │
         └──────────────┬──────────────┘
                        │
                        ▼
                    Browser
                 (relative fetch: /api/…)
```

Key points:
- **Pages** are React Server Components by default; pages marked `"use client"` (most of them) hydrate as a SPA after first load.
- **API routes** at `src/app/api/**/route.ts` are server-side handlers — they import Prisma and read/write SQLite.
- Frontend calls them via **relative fetches** (`fetch("/api/questions")`), so there's no CORS, no `API_BASE_URL`, no separate deployment.

---

## Usage Flows

### 1. First-time setup as a learner
1. Open <http://localhost:3000>
2. Click **Start practicing** → answer a few questions to build a baseline
3. Return to the dashboard — your readiness score and domain coverage now reflect your activity

### 2. Take a timed mock exam
1. Click **Exam** in the nav (or **Take a mock exam** on the dashboard)
2. Choose number of questions, duration, optional domain/difficulty filter
3. Click **Start exam** — the runner opens with a countdown
4. Navigate freely between questions, mark hard ones for review, submit when ready
5. The results page shows your score, per-domain breakdown, and lets you review every question with rationales

### 3. Spaced-recall study
1. Click **Flashcards**
2. Each card shows a prompt; click to flip and see the correct answer + explanation
3. Use **Reshuffle** for variety, filter by domain to focus on weak areas

### 4. Manage your question bank (admin)
1. Click **Admin** in the nav
2. **New question** opens a dialog with all fields (domain, topic, difficulty, type, prompt, options with rationales, explanation, reference URL, tags)
3. Click any row's trash icon to delete

---

## API Reference

All endpoints live under `/api/`. JSON request/response bodies. No auth (yet — see [Roadmap](#roadmap)).

### Questions

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/questions` | List questions. Query params: `domain`, `difficulty`, `q` (search), `limit`, `offset`, `include=answers` |
| `POST` | `/api/questions` | Create a question. Body: `{ domain, topic, difficulty, type, prompt, explanation, options[], reference?, tags?, code?, codeLanguage? }` |
| `GET` | `/api/questions/[id]` | Get one question with full details |
| `PATCH` | `/api/questions/[id]` | Update fields and/or replace options |
| `DELETE` | `/api/questions/[id]` | Delete |

**Note on `include=answers`:** by default the list endpoint omits per-option `isCorrect` flags and explanations (so exam mode can't cheat). Pass `include=answers` to receive them (used by practice, flashcards, admin, review).

### Attempts (grading)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/attempts` | Submit selected options for a question; returns `{ isCorrect, correctOptionIds, explanation, reference, optionRationales }`. Optional `sessionId`, `confidence`, `timeSpentMs`, `markedForReview`. |

### Exam sessions

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/exam` | Create a session. Body: `{ mode, count?, durationSec?, domain?, difficulty? }` → returns `{ sessionId, questionIds, durationSec, startedAt }` |
| `GET` | `/api/exam/[id]` | Fetch session + all questions (with answers) + recorded attempts |
| `PATCH` | `/api/exam/[id]` | Body `{ complete: true }` marks the session done and computes the score |

### Bookmarks & notes

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/bookmarks` | List bookmarked questions with their prompts |
| `POST` | `/api/bookmarks` | Toggle. Body: `{ questionId }` → `{ bookmarked: true \| false }` |
| `POST` | `/api/notes` | Upsert (empty body deletes). Body: `{ questionId, body }` |

### Stats

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/stats` | Aggregated stats: `totalQuestions`, `correctRate`, per-domain accuracy/coverage, per-difficulty, recent sessions, readiness score (0–100) |

### Example call

```bash
# Create a 5-question exam and grab the session ID
curl -X POST http://localhost:3000/api/exam \
  -H "Content-Type: application/json" \
  -d '{"mode":"exam","count":5,"durationSec":600}'
```

---

## Adding or Editing Questions

You can add questions in two ways:

### A. Via the Admin UI (recommended for one-offs)
Go to `/admin` → **New question**. Changes persist to `prisma/dev.db` immediately.

### B. Via seed files (recommended for bulk / version control)

1. Open the domain file under `prisma/questions/` (e.g. `compute.ts`).
2. Append a new entry that matches the `SeedQuestion` interface:

   ```ts
   {
     externalId: "compute-099",
     domain: "compute",
     topic: "App Service",
     difficulty: "medium",
     type: "single",                 // or "multi"
     prompt: "Your question text…",
     code: "optional code block",
     codeLanguage: "csharp",
     explanation: "Why the correct answer is right; concepts to learn…",
     reference: "https://learn.microsoft.com/…",
     tags: ["app-service", "slots"],
     options: [
       { text: "Option A", isCorrect: true,  rationale: "Why right" },
       { text: "Option B", isCorrect: false, rationale: "Why wrong" },
       // …
     ],
   }
   ```

3. Re-seed:
   ```bash
   npm run db:seed
   ```
   The seeder uses `externalId` as a stable key and **upserts** — running it multiple times is safe and idempotent. Existing user attempts, bookmarks, and notes are preserved.

---

## Database

- **Engine:** SQLite (file at `prisma/dev.db`).
- **ORM:** Prisma. Models defined in [prisma/schema.prisma](prisma/schema.prisma).
- **Inspect interactively:** `npx prisma studio` → opens <http://localhost:5555>.
- **Reset everything:** `npm run db:reset` — drops + recreates + reseeds.

### Models at a glance
- `Question` ←→ `Option` (one-to-many, ordered)
- `ExamSession` ←→ `Attempt` (one-to-many)
- `Attempt` → `Question`
- `Bookmark`, `Note` are 1:1 with `Question`

---

## Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| `Error: Cannot find module '@prisma/client'` | The `postinstall` hook didn't run. Fix: `npx prisma generate`. |
| `Environment variable not found: DATABASE_URL` | Missing `.env` file. Create one with `DATABASE_URL="file:./dev.db"`. |
| `EADDRINUSE: address already in use :::3000` | Port 3000 occupied. Stop the other process, or run `next dev -p 3001`. |
| Pages compile slowly on first hit | Normal for Next.js dev mode — each route compiles on demand. Subsequent loads are fast. |
| `npm install` fails on Windows with `EBUSY` / file-lock errors | Close VS Code / antivirus scans on the project folder, then retry. |
| Stats page is blank | You haven't answered any questions yet — submit a few in `/practice` first. |
| Question count looks low (`0` in admin) | Database not seeded yet. Run `npm run db:seed`. |
| Dark-mode flicker on first load | Expected with `next-themes` during hydration — wrapped in `suppressHydrationWarning`. |
| Want to start completely fresh | `npm run db:reset` |

---

## Contributing

Contributions are welcome — especially new questions, improved explanations, and bug fixes.

### Setup
1. Fork & clone the repo
2. Create a feature branch: `git checkout -b feat/<short-description>`
3. Follow the [Quick Start](#quick-start) to get the app running

### Adding questions
- One question per domain file, appended to the array
- Use a unique `externalId` (e.g., `compute-101`)
- Always include a `rationale` per option, an `explanation` for the question as a whole, and a `reference` to Microsoft Learn when possible
- Run `npm run db:seed` and verify in the UI before opening a PR
- The seeder warns about `type=single` questions with 0 or >1 correct options — heed those warnings

### Code style
- TypeScript strict mode is on; no `any` unless justified
- Prefer Tailwind utility classes over custom CSS
- For new UI primitives, use Radix UI + shadcn conventions consistent with `src/components/ui/`
- Run `npm run lint` before committing

### Pull requests
- Keep PRs focused — one feature or fix per PR
- Include a short description of what changed and why
- Screenshots welcome for UI changes

---

## Roadmap

Planned but not yet implemented:

- [ ] User accounts & multi-user analytics (currently single-user, local-only)
- [ ] AI tutor integration (Claude / OpenAI) — opt-in via user-supplied API key, exposed behind a `/api/explain` route
- [ ] Adaptive difficulty engine — surface questions in domains where accuracy is lowest
- [ ] Bulk import / export of questions as JSON
- [ ] PWA / offline support
- [ ] Postgres production config + `docker-compose.yml`
- [ ] CI pipeline (GitHub Actions: lint + typecheck + build)
- [ ] Authentication (Auth.js with email magic link)

---

## License

> **Assumption:** No license file is currently included. Until one is added, treat this code as **All Rights Reserved**.
>
> Recommended choice for an open-source educational project: **MIT License**. To adopt it, add a `LICENSE` file with the standard MIT template and update this section accordingly.

---

## Acknowledgements

- Microsoft Learn — official source for AZ-204 exam objectives and reference documentation linked from each question
- The Next.js, Prisma, Radix UI, and shadcn/ui teams for the foundation this app is built on
