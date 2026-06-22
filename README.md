# Somnus

A dream journal webapp for recording, analyzing, and sharing dreams. Built with Next.js, Tailwind CSS, Supabase, and the Anthropic Claude API.

## Features

- **Dream log** — scrollable list of entries with search and bulk select/delete
- **Dream entry** — write and read dreams with a minimal, typographic layout
- **AI analysis** — Claude interprets each dream's themes and symbolism
- **Auto-title** — Claude Haiku generates a descriptive title on save
- **Sharing** — generate a public link for any entry; recipients can view it in their own Shared with you tab

## Tech stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Database + Auth | Supabase |
| AI | Anthropic Claude API (`claude-sonnet-4-6` for analysis, `claude-haiku-4-5` for titles) |
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

In your Supabase project, open the SQL editor and run each block in order.

**Dreams table:**

```sql
create table dreams (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  title text,
  body text,
  analysis text,
  analyzed_body text,
  share_token text,
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

**Shared with you table:**

```sql
create table shared_with_me (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid references auth.users not null,
  dream_id uuid references dreams not null,
  sharer_email text,
  saved_at timestamptz default now(),
  unique (viewer_id, dream_id)
);

alter table shared_with_me enable row level security;

create policy "Users can manage their own shared entries"
  on shared_with_me for all
  using (auth.uid() = viewer_id);

grant select on public.shared_with_me to authenticated;
```

**RPC to save a shared dream (reads sharer email securely):**

```sql
create or replace function save_shared_dream(p_dream_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  v_viewer_id uuid := auth.uid();
  v_sharer_id uuid;
  v_sharer_email text;
begin
  select user_id into v_sharer_id from dreams where id = p_dream_id;
  select email into v_sharer_email from auth.users where id = v_sharer_id;

  insert into shared_with_me (viewer_id, dream_id, sharer_email)
  values (v_viewer_id, p_dream_id, v_sharer_email)
  on conflict (viewer_id, dream_id) do nothing;

  return v_sharer_email;
end;
$$;
```

**Trigger to auto-remove shared entries when a link is revoked:**

```sql
create or replace function remove_shared_on_token_revoke()
returns trigger as $$
begin
  if new.share_token is null and old.share_token is not null then
    delete from shared_with_me where dream_id = new.id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_share_token_revoke
  after update on dreams
  for each row
  execute function remove_shared_on_token_revoke();
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  page.tsx                  ← Dream log (home) with My dreams / Shared with you tabs
  dream/new/page.tsx        ← New entry (body only, title auto-generated on save)
  dream/[id]/page.tsx       ← Entry view and edit
  share/[token]/page.tsx    ← Public shared dream (view only)
  api/analyze/route.ts      ← Claude Sonnet dream analysis
  api/title/route.ts        ← Claude Haiku title generation

components/
  Navbar.tsx                ← Top nav with search
  DreamCard.tsx             ← List item in dream log
  AnalysisPanel.tsx         ← Sliding analysis overlay
  ShareModal.tsx            ← Share link modal with send options
  icons.tsx                 ← Custom SVG icons (refresh, share, delete)
  LoadingScreen.tsx         ← "Dreaming..." splash

lib/
  types.ts                  ← Dream and SharedDream types
  supabase.ts               ← All database queries and helpers
```

## Collaboration

- `main` — always deployable; merge via PR only
- `dev-effie` — Effie's working branch
- `dev-[name]` — collaborator working branches

**Designer owns:** `components/`, page layouts, fonts, global CSS  
**Developer owns:** `app/api/`, `lib/supabase.ts`, Supabase schema, Vercel config

## Deploying

Connect the GitHub repo to [Vercel](https://vercel.com), add the three environment variables in the Vercel dashboard, and deploy. Vercel auto-deploys on every push to `main`.
