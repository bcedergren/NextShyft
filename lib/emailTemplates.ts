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
