export function supportEscalationEmail(
  orgName: string,
  orgId: string,
  actorEmail: string,
  plan: string,
) {
  return `
    <h2>NextShyft — Suspension Escalation</h2>
    <p>Org: <strong>${orgName}</strong> (${orgId})</p>
    <p>Plan: ${plan}</p>
    <p>Requested by: ${actorEmail}</p>
    <p>Time: ${new Date().toISOString()}</p>
  `;
}

export function inviteEmail(link: string, firstName = '', lastName = '') {
  const full = [firstName, lastName].filter(Boolean).join(' ').trim();
  const greet = full ? `Hi ${full},` : 'Hello,';
  return `
    <h3>You're invited to NextShyft</h3>
    <p>${greet}</p>
    <p>Click to join your organization: <a href="${link}">${link}</a></p>
  `;
}

export function resetPasswordEmail(link: string) {
  const app = 'NextShyft';
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.5; color:#0f172a; background:#f8fafc; padding:24px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px; margin:0 auto; background:white; border-radius:12px; box-shadow:0 1px 2px rgba(0,0,0,0.05); overflow:hidden;">
      <tr>
        <td style="padding:24px 24px 0;">
          <h2 style="margin:0 0 8px; font-size:22px; color:#0f172a;">Reset your password</h2>
          <p style="margin:0; color:#334155;">You requested a password reset for your ${app} account. Click the button below to set a new password.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:24px; text-align:center;">
          <a href="${link}" style="display:inline-block; background:#0ea5e9; color:white; text-decoration:none; padding:12px 20px; border-radius:8px; font-weight:600;">Reset password</a>
          <p style="margin:16px 0 0; font-size:12px; color:#64748b;">If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break:break-all; font-size:12px; color:#0ea5e9;">
            <a href="${link}" style="color:#0ea5e9;">${link}</a>
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 24px 24px;">
          <p style="margin:0; font-size:12px; color:#64748b;">This link expires in 1 hour. If you didn’t request this, you can safely ignore this email.</p>
        </td>
      </tr>
    </table>
    <p style="max-width:640px; margin:12px auto 0; font-size:12px; color:#94a3b8; text-align:center;">
      © ${new Date().getFullYear()} ${app}
    </p>
  </div>`;
}
