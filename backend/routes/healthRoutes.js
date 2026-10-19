import { Router } from 'express';
import db from '../config/db.js';
import { env } from '../config/env.js';

const router = Router();
const startTime = Date.now();

router.get('/', (req, res) => {
  let dbStatus = 'healthy';
  try {
    db.prepare('SELECT 1').get();
  } catch (err) {
    dbStatus = `unhealthy: ${err.message}`;
  }

  res.json({
    success: true,
    status: 'online',
    system: 'AINA (AI National Assistant) Backend API',
    version: '1.0.0',
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: {
      type: 'SQLite (node:sqlite WAL mode)',
      status: dbStatus
    },
    aiProvider: {
      geminiConfigured: Boolean(env.GEMINI_API_KEY),
      model: env.GEMINI_MODEL,
      fallbackMatrix: 'Active (Built-in Pakistani Civic Rule Engine)'
    }
  });
});

export default router;
