import { verifyToken } from '../utils/jwt.util.js';
import User from '../models/User.model.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
    }

    const user = await User.findById(decoded.id).select('-password -otpCode -otpExpires');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User belonging to this token no longer exists' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ success: false, message: 'Account is unverified. OTP verification required.', unverified: true, email: user.email });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
