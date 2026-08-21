import nodemailer from 'nodemailer';

/**
 * Creates primary and fallback transporters for sending emails.
 * Port 587 STARTTLS is the cloud-friendly standard (works seamlessly across Render, AWS, GCP).
 */
const createGmailTransporter = (user, appPassword) => {
  const cleanPass = appPassword.replace(/\s+/g, '');
  
  // Strategy 1 (Primary for Cloud): Port 587 STARTTLS
  const smtp587 = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user,
      pass: cleanPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  // Strategy 2 (Fallback): Port 465 Direct SSL
  const smtp465 = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass: cleanPass,
    },
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });

  return { smtp587, smtp465 };
};

/**
 * Send OTP verification email to user.
 */
export const sendOTPEmail = async (toEmail, otpCode, purpose = 'Verification') => {
  const user = (process.env.GOOGLE_USER || 'shuvomdhar8@gmail.com').trim().replace(/['"]/g, '');
  const appPassword = (process.env.GOOGLE_APP_PASSWORD || '').trim().replace(/['"]/g, '');

  console.log(`\n========================================`);
  console.log(`🔑 [SecureVault OTP Service]`);
  console.log(`Sender   : ${user}`);
  console.log(`Recipient: ${toEmail}`);
  console.log(`Purpose  : ${purpose}`);
  console.log(`OTP CODE : >>> ${otpCode} <<<`);
  console.log(`========================================\n`);

  if (!appPassword) {
    console.warn('⚠️ GOOGLE_APP_PASSWORD is not set in environment.');
    return { success: false, emailSent: false };
  }

  const { smtp587, smtp465 } = createGmailTransporter(user, appPassword);

  const mailOptions = {
    from: `"SecureVault Security" <${user}>`,
    to: toEmail,
    subject: `🔐 Your SecureVault Verification Code: ${otpCode}`,
    text: `Your SecureVault OTP Code is ${otpCode}. Please use this code to verify your action (${purpose}). Valid for 10 minutes.`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 16px; background: linear-gradient(135deg, #7c3aed, #4f46e5); color: #ffffff; font-size: 28px; font-weight: bold; text-align: center;">
            🔐
          </div>
          <h2 style="color: #0f172a; margin-top: 16px; margin-bottom: 4px; font-size: 22px; font-weight: 700;">Account Verification</h2>
          <p style="color: #64748b; font-size: 14px; margin: 0;">SecureVault Authentication Service</p>
        </div>
        
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">Hello,</p>
        <p style="font-size: 15px; color: #334155; line-height: 1.6;">You requested a verification code for <strong>${purpose}</strong>. Use the code below to complete your authentication:</p>
        
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #6d28d9; background: #f5f3ff; border: 1px solid #ddd6fe; padding: 14px 32px; border-radius: 12px;">
            ${otpCode}
          </div>
        </div>
        
        <p style="font-size: 13px; color: #64748b; text-align: center;">This code will expire in <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">SecureVault &bull; End-to-End Encrypted Password Manager</p>
      </div>
    `,
  };

  // Attempt 1: Port 587 STARTTLS (best for cloud providers)
  try {
    const info = await smtp587.sendMail(mailOptions);
    console.log('✅ OTP Email dispatched via Port 587 STARTTLS! MessageId: %s', info.messageId);
    return { success: true, emailSent: true };
  } catch (err587) {
    console.warn('⚠️ Port 587 attempt failed (%s). Retrying via Port 465 SSL...', err587.message);
  }

  // Attempt 2: Port 465 SSL
  try {
    const info = await smtp465.sendMail(mailOptions);
    console.log('✅ OTP Email dispatched via Port 465 SSL! MessageId: %s', info.messageId);
    return { success: true, emailSent: true };
  } catch (err465) {
    console.error('❌ Both Port 587 and Port 465 failed. Error:', err465.message);
    return { success: false, emailSent: false, error: err465.message };
  }
};
