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

/** Sends an email via Gmail SMTP. */
export async function sendPlainEmail({
    to,
    subject,
    text,
    html,
    attachments,
    gmailFrom = "CodeStarters",
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

/** Verifies the Gmail SMTP connection. */
export async function testSmtpConnection(): Promise<{ ok: boolean; error?: string; user?: string }> {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
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

        <p>To accept your invitation, sign in using your Google account (<strong>${to}</strong>):</p>

        <div class="btn-wrapper">
          <a href="${inviteUrl}" class="btn" target="_blank">Sign in with Google SSO &rarr;</a>
        </div>

        <p style="font-size: 13px; color: #64748b;">This invitation link is single-use and will expire in 7 days. If you did not expect this email, you can safely ignore it.</p>

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

Sign in with your Google account (${to}) by clicking this single-use link:
${inviteUrl}

This link is valid for 7 days.
    `;

    await sendPlainEmail({
        to,
        subject,
        text,
        html,
        gmailFrom: "CodeStarters",
    });
}
