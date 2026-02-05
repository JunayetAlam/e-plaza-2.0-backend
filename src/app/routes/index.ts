import express from 'express';
import { UserRouters } from '../modules/User/user.routes';
// import { MessageRouters } from '../modules/Messages/message.route';
import { NotificationsRouters } from '../modules/Notification/notification.route';
import { AssetRouters } from '../modules/Asset/asset.route';
import { AuthByOtpRouters } from '../modules/AuthByOtp/auth.routes';
import { PaymentRoutes } from '../modules/Payment/payment.route';
import { OrderRouters } from '../modules/Order/order.route';
const router = express.Router();

const moduleRoutes = [
  // {
  //   path: '/auth',
  //   route: AuthRouters,
  // },
  {
    path: '/auth',
    route: AuthByOtpRouters,
  },
  {
    path: '/users',
    route: UserRouters,
  },
  {
    path: '/orders',
    route: OrderRouters,
  },
  // {
  //   path: '/messages',
  //   route: MessageRouters,
  // },
  {
    path: '/notifications',
    route: NotificationsRouters,
  },
  {
    path: '/assets',
    route: AssetRouters,
  },


  {
    path: '/payments',
    route: PaymentRoutes,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
