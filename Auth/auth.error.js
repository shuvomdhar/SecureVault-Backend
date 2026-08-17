export const AuthErrors = {

  USER_NOT_FOUND: {
    code: 'USR001',
    message: 'User not found with provided credentials',
    httpCode: 404,
  },

  INVALID_PASSWORD: {
    code: 'USR002',
    message: 'Invalid email or password',
    httpCode: 401,
  },

  EMAIL_ALREADY_EXISTS: {
    code: 'USR003',
    message: 'An account with this email already exists',
    httpCode: 409,
  },

  INVALID_OTP: {
    code: 'OTP001',
    message: 'Invalid or expired OTP verification code',
    httpCode: 400,
  },

  OTP_EXPIRED: {
    code: 'OTP002',
    message: 'OTP code has expired. Please request a new code.',
    httpCode: 400,
  },

  UNAUTHORIZED: {
    code: 'AUTH001',
    message: 'Unauthorized access',
    httpCode: 401,
  },

};