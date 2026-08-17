export const validateRegisterInput = ({ name, email, password }) => {
  const errors = [];
  if (!name || name.trim().length === 0) errors.push('Name is required');
  if (!email || !/\S+@\S+\.\S+/.test(email)) errors.push('A valid email is required');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters long');
  return { isValid: errors.length === 0, errors };
};

export const validateLoginInput = ({ email, password }) => {
  const errors = [];
  if (!email || !/\S+@\S+\.\S+/.test(email)) errors.push('A valid email is required');
  if (!password) errors.push('Password is required');
  return { isValid: errors.length === 0, errors };
};

export const validateOTPInput = ({ email, otp }) => {
  const errors = [];
  if (!email || !/\S+@\S+\.\S+/.test(email)) errors.push('Email is required');
  if (!otp || String(otp).trim().length !== 6) errors.push('OTP must be a 6-digit code');
  return { isValid: errors.length === 0, errors };
};
