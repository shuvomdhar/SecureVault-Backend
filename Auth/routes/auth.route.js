import express from 'express';
import {
  register,
  login,
  googleAuth,
  verifyOTP,
  resendOTP,
  getMe,
} from '../controllers/auth.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', protect, getMe);

export default router;
