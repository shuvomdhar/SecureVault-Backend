import nodemailer from 'nodemailer';

const getTransporter = () => {
  const user = (process.env.GOOGLE_USER || '').trim().replace(/['"]/g, '');
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim().replace(/['"]/g, '');
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim().replace(/['"]/g, '');
  const refreshToken = (process.env.GOOGLE_REFRESH_TOKEN || '').trim().replace(/['"]/g, '');

  if (!user || !clientId || !clientSecret || !refreshToken) {
    console.warn('⚠️ Mailer configuration incomplete. Email sending will run in fallback simulation mode.');
    return null;
  }

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
    });

    return transporter;
  } catch (err) {
    console.error('❌ Error creating Nodemailer transporter:', err.message);
    return null;
  }
};

/**
 * Send OTP verification email to user
 */
export const sendOTPEmail = async (toEmail, otpCode, purpose = 'Verification') => {
  const transporter = getTransporter();
  const cleanSender = (process.env.GOOGLE_USER || 'no-reply@securevault.com').trim().replace(/['"]/g, '');

  console.log(`\n========================================`);
  console.log(`🔑 [SecureVault OTP Service]`);
  console.log(`Recipient: ${toEmail}`);
  console.log(`Purpose  : ${purpose}`);
  console.log(`OTP CODE : >>> ${otpCode} <<<`);
  console.log(`========================================\n`);

  if (!transporter) {
    return { success: true, simulated: true, otp: otpCode };
  }

  const mailOptions = {
    from: `"SecureVault Security" <${cleanSender}>`,
    to: toEmail,
    subject: `🔐 Your SecureVault Verification Code: ${otpCode}`,
    text: `Your SecureVault OTP Code is ${otpCode}. Please use this code to verify your action (${purpose}).`,
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
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email dispatched via Gmail OAuth2! MessageId: %s', info.messageId);
    return { success: true, simulated: false, otp: otpCode };
  } catch (error) {
    console.error('❌ Failed to send email via Nodemailer:', error.message);
    return { success: true, simulated: true, otp: otpCode, error: error.message };
  }
};
