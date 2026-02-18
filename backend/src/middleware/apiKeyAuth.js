import bcrypt from 'bcrypt';
import pool from '../db.js';

export async function apiKeyAuth(req, res, next) {
  const rawKey = req.headers['x-api-key'];
  if (!rawKey) {
    return res.status(401).json({ error: 'X-Api-Key header required' });
  }

  const prefix = rawKey.slice(0, 8);

  try {
    const { rows } = await pool.query(
      `SELECT id, user_id, key_hash FROM api_keys
       WHERE key_prefix = $1 AND revoked = false`,
      [prefix]
    );

    let matched = null;
    for (const row of rows) {
      if (await bcrypt.compare(rawKey, row.key_hash)) {
        matched = row;
        break;
      }
    }

    if (!matched) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    await pool.query(
      'UPDATE api_keys SET last_used_at = NOW() WHERE id = $1',
      [matched.id]
    );

    req.userId = matched.user_id;
    req.apiKeyId = matched.id;
    next();
  } catch (err) {
    console.error('API key auth error:', err);
    res.status(500).json({ error: 'Authentication error' });
  }
}
