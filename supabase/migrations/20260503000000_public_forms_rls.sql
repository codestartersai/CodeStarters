-- Restore public-form INSERT access for volunteers + website_requests.
-- Both tables have RLS enabled but were missing INSERT policies for the
-- anonymous role, causing every public form submission to fail with
--   42501: new row violates row-level security policy
-- Reads/updates stay locked down — the admin dashboard goes through the
-- service-role client, which always bypasses RLS.
-- Run this in the Supabase SQL editor for project pjvhnqyxyumavfoqsrez.

alter table public.volunteers enable row level security;
alter table public.website_requests enable row level security;

-- volunteers: anyone (anon or authenticated) may submit an application.
drop policy if exists "volunteers public insert" on public.volunteers;
create policy "volunteers public insert"
on public.volunteers
for insert
to anon, authenticated
with check (true);

-- website_requests: anyone may submit a request.
drop policy if exists "website_requests public insert" on public.website_requests;
create policy "website_requests public insert"
on public.website_requests
for insert
to anon, authenticated
with check (true);
