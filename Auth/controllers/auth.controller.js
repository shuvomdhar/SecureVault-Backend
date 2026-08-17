import {
  registerUser,
  loginUser,
  googleAuthUser,
  verifyOTPCode,
  resendOTPCode,
} from '../services/auth.services.js';
import {
  validateRegisterInput,
  validateLoginInput,
  validateOTPInput,
} from '../validators/auth.validator.js';

export const register = async (req, res) => {
  try {
    const { isValid, errors } = validateRegisterInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const result = await registerUser(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { isValid, errors } = validateLoginInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const result = await loginUser(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { email, name, googleId, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account email is required' });
    }

    const result = await googleAuthUser({ email, name, googleId, avatar });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { isValid, errors } = validateOTPInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }

    const result = await verifyOTPCode(req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const result = await resendOTPCode({ email });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
