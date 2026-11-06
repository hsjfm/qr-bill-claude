// Who may hold a dashboard account. The API itself stays open to any valid
// key: Matpro's Salesforce org calls it with a key, not a login, so nothing
// here can break its QR bills.
//
// ALLOWED_EMAILS and ALLOWED_DOMAINS are comma-separated. With both unset,
// anyone may sign up, as before; that keeps local development simple.
// Production sets them (6 Nov 2026): William is the only Headswap person with
// access, and Matpro's own people keep theirs.
const list = value => (value || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

export function isAllowedEmail(email, env = process.env) {
  const emails = list(env.ALLOWED_EMAILS);
  const domains = list(env.ALLOWED_DOMAINS).map(d => d.replace(/^@/, ''));
  if (!emails.length && !domains.length) return true;
  const e = String(email || '').trim().toLowerCase();
  return emails.includes(e) || domains.includes(e.split('@')[1]);
}

export const NOT_ALLOWED = 'This email has no access to the QR Bill dashboard. Ask Headswap to add it.';
