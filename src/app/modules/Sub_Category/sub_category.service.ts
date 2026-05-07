import httpStatus from 'http-status';
import { prisma } from '../../utils/prisma';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import { deleteSingle, uploadSingle } from '../Asset/asset.utils';
import { SubCategory, UserRoleEnum } from '@prisma/client';
import { checkSubCategoryTitleAndSlug } from './sub_category.utils';
import QueryBuilder from '../../builder/QueryBuilder';

const createSubCategory = catchAsync(async (req, res) => {
  const payload = req.body as SubCategory;
  const imageFiles = req.file as Express.Multer.File | undefined;

  // Check if category exists
  await prisma.category.findUniqueOrThrow({
    where: {
      id: payload.categoryId,
      isDeleted: false,
    },
  });

  const slug = await checkSubCategoryTitleAndSlug(payload.title);
  const imageUrl = imageFiles ? (await uploadSingle(imageFiles)).url : '';

  payload.image = imageUrl;

  const result = await prisma.subCategory.create({
    data: {
      title: payload.title,
      slug: slug,
      image: imageUrl,
      categoryId: payload.categoryId,
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'SubCategory created successfully',
    data: result,
  });
});

const updateSubCategory = catchAsync(async (req, res) => {
  const payload = req.body as Partial<SubCategory>;
  const id = req.params.id;
  const imageFiles = req.file as Express.Multer.File | undefined;
  let newImageUrls: string | null = null;

  const isSubCategoryExist = await prisma.subCategory.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (payload.title) {
    payload.slug = await checkSubCategoryTitleAndSlug(payload.title, id);
  }

  if (payload.categoryId) {
    await prisma.category.findUniqueOrThrow({
      where: {
        id: payload.categoryId,
        isDeleted: false,
      },
    });
  }

  if (imageFiles) {
    const imageUrl = await uploadSingle(imageFiles);
    if (imageUrl.url) {
      payload.image = imageUrl.url;
      newImageUrls = imageUrl.url;
    }
  }

  const result = await prisma.subCategory.update({
    where: {
      id,
      isDeleted: false,
    },
    data: {
      ...payload,
    },
  });

  if (newImageUrls) {
    deleteSingle(isSubCategoryExist.image);
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'SubCategory updated successfully',
    data: result,
  });
});

const getAllSubCategory = catchAsync(async (req, res) => {
  const query = (req.query || {}) as Record<string, unknown>;
  const role = req?.user?.role as UserRoleEnum;

  if (role === UserRoleEnum.SUPERADMIN) {
    if (query.deletedSubCategory === 'true') {
      query.isDeleted = true;
    } else {
      query.isDeleted = false;
    }
  } else {
    query.isDeleted = false;
    query.isActive = true;
  }
  delete query.deletedSubCategory;

  const subCategoryBuilder = new QueryBuilder(prisma.subCategory, query);
  const result = await subCategoryBuilder
    .search(['title', 'category.title', 'slug', 'category.slug'])
    .select({
      id: true,
      title: true,
      slug: true,
      image: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          title: true,
          slug: true,
          image: true,
        },
      },
    })
    .filter()
    .sort()
    .paginate()
    .exclude()
    .execute();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'SubCategories fetched successfully',
    ...result,
  });
});

const getSingleSubCategory = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await prisma.subCategory.findUniqueOrThrow({
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
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'SubCategory fetched successfully',
    data: result,
  });
});

const toggleDeleteSubCategory = catchAsync(async (req, res) => {
  const id = req.params.id;
  const subCategory = await prisma.subCategory.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const result = await prisma.subCategory.update({
    where: {
      id,
    },
    data: {
      isDeleted: !subCategory.isDeleted,
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'SubCategory deleted status toggled successfully',
    data: result,
  });
});

const toggleStatusSubCategory = catchAsync(async (req, res) => {
  const id = req.params.id;
  const subCategory = await prisma.subCategory.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  const result = await prisma.subCategory.update({
    where: {
      id,
    },
    data: {
      isActive: !subCategory.isActive,
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'SubCategory status toggled successfully',
    data: result,
  });
});

export const SubCategoryService = {
  createSubCategory,
  updateSubCategory,
  getAllSubCategory,
  getSingleSubCategory,
  toggleDeleteSubCategory,
  toggleStatusSubCategory,
};
