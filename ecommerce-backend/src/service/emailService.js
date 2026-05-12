'use strict';
const nodemailer = require('nodemailer');

/**
 * Configure the Brevo SMTP Transporter
 * Forces IPv4 to ensure compatibility with Render's network
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // Use STARTTLS for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  // --- CRITICAL NETWORK FIX FOR RENDER ---
  family: 4, // Forces IPv4 to avoid ENETUNREACH errors
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000
});

/**
 * Sends a verification email to any recipient
 */
exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: '"TECHSHOP" <noreply@techshop.com>',
    to: email,
    subject: 'Confirm your Email Address - TECHSHOP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;"> 
        <h2 style="color: #2563eb;">Welcome to TECHSHOP!</h2> 
        <p>Thank you for signing up. Please verify your email by clicking the button below to activate your account:</p> 
        <div style="text-align: center; margin: 30px 0;"> 
          <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a> 
        </div> 
        <p style="font-size: 12px; color: #666;">If the button does not work, copy and paste this link: <br/> 
          <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
        </p> 
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999;">This is an automated system message. Please do not reply.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully via Brevo:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Brevo SMTP Error:', error.message);
    // Log detailed error for troubleshooting
    if (error.code === 'EAUTH') {
      console.error('Check your SMTP_USER and SMTP_PASS (API Key)');
    }
    return { success: false, error: error.message };
  }
};