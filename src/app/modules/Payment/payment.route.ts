import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { PaymentValidation } from './payment.validation';
import { PaymentServices } from './payment.service';

const router = express.Router();




// Payment history and management
router.get('/', auth('ANY'), PaymentServices.getAllPayments);

router.get('/:id', auth('ANY'), PaymentServices.singleTransactionHistory);

router.get('/session/:sessionId', auth('ANY'), PaymentServices.singleTransactionHistoryBySessionId);

router.patch('/:id/cancel', auth('ANY'), PaymentServices.cancelPayment);



export const PaymentRoutes = router;