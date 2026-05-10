import express from 'express';
import { FilterService } from './filter.service';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post('/', auth('SUPERADMIN'), FilterService.createFilter);
router.patch('/:id', auth('SUPERADMIN'), FilterService.updateFilter);
router.patch(
  '/toggle-status/:id',
  auth('SUPERADMIN'),
  FilterService.toggleStatus,
);
router.delete('/:id', auth('SUPERADMIN'), FilterService.deleteFilter);
router.get('/', auth('OPTIONAL'), FilterService.getAllFilters);
router.get('/:id', auth('SUPERADMIN'), FilterService.getSingleFilter);

export const FilterRoutes = router;
