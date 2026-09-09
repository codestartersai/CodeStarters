/**
 * Re-send Fire Hacks portal login emails with corrected codestarters.org URL.
 * Usage: node scripts/resend-firehacks-portal-logins.mjs [--dry-run]
 */
import crypto from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const dryRun = process.argv.includes("--dry-run");
const PORTAL_URL = "https://codestarters.org/firehacks/portal/login";
const DAY_START = "2026-06-14T00:00:00Z";
const DAY_END = "2026-06-15T00:00:00Z";

function loadEnv() {
  const env = {};
  for (const file of ["/tmp/vercel-env-resend.env", ".env.local"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split("\n")) {
      if (!line || line.startsWith("#")) continue;
      const i = line.indexOf("=");
      if (i === -1) continue;
      const key = line.slice(0, i);
      let val = line.slice(i + 1);
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (val) env[key] = val;
    }
  }
  return env;
}

function generatePassword() {
  return crypto.randomBytes(12).toString("base64url");
}

function buildEmail(fullName, email, password) {
  return {
    subject: "CORRECTED: Your Fire Hacks Portal Login",
    text: [
      `Hi ${fullName},`,
      "",
      "We apologize for the inconvenience — our earlier email included the wrong portal link (codestarters.xyz). Please use the corrected link below.",
      "",
      "Here are your updated credentials to access the Fire Hacks attendee portal:",
      "",
      `  Portal: ${PORTAL_URL}`,
      `  Email:  ${email}`,
      `  Password: ${password}`,
      "",
      "Your previous password from the earlier email no longer works. Use the password above instead.",
      "",
      "You can use this portal to view your QR code for check-in and the food line.",
      "",
      "Security note: do not forward this email. If you received this in error, contact a Fire Hacks staff member immediately.",
      "",
      "Sorry again for the confusion, and see you at Fire Hacks!",
      "",
      "— Fire Hacks 2026 Staff",
    ].join("\n"),
  };
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const gmailUser = env.GMAIL_USER;
const gmailPass = env.GMAIL_APP_PASSWORD;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}
if (!dryRun && (!gmailUser || !gmailPass)) {
  console.error("Missing GMAIL_USER / GMAIL_APP_PASSWORD. Run with --dry-run or pull Vercel env.");
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const transport =
  !dryRun &&
  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: gmailUser, pass: gmailPass },
  });

const { data: staff } = await admin.from("firehacks_members").select("email");
const staffSet = new Set((staff ?? []).map((s) => s.email.toLowerCase()));

const { data: participants, error: pErr } = await admin
  .from("firehacks_participants")
  .select("email, full_name, auth_user_id")
  .eq("event_id", "fh2026")
  .gte("created_at", DAY_START)
  .lt("created_at", DAY_END);

if (pErr) {
  console.error(pErr);
  process.exit(1);
}

// Also include re-provisioned participants (auth touched today, participant older)
const { data: userList } = await admin.auth.admin.listUsers({ perPage: 500 });
const startMs = Date.parse(DAY_START);
const endMs = Date.parse(DAY_END);
const touchedAuth = new Map(
  userList.users
    .filter((u) => {
      const t = Date.parse(u.updated_at || u.created_at);
      return (
        t >= startMs &&
        t < endMs &&
        u.email &&
        !staffSet.has(u.email.toLowerCase()) &&
        u.email !== "demo@firehacks.xyz"
      );
    })
    .map((u) => [u.id, u]),
);

const { data: allParts } = await admin
  .from("firehacks_participants")
  .select("email, full_name, auth_user_id")
  .eq("event_id", "fh2026");

const recipientMap = new Map();
for (const p of participants ?? []) {
  if (p.auth_user_id) recipientMap.set(p.email.toLowerCase(), p);
}
for (const p of allParts ?? []) {
  if (p.auth_user_id && touchedAuth.has(p.auth_user_id)) {
    recipientMap.set(p.email.toLowerCase(), p);
  }
}

const recipients = [...recipientMap.values()].sort((a, b) => a.email.localeCompare(b.email));
console.log(`${dryRun ? "[DRY RUN] " : ""}Resending to ${recipients.length} recipients...`);

let sent = 0;
let failed = 0;

for (const row of recipients) {
  const authUser = touchedAuth.get(row.auth_user_id) ?? userList.users.find((u) => u.id === row.auth_user_id);
  if (!authUser) {
    console.error(`SKIP (no auth user): ${row.email}`);
    failed++;
    continue;
  }

  const password = generatePassword();
  const { subject, text } = buildEmail(row.full_name, row.email, password);

  if (dryRun) {
    console.log(`Would send to ${row.email}`);
    sent++;
    continue;
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(authUser.id, { password });
  if (updateError) {
    console.error(`FAIL update ${row.email}:`, updateError.message);
    failed++;
    continue;
  }

  try {
    await transport.sendMail({
      from: `"Fire Hacks 2026" <${gmailUser}>`,
      to: row.email,
      subject,
      text,
    });
    console.log(`Sent: ${row.email}`);
    sent++;
    await new Promise((r) => setTimeout(r, 1200));
  } catch (err) {
    console.error(`FAIL send ${row.email}:`, err instanceof Error ? err.message : err);
    failed++;
  }
}

console.log(`Done. sent=${sent} failed=${failed}`);
