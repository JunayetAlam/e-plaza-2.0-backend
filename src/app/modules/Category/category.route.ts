import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryService } from './category.service';
import { CategoryValidation } from './category.validation';
import { uploadMiddleware } from '../Upload/upload.middleware';

const router = express.Router();

router.post(
    '/',
    auth('SUPERADMIN'),
    uploadMiddleware.single('file'),
    validateRequest.body(CategoryValidation.createCategoryValidation),
    CategoryService.createCategory,
);

router.get(
    '/',
    auth('OPTIONAL'),
    CategoryService.getAllCategory,
);

router.get(
    '/:id',
    auth('OPTIONAL'),
    CategoryService.getSingleCategory,
);

router.put(
    '/:id',
    auth('SUPERADMIN'),
    uploadMiddleware.single('file'),
    validateRequest.body(CategoryValidation.createCategoryValidation),
    CategoryService.updateCategory,
);

router.put(
    '/status/:id',
    auth('SUPERADMIN'),
    CategoryService.toggleStatusCategory,
);

router.delete(
    '/:id',
    auth('SUPERADMIN'),
    CategoryService.toggleDeleteCategory,
);

export const CategoryRouters = router;
