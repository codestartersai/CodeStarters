-- ==============================================================================
-- CodeStarters Database Schema & Security Setup
-- Production-grade, zero hardcoded names, strict RLS, dynamic team tabs & invite tokens
-- ==============================================================================

-- 1. Admin Users Table (Authorized personnel)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'editor', -- 'super_admin', 'editor', 'viewer', 'custom'
    permissions JSONB NOT NULL DEFAULT '["manage_team", "manage_requests"]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure all columns exist even if the table already existed previously
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'editor';
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS permissions JSONB NOT NULL DEFAULT '["manage_team", "manage_requests"]'::jsonb;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (email);

-- 2. Admin Invitations Table (One-use secure access tokens)
CREATE TABLE IF NOT EXISTS admin_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'editor',
    permissions JSONB NOT NULL DEFAULT '["manage_team", "manage_requests"]'::jsonb,
    token TEXT UNIQUE NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    invited_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_admin_invites_token ON admin_invites (token);
CREATE INDEX IF NOT EXISTS idx_admin_invites_email ON admin_invites (email);

-- 3. Team Categories / Tabs Table (Dynamic departments: Robotics, Web, etc.)
CREATE TABLE IF NOT EXISTS team_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default Department Tabs
INSERT INTO team_categories (id, name, description, order_index) VALUES
    ('leadership', 'Leadership', 'Executive team and organization leads', 1),
    ('ai', 'AI Team', 'AI mentors and curriculum developers', 2),
    ('python', 'Python Team', 'Python instructors and team leads', 3),
    ('robotics', 'Robotics Team', 'Robotics hardware, engineering, and mentors', 4),
    ('webdev', 'Web Development', 'Developers creating websites for local businesses', 5),
    ('marketing', 'Marketing & Outreach', 'Community outreach, growth, and partnerships', 6)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index;

-- 4. Team Members Table (Manageable via /admin/team)
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    category_id TEXT NOT NULL REFERENCES team_categories(id) ON DELETE CASCADE,
    image_url TEXT,
    bio TEXT,
    social_links TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_members_category ON team_members (category_id);
CREATE INDEX IF NOT EXISTS idx_team_members_order ON team_members (order_index);

-- Seed initial team members matching codestarters.org
INSERT INTO team_members (id, name, role, category_id, image_url, order_index) VALUES
    ('11111111-1111-1111-1111-111111111101', 'Smaran Aramballi Sandarsh', 'Founder & President', 'leadership', '/smaran.png', 1),
    ('11111111-1111-1111-1111-111111111102', 'Amogh Bhatta', 'Founder & Director of Robotics', 'leadership', '/amogh.webp', 2),
    ('11111111-1111-1111-1111-111111111103', 'Reyansh Nankani', 'Founder & Vice-President', 'leadership', '/team/reyansh-nankani.png', 3),
    ('11111111-1111-1111-1111-111111111104', 'Pranav C', 'Founder & Head of AI, Finance, and Legal', 'leadership', '/team/pranav-c.png', 4),
    ('11111111-1111-1111-1111-111111111105', 'Aljer Almazan', 'Director of Python', 'leadership', '/team/aljer-almazan.webp', 5),
    ('11111111-1111-1111-1111-111111111106', 'Carter Chang', 'AI Mentor', 'ai', '/team/carter-chang.png', 1),
    ('11111111-1111-1111-1111-111111111107', 'Jahan Vora', 'Marketing Team Member', 'python', NULL, 1),
    ('11111111-1111-1111-1111-111111111108', 'Mridhula Ganesh Kumar', 'Marketing Team Member', 'robotics', '/team/mridhula-ganesh-kumar.webp', 1)
ON CONFLICT (id) DO NOTHING;

-- 5. Website Requests Table (Client pipeline)
CREATE TABLE IF NOT EXISTS website_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    business_type TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    description TEXT,
    needs TEXT,
    cupertino_consent BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT,
    assigned_to TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_website_requests_status ON website_requests (status);
