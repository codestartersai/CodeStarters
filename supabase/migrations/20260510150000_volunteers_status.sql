-- Add status column to volunteers table for application workflow.
-- Values: pending (new signup), contacted, rejected, completed (joined team).
ALTER TABLE public.volunteers
    ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'contacted', 'rejected', 'completed'));
