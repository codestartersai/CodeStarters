/**
 * Provision Fire Hacks portal logins for Luma registrants not yet emailed.
 * Usage: node scripts/provision-luma-portal-logins.mjs [--dry-run] [--emails-file path]
 */
import crypto from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const dryRun = process.argv.includes("--dry-run");
const emailsFileArg = process.argv.find((a) => a.startsWith("--emails-file="));
const defaultEmailsFile = join(dirname(fileURLToPath(import.meta.url)), "data/luma-fh2026-emails.txt");
const emailsFile = emailsFileArg ? emailsFileArg.split("=")[1] : defaultEmailsFile;

const PORTAL_URL = "https://codestarters.org/firehacks/portal/login";
const EVENT_ID = "fh2026";

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

function deriveFullName(email) {
  return email
    .split("@")[0]
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function generatePassword() {
  return crypto.randomBytes(12).toString("base64url");
}

function buildEmail(fullName, email, password) {
  return {
    subject: "Your Fire Hacks Portal Login",
    text: [
      `Hi ${fullName},`,
      "",
      "Here are your credentials to access the Fire Hacks attendee portal:",
      "",
      `  Portal: ${PORTAL_URL}`,
      `  Email:  ${email}`,
      `  Password: ${password}`,
      "",
      "You can use this to view your QR code for check-in and the food line.",
      "",
      "Security note: do not forward this email. If you received this in error, contact a Fire Hacks staff member immediately.",
      "",
      "— Fire Hacks 2026 Staff",
    ].join("\n"),
  };
}

async function listAllAuthUsers(admin) {
  const users = [];
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 500 });
    if (error) throw error;
    users.push(...(data.users ?? []));
    if ((data.users ?? []).length < 500) break;
    page++;
  }
  return users;
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
  console.error("Missing GMAIL_USER / GMAIL_APP_PASSWORD.");
  process.exit(1);
}

const lumaEmails = readFileSync(emailsFile, "utf8")
  .split("\n")
  .map((l) => l.trim().toLowerCase())
  .filter(Boolean);

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

const { data: participants, error: pErr } = await admin
  .from("firehacks_participants")
  .select("id, email, full_name, auth_user_id")
  .eq("event_id", EVENT_ID);

if (pErr) {
  console.error(pErr);
  process.exit(1);
}

const byEmail = new Map((participants ?? []).map((p) => [p.email.toLowerCase(), p]));
const alreadySent = lumaEmails.filter((e) => byEmail.get(e)?.auth_user_id);
const toProvision = lumaEmails.filter((e) => !byEmail.get(e)?.auth_user_id);

console.log(`Luma emails: ${lumaEmails.length}`);
console.log(`Already provisioned: ${alreadySent.length}`);
console.log(`${dryRun ? "[DRY RUN] " : ""}To provision: ${toProvision.length}`);

if (alreadySent.length) {
  console.log("\nAlready sent (skipped):");
  for (const e of alreadySent) console.log(`  ${e}`);
}

const authUsers = await listAllAuthUsers(admin);
const authByEmail = new Map(
  authUsers.filter((u) => u.email).map((u) => [u.email.toLowerCase(), u]),
);

let sent = 0;
let failed = 0;

for (const email of toProvision) {
  const fullName = byEmail.get(email)?.full_name || deriveFullName(email);
  const password = generatePassword();

  if (dryRun) {
    console.log(`Would provision: ${email}`);
    sent++;
    continue;
  }

  const { data: existingParticipant } = await admin
    .from("firehacks_participants")
    .select("id")
    .eq("event_id", EVENT_ID)
    .ilike("email", email)
    .maybeSingle();

  if (existingParticipant) {
    await admin
      .from("firehacks_participants")
      .update({ full_name: fullName })
      .eq("id", existingParticipant.id);
  } else {
    const { error: insertErr } = await admin.from("firehacks_participants").insert({
      event_id: EVENT_ID,
      email,
      full_name: fullName,
    });
    if (insertErr) {
      console.error(`FAIL insert ${email}:`, insertErr.message);
      failed++;
      continue;
    }
  }

  let authUserId;
  const existingAuth = authByEmail.get(email);
  if (existingAuth) {
    authUserId = existingAuth.id;
    const { error: updateErr } = await admin.auth.admin.updateUserById(authUserId, { password });
    if (updateErr) {
      console.error(`FAIL password reset ${email}:`, updateErr.message);
      failed++;
      continue;
    }
  } else {
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) {
      console.error(`FAIL create auth ${email}:`, createErr.message);
      failed++;
      continue;
    }
    authUserId = created.user.id;
    authByEmail.set(email, created.user);
  }

  const { error: linkErr } = await admin
    .from("firehacks_participants")
    .update({ auth_user_id: authUserId })
    .eq("event_id", EVENT_ID)
    .ilike("email", email);
  if (linkErr) {
    console.error(`FAIL link ${email}:`, linkErr.message);
    failed++;
    continue;
  }

  const { subject, text } = buildEmail(fullName, email, password);
  try {
    await transport.sendMail({
      from: `"Fire Hacks 2026" <${gmailUser}>`,
      to: email,
      subject,
      text,
    });
    console.log(`Sent: ${email}`);
    sent++;
    await new Promise((r) => setTimeout(r, 1200));
  } catch (err) {
    console.error(`FAIL send ${email}:`, err instanceof Error ? err.message : err);
    failed++;
  }
}

console.log(`\nDone. sent=${sent} failed=${failed}`);
