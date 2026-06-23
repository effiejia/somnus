@AGENTS.md

## Project Overview
A dream journal webapp for recording, analyzing, and sharing dreams. Built with Next.js, Tailwind CSS, Supabase, and the Anthropic Claude API.

## Tech Stack
- Next.js (App Router)
    - uses motion
- TypeScript, CSS
- Supabase (Auth, SQL)

---

## File Size & Compartmentalization Rules

**Hard limits — split files that exceed these:**
- Components: max ~150 lines
- Route handlers / Server Actions: max ~100 lines
- Utility/helper files: max ~200 lines
- Page files (`page.tsx`): should mostly *compose* smaller pieces, not contain logic

**When a file grows too large, split by responsibility, not arbitrarily:**
- UI rendering → component file
- Data fetching → separate `lib/` or `queries/` function
- Business logic / transforms → separate `lib/` or `utils/` function
- Types → separate `types.ts`
- Constants/config → separate `constants.ts`

---

## Directory Structure

\```
app/
  (routes)/
    dashboard/
      page.tsx              # composition only — imports from below
      _components/          # route-local components
        DashboardHeader.tsx
        DashboardStats.tsx
      _lib/                 # route-local data/logic
        getDashboardData.ts
      _hooks/
        useDashboardFilters.ts
components/
  ui/                       # shared, generic, reusable (Button, Card, Modal)
  features/                 # shared, feature-specific (e.g. UserAvatar)
lib/
  api/                      # fetch/data-layer functions, one file per domain
  utils/                    # pure helper functions, one concern per file
  validations/              # zod/yup schemas
hooks/                      # shared custom hooks
types/                      # shared TS types/interfaces
constants/                  # shared constants/config
\```

---

## Component Rules
- One component per file. No multi-component files except tightly coupled tiny subcomponents (e.g. `List` + `ListItem` if `ListItem` is never used elsewhere).
- Co-locate route-specific components under `_components/` next to the route; only promote to `components/` if reused in 2+ places.
- Extract any JSX block reused more than once, or any block over ~30 lines, into its own component.
- No inline data-fetching logic in components — call a function from `lib/api/`.

## Logic Rules
- No business logic inside components — extract to `lib/utils/` or a custom hook.
- No raw fetch/query calls inside components or route handlers — wrap in `lib/api/{domain}.ts`.
- Pure functions go in `utils/`; anything stateful or React-specific goes in `hooks/`.

## Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utils/lib: `camelCase.ts`
- One default export per component file; named exports for utils/hooks.

## Before Creating a New File
1. Check if similar logic already exists in `lib/` or `components/`.
2. If a file you're editing would exceed the size limits above, split it first.
3. Prefer composition (small components imported into a parent) over one large file.

## When Generating Code
- Always default to splitting UI, data, and logic into separate files per the rules above.
- If asked to "add a feature," scaffold it across the appropriate folders (component + lib function + types) rather than writing it all into `page.tsx`.
- Flag (in comments or chat) when an existing file is approaching the size limit, and suggest a split.
- Follow `biome.json` for formatting rules.