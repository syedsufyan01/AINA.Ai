import { Router } from 'express';
import { directoryService } from '../services/directoryService.js';
import { analyticsService } from '../services/analyticsService.js';

const router = Router();

// Get directory listings with category and search filter
router.get('/', (req, res, next) => {
  try {
    const { category, search } = req.query;
    const items = directoryService.getAll(category, search);

    if (search) {
      analyticsService.recordEvent('directory_search', category, 'en', { search });
    }

    res.json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
});

// Get directory category counts
router.get('/categories', (req, res, next) => {
  try {
    const categories = directoryService.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (err) {
    next(err);
  }
});

// Get single helpline by ID
router.get('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const item = directoryService.getById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HELPLINE_NOT_FOUND',
          message: `Directory item with ID ${id} was not found.`
        }
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (err) {
    next(err);
  }
});

export default router;
