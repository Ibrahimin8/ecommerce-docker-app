const { Resend } = require('resend');

// Initialize Resend with the key from your .env
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'TechShop <onboarding@resend.dev>', // Required for Resend free tier
      to: email,
      subject: 'Confirm your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 15px;"> 
          <h2 style="color: #2563eb;">Welcome to TECHSHOP!</h2> 
          <p>Please verify your email by clicking the button below:</p> 
          <div style="text-align: center; margin: 30px 0;"> 
            <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 15px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a> 
          </div> 
          <p style="font-size: 12px; color: #666;">Link: <a href="${verificationUrl}">${verificationUrl}</a></p> 
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend Error:', error);
      return { success: false };
    }

    console.log('✅ Email sent. ID:', data.id);
    return { success: true };
  } catch (err) {
    console.error('❌ Email Service Crash:', err.message);
    return { success: false };
  }
};