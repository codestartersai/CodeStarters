-- Volunteer resume uploads for the public application form.

alter table public.volunteers
  add column if not exists resume_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'volunteer-resumes',
  'volunteer-resumes',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
