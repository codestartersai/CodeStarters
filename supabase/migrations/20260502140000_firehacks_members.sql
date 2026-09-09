-- Tracks Fire Hacks staff/scanner accounts created by admins.
create table if not exists public.firehacks_members (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    created_at timestamptz not null default now(),
    created_by uuid references auth.users(id) on delete set null
);

alter table public.firehacks_members enable row level security;
-- Service role bypasses RLS; no policies needed.
