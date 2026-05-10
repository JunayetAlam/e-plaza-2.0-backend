import httpStatus from 'http-status';

import { prisma } from '../../utils/prisma';

import sendResponse from '../../utils/sendResponse';

import catchAsync from '../../utils/catchAsync';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';

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

const getSingleFilter = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await prisma.filter.findUnique({
    where: { id, isDeleted: false },
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Filter retrieved successfully',
    data: result,
  });
});

const updateFilter = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await prisma.filter.update({
    where: { id },
    data: req.body,
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Filter updated successfully',
    data: result,
  });
});

const deleteFilter = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await prisma.filter.update({
    where: { id },
    data: { isDeleted: true },
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Filter deleted successfully',
    data: result,
  });
});

const toggleStatus = catchAsync(async (req, res) => {
  const { id } = req.params;

  // First fetch the filter to get current status
  const existingFilter = await prisma.filter.findUnique({
    where: { id, isDeleted: false },
  });

  if (!existingFilter) {
    throw new AppError(httpStatus.NOT_FOUND, 'Filter not found');
  }

  const result = await prisma.filter.update({
    where: { id },
    data: { isActive: !existingFilter.isActive },
  });
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Filter status toggled successfully',
    data: result,
  });
});

export const FilterService = {
  createFilter,
  getAllFilters,
  getSingleFilter,
  updateFilter,
  deleteFilter,
  toggleStatus,
};
