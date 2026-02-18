import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initDb } from './db.js';
import authRouter from './routes/auth.js';
import keysRouter from './routes/keys.js';
import qrRouter from './routes/qr.js';

const app = express();
const PORT = process.env.PORT || 3001;

let dbReady = false;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Health check responds immediately — even before DB is connected
// so Railway's healthcheck passes on cold start
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', db: dbReady ? 'connected' : 'connecting', version: '1.0.0' });
});

app.use('/api/auth', authRouter);
app.use('/api/keys', keysRouter);
app.use('/api', qrRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// Start HTTP server immediately — healthcheck will pass right away
app.listen(PORT, () => {
  console.log(`QR Bill API listening on port ${PORT}`);
});

// Initialise DB asynchronously with retry — server stays up regardless
async function initDbWithRetry() {
  try {
    await initDb();
    dbReady = true;
    console.log('Database schema ready');
  } catch (err) {
    console.error('DB init failed, retrying in 5s:', err.message);
    setTimeout(initDbWithRetry, 5000);
  }
}

initDbWithRetry();
