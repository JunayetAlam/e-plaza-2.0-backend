import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import AppError from '../../errors/AppError';
import sendResponse from '../../utils/sendResponse';
import { Order, OrderedProduct, OrderStatus, PaymentStatus } from '@prisma/client';
import { prisma } from '../../utils/prisma';
import { analyzeProduct, createOrderSessionId, createOrderTransactionId } from './order.utils';
import QueryBuilder from '../../builder/QueryBuilder';

const createOrderForCashOnDelivery = catchAsync(async (req, res) => {
    const payload = req.body as Omit<Order, 'products' | 'deliveryCharge'> & { products: { productId: string, quantity: number, }[], isInside: boolean };
    const userId = req?.user?.id;

    if (userId) {
        payload.userId = userId;
    }

    const { err, totalPrice, orderProducts } = await analyzeProduct(payload.products);

    if (err.length > 0) {
        sendResponse(res, {
            statusCode: httpStatus.BAD_REQUEST,
            message: 'Something went wrong!',
            data: err,
        });
        return;
    } else {
        const transactionId = createOrderTransactionId();
        const sessionId = createOrderSessionId();
        const deliveryCharge = payload.isInside ? 60 : 120;

        const createOrder = await prisma.order.create({
            data: {
                transactionId,
                totalPrice: totalPrice + deliveryCharge,
                products: orderProducts,
                clientInfo: payload.clientInfo,
                deliveryCharge: deliveryCharge,
                ...(userId ? { userId } : {}),
                payment: {
                    create: {
                        transactionId,
                        sessionId,
                        amount: totalPrice + deliveryCharge,
                        paymentType: 'CASH_ON_DELIVERY',
                        type: "ORDER",
                        ...(userId ? { userId } : {}),
                    }
                }
            },
            include: {
                payment: true,
            }
        });

        sendResponse(res, {
            statusCode: httpStatus.OK,
            message: 'Order created successfully',
            data: createOrder,
        });
    }
});

const getAllOrders = catchAsync(async (req, res) => {
    const user = req.user;
    const query: Record<string, unknown> = req.query;

    // const isMe = query?.isMe ? true : false;

    if (user.role !== 'SUPERADMIN') {
        query.userId = user.id;
    }

    const ordersQuery = new QueryBuilder<typeof prisma.order>(prisma.order, query);
    const result = await ordersQuery
        .search(['transactionId', 'sessionId', 'clientInfo.name', 'clientInfo.phoneNumber', 'clientInfo.email', 'clientInfo.address'])
        .filter()
        .sort()
        .paginate()
        .execute();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Orders retrieved successfully',
        ...result
    });
});

const getSingleOrder = catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    const whereCondition: any = { id };

    if (user.role !== 'SUPERADMIN') {
        whereCondition.userId = user.id;
    }

    const result = await prisma.order.findUniqueOrThrow({
        where: whereCondition,
        include: {
            payment: true,
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                }
            }
        }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Order retrieved successfully',
        data: result,
    });
});

const updateOrder = catchAsync(async (req, res) => {
    const { id } = req.params;
    const payload = req.body;
    const user = req.user;

    const whereCondition: any = { id };
    whereCondition.isDeleted = false;

    if (user.role !== 'SUPERADMIN') {
        whereCondition.userId = user.id;
        whereCondition.isArchived = false;
        whereCondition.status = OrderStatus.PENDING;
    }

    await prisma.order.findUniqueOrThrow({
        where: whereCondition,
    });


    let updateData: any = {
        clientInfo: payload.clientInfo,
        deliveryCharge: payload.isInside ? 60 : 120,
    }

    let TotalPrice: null | number = null;

    if (payload.products) {
        const { err, totalPrice, orderProducts } = await analyzeProduct(payload.products);
        if (err.length > 0) {
            sendResponse(res, {
                statusCode: httpStatus.BAD_REQUEST,
                message: 'Something went wrong!',
                data: err,
            });
            return;
        } else {
            updateData.totalPrice = totalPrice;
            updateData.products = orderProducts;
            TotalPrice = totalPrice;
        }
    }

    const result = await prisma.order.update({
        where: { id },
        data: {
            ...updateData,
            ...(TotalPrice && { totalPrice: TotalPrice + updateData.deliveryCharge, payment: { update: { amount: TotalPrice + updateData.deliveryCharge } } }),
        },
        include: {
            payment: true,
        }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Order updated successfully',
        data: result,
    });
});

const updateOrderStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid order status');
    }

    const result = await prisma.order.update({
        where: { id },
        data: { status },
        select: {
            id: true,
            status: true,
            transactionId: true,
            totalPrice: true,
        }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Order status updated successfully',
        data: result,
    });
});

const updatePaymentStatus = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(PaymentStatus).includes(status)) {
        throw new AppError(httpStatus.BAD_REQUEST, 'Invalid payment status');
    }

    const order = await prisma.order.findUniqueOrThrow({
        where: { id },
        include: { payment: true }
    });

    if (!order.payment) {
        throw new AppError(httpStatus.NOT_FOUND, 'Payment not found for this order');
    }

    const result = await prisma.payment.update({
        where: { orderId: id },
        data: { status },
        select: {
            id: true,
            status: true,
            transactionId: true,
            amount: true,
            paymentType: true,
        }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Payment status updated successfully',
        data: result,
    });
});

const archiveOrder = catchAsync(async (req, res) => {
    const { id } = req.params;

    const order = await prisma.order.findUniqueOrThrow({
        where: { id, isDeleted: false },
    });

    if (order.userId !== req.user.id) {
        throw new AppError(httpStatus.FORBIDDEN, 'You are not authorized to archive this order');
    }

    await prisma.order.update({
        where: { id },
        data: { isArchived: true }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Order archived successfully',
        data: { message: 'Order archived successfully' },
    });
});

const deleteOrder = catchAsync(async (req, res) => {
    const { id } = req.params;

    const order = await prisma.order.findUniqueOrThrow({
        where: { id },
        include: { payment: true }
    });

    await prisma.order.update({
        where: { id },
        data: { isDeleted: true }
    });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Order deleted successfully',
        data: { message: 'Order deleted successfully' },
    });
});

export const OrderService = {
    createOrderForCashOnDelivery,
    getAllOrders,
    getSingleOrder,
    updateOrder,
    updateOrderStatus,
    updatePaymentStatus,
    archiveOrder,
    deleteOrder,
};