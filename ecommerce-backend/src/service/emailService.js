const nodemailer = require('nodemailer');

// Setup the connection to Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your gmail
    pass: process.env.EMAIL_PASS  // Your 16-character App Password
  }
});

// The function your AuthController will call
exports.sendVerificationEmail = async (email, token) => {
  // We use backticks (`) so we can use ${variable} syntax
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: '"TECHSHOP" <noreply@techshop.com>',
    to: email,
    subject: 'Confirm your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;"> 
        <h2 style="color: #2563eb;">Welcome to TECHSHOP!</h2> 
        <p>Thank you for signing up. Please verify your email by clicking the button below:</p> 
        <div style="text-align: center; margin: 30px 0;"> 
          <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a> 
        </div> 
        <p style="font-size: 12px; color: #666;">If the button does not work, copy and paste this link: <br/> 
          <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
        </p> 
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};