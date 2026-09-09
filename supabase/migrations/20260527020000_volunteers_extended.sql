ALTER TABLE public.volunteers
  ADD COLUMN IF NOT EXISTS why_this_role text,
  ADD COLUMN IF NOT EXISTS relevant_project text,
  ADD COLUMN IF NOT EXISTS what_to_learn text,
  ADD COLUMN IF NOT EXISTS has_taught text,
  ADD COLUMN IF NOT EXISTS admin_notes text;
