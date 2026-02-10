import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { OrderService } from './order.service';
import { setMe } from '../../middlewares/setMe';
import { OrderValidation } from './order.validation';

const router = express.Router();

router.post(
    '/cash-on-delivery',
    auth('OPTIONAL'),
    validateRequest.body(OrderValidation.createOrderForCashOnDeliveryValidation),
    OrderService.createOrderForCashOnDelivery,
);

router.get(
    '/admin',
    auth('ANY'),
    OrderService.getAllOrders,
);
router.get(
    '/',
    auth('ANY'),
    setMe,
    OrderService.getAllOrders,
);

router.get(
    '/:id',
    auth('OPTIONAL'),
    OrderService.getSingleOrder,
);

router.put(
    '/:id',
    auth('ANY'),
    validateRequest.body(OrderValidation.updateOrderValidation),
    OrderService.updateOrder,
);

router.put(
    '/status/:id',
    auth('SUPERADMIN'),
    validateRequest.body(OrderValidation.updateOrderStatusValidation),
    OrderService.updateOrderStatus,
);

router.put(
    '/payment-status/:id',
    auth('SUPERADMIN'),
    validateRequest.body(OrderValidation.updatePaymentStatusValidation),
    OrderService.updatePaymentStatus,
);

router.put(
    '/archive/:id',
    auth('ANY'),
    OrderService.archiveOrder,
);

router.delete(
    '/:id',
    auth('SUPERADMIN'),
    OrderService.deleteOrder,
);

export const OrderRouters = router;
