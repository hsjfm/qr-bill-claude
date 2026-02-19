import pool from '../db.js';

/**
 * Express middleware that logs every authenticated API request to api_logs.
 * Must be used AFTER apiKeyAuth so req.userId and req.apiKeyId are set.
 *
 * Captures: user, key, method, path, status code, duration, IP.
 */
export function requestLogger(req, res, next) {
  const startedAt = Date.now();

  // Fire after the response has been sent
  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      null;

    // Fire-and-forget — never block the response
    pool.query(
      `INSERT INTO api_logs
         (user_id, api_key_id, method, path, status_code, duration_ms, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        req.userId   ?? null,
        req.apiKeyId ?? null,
        req.method,
        req.path,
        res.statusCode,
        durationMs,
        ip,
      ]
    ).catch(err => console.error('Failed to write api_log:', err.message));
  });

  next();
}
