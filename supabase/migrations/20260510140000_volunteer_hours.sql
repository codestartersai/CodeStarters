-- Volunteer hours verification table
CREATE TABLE IF NOT EXISTS volunteer_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  volunteer_name TEXT NOT NULL,
  volunteer_email TEXT NOT NULL,
  activity_description TEXT NOT NULL,
  hours NUMERIC(5,1) NOT NULL,
  proof_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE volunteer_hours ENABLE ROW LEVEL SECURITY;

-- Anyone can submit hours
CREATE POLICY "anon can insert volunteer hours"
  ON volunteer_hours FOR INSERT TO anon
  WITH CHECK (true);

-- Authenticated (admins) can read all
CREATE POLICY "authenticated can read volunteer hours"
  ON volunteer_hours FOR SELECT TO authenticated
  USING (true);

-- Authenticated (admins) can update status
CREATE POLICY "authenticated can update volunteer hours"
  ON volunteer_hours FOR UPDATE TO authenticated
  USING (true);
