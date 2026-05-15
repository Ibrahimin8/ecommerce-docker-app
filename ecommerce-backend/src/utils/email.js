const Brevo = require('@getbrevo/brevo');

const sendEmail = async (options) => {
  const apiInstance = new Brevo.TransactionalEmailsApi();

  // Configure API Key
  const apiKey = apiInstance.authentications['apiKey'];
  apiKey.apiKey = process.env.BREVO_API_KEY;

  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.subject = options.subject;
  sendSmtpEmail.textContent = options.message;
  sendSmtpEmail.sender = { "name": "TechShop Support", "email": process.env.SENDER_EMAIL };
  sendSmtpEmail.to = [{ "email": options.email }];

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email sent successfully via Brevo API");
  } catch (error) {
    console.error("Brevo API Error:", error);
    throw new Error("Email delivery failed");
  }
};

module.exports = sendEmail;