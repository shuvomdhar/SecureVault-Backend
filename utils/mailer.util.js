import nodemailer from 'nodemailer';

/**
 * Creates a Nodemailer transporter using available credentials:
 *   1. Gmail App Password (recommended — never expires)
 *   2. Generic SMTP (Brevo, SendGrid, Mailgun, etc.)
 *   3. Gmail OAuth2 (fallback, subject to token expiry)
 */
const getTransporter = () => {
  const user = (process.env.GOOGLE_USER || process.env.SMTP_USER || '').trim().replace(/['"]/g, '');

  // Strategy 1: Gmail App Password (simple, reliable SMTP)
  const appPassword = (process.env.GOOGLE_APP_PASSWORD || '').trim().replace(/['"]/g, '');
  if (user && appPassword) {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user,
          pass: appPassword.replace(/\s+/g, ''), // handle passwords with or without spaces
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });
      return { transporter, type: 'Gmail App Password (SMTP)' };
    } catch (err) {
      console.error('❌ Error creating Gmail App Password transporter:', err.message);
    }
  }

  // Strategy 2: Generic SMTP
  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();
  if (smtpHost && user && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: {
          user,
          pass: smtpPass,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });
      return { transporter, type: `SMTP (${smtpHost})` };
    } catch (err) {
      console.error('❌ Error creating generic SMTP transporter:', err.message);
    }
  }

  // Strategy 3: Gmail OAuth2
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim().replace(/['"]/g, '');
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim().replace(/['"]/g, '');
  const refreshToken = (process.env.GOOGLE_REFRESH_TOKEN || '').trim().replace(/['"]/g, '');

  if (user && clientId && clientSecret && refreshToken) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user,
          clientId,
          clientSecret,
          refreshToken,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });
      return { transporter, type: 'Gmail OAuth2' };
    } catch (err) {
      console.error('❌ Error creating Gmail OAuth2 transporter:', err.message);
    }
  }

  return null;
};

/**
 * Send OTP verification email to user.
 * Dispatches email quickly or falls back gracefully without blocking login/signup.
 */
export const sendOTPEmail = async (toEmail, otpCode, purpose = 'Verification') => {
  const mailerInfo = getTransporter();
  const cleanSender = (process.env.GOOGLE_USER || process.env.SMTP_USER || 'no-reply@securevault.com')
    .trim()
    .replace(/['"]/g, '');

  console.log(`\n========================================`);
  console.log(`🔑 [SecureVault OTP Service]`);
  console.log(`Recipient: ${toEmail}`);
  console.log(`Purpose  : ${purpose}`);
  console.log(`OTP CODE : >>> ${otpCode} <<<`);
  console.log(`Transport: ${mailerInfo ? mailerInfo.type : 'Simulation Fallback'}`);
  console.log(`========================================\n`);

  if (!mailerInfo) {
    console.warn('⚠️ No email credentials configured. Returning OTP in response for testing/demo.');
    return { success: true, emailSent: false, simulated: true, otp: otpCode };
  }

  const mailOptions = {
    from: `"SecureVault Security" <${cleanSender}>`,
    to: toEmail,
    subject: `🔐 Your SecureVault Verification Code: ${otpCode}`,
    text: `Your SecureVault OTP Code is ${otpCode}. Please use this code to verify your action (${purpose}). Valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #6d28d9; text-align: center;">🔐 SecureVault Security Verification</h2>
        <p style="font-size: 16px; color: #374151;">Hello,</p>
        <p style="font-size: 16px; color: #374151;">Your verification code for <strong>${purpose}</strong> is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #6d28d9; background: #f3e8ff; padding: 12px 24px; border-radius: 8px;">${otpCode}</span>
        </div>
        <p style="font-size: 14px; color: #6b7280;">This OTP is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">SecureVault - Secret Storage & Password Manager</p>
      </div>
    `,
  };

  try {
    const info = await mailerInfo.transporter.sendMail(mailOptions);
    console.log('✅ OTP Email dispatched successfully via %s! MessageId: %s', mailerInfo.type, info.messageId);
    return { success: true, emailSent: true, simulated: false };
  } catch (error) {
    console.error(`❌ Failed to send OTP email via ${mailerInfo.type}:`, error.message);
    console.warn('⚠️ Falling back to demo mode so user authentication is not blocked.');
    // Return simulated: true with OTP so user can still complete verification
    return { success: true, emailSent: false, simulated: true, otp: otpCode, error: error.message };
  }
};
