# Year of Dates

## Overview

A warm, elegant web app for Seth and Elana — a newly married couple — to enjoy one meaningful, world-inspired date night per month during their first year of marriage.

## App Description

Year of Dates guides Seth and Elana through 12 curated date nights, each built around a destination and culture. Every month includes a dinner idea (for Seth the cook), music direction (for Elana the DJ), an opening ritual, conversation prompts, a fun activity, a local add-on, and a prep checklist. Couples can schedule dates, save reflections, record learnings about each other, and save favorite rituals/activities/prompts.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite (artifact: `year-of-dates`, preview path: `/`)
- **API framework**: Express 5 (artifact: `api-server`, preview path: `/api`)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **UI**: shadcn/ui + Tailwind CSS v4 + Framer Motion
- **Fonts**: Cormorant Garamond (serif headings) + Inter (body)
- **Color palette**: Warm ivory backgrounds with deep wine/rose primary

## Key Features

- 12-month dashboard with all date plans and progress tracking
- Individual month pages with: dinner, music, ritual, conversation prompts, activity, local add-on
- Prep checklist per month with toggle completion
- Add to Google Calendar or download .ics file
- Mark dates as complete + write post-date reflections
- Memory Vault: all reflections organized by month
- What We've Learned: record discoveries about each other (tagged: Seth/Elana/Both)
- Saved Favorites: heart rituals, activities, and prompts to save permanently

## Data Flow

- All 12 date plans seeded in the database on first startup
- 5 checklist items per month (60 total) seeded on startup
- All user data (reflections, learnings, favorites, scheduling) persisted to PostgreSQL

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Architecture

```
artifacts/
  year-of-dates/     # React + Vite frontend (preview: /)
  api-server/        # Express 5 API (preview: /api)
lib/
  api-spec/          # OpenAPI spec + Orval codegen config
  api-client-react/  # Generated React Query hooks
  api-zod/           # Generated Zod schemas
  db/                # Drizzle ORM schema + DB client
    schema/
      dates.ts       # date_plans table
      reflections.ts # reflections table
      checklist.ts   # checklist_items table
      favorites.ts   # favorites table
      learnings.ts   # learnings table
```

## Note on api-zod index.ts

After running codegen, manually overwrite `lib/api-zod/src/index.ts` to only export from `./generated/api` (not `./generated/types`) to prevent duplicate export conflicts. The codegen script regenerates this file with both exports, causing TypeScript errors.
