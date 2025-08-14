
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) return { ok: false, skipped: 'RESEND_API_KEY missing' };
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.EMAIL_FROM || 'noreply@nextshyft.app', to, subject, html })
    });
    return { ok: res.ok };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function sendSMS(to: string, body: string) {
  try {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM_NUMBER;
    if (!sid || !token || !from) return { ok: false, skipped: 'Twilio env missing' };
    const auth = Buffer.from(`${sid}:${token}`).toString('base64');
    const data = new URLSearchParams({ To: to, From: from, Body: body }).toString();
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: data,
    });
    return { ok: res.ok };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
