import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET_TOKEN;
const EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '7d';

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
