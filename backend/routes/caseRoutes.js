import { Router } from 'express';
import { z } from 'zod';
import { caseService } from '../services/caseService.js';
import { analyticsService } from '../services/analyticsService.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createCaseSchema = z.object({
  category: z.string().default('utilities'),
  severity: z.string().default('Medium'),
  title: z.string().min(3, 'Title is required and must be at least 3 characters.'),
  description: z.string().optional().default(''),
  authorityName: z.string().optional().default('Relevant Competent Authority'),
  authorityNameUr: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['draft', 'filed', 'diary_assigned', 'under_investigation', 'hearing_scheduled', 'resolved', 'escalated']).default('draft'),
  diaryNumber: z.string().optional(),
  applicantName: z.string().min(2, 'Applicant name is required.'),
  applicantCnic: z.string().optional(),
  applicantPhone: z.string().optional(),
  applicantAddress: z.string().optional(),
  referenceId: z.string().optional(),
  draftEn: z.any().optional(),
  draftUr: z.any().optional(),
  roadmap: z.any().optional(),
  statutoryDays: z.string().optional(),
  legalAct: z.string().optional(),
  escalationOfficer: z.string().optional()
});

// Create new case / save complaint draft
router.post('/', validate(createCaseSchema), async (req, res, next) => {
  try {
    const createdCase = caseService.createCase(req.body);

    analyticsService.recordEvent('case_created', req.body.category, 'en', {
      trackingId: createdCase.tracking_id,
      status: createdCase.status
    });

    res.status(201).json({
      success: true,
      message: `Case successfully created. Use tracking ID '${createdCase.tracking_id}' to monitor progress.`,
      data: createdCase
    });
  } catch (err) {
    next(err);
  }
});

// Search and list cases
router.get('/', (req, res, next) => {
  try {
    const { trackingId, category, status, query, limit, offset } = req.query;
    const cases = caseService.searchCases({
      trackingId,
      category,
      status,
      query,
      limit: limit ? parseInt(limit, 10) : 20,
      offset: offset ? parseInt(offset, 10) : 0
    });

    res.json({
      success: true,
      count: cases.length,
      data: cases
    });
  } catch (err) {
    next(err);
  }
});

// Get case by tracking code (e.g. AINA-PK-2026-X8F2)
router.get('/:trackingId', (req, res, next) => {
  try {
    const trackingId = req.params.trackingId.trim();
    const caseData = caseService.getCaseByTrackingId(trackingId);

    if (!caseData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CASE_NOT_FOUND',
          message: `No grievance case found with tracking code '${trackingId}'. Please check your code.`
        }
      });
    }

    res.json({
      success: true,
      data: caseData
    });
  } catch (err) {
    next(err);
  }
});

const updateStatusSchema = z.object({
  status: z.enum(['draft', 'filed', 'diary_assigned', 'under_investigation', 'hearing_scheduled', 'resolved', 'escalated']).optional(),
  diaryNumber: z.string().optional(),
  note: z.string().optional(),
  officer: z.string().optional()
});

// Update case status / assign receiving diary number
router.patch('/:trackingId/status', validate(updateStatusSchema), (req, res, next) => {
  try {
    const trackingId = req.params.trackingId.trim();
    const updated = caseService.updateStatus(trackingId, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CASE_NOT_FOUND',
          message: `Cannot update. No grievance case found with tracking code '${trackingId}'.`
        }
      });
    }

    res.json({
      success: true,
      message: 'Case status updated successfully.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

const addMilestoneSchema = z.object({
  stage: z.string().min(2, 'Stage name is required.'),
  note: z.string().min(3, 'Milestone note description is required.'),
  officer: z.string().optional()
});

// Add timeline event
router.post('/:trackingId/timeline', validate(addMilestoneSchema), (req, res, next) => {
  try {
    const trackingId = req.params.trackingId.trim();
    const updated = caseService.addTimelineMilestone(trackingId, req.body);

    if (!updated) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CASE_NOT_FOUND',
          message: `Cannot add milestone. No grievance case found with tracking code '${trackingId}'.`
        }
      });
    }

    res.json({
      success: true,
      message: 'Milestone added to case timeline.',
      data: updated
    });
  } catch (err) {
    next(err);
  }
});

// Export formatted petition
router.get('/:trackingId/export', (req, res, next) => {
  try {
    const trackingId = req.params.trackingId.trim();
    const lang = req.query.lang === 'ur' ? 'ur' : 'en';
    const petitionText = caseService.exportFormattedPetition(trackingId, lang);

    if (!petitionText) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CASE_NOT_FOUND',
          message: `No petition found for tracking ID '${trackingId}'.`
        }
      });
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(petitionText);
  } catch (err) {
    next(err);
  }
});

export default router;
