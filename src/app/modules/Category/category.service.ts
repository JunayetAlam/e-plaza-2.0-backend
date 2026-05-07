import httpStatus from 'http-status';
import { prisma } from '../../utils/prisma';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import { deleteSingle, uploadSingle } from '../Asset/asset.utils';
import { Category, UserRoleEnum } from '@prisma/client';
import { checkTitleAndSlug, manageIndex } from './category.utils';
import QueryBuilder from '../../builder/QueryBuilder';

const createCategory = catchAsync(async (req, res) => {
  const payload = req.body as Category;
  const imageFiles = req.file as Express.Multer.File | undefined;
  // name cant be duplicate
  if (!imageFiles) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Image is required');
  }
  const slug = await checkTitleAndSlug(payload.title);
  const imageUrl = await uploadSingle(imageFiles);
  payload.image = imageUrl.url;
  const index = await manageIndex();

  const result = await prisma.category.create({
    data: {
      title: payload.title,
      slug: slug,
      image: imageUrl.url,
      index: index,
    },
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category created successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const payload = req.body as Partial<Category>;
  const id = req.params.id;
  const imageFiles = req.file as Express.Multer.File | undefined;
  let newImageUrls: string | null = null;
  const isCategoryExist = await prisma.category.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (payload.title) {
    payload.slug = await checkTitleAndSlug(payload.title, id);
  }

  if (imageFiles) {
    const imageUrl = await uploadSingle(imageFiles);
    if (imageUrl.url) {
      payload.image = imageUrl.url;
      newImageUrls = imageUrl.url;
    }
  }

  const result = await prisma.category.update({
    where: {
      id,
      isDeleted: false,
    },
    data: {
      ...payload,
    },
  });

  if (newImageUrls) {
    deleteSingle(isCategoryExist.image);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category updated successfully',
    data: result,
  });
});

const getAllCategory = catchAsync(async (req, res) => {
  const query = (req.query || {}) as Record<string, unknown>;
  const role = req?.user?.role as UserRoleEnum;
  let includeSubCategory = false;
  if (query.includeSubCategory === 'true') {
    includeSubCategory = true;
    delete query.includeSubCategory;
  }
  if (role === UserRoleEnum.SUPERADMIN) {
    if (query.deletedCategory === 'true') {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
    }
  } else {
    query.isDeleted = false;
    query.isActive = true;
  }
  delete query.deletedCategory;

  const categoryBuilder = new QueryBuilder(prisma.category, query);
  const result = await categoryBuilder
    .search(['title'])
    .filter()
    .select({
      id: true,
      title: true,
      slug: true,
      image: true,
      ...(includeSubCategory && {
        subCategories: {
          where: {
            isDeleted: false,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            categoryId: true,
            image: true,
          },
        },
      }),
    })
    .sort()
    .paginate()
    .exclude()
    .execute();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category fetched successfully',
    ...result,
  });
});

const getSingleCategory = catchAsync(async (req, res) => {
  const id = req.params.id;
  const includeSubCategory = req?.query?.includeSubCategory === 'true';
  const result = await prisma.category.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      image: true,
      ...(includeSubCategory && {
        subCategories: {
          where: {
            isDeleted: false,
          },
          select: {
            id: true,
            title: true,
            slug: true,
            categoryId: true,
            image: true,
          },
        },
      }),
    },
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category fetched successfully',
    data: result,
  });
});

const toggleDeleteCategory = catchAsync(async (req, res) => {
  const id = req.params.id;
  const category = await prisma.category.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const result = await prisma.category.update({
    where: {
      id,
    },
    data: {
      isDeleted: !category.isDeleted,
    },
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category deleted successfully',
    data: result,
  });
});

const toggleStatusCategory = catchAsync(async (req, res) => {
  const id = req.params.id;
  const category = await prisma.category.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });
  const result = await prisma.category.update({
    where: {
      id,
    },
    data: {
      isActive: !category.isActive,
    },
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Category status updated successfully',
    data: result,
  });
});

export const CategoryService = {
  createCategory,
  updateCategory,
  getAllCategory,
  getSingleCategory,
  toggleDeleteCategory,
  toggleStatusCategory,
};
