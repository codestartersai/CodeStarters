import nodemailer from "nodemailer";

type EmailAttachment = {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  cid?: string;
};

type SendPlainArgs = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  attachments?: EmailAttachment[];
  /** Display name for Gmail SMTP "from". Address is always GMAIL_USER. */
  gmailFrom?: string;
};

/** Sends a plain-text email via Gmail SMTP. */
export async function sendPlainEmail({
  to,
  subject,
  text,
  html,
  attachments,
  gmailFrom = "Fire Hacks 2026",
}: SendPlainArgs): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) {
    throw new Error("MISSING_EMAIL_CONFIG");
  }
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });
  await transport.sendMail({
    from: `"${gmailFrom}" <${user}>`,
    to,
    subject,
    text,
    html,
    attachments,
  });
}

export function emailNotConfiguredMessage(): string {
  return "Email not configured on the server. Set GMAIL_USER and GMAIL_APP_PASSWORD in your hosting environment.";
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}
