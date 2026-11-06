import jwt from 'jsonwebtoken';
import pool from '../db.js';
import { isAllowedEmail, NOT_ALLOWED } from '../access.js';

// A dashboard token lasts 30 days, so the allowlist is checked on every
// request: removing someone takes effect at once, not when their token expires.
export async function jwtAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  let payload;
  try {
    payload = jwt.verify(authHeader.slice(7), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    const { rows } = await pool.query('SELECT email FROM users WHERE id = $1', [payload.sub]);
    if (!rows[0]) return res.status(401).json({ error: 'Invalid or expired token' });
    if (!isAllowedEmail(rows[0].email)) return res.status(403).json({ error: NOT_ALLOWED });
  } catch (err) {
    console.error('JWT auth error:', err);
    return res.status(500).json({ error: 'Authentication error' });
  }

  req.userId = payload.sub;
  next();
}
