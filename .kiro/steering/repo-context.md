---
inclusion: always
---

# INDUS FOUNDRY VENTURES

> **AGENT INSTRUCTION**: Skip browser testing. Rely strictly on this map. Avoid view_file on files already listed.

```mermaid
graph TD
    src/db/schema.ts(Turso SQLite Schema)
    src/app/actions[Server Actions]
    src/app/api/auth[NextAuth v4]
    
    src/app/actions -->|user.ts| auth
    src/app/actions -->|jobs.ts| jobs
    src/app/actions -->|company.ts| companies
    src/app/actions -->|posts.ts| posts
    
    src/app(Next.js 15 App Router) --> src/app/feed/page.tsx(Feed)
    src/app --> src/app/jobs/page.tsx(Jobs)
    src/app --> src/app/company/[slug]/page.tsx(Company)
    src/app --> src/app/profile/page.tsx(Profile)
```

## Critical Token-Saving Rules
1. **NO BROWSER TESTING**: Never run the browser subagent.
2. **NO FILE EXPLORING**: Do not run list_dir, grep_search, or view_file unless strictly required to edit a specific line.
3. **NO DEV SERVER**: Use `npm run build` only if validation is explicitly requested.
4. **ICONS**: `lucide-react` -> Use `X` instead of `Twitter` and `Link2` instead of `Linkedin`.
5. **DB**: Use `src/db/schema.ts` for schema context. Always run `npm run db:push` for changes.
6. **AUTH**: Check `src/app/actions/user.ts` `checkUserStatus()` for auth fallbacks.
