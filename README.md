# Somnus

A dream journal webapp for recording, analyzing, and sharing dreams. Built with Next.js, Tailwind CSS, Supabase, and the Anthropic Claude API.

## Features

- **Dream log** — scrollable list of entries with search and bulk delete
- **Dream entry** — write and read dreams with a minimal, typographic layout
- **AI analysis** — Claude interprets each dream's themes and symbolism
- **Sharing** — generate a public link for any entry, no login required

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Database + Auth | Supabase |
| AI | Anthropic Claude API (`claude-sonnet-4-6`) |
| Deployment | Vercel |

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/effiejia/somnus.git
cd somnus
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local` with your keys:

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase dashboard → Settings → API |
| `ANTHROPIC_API_KEY` | console.anthropic.com |

### 3. Set up the database

In your Supabase project, open the SQL editor and run:

```sql
create table dreams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  title text,
  body text,
  analysis text,
  share_token uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table dreams enable row level security;

create policy "Users can manage their own dreams"
  on dreams for all
  using (auth.uid() = user_id);

create policy "Anyone can read shared dreams"
  on dreams for select
  using (share_token is not null);
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.tsx              ← Dream log (home)
  dream/new/page.tsx    ← New entry
  dream/[id]/page.tsx   ← Entry view (all states)
  share/[token]/page.tsx ← Public shared dream
  api/analyze/route.ts  ← Server-side Claude call

components/
  Navbar.tsx            ← Top nav with search
  DreamCard.tsx         ← List item in dream log
  AnalysisPanel.tsx     ← Sliding analysis overlay
  LoadingScreen.tsx     ← "Dreaming..." splash

lib/
  types.ts              ← Shared Dream type
  supabase.ts           ← Database queries
```

## Collaboration

- `main` — always deployable
- `dev` — shared integration branch
- Feature branches: `effie/...` for design/UI, `dev/...` for backend

**Designer owns:** `components/`, page layouts, `tailwind.config.ts`  
**Developer owns:** `app/api/`, `lib/supabase.ts`, Supabase schema, Vercel config

## Deploying

Connect the GitHub repo to [Vercel](https://vercel.com), add the three environment variables in the Vercel dashboard, and deploy. Vercel auto-deploys on every push to `main`.
