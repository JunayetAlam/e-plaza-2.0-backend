import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { authValidation } from './auth.validation';
import auth from '../../middlewares/auth';
import { AuthServices } from './auth.service';

const router = express.Router();

router.post(
  '/login',
  validateRequest.body(authValidation.loginUser),
  AuthServices.loginUser
);

router.post(
  '/register',
  validateRequest.body(authValidation.registerUser),
  AuthServices.registerUser
);
router.post(
  '/refresh-token',
  auth('ANY'),
  AuthServices.refreshToken
);

router.post(
  '/verify-email',
  validateRequest.body(authValidation.verifyEmail),
  AuthServices.verifyEmail
);

router.post(
  '/resend-verification-otp',
  validateRequest.body(authValidation.resendOtp),
  AuthServices.resendVerificationOtpToNumber
);

router.patch(
  '/change-password',
  auth('ANY'),
  validateRequest.body(authValidation.changePassword),
  AuthServices.changePassword
);

router.post(
  '/forget-password',
  validateRequest.body(authValidation.forgetPassword),
  AuthServices.forgetPassword
);

router.post(
  '/verify-forgot-password-otp',
  validateRequest.body(authValidation.verifyForgotOtp),
  AuthServices.verifyForgotPassOtp
);

router.post(
  '/reset-password',
  validateRequest.body(authValidation.resetPassword),
  AuthServices.resetPassword
);

export const AuthByOtpRouters = router;