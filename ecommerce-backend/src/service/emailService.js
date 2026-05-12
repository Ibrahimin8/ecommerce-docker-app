'use strict';

/**
 * Sends a verification email via Brevo's REST API.
 * Bypasses Render's SMTP block by using standard Port 443.
 */
exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  
  const payload = {
    sender: { name: "TECHSHOP", email: "ibrahimin8@gmail.com" }, // Must be your Brevo login email
    to: [{ email: email }],
    subject: "Confirm your Email Address - TECHSHOP",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;"> 
        <h2 style="color: #2563eb;">Welcome to TECHSHOP!</h2> 
        <p>Thank you for signing up. Please verify your email by clicking the button below:</p> 
        <div style="text-align: center; margin: 30px 0;"> 
          <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a> 
        </div> 
        <p style="font-size: 12px; color: #666;">If the button doesn't work, copy and paste this link: <br/> 
          <a href="${verificationUrl}" style="color: #2563eb;">${verificationUrl}</a>
        </p> 
      </div>
    `
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Brevo API Error Detail:', JSON.stringify(result, null, 2));
      return { success: false, error: result };
    }

    console.log('✅ Email sent successfully via API ID:', result.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Network Error (Brevo API):', error.message);
    return { success: false, error: error.message };
  }
};