# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CodeStarters is a nonprofit website for a student-led initiative that teaches CS/AI to younger students and builds free websites for local Cupertino businesses. Built with Next.js 16, React 19, Supabase, and Tailwind CSS v4.

## Commands

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run lint` — Run ESLint
- `npm start` — Start production server

## Architecture

### Route Groups

- `src/app/(website)/` — Public-facing marketing site with Navbar and Footer via its own layout
- `src/app/admin/` — Authenticated admin dashboard (client-side `"use client"` layout with sidebar)

### Authentication & Middleware

- `src/middleware.ts` — Supabase SSR auth middleware that protects all `/admin/*` routes, redirecting unauthenticated users to `/admin/login`. Login and setup pages are excluded from protection.
- Admin login checks the `admin_users` Supabase table after authentication to verify authorization.

### Supabase

- `src/lib/supabase.ts` — Client-side Supabase instance using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (from `.env.local`)
- Middleware creates its own server client via `@supabase/ssr`
- Three main tables: `website_requests`, `volunteers`, `admin_users`

### Key Patterns

- **Styling**: Tailwind CSS v4 with custom `brand-*` color tokens defined in `src/app/globals.css` via `@theme` (blue palette, brand-500 = `#3b82f6`)
- **Class merging**: `cn()` utility in `src/lib/utils.ts` combines `clsx` + `tailwind-merge`
- **Animations**: `framer-motion` used extensively — the `Button` component wraps `motion.button` with hover/tap scale effects
- **Icons**: `lucide-react` for all icons
- **Path alias**: `@/*` maps to `./src/*`
- **Components are all client components** (`"use client"`) — there are no server components beyond the root and website layouts
- **UI primitives**: `src/components/ui/` contains `Button` (with variant/size props) and `Card`
- **Forms submit directly to Supabase** from client components (volunteer applications → `volunteers` table, website requests → `website_requests` table)
