import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { prisma } from '../../utils/prisma';
import sendResponse from '../../utils/sendResponse';
import { Product, UserRoleEnum } from '@prisma/client';
import {
  checkCategoryAndSubCategory,
  manageProductImages,
  manageProductIndex,
  manageProductSlug,
} from './product.utils';
import QueryBuilder from '../../builder/QueryBuilder';
import { deleteMultiple, uploadMultiple } from '../Asset/asset.utils';
import AppError from '../../errors/AppError';

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
      images,
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

  if (payload.title) {
    const slug = await manageProductSlug(payload.title, id);
    payload.slug = slug;
  }

  await checkCategoryAndSubCategory(payload.categoryId, payload.subCategoryId);

  const result = await prisma.product.update({
    where: {
      id,
      isDeleted: false,
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

const getAllProduct = catchAsync(async (req, res) => {
  const query = (req.query || {}) as Record<string, unknown>;
  const role = req?.user?.role as UserRoleEnum;

  if (role === UserRoleEnum.SUPERADMIN) {
    if (query.deletedProduct === 'true') {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
    }
  } else {
    query.isDeleted = false;
  }
  delete query.deletedProduct;

  const productBuilder = new QueryBuilder(prisma.product, query);
  const result = await productBuilder
    .search(['title', 'brand', 'slug', 'category.title', 'subCategory.title'])
    .select({
      id: true,
      title: true,
      slug: true,
      brand: true,
      price: true,
      mainImage: true,
      isStock: true,
      isTop: true,
      isDeleted: true,
    })
    .filter()
    .sort()
    .paginate()
    .exclude()
    .execute();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Products fetched successfully',
    ...result,
  });
});

const getSingleProduct = catchAsync(async (req, res) => {
  const id = req.params.id;

  const result = await prisma.product.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      category: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
      subCategory: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product fetched successfully',
    data: result,
  });
});

const toggleDeleteProduct = catchAsync(async (req, res) => {
  const id = req.params.id;

  const product = await prisma.product.findUniqueOrThrow({
    where: { id },
  });

  const result = await prisma.product.update({
    where: { id },
    data: {
      isDeleted: !product.isDeleted,
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product delete status toggled successfully',
    data: result,
  });
});

const toggleStockProduct = catchAsync(async (req, res) => {
  const id = req.params.id;

  const product = await prisma.product.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.product.update({
    where: { id },
    data: {
      isStock: !product.isStock,
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product stock status toggled successfully',
    data: result,
  });
});

const toggleTopProduct = catchAsync(async (req, res) => {
  const id = req.params.id;

  const product = await prisma.product.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.product.update({
    where: { id },
    data: {
      isTop: !product.isTop,
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product top status toggled successfully',
    data: result,
  });
});

const deleteProductImages = catchAsync(async (req, res) => {
  const id = req.params.id;
  const images = req.body.images;

  const product = await prisma.product.findUniqueOrThrow({
    where: { id },
  });

  const newImages = product.images.filter(image => !images.includes(image));
  const mainImage = newImages[0];

  const result = await prisma.product.update({
    where: { id },
    data: {
      images: newImages,
      mainImage: mainImage,
    },
  });

  deleteMultiple(images);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product images deleted successfully',
    data: result,
  });
});

const updateProductImages = catchAsync(async (req, res) => {
  const id = req.params.id;
  const images = req.body.images;
  const result = await prisma.product.update({
    where: { id },
    data: {
      images: images,
      mainImage: images[0],
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product images updated successfully',
    data: result,
  });
});

const addImages = catchAsync(async (req, res) => {
  const id = req.params.id;
  const product = await prisma.product.findUniqueOrThrow({
    where: { id, isDeleted: false },
  });
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No files uploaded');
  }
  const images = await uploadMultiple(files);
  const urls = images.map(image => image.url);
  const result = await prisma.product.update({
    where: { id },
    data: {
      images: [...product.images, ...urls],
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Product images added successfully',
    data: result,
  });
});

export const ProductService = {
  createProduct,
  updateProduct,
  getAllProduct,
  getSingleProduct,
  toggleDeleteProduct,
  toggleStockProduct,
  toggleTopProduct,
  addImages,
  deleteProductImages,
  updateProductImages,
};
