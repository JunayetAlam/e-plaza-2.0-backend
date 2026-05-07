import httpStatus from 'http-status';

import { prisma } from '../../utils/prisma';

import sendResponse from '../../utils/sendResponse';

import catchAsync from '../../utils/catchAsync';

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
  const result = await prisma.filter.findMany();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Filters retrieved successfully',
    data: result,
  });
});

export const FilterService = {
  createFilter,
  getAllFilters,
};
