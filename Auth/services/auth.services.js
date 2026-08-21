import bcrypt from 'bcryptjs';
import User from '../../models/User.model.js';
import { generateToken } from '../../utils/jwt.util.js';
import { sendOTPEmail } from '../../utils/mailer.util.js';
import { AuthErrors } from '../auth.error.js';

/**
 * Helper to generate 6-digit OTP code
 */
export const generateOTPCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Register a new user with email and password
 */
export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    if (existingUser.isVerified) {
      throw new Error(AuthErrors.EMAIL_ALREADY_EXISTS.message);
    }
    // If account exists but unverified, update details and resend OTP
    const salt = await bcrypt.genSalt(10);
    existingUser.password = await bcrypt.hash(password, salt);
    existingUser.name = name;
    
    const otp = generateOTPCode();
    existingUser.otpCode = otp;
    existingUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await existingUser.save();
    
    const emailRes = await sendOTPEmail(existingUser.email, otp, 'Account Verification');
    return {
      message: emailRes.emailSent 
        ? 'Account details updated. Verification OTP sent to your email.'
        : 'Account details updated. Verification OTP generated.',
      email: existingUser.email,
      requiresOTP: true,
      ...(emailRes.simulated ? { otp } : {}),
    };
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const otp = generateOTPCode();

  const newUser = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    isVerified: false,
    otpCode: otp,
    otpExpires: new Date(Date.now() + 10 * 60 * 1000),
  });

  const emailRes = await sendOTPEmail(newUser.email, otp, 'Account Verification');

  return {
    message: emailRes.emailSent
      ? 'User registered successfully. Verification OTP sent to your email.'
      : 'User registered successfully. Verification OTP generated.',
    email: newUser.email,
    requiresOTP: true,
    ...(emailRes.simulated ? { otp } : {}),
  };
};

/**
 * Initiate Login with Email & Password (Triggers OTP Verification)
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error(AuthErrors.INVALID_PASSWORD.message);
  }

  if (user.googleId && !user.password) {
    throw new Error('This account was registered using Google. Please log in using Google OAuth.');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error(AuthErrors.INVALID_PASSWORD.message);
  }

  // Generate OTP for login verification
  const otp = generateOTPCode();
  user.otpCode = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  user.pendingSession = true;
  await user.save();

  const emailRes = await sendOTPEmail(user.email, otp, 'Login Verification');

  return {
    message: emailRes.emailSent
      ? 'Login credentials accepted. OTP sent to your email for verification.'
      : 'Login credentials accepted. OTP generated for verification.',
    email: user.email,
    requiresOTP: true,
    ...(emailRes.simulated ? { otp } : {}),
  };
};

/**
 * Handle Google Auth Signup/Login
 */
export const googleAuthUser = async ({ email, name, googleId, avatar }) => {
  let user = await User.findOne({ email: email.toLowerCase() });

  const otp = generateOTPCode();

  if (!user) {
    // Create new user via Google
    user = await User.create({
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      googleId: googleId || `google_${Date.now()}`,
      avatar: avatar || '',
      isVerified: false,
      otpCode: otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000),
      pendingSession: true,
    });
  } else {
    if (!user.googleId) {
      user.googleId = googleId || `google_${Date.now()}`;
    }
    if (avatar) user.avatar = avatar;
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.pendingSession = true;
    await user.save();
  }

  const emailRes = await sendOTPEmail(user.email, otp, 'Google Login Verification');

  return {
    message: emailRes.emailSent
      ? 'Google authentication successful. OTP sent to your email for verification.'
      : 'Google authentication successful. OTP generated for verification.',
    email: user.email,
    requiresOTP: true,
    ...(emailRes.simulated ? { otp } : {}),
  };
};

/**
 * Verify OTP code and return auth token
 */
export const verifyOTPCode = async ({ email, otp }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error(AuthErrors.USER_NOT_FOUND.message);
  }

  if (!user.otpCode || user.otpCode !== String(otp).trim()) {
    throw new Error(AuthErrors.INVALID_OTP.message);
  }

  if (new Date() > new Date(user.otpExpires)) {
    throw new Error(AuthErrors.OTP_EXPIRED.message);
  }

  // Clear OTP fields & set verified
  user.isVerified = true;
  user.otpCode = null;
  user.otpExpires = null;
  user.pendingSession = false;
  await user.save();

  const token = generateToken({ id: user._id, email: user.email });

  return {
    message: 'OTP verified successfully!',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
  };
};

/**
 * Resend OTP Code
 */
export const resendOTPCode = async ({ email }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error(AuthErrors.USER_NOT_FOUND.message);
  }

  const otp = generateOTPCode();
  user.otpCode = otp;
  user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  const emailRes = await sendOTPEmail(user.email, otp, 'Resend OTP');

  return {
    message: emailRes.emailSent
      ? 'A fresh OTP code has been dispatched to your email.'
      : 'A fresh OTP code has been generated.',
    email: user.email,
    ...(emailRes.simulated ? { otp } : {}),
  };
};
