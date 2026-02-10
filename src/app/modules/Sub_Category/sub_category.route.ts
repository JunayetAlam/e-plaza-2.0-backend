import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { SubCategoryService } from './sub_category.service';
import { SubCategoryValidation } from './sub_category.validation';
import { uploadMiddleware } from '../Upload/upload.middleware';

const router = express.Router();

router.post(
    '/',
    auth('SUPERADMIN'),
    uploadMiddleware.single('file'),
    validateRequest.body(SubCategoryValidation.createSubCategoryValidation),
    SubCategoryService.createSubCategory,
);

router.get(
    '/',
    auth('OPTIONAL'),
    SubCategoryService.getAllSubCategory,
);

router.get(
    '/:id',
    auth('OPTIONAL'),
    SubCategoryService.getSingleSubCategory,
);

router.put(
    '/:id',
    auth('SUPERADMIN'),
    uploadMiddleware.single('file'),
    validateRequest.body(SubCategoryValidation.updateSubCategoryValidation),
    SubCategoryService.updateSubCategory,
);

router.put(
    '/status/:id',
    auth('SUPERADMIN'),
    SubCategoryService.toggleStatusSubCategory,
);

router.delete(
    '/:id',
    auth('SUPERADMIN'),
    SubCategoryService.toggleDeleteSubCategory,
);

export const SubCategoryRoutes = router;
