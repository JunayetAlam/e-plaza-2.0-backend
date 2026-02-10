import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { prisma } from '../../utils/prisma';
import sendResponse from '../../utils/sendResponse';
import { Product } from '@prisma/client';
import { checkCategoryAndSubCategory, manageProductImages, manageProductIndex, manageProductSlug } from './product.utils';

const createProduct = catchAsync(async (req, res) => {
    const payload = req.body as Product;
    const imageFiles = req.files as Express.Multer.File[];

    await checkCategoryAndSubCategory(payload.categoryId, payload.subCategoryId);
    const slug = await manageProductSlug(payload.title);
    const index = await manageProductIndex();
    const { mainImage, images } = await manageProductImages(imageFiles);

    const result = await prisma.product.create({
        data: {
            ...payload,
            index,
            slug,
            mainImage,
            images
        },
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product created successfully',
        data: result,
    });
});

const updateProduct = catchAsync(async (req, res) => {
    const payload = req.body as Partial<Product>;
    const id = req.params.id;

    // set slug 

    if (payload.title) {
        const slug = await manageProductSlug(payload.title, id);
        payload.slug = slug;
    }

    await checkCategoryAndSubCategory(payload.categoryId, payload.subCategoryId);

    const result = await prisma.product.update({
        where: {
            id,
            isDeleted: false
        },
        data: {
            ...payload,
        },
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Product updated successfully',
        data: result,
    });
});



export const ProductService = {
    createProduct
};
