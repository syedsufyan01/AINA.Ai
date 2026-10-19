import { Router } from 'express';
import { lawsService } from '../services/lawsService.js';

const router = Router();

// Get list of Pakistani laws and rights
router.get('/', (req, res, next) => {
  try {
    const { category, query } = req.query;
    const statutes = lawsService.getAll(category, query);

    res.json({
      success: true,
      count: statutes.length,
      data: statutes
    });
  } catch (err) {
    next(err);
  }
});

// Get single law by ID
router.get('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const statute = lawsService.getById(id);

    if (!statute) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STATUTE_NOT_FOUND',
          message: `Legal statute with ID ${id} was not found.`
        }
      });
    }

    res.json({
      success: true,
      data: statute
    });
  } catch (err) {
    next(err);
  }
});

export default router;
