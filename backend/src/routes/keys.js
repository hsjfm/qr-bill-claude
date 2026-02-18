import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import pool from '../db.js';
import { jwtAuth } from '../middleware/jwtAuth.js';

const router = Router();

router.use(jwtAuth);

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, key_prefix, created_at, last_used_at
       FROM api_keys
       WHERE user_id = $1 AND revoked = false
       ORDER BY created_at DESC`,
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('List keys error:', err);
    res.status(500).json({ error: 'Failed to fetch keys' });
  }
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Key name required' });
  }

  const rawKey = crypto.randomBytes(32).toString('hex');
  const prefix = rawKey.slice(0, 8);
  const keyHash = await bcrypt.hash(rawKey, 10);

  try {
    const { rows } = await pool.query(
      `INSERT INTO api_keys (user_id, name, key_prefix, key_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, key_prefix, created_at`,
      [req.userId, name.trim(), prefix, keyHash]
    );

    res.status(201).json({
      ...rows[0],
      key: rawKey,
      warning: 'Save this key now — it will not be shown again.',
    });
  } catch (err) {
    console.error('Create key error:', err);
    res.status(500).json({ error: 'Failed to create key' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { rowCount } = await pool.query(
      `UPDATE api_keys SET revoked = true
       WHERE id = $1 AND user_id = $2 AND revoked = false`,
      [req.params.id, req.userId]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: 'Key not found' });
    }
    res.json({ message: 'Key revoked' });
  } catch (err) {
    console.error('Revoke key error:', err);
    res.status(500).json({ error: 'Failed to revoke key' });
  }
});

export default router;
