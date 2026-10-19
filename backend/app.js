import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import directoryRoutes from './routes/directoryRoutes.js';
import lawsRoutes from './routes/lawsRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

const app = express();

// Security and utility middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-api-key'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

// API Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AINA (AI National Assistant) Backend API',
    tagline: 'قومی معاون برائے شہری امور • NYLP AI Hackathon 2026',
    status: 'operational',
    endpoints: {
      health: '/api/health',
      aiDiagnose: 'POST /api/ai/diagnose',
      aiDraft: 'POST /api/ai/draft',
      cases: '/api/cases',
      caseTracking: '/api/cases/:trackingId',
      directory: '/api/directory',
      laws: '/api/laws',
      analytics: '/api/analytics/overview'
    }
  });
});

// Mount modular API routers
app.use('/api/health', healthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/laws', lawsRoutes);
app.use('/api/analytics', analyticsRoutes);

// Catch 404 and forward to error handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
