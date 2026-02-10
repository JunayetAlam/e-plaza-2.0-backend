import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ProductService } from './product.service';
import { ProductValidation } from './product.validation';
import { uploadMiddleware } from '../Upload/upload.middleware';

const router = express.Router();

router.post(
    '/',
    auth('SUPERADMIN'),
    uploadMiddleware.array('files', { maxFiles: 10 }),
    validateRequest.body(ProductValidation.createProductValidation),
    ProductService.createProduct,
);

router.get(
    '/',
    auth('OPTIONAL'),
    ProductService.getAllProduct,
);

router.get(
    '/:id',
    auth('OPTIONAL'),
    ProductService.getSingleProduct,
);

router.put(
    '/:id',
    auth('SUPERADMIN'),
    validateRequest.body(ProductValidation.updateProductValidation),
    ProductService.updateProduct,
);

router.put(
    '/stock/:id',
    auth('SUPERADMIN'),
    ProductService.toggleStockProduct,
);

router.put(
    '/top/:id',
    auth('SUPERADMIN'),
    ProductService.toggleTopProduct,
);

router.delete(
    '/:id',
    auth('SUPERADMIN'),

    ProductService.toggleDeleteProduct,
);

router.post(
    '/images/:id',
    auth('SUPERADMIN'),
    uploadMiddleware.array('files', { maxFiles: 10 }),
    ProductService.addImages,
);

router.delete(
    '/images/:id',
    auth('SUPERADMIN'),
    validateRequest.body(ProductValidation.urlsSchema),
    ProductService.deleteProductImages,
);

router.put(
    '/images/:id',
    auth('SUPERADMIN'),
    validateRequest.body(ProductValidation.urlsSchema),
    ProductService.updateProductImages,
);

export const ProductRoutes = router;
