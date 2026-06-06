---
inclusion: always
---

# INDUS FOUNDRY VENTURES — AI Agent Repo Context
> Read this FIRST. Never re-explore the repo. All facts are here. Skip browser testing always.

---

## Stack
| Layer | Tech |
|---|---|
| Framework | Next.js 15.5 App Router, Turbopack |
| Language | TypeScript 5 strict |
| Styling | Tailwind CSS v4 (`@import "tailwindcss"` — no config file) |
| Database | Turso (libSQL/SQLite edge) via Drizzle ORM |
| Auth | NextAuth v4 (Google provider) |
| Icons | lucide-react v1.17 — **NO `Twitter`/`Linkedin`** → use `X` and `Link2` |
| Animation | framer-motion v12 |
| Deploy | Cloudflare Pages via `@opennextjs/cloudflare` |

---

## CLOUDFLARE DEPLOYMENT — CRITICAL
- Build cmd: `npm run build:cloudflare` → output: `.open-next`
- Runtime: `workerd` with `nodejs_compat` (wrangler.toml)
- **`src/db/index.ts` MUST use `@libsql/client/web` and `drizzle-orm/libsql/web`** — the bare Node.js variants crash workerd
- `next.config.ts` uses `serverExternalPackages: ["@libsql/client", "@libsql/client/web"]`
- `open-next.config.ts` MUST set `cloudflare: { useWorkerdCondition: false }` — without this, esbuild tries to resolve `@libsql/isomorphic-ws ./web.mjs` via the `workerd` export condition which doesn't exist on disk → build fails
- KV namespace `SEARCH_CACHE` bound in wrangler.toml `[[kv_namespaces]]` — get ID from Cloudflare dashboard → KV, also bind in Pages → Settings → Functions → KV namespace bindings
- Env vars set as Cloudflare Pages secrets (not in wrangler.toml): `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`

---

## File structure
```
src/
  app/
    actions/
      company.ts   — createCompanyPage, getCompanyPageBySlug, getMyCompanyPage, getAllCompanyPages
      freelance.ts — getFreelanceProjects, createFreelanceProject
      jobs.ts      — createJobPosting, getAllJobs, getJobById, applyForJob, getMyApplications
      mvps.ts      — MVP actions
      myposts.ts   — user's own posts
      posts.ts     — getPosts, createPost
      profile.ts   — profile CRUD
      user.ts      — checkUserStatus, saveUserOnboarding, updateUserRole
    api/auth/[...nextauth]/route.ts  — NextAuth handler + authOptions
    challenges/page.tsx
    company/
      page.tsx          — company directory (search + filters + grid cards)
      create/page.tsx   — 3-step wizard to create company page
      [slug]/page.tsx   — public company profile (About + Jobs tabs)
    data.ts             — static seed data (legacy jobs/challenges)
    feed/page.tsx       — 3-col layout: profile card+stats LEFT | posts CENTER | modules nav RIGHT
    freelance/page.tsx
    funding/page.tsx
    globals.css         — CSS vars, bg-grid-pattern, glass-panel, animate-pulse-glow
    gov/page.tsx
    Header.tsx          — sticky header, dropdown menus, mobile menu, NextAuth session
    investors/companies/page.tsx
    investors/individuals/page.tsx
    jobs/page.tsx       — LinkedIn split-panel, real DB jobs, Easy Apply, Post Job modal
    layout.tsx          — root: NextAuthProvider, OnboardingOverlay, Header, main
    login/page.tsx
    mvps/page.tsx
    myposts/page.tsx + MyPostsManager.tsx
    page.tsx            — landing/home page
    partnerships/page.tsx
    profile/page.tsx
    teams/page.tsx
  components/
    EasyApplyModal.tsx    — 3-field apply modal (resumeUrl, phone, coverNote 280ch)
    FeedPostCard.tsx      — feed post card
    NextAuthProvider.tsx  — wraps SessionProvider
    OnboardingOverlay.tsx — first-login role picker
    PostComposerModal.tsx — create feed post modal
    PostJobModal.tsx      — 2-step post a job modal
  db/
    index.ts    — drizzle client using @libsql/client/web + drizzle-orm/libsql/web
    schema.ts   — all table definitions
  middleware.ts — NextAuth route protection
```

