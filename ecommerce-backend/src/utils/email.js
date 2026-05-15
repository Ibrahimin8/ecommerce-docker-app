const Brevo = require('@getbrevo/brevo');

const sendEmail = async (options) => {
  // 1. Create the API instance using the correct constructor name
  let apiInstance = new Brevo.TransactionalEmailsApi();

  // 2. Configure the API Key
  let apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  // 3. Create the email object
  let sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.textContent = options.message;
  sendSmtpEmail.sender = { 
    name: "TechShop Support", 
    email: process.env.SENDER_EMAIL 
  };
  sendSmtpEmail.to = [{ email: options.email }];

  try {
    // 4. Execute the send command
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Brevo Email sent successfully. Message ID:', data.messageId);
    return data;
  } catch (error) {
    console.error('❌ Brevo API Error:', error.response ? error.response.body : error.message);
    throw new Error('Failed to send email via Brevo API.');
  }
};

module.exports = sendEmail;