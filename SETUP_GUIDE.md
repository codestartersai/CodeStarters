# CodeStarters Admin Portal & Security Setup Guide

This guide walks you step-by-step through setting up Supabase, configuring the Gmail SMTP connector via Google App Passwords, claiming the initial **Super Admin** account with your username and password, and inviting teammates with one-time links.

---

## Architecture Overview

1. **Direct Username & Password Authentication**: No Google Cloud OAuth configuration is required. All authentication uses secure email/username and password credentials.
2. **First-User Super Admin Bootstrap**: When you first visit `/admin/login` on a fresh database, the portal presents the **Initial Setup** screen to create the primary Super Admin account (`codestartersai@gmail.com`).
3. **Permanent Lockout**: Once the first Super Admin is created, self-registration is permanently closed. Nobody else can create an account or sign in unless explicitly invited.
4. **One-Time Email Invite Links**: Administrators invite colleagues from the dashboard. An invitation email is sent via the Gmail SMTP connector (using your Google App Password) containing a secure, single-use link.
5. **Invite Password Setup**: The colleague clicks the one-time link, chooses their username, and creates their password. Once activated, the link expires immediately.
6. **Full Team & Tabs Customization**: Dynamically manage team tabs (Robotics, Web Dev, Leadership), add members, crop/compress photos to WebP under 100KB, and sync live to the public site.
7. **In-Dashboard Email Inquiries**: Reply directly to business website requests from the dashboard using the Gmail connector with pre-built professional templates.

---

## Step 1: Set Up Supabase

### 1.1 Create Tables and Security Policies
1. Open your [Supabase Dashboard](https://supabase.com/dashboard) and select your project.
2. In the left navigation, click on the **SQL Editor**.
3. Click **New query**, paste the entire contents of [`supabase-schema.sql`](./supabase-schema.sql), and click **Run**.
4. This creates:
   - `admin_users` (with RLS policies and role/permission tracking)
   - `admin_invites` (with single-use cryptographic token indexes)
   - `team_categories` (with default categories: Leadership, Robotics, Web Dev, Education, Marketing)
   - `team_members` (dynamic team roster)
   - `website_requests` (client inquiry pipeline with notes and contacted status)
   - `volunteers` (mentor and volunteer applications)

### 1.2 Obtain Supabase API Keys
Go to **Project Settings** &rarr; **API**:
- Copy **Project URL**
- Copy **anon** public key
- Copy **service_role** secret key (needed for server-side invite generation and admin user creation)

---

## Step 2: Generate Google App Password for Gmail SMTP

To send invitations and client replies from `codestartersai@gmail.com`:

1. Sign into your Google Account (`codestartersai@gmail.com`).
2. Go to [myaccount.google.com/security](https://myaccount.google.com/security).
3. Ensure **2-Step Verification** is turned **ON**.
4. In the search bar at the top of the Google Account page, search for **App passwords** (or visit [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
5. Enter **"CodeStarters Admin"** in the app name field and click **Create**.
6. Google will display a 16-character passcode formatted like:
   ```
   abcd efgh ijkl mnop
   ```
7. Copy this code.

---

## Step 3: Configure Environment Variables

Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_URL="https://your-project-id.supabase.co"

VITE_SUPABASE_ANON_KEY="eyJhbGciOi..."
SUPABASE_ANON_KEY="eyJhbGciOi..."

SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

# Gmail SMTP Connector
GMAIL_USER="codestartersai@gmail.com"
GMAIL_APP_PASSWORD="abcd efgh ijkl mnop"
EMAIL_FROM_NAME="CodeStarters Team"

# App URL
VITE_APP_URL="http://localhost:3000"
```

---

## Step 4: Launch App & Claim Super Admin

1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:3000/admin/login
   ```
3. Because no administrators exist yet in the database, you will see the **Initial Setup Required** card:
   - **Full Name / Username**: Enter your desired name (e.g. `codestartersai` or `Smaran Sandarsh`)
   - **Email**: Enter `codestartersai@gmail.com`
   - **Password**: Enter a secure password (at least 6 characters)
   - **Confirm Password**: Re-enter your password
4. Click **"Create Super Admin & Lock Portal"**.
5. Your account is immediately created as `super_admin` with all permissions (`all`), you are logged in, and redirected to the dashboard (`/admin`)!
6. **The dashboard is now permanently locked against public signups**. Any subsequent visits to `/admin/login` will show the standard login form.

---

## Step 5: Inviting Colleagues via One-Time Link

1. Inside `/admin`, navigate to **Admin Members** (`/admin/members`).
2. Click **"Invite Admin"**.
3. Enter your colleague's email address (e.g. `colleague@domain.com`).
4. Select their **Role Tier** (`Editor`, `Viewer`, or `Super Admin`) and granular permissions.
5. Click **"Send Invite Link"**.
6. The Gmail connector sends an email to your colleague with a unique one-time link:
   ```
   http://localhost:3000/admin/login?invite=<secure-token>
   ```
7. When your colleague clicks the link:
   - They see the **Accept Invitation** screen.
   - They enter their desired **Username** and set their **Password**.
   - They click **"Create Account & Join Dashboard"**.
   - The link is burned (`used = true`).
   - They are logged in and can sign in anytime using their username/email and password.

---

## Step 6: Managing Teams & Replying to Client Inquiries

### Team & Tabs Customization (`/admin/team`)
- **Add / Edit Tabs**: Click **"Add Tab"** to create a new category (e.g. `Robotics Team`, `AI Lab`, `Mentors`). You can edit tab names, descriptions, and sort order.
- **Add / Edit Members**: Add team members with name, role, bio, and social links (LinkedIn, GitHub).
- **Photo Upload & Compression**: Click **"Upload Photo"** or select a preset avatar. Uploaded photos are compressed automatically in your browser to 600×600 WebP under 100KB for maximum site speed.
- All changes are synchronized live with the public team page (`/#team`).

### Reply to Website Inquiries via Email (`/admin/requests`)
- Navigate to **Website Requests** (`/admin/requests`).
- Click **"Reply via Email"** on any business request.
- Choose from pre-written templates (*Kickoff Call*, *Project Details Intake*, *Development Notice*, *Waitlist*) or write a custom reply.
- Optionally add a Call-to-Action button (e.g. a Calendly or Google Meet link).
- Click **"Send Email to Client"**. The email is delivered via your Gmail SMTP connector, the request status is automatically marked as **Contacted**, and a timestamped audit note is recorded.