---

## Database schema (Turso/SQLite)

### `users` — `id`(PK), `email`(unique), `name`, `role`(legacy "None"), `avatar_url`, timestamps
### `profiles` — `id`(PK=userId), `user_id`, `phone`, `country`, `location`, social URLs, `roles_json`(JSON[]), `employment_status`, timestamps
### `posts` — `id`, `user_id`, `user_name`, `user_role`, `user_avatar`, `title`, `content`, `category`, `images_json`, show_contact_* booleans, timestamps
### `mvps` — `id`, user fields, `title`, `tagline`, `category`, `reason`, `asking_price`, `revenue`, `users`, `github_repo`, `tech_stack`, `product_description`, verified flags, `screenshot`, timestamps
### `freelance_projects` — `id`, user fields, `title`, `client`, `budget`, `budget_type`, `duration`, `primary_industry`, `secondary_industries`(JSON), `skills`(csv), `description`, timestamps
### `company_pages` — `id`, `owner_id`, `slug`(unique), `name`, `tagline`, `about`, `industry`, `company_size`, `founded`, `headquarters`, `website`, `linkedin_url`, `twitter_url`, `logo_url`, `banner_url`, `specialties_json`(JSON), `stage`, `is_verified`, `followers_count`, timestamps — indexes: slug, owner_id, industry
### `job_postings` — `id`, `company_page_id`(nullable), `posted_by_user_id`, `company_name`, `company_logo`, `company_slug`, `title`, `department`, `employment_type`, `location_type`, `location`, `salary_min/max`, `salary_currency`, `salary_period`, `experience_level`, `industry`, `skills_json`, `description`, `requirements_json`, `benefits_json`, `application_deadline`, `is_open`, `is_featured`, `views_count`, `applications_count`, timestamps — indexes: company, poster, industry, is_open, type
### `job_applications` — `id`, `job_id`, `applicant_user_id`, `resume_url`, `phone`, `cover_note`, `status`(Applied/Viewed/Shortlisted/Rejected/Hired), timestamps — unique(job_id+applicant_user_id)

---

## Key UI patterns

**CSS vars:** `--background: #080b11` · `--primary: #00a86b` · `--accent: #2563eb`
**Panel:** `bg-[#1d2226] border border-[#38434f] rounded-xl`
**Hover:** `hover:border-emerald-500/30 transition-all`
**Badge:** `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px] font-black border border-emerald-500/20 uppercase tracking-widest`
**Orbs:** `absolute rounded-full bg-[#00a86b]/4 blur-[140px] pointer-events-none animate-pulse-glow`
**Images:** always add `onError={(e) => (e.currentTarget.style.display = "none")}`

---

## Build & DB commands
```bash
npm run build            # verify Next.js build locally (21 pages)
npm run build:cloudflare # full Cloudflare Pages build via OpenNext
npm run db:push          # apply schema changes to Turso (use this, not migrate)
npm run db:generate      # generate SQL migration file
npm run db:studio        # Drizzle Studio UI
```

---

## Critical rules
1. **No `Twitter`/`Linkedin` icons** — use `X` and `Link2` from lucide-react
2. **No browser/e2e tests** — just `npm run build` to verify
3. **DB changes**: edit `src/db/schema.ts` → `npm run db:push`
4. **Server actions**: `"use server"` at top, auth via `getServerSession(authOptions)`
5. **IDs**: `` `prefix_${Math.random().toString(36).substring(2, 11)}` ``
6. **JSON fields**: `JSON.stringify()` on write, parse with `|| "[]"` fallback on read
7. **Tailwind v4**: no config file — custom classes go in `globals.css`
8. **Cloudflare**: NEVER use `@libsql/client` bare import — always `@libsql/client/web`

---

## Token-saving rules
- DO NOT list directories or read files already documented here
- DO NOT run the dev server
- DO NOT write tests unless explicitly asked
- DO NOT re-read schema.ts unless adding a new table
- PREFER reading only the specific file being changed
- ALWAYS check this doc before any file read
