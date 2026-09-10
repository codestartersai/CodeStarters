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

import { resolveEnv } from "@/lib/supabase/admin";

export function getEmailConfig(): { user?: string; pass?: string; from?: string } {
    const user = resolveEnv(["GMAIL_USER", "GMAIL_ADDRESS", "SMTP_USER"]);
    const pass = resolveEnv(["GMAIL_APP_PASSWORD", "GMAIL_PASSWORD", "SMTP_PASSWORD"]);
    const from = resolveEnv(["EMAIL_FROM_NAME", "GMAIL_FROM_NAME"]) || "CodeStarters";
    return { user, pass, from };
}

/** Sends an email via Gmail SMTP. */
export async function sendPlainEmail({
    to,
    subject,
    text,
    html,
    attachments,
    gmailFrom,
}: SendPlainArgs): Promise<void> {
    const config = getEmailConfig();
    if (!config.user || !config.pass) {
        throw new Error("MISSING_EMAIL_CONFIG");
    }
    const transport = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: { user: config.user, pass: config.pass },
    });
    await transport.sendMail({
        from: `"${gmailFrom || config.from}" <${config.user}>`,
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
    const { user, pass } = getEmailConfig();
    return Boolean(user && pass);
}

/** Verifies the Gmail SMTP connection. */
export async function testSmtpConnection(): Promise<{ ok: boolean; error?: string; user?: string }> {
    const { user, pass } = getEmailConfig();
    if (!user || !pass) {
        return { ok: false, error: "Missing GMAIL_USER or GMAIL_APP_PASSWORD in environment variables." };
    }
    try {
        const transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: { user, pass },
        });
        await transport.verify();
        return { ok: true, user };
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "SMTP verification failed.";
        return { ok: false, error: message, user };
    }
}

