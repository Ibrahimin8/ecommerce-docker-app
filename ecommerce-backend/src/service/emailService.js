const { Resend } = require('resend');

/**
 * Initialize Resend with your API Key
 * Note: No need for SMTP ports or 'family: 4' settings here.
 */
const resend = new Resend(process.env.RESEND_API_KEY);

exports.sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  try {
    const { data, error } = await resend.emails.send({
      // While in testing/onboarding, you MUST use this 'from' address
      from: 'TechShop <onboarding@resend.dev>', 
      to: email,
      subject: 'Confirm your Email Address',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
          <h2 style="color: #2563eb;">Welcome to TECHSHOP!</h2>
          <p>Click the button below to verify your account and start shopping:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="font-size: 12px; color: #666;">
            If the button fails, copy this link: <br/>
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
        </div>
      `
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
      return;
    }

    console.log('✅ Email sent successfully via Resend API ID:', data.id);
  } catch (err) {
    console.error('❌ Unexpected Email Error:', err.message);
  }
};