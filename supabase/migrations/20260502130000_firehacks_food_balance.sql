-- Food balance table: tracks per-participant item counts with max limits.
-- Run this in the Supabase SQL editor after the firehacks schema migration.

create table if not exists public.firehacks_food_balance (
    participant_id uuid not null references public.firehacks_participants(id) on delete cascade,
    kind text not null check (kind in ('pizza', 'chips', 'drink', 'water')),
    count integer not null default 0 check (count >= 0),
    updated_at timestamptz not null default now(),
    primary key (participant_id, kind)
);

alter table public.firehacks_food_balance enable row level security;
-- Service role bypasses RLS; no policies needed for staff-facing scanner API.