/** Sends a branded Google SSO Admin Invitation email. */
export async function sendAdminInviteEmail({
    to,
    inviteUrl,
    role,
    permissions,
    invitedByName = "An administrator",
}: {
    to: string;
    inviteUrl: string;
    role: string;
    permissions: string[];
    invitedByName?: string;
}): Promise<void> {
    const subject = "Invitation to CodeStarters Admin Portal";
    const roleTitle = role === "super_admin" ? "Super Admin" : role === "editor" ? "Editor" : "Team Member";

    const permLabels: Record<string, string> = {
        all: "Full Administrative Access",
        manage_team: "Manage Teams & Tabs (Robotics, Web, etc.)",
        manage_requests: "Manage Website Requests",
        manage_applications: "Review Applications",
        manage_scanners: "Event QR Scanners",
        manage_admins: "Invite Members & Access Control",
    };

    const permListHtml = permissions
        .map((p) => `<li style="margin-bottom: 6px;">${permLabels[p] || p}</li>`)
        .join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CodeStarters Admin Invitation</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .card { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; padding: 40px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); }
        .header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .logo { width: 44px; height: 44px; background: #eff6ff; color: #1d4ed8; border-radius: 12px; font-weight: 900; font-size: 18px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; text-align: center; line-height: 44px; }
        h1 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
        p { font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 16px 0; }
        .badge { display: inline-block; background: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 700; margin-bottom: 20px; }
        .perm-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 20px 0; }
        .perm-box h3 { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0 0 12px 0; font-weight: 800; }
        .perm-box ul { margin: 0; padding-left: 20px; font-size: 14px; color: #334155; }
        .btn-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background: #2563eb; color: #ffffff !important; padding: 14px 32px; border-radius: 14px; font-size: 15px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.3); }
        .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">CS</div>
          <span style="font-size: 16px; font-weight: 800; color: #0f172a;">CodeStarters Admin</span>
        </div>
        <h1>You've been invited to join the team</h1>
        <p>${invitedByName} has invited you to access the CodeStarters Admin Dashboard as a <strong>${roleTitle}</strong>.</p>
        
        <div class="badge">Role: ${roleTitle}</div>

        <div class="perm-box">
          <h3>Your Assigned Permissions:</h3>
          <ul>
            ${permListHtml}
          </ul>
        </div>

        <p>To accept your invitation, click the button below to choose your username and create your password:</p>

        <div class="btn-wrapper">
          <a href="${inviteUrl}" class="btn" target="_blank">Set Up Username & Password &rarr;</a>
        </div>

        <p style="font-size: 13px; color: #64748b;">This link is single-use and will expire in 7 days. Once you create your password, you will be able to log in to the dashboard directly anytime.</p>

        <div class="footer">
          CodeStarters &bull; Empowering the Next Generation of Tech Leaders
        </div>
      </div>
    </body>
    </html>
    `;

    const text = `
You've been invited to the CodeStarters Admin Dashboard!

${invitedByName} has invited you to access the admin portal as a ${roleTitle}.
Your permissions: ${permissions.join(", ")}

To accept your invitation, choose your username and password at this one-time link:
${inviteUrl}

This single-use link is valid for 7 days.
    `;

    await sendPlainEmail({
        to,
        subject,
        text,
        html,
        gmailFrom: "CodeStarters",
    });
}

/** Sends a human, cleanly-designed reply to a website request or inquiry via Gmail connector */
export async function sendRequestReplyEmail({
    to,
    recipientName,
    businessName,
    subject,
    message,
    senderName = "The CodeStarters Team",
    callToActionText,
    callToActionUrl,
}: {
    to: string;
    recipientName: string;
    businessName?: string;
    subject: string;
    message: string;
    senderName?: string;
    callToActionText?: string;
    callToActionUrl?: string;
}): Promise<void> {
    // Escape HTML special characters for the message paragraphs while preserving linebreaks
    const formattedParagraphs = message
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p style="font-size: 15px; line-height: 1.65; color: #334155; margin: 0 0 16px 0;">${p.replace(/\n/g, "<br/>")}</p>`)
        .join("");

    const ctaHtml = callToActionText && callToActionUrl
        ? `
        <div style="text-align: left; margin: 28px 0 24px 0;">
            <a href="${callToActionUrl}" style="display: inline-block; background: #2563eb; color: #ffffff !important; padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);" target="_blank">
                ${callToActionText} &rarr;
            </a>
        </div>
        `
        : "";

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.04); }
        .header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 18px; }
        .logo { width: 38px; height: 38px; background: #eff6ff; color: #1d4ed8; border-radius: 10px; font-weight: 900; font-size: 16px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; text-align: center; line-height: 38px; }
        h1 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 16px 0; }
        .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.5; }
        .signoff { margin-top: 24px; font-size: 14px; color: #475569; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">CS</div>
          <div>
            <span style="font-size: 15px; font-weight: 800; color: #0f172a; display: block;">CodeStarters</span>
            <span style="font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Student Tech Initiative &bull; Cupertino, CA</span>
          </div>
        </div>

        ${businessName ? `<div style="display: inline-block; background: #f1f5f9; color: #475569; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin-bottom: 16px;">Re: ${businessName}</div>` : ""}

        <h1>Hi ${recipientName || "there"},</h1>

        ${formattedParagraphs}

        ${ctaHtml}

        <div class="signoff">
          <p style="margin: 0; font-weight: 700; color: #1e293b;">Best regards,</p>
          <p style="margin: 4px 0 0 0; color: #475569;">${senderName}</p>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">CodeStarters Cupertino &bull; codestarters26@gmail.com</p>
        </div>

        <div class="footer">
          You are receiving this message regarding your inquiry on <a href="https://codestarters.org" style="color: #2563eb; text-decoration: none;">codestarters.org</a>.
        </div>
      </div>
    </body>
    </html>
    `;

    const plainText = `
Hi ${recipientName || "there"},

${message}

Best regards,
${senderName}
CodeStarters Cupertino
codestarters26@gmail.com
    `.trim();

    await sendPlainEmail({
        to,
        subject,
        text: plainText,
        html,
        gmailFrom: "CodeStarters",
    });
}

/** Sends a branded applicant communication email (e.g. interview request, onboarding, follow-up). */
export async function sendApplicantEmail({
    to,
    applicantName,
    interest,
    subject,
    message,
    senderName = "The CodeStarters Team",
    callToActionText,
    callToActionUrl,
}: {
    to: string;
    applicantName: string;
    interest?: string;
    subject: string;
    message: string;
    senderName?: string;
    callToActionText?: string;
    callToActionUrl?: string;
}): Promise<void> {
    const formattedParagraphs = message
        .split("\n\n")
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `<p style="font-size: 15px; line-height: 1.65; color: #334155; margin: 0 0 16px 0;">${p.replace(/\n/g, "<br/>")}</p>`)
        .join("");

    const ctaHtml = callToActionText && callToActionUrl
        ? `
        <div style="text-align: left; margin: 28px 0 24px 0;">
            <a href="${callToActionUrl}" style="display: inline-block; background: #0f172a; color: #ffffff !important; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none;" target="_blank">
                ${callToActionText} &rarr;
            </a>
        </div>
        `
        : "";

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }
        .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.04); }
        .header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 18px; }
        .logo { width: 36px; height: 36px; background: #0f172a; color: #ffffff; border-radius: 8px; font-weight: 800; font-size: 15px; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; text-align: center; line-height: 36px; }
        h1 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 16px 0; }
        .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 20px; line-height: 1.5; }
        .signoff { margin-top: 24px; font-size: 14px; color: #475569; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div class="logo">CS</div>
          <div>
            <span style="font-size: 15px; font-weight: 700; color: #0f172a; display: block;">CodeStarters</span>
            <span style="font-size: 11px; color: #64748b; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">Student Tech Initiative &bull; Cupertino, CA</span>
          </div>
        </div>

        ${interest ? `<div style="display: inline-block; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 4px; margin-bottom: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Application: ${interest}</div>` : ""}

        <h1>Hi ${applicantName || "there"},</h1>

        ${formattedParagraphs}

        ${ctaHtml}

        <div class="signoff">
          <p style="margin: 0; font-weight: 600; color: #1e293b;">Best regards,</p>
          <p style="margin: 4px 0 0 0; color: #475569;">${senderName}</p>
          <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">CodeStarters Cupertino &bull; codestarters26@gmail.com</p>
        </div>

        <div class="footer">
          You received this message regarding your volunteer/mentor application to CodeStarters (<a href="https://codestarters.org" style="color: #0f172a; text-decoration: underline;">codestarters.org</a>).
        </div>
      </div>
    </body>
    </html>
    `;

    const plainText = `
Hi ${applicantName || "there"},

${message}

Best regards,
${senderName}
CodeStarters Cupertino
codestarters26@gmail.com
    `.trim();

    await sendPlainEmail({
        to,
        subject,
        text: plainText,
        html,
        gmailFrom: "CodeStarters",
    });
}


