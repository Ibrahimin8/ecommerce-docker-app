'use strict';

/**
 * Sends a verification email using the Brevo REST API v3.
 * This method is the most reliable for Render.com hosting.
 */
exports.sendVerificationEmail = async (email, token) => {
  const apiKey = process.env.BREVO_API_KEY;
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  // 1. Prepare the email payload
  const emailPayload = {
    sender: { 
      name: "TECHSHOP", 
      email: "ibrahimin8@gmail.com" // This must be your verified Brevo sender email
    },
    to: [{ email: email }],
    subject: "Verify Your Account - TECHSHOP",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; color: #1e293b;">
        <h2 style="color: #2563eb; text-align: center;">Welcome to TECHSHOP!</h2>
        <p>Thank you for signing up. To complete your registration and secure your account, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 35px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            Verify Email Address
          </a>
        </div>
        
        <p style="font-size: 14px; line-height: 1.6;">
          If the button doesn't work, copy and paste this link into your browser: <br/>
          <a href="${verificationUrl}" style="color: #2563eb; word-break: break-all;">${verificationUrl}</a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 11px; color: #64748b; text-align: center;">
          This is an automated message from TECHSHOP. If you did not create an account, please ignore this email.
        </p>
      </div>
    `
  };

  try {
    // 2. Make the API request using built-in fetch
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": apiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify(emailPayload)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success: Email sent via Brevo API. Message ID:', result.messageId);
      return { success: true, messageId: result.messageId };
    } else {
      // Log the exact error from Brevo for debugging
      console.error('❌ Brevo API Error:', result.message || JSON.stringify(result));
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('❌ Network Error (Brevo API):', error.message);
    return { success: false, error: error.message };
  }
};