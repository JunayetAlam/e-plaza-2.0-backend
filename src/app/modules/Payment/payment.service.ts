import httpStatus from 'http-status';
import { prisma } from '../../utils/prisma';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';

const getAllPayments = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;
  const query = req.query;

  if (role !== 'SUPERADMIN') {
    query.userId = userId;
  }

  const paymentQuery = new QueryBuilder<typeof prisma.payment>(
    prisma.payment,
    query,
  );
  const result = await paymentQuery
    .search(['user.name', 'user.email', 'stripePaymentId', 'stripeSessionId'])
    .filter()
    .sort()
    .select({
      id: true,
      amount: true,
      userId: true,
      cardBrand: true,
      paymentType: true,
      createdAt: true,
      user: {
        select: {
          profilePhoto: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      transactionId: true,
      bankTransactionId: true,
      cardIssuer: true,
      cardIssuerCountry: true,
      cardType: true,
      currency: true,
      status: true,
      type: true,
      order: {
        select: {
          id: true,
          clientInfo: true,
          totalPrice: true,
        },
      },
    })
    .exclude()
    .paginate()
    .execute();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payments retrieved successfully',
    data: result,
  });
});

const singleTransactionHistory = catchAsync(async (req, res) => {
  const query = {
    id: req.params.id,
    ...(req.user.role !== 'SUPERADMIN' && { userId: req.user.id }),
  };

  const result = await prisma.payment.findUnique({
    where: query,
    select: {
      id: true,
      amount: true,
      userId: true,
      cardBrand: true,
      paymentType: true,
      createdAt: true,
      user: {
        select: {
          profilePhoto: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      transactionId: true,
      bankTransactionId: true,
      cardIssuer: true,
      cardIssuerCountry: true,
      cardType: true,
      currency: true,
      status: true,
      type: true,
      order: {
        select: {
          id: true,
          clientInfo: true,
          totalPrice: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Transaction history not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Transaction history retrieved successfully',
    data: result,
  });
});

const singleTransactionHistoryBySessionId = catchAsync(async (req, res) => {
  const query = {
    sessionId: req.params.sessionId,
    ...(req.user.role !== 'SUPERADMIN' && { userId: req.user.id }),
  };

  const result = await prisma.payment.findUnique({
    where: query,
    select: {
      id: true,
      amount: true,
      userId: true,
      cardBrand: true,
      paymentType: true,
      createdAt: true,
      user: {
        select: {
          profilePhoto: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      transactionId: true,
      bankTransactionId: true,
      cardIssuer: true,
      cardIssuerCountry: true,
      cardType: true,
      currency: true,
      status: true,
      type: true,
      order: {
        select: {
          id: true,
          clientInfo: true,
          totalPrice: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'Transaction history not found');
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Transaction history retrieved successfully by sessionId',
    data: result,
  });
});

const cancelPayment = catchAsync(async (req, res) => {
  const id = req.params.id;
  const userId = req.user.id;
  const role = req.user.role;

  const result = await prisma.payment.update({
    where: {
      id,
      ...(role !== 'SUPERADMIN' && { userId }),
    },
    data: {
      status: 'CANCELLED',
    },
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Payment cancelled successfully',
    data: result,
  });
});

export const PaymentServices = {
  getAllPayments,
  singleTransactionHistory,
  singleTransactionHistoryBySessionId,
  cancelPayment,
};
