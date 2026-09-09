ALTER TABLE public.tasks
  ALTER COLUMN assigned_to TYPE text[]
  USING CASE WHEN assigned_to IS NULL THEN NULL ELSE ARRAY[assigned_to] END;
