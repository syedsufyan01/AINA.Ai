import { Router } from 'express';
import { z } from 'zod';
import { analyticsService } from '../services/analyticsService.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// Get aggregated platform statistics
router.get('/overview', (req, res, next) => {
  try {
    const overview = analyticsService.getOverview();
    res.json({
      success: true,
      data: overview
    });
  } catch (err) {
    next(err);
  }
});

const eventSchema = z.object({
  eventType: z.string().min(2),
  category: z.string().optional(),
  language: z.string().default('en'),
  meta: z.any().optional()
});

// Telemetry event logging
router.post('/event', validate(eventSchema), (req, res, next) => {
  try {
    const { eventType, category, language, meta } = req.body;
    analyticsService.recordEvent(eventType, category, language, meta);
    res.json({
      success: true,
      message: 'Event recorded.'
    });
  } catch (err) {
    next(err);
  }
});

export default router;
