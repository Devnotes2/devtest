const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const client = twilio(accountSid, authToken);

const sendSmsOtp = async (to, otp) => {
  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: twilioPhoneNumber,
      to: to,
    });
    console.log('SMS OTP sent successfully');
  } catch (error) {
    console.error('Error sending SMS OTP:', error);
    throw new Error('SMS OTP could not be sent');
  }
};

const sendWhatsAppOtp = async (to, otp) => {
  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: `whatsapp:${twilioPhoneNumber}`,
      to: `whatsapp:${to}`,
    });
    console.log('WhatsApp OTP sent successfully');
  } catch (error) {
    console.error('Error sending WhatsApp OTP:', error);
    throw new Error('WhatsApp OTP could not be sent');
  }
};

module.exports = {
  sendSmsOtp,
  sendWhatsAppOtp,
};
