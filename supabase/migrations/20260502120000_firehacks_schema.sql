-- Fire Hacks participant portal: tables, storage bucket, RLS, auto-link trigger.
-- Run this in the Supabase SQL editor for project pjvhnqyxyumavfoqsrez.
-- After running, create participant rows (full_name, email, event_id) and an
-- auth.users entry with the same email + a password (Supabase dashboard ->
-- Authentication -> Add user, check "Auto Confirm User"). The trigger below
-- links them automatically.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- tables

create table if not exists public.firehacks_participants (
    id uuid primary key default gen_random_uuid(),
    event_id text not null default 'fh2026',
    full_name text not null,
    email text not null,
    auth_user_id uuid unique references auth.users(id) on delete set null,
    pass_token uuid not null unique default gen_random_uuid(),
    waiver_storage_path text,
    waiver_uploaded_at timestamptz,
    created_at timestamptz not null default now()
);

create unique index if not exists firehacks_participants_event_email_key
    on public.firehacks_participants (event_id, lower(email));

create index if not exists firehacks_participants_email_idx
    on public.firehacks_participants (lower(email));

create table if not exists public.firehacks_meal_redemptions (
    id uuid primary key default gen_random_uuid(),
    participant_id uuid not null references public.firehacks_participants(id) on delete cascade,
    kind text not null check (kind in ('breakfast','lunch','dinner','snack','meal')),
    redeemed_at timestamptz not null default now(),
    redeemed_by uuid references auth.users(id) on delete set null,
    unique (participant_id, kind)
);

create index if not exists firehacks_meal_redemptions_participant_idx
    on public.firehacks_meal_redemptions (participant_id);

-- ---------------------------------------------------------------- storage

insert into storage.buckets (id, name, public)
values ('firehacks-waivers', 'firehacks-waivers', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------- auto-link

create or replace function public.firehacks_link_participant_on_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    update public.firehacks_participants
       set auth_user_id = new.id
     where auth_user_id is null
       and lower(email) = lower(new.email);
    return new;
end;
$$;

drop trigger if exists firehacks_link_participant_on_user_insert on auth.users;
create trigger firehacks_link_participant_on_user_insert
after insert on auth.users
for each row execute function public.firehacks_link_participant_on_auth();

drop trigger if exists firehacks_link_participant_on_user_update on auth.users;
create trigger firehacks_link_participant_on_user_update
after update of email on auth.users
for each row execute function public.firehacks_link_participant_on_auth();

-- Backfill any auth users that already match an existing participant row.
update public.firehacks_participants p
   set auth_user_id = u.id
  from auth.users u
 where p.auth_user_id is null
   and lower(p.email) = lower(u.email);

-- ---------------------------------------------------------------- RLS

alter table public.firehacks_participants enable row level security;
alter table public.firehacks_meal_redemptions enable row level security;

drop policy if exists "fh participants read own row" on public.firehacks_participants;
create policy "fh participants read own row"
on public.firehacks_participants
for select
to authenticated
using (auth_user_id = auth.uid());

drop policy if exists "fh participants update own row" on public.firehacks_participants;
create policy "fh participants update own row"
on public.firehacks_participants
for update
to authenticated
using (auth_user_id = auth.uid())
with check (auth_user_id = auth.uid());

drop policy if exists "fh participants read own redemptions" on public.firehacks_meal_redemptions;
create policy "fh participants read own redemptions"
on public.firehacks_meal_redemptions
for select
to authenticated
using (
    exists (
        select 1
          from public.firehacks_participants p
         where p.id = participant_id
           and p.auth_user_id = auth.uid()
    )
);
