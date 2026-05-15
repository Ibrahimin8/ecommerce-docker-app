'use strict';

/**
 * Sends a password reset OTP email using the Brevo REST API v3.
 */
const sendEmail = async (options) => {
  const apiKey = process.env.BREVO_API_KEY;

  const emailPayload = {
    sender: { 
      name: "TECHSHOP Support", 
      email: process.env.SENDER_EMAIL || "ibrahimin8@gmail.com" 
    },
    to: [{ email: options.email }],
    subject: options.subject,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 25px; border-radius: 12px; color: #1e293b;">
        <h2 style="color: #2563eb; text-align: center;">Password Reset Code</h2>
        <p>Hello,</p>
        <p>You requested a password reset. Please use the following 6-digit verification code to complete the process:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; background: #f1f5f9; padding: 10px 20px; border-radius: 8px; border: 1px dashed #cbd5e1;">
            ${options.otp || options.message.match(/\d{6}/)}
          </span>
        </div>
        
        <p style="font-size: 14px; color: #64748b;">This code is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">
          Sent by TECHSHOP Security Team
        </p>
      </div>
    `
  };

  try {
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
      console.log('✅ Success: Reset OTP sent via Brevo REST API.');
      return { success: true, messageId: result.messageId };
    } else {
      console.error('❌ Brevo API Error:', result.message || JSON.stringify(result));
      throw new Error(result.message || "Email delivery failed");
    }
  } catch (error) {
    console.error('❌ Network Error (Brevo API):', error.message);
    throw error;
  }
};

module.exports = sendEmail;