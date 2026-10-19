import { Router } from 'express';
import { z } from 'zod';
import { aiService } from '../services/aiService.js';
import { analyticsService } from '../services/analyticsService.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const diagnoseSchema = z.object({
  input: z.string().min(3, 'Issue description must be at least 3 characters long.'),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  context: z.record(z.string(), z.any()).optional()
});

router.post('/diagnose', validate(diagnoseSchema), async (req, res, next) => {
  try {
    const { input, apiKey, model, context } = req.body;
    const clientHeaderKey = req.headers['x-gemini-api-key'];
    const effectiveKey = apiKey || (typeof clientHeaderKey === 'string' ? clientHeaderKey : '');

    const result = await aiService.diagnose(input, {
      apiKey: effectiveKey,
      model,
      context
    });

    // Telemetry tracking
    analyticsService.recordEvent('diagnosis', result.category, aiService.detectLanguage(input), {
      severity: result.severity,
      source: result.source
    });

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
});

const draftSchema = z.object({
  category: z.string().default('utilities'),
  input: z.string().optional().default(''),
  docLang: z.enum(['en', 'ur']).default('en')
});

router.post('/draft', validate(draftSchema), async (req, res, next) => {
  try {
    const { category, input, docLang } = req.body;
    const draft = aiService.generateComplaintLetter(category, input, docLang);

    res.json({
      success: true,
      data: draft
    });
  } catch (err) {
    next(err);
  }
});

export default router;