CREATE INDEX IF NOT EXISTS idx_website_requests_created ON website_requests (created_at DESC);

-- 6. Volunteers Table
CREATE TABLE IF NOT EXISTS volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    interest TEXT,
    school TEXT,
    grade_level TEXT,
    availability TEXT,
    reason_for_joining TEXT,
    previous_experience TEXT,
    social_links TEXT,
    bio TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers (status);

-- ==============================================================================
-- Security Helper Functions
-- ==============================================================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admin_users
        WHERE id = auth.uid() AND role = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to allow idempotent re-running
DO $$ BEGIN
    -- admin_users policies
    DROP POLICY IF EXISTS "Users can read own admin profile" ON admin_users;
    DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
    DROP POLICY IF EXISTS "Admins can view other admins" ON admin_users;
    DROP POLICY IF EXISTS "Allow bootstrap of first super admin" ON admin_users;
    DROP POLICY IF EXISTS "Allow bootstrap read when empty" ON admin_users;

    -- admin_invites policies
    DROP POLICY IF EXISTS "Admins can view invitations" ON admin_invites;
    DROP POLICY IF EXISTS "Admins can manage invitations" ON admin_invites;

    -- team_categories policies
    DROP POLICY IF EXISTS "Public read for team categories" ON team_categories;
    DROP POLICY IF EXISTS "Admins can manage team categories" ON team_categories;

    -- team_members policies
    DROP POLICY IF EXISTS "Public read for team members" ON team_members;
    DROP POLICY IF EXISTS "Admins can manage team members" ON team_members;

    -- website_requests policies
    DROP POLICY IF EXISTS "Public insert for website requests" ON website_requests;
    DROP POLICY IF EXISTS "Admins can view and manage website requests" ON website_requests;

    -- volunteers policies
    DROP POLICY IF EXISTS "Public insert for volunteer applications" ON volunteers;
    DROP POLICY IF EXISTS "Admins can view and manage volunteer applications" ON volunteers;
END $$;

-- 1. admin_users policies
CREATE POLICY "Users can read own admin profile"
    ON admin_users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Admins can view other admins"
    ON admin_users FOR SELECT
    USING (is_admin());

CREATE POLICY "Super admins can manage admin users"
    ON admin_users FOR ALL
    USING (is_super_admin());

-- Allow bootstrap of the first super admin when the table is empty
CREATE POLICY "Allow bootstrap of first super admin"
    ON admin_users FOR INSERT
    WITH CHECK (
        NOT EXISTS (SELECT 1 FROM admin_users)
    );

CREATE POLICY "Allow bootstrap read when empty"
    ON admin_users FOR SELECT
    USING (
        NOT EXISTS (SELECT 1 FROM admin_users)
    );

-- 2. admin_invites policies
CREATE POLICY "Admins can view invitations"
    ON admin_invites FOR SELECT
    USING (is_admin());

CREATE POLICY "Admins can manage invitations"
    ON admin_invites FOR ALL
    USING (is_admin());

-- 3. team_categories policies
CREATE POLICY "Public read for team categories"
    ON team_categories FOR SELECT
    USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admins can manage team categories"
    ON team_categories FOR ALL
    USING (is_admin());

-- 4. team_members policies
CREATE POLICY "Public read for team members"
    ON team_members FOR SELECT
    USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admins can manage team members"
    ON team_members FOR ALL
    USING (is_admin());

-- 5. website_requests policies
CREATE POLICY "Public insert for website requests"
    ON website_requests FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Admins can view and manage website requests"
    ON website_requests FOR ALL
    USING (is_admin());

-- 6. volunteers policies
CREATE POLICY "Public insert for volunteer applications"
    ON volunteers FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Admins can view and manage volunteer applications"
    ON volunteers FOR ALL
    USING (is_admin());

-- Reload PostgREST schema cache so newly added columns are instantly recognized
NOTIFY pgrst, 'reload schema';
