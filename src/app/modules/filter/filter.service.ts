import httpStatus from 'http-status';

import { prisma } from '../../utils/prisma';

import sendResponse from '../../utils/sendResponse';

import catchAsync from '../../utils/catchAsync';
import QueryBuilder from '../../builder/QueryBuilder';

const createFilter = catchAsync(async (req, res) => {
  const { name } = req.body;
  const result = await prisma.filter.create({
    data: { name },
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Filter created successfully',
    data: result,
  });
});

const getAllFilters = catchAsync(async (req, res) => {
  const user = req.user;

  if (!user || !['SUPERADMIN'].includes(user.role)) {
    req.query.isDeleted = 'false';
    req.query.isActive = 'true';
  }
  const filterQuery = new QueryBuilder(prisma.filter, req.query, {
    isDeleted: 'boolean',
    isActive: 'boolean',
  });

  const result = await filterQuery
    .search(['name', 'filterProducts.product.title'])
    .filter()
    .sort()
    .paginate()
    .execute();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Filters retrieved successfully',
    ...result,
  });
});

export const FilterService = {
  createFilter,
  getAllFilters,
};
