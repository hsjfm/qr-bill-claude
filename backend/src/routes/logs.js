import { Router } from 'express';
import { jwtAuth } from '../middleware/jwtAuth.js';
import pool from '../db.js';

const router = Router();

// GET /api/logs — returns the last 200 log entries for the authenticated user
router.get('/logs', jwtAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         l.id,
         l.method,
         l.path,
         l.status_code,
         l.duration_ms,
         l.ip,
         l.created_at,
         k.name AS key_name,
         k.key_prefix
       FROM api_logs l
       LEFT JOIN api_keys k ON k.id = l.api_key_id
       WHERE l.user_id = $1
       ORDER BY l.created_at DESC
       LIMIT 200`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Logs fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET /api/logs/stats — summary counts for the dashboard overview
router.get('/logs/stats', jwtAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*)                                             AS total_calls,
         COUNT(*) FILTER (WHERE status_code = 200)           AS successful_calls,
         COUNT(*) FILTER (WHERE status_code != 200)          AS failed_calls,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') AS calls_today,
         COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')  AS calls_this_month,
         ROUND(AVG(duration_ms))                             AS avg_duration_ms
       FROM api_logs
       WHERE user_id = $1`,
      [req.userId]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('Logs stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
