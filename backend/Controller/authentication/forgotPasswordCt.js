const { sendOtpEmail } = require('../../Utilities/emailUtils');
const { sendSmsOtp, sendWhatsAppOtp } = require('../../Utilities/smsUtils');

const forgotPassword = async (req, res) => {
  console.log('[FORGOT_PASSWORD_OTP] Received a request.');
  const { email, instituteCode, deliveryMethod, phoneNumber } = req.body;
  const db = req.collegeDB;
  const MembersData = db.model('MembersData'); // Changed to db.model()

  try {
    let user;
    if (email) {
      console.log(`[FORGOT_PASSWORD_OTP] Searching for user with email: ${email}`);
      user = await MembersData.findOne({ email });
    } else if (phoneNumber) {
      console.log(`[FORGOT_PASSWORD_OTP] Searching for user with phoneNumber: ${phoneNumber}`);
      user = await MembersData.findOne({ phoneNumber });
    }

    if (!user) {
      console.log('[FORGOT_PASSWORD_OTP] User not found. Sending generic success response.');
      return res.status(200).json({ message: 'If an account with this email/phone number exists, an OTP has been sent.' });
    }

    console.log('[FORGOT_PASSWORD_OTP] User found. Generating OTP...');
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.passwordResetOtp = otp; // Save the plain OTP
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // Expires in 15 minutes

    await user.save();
    console.log('[FORGOT_PASSWORD_OTP] OTP saved to DB.');

    try {
      if (deliveryMethod === 'sms') {
        console.log('[FORGOT_PASSWORD_OTP] Attempting to send OTP sms...');
        await sendSmsOtp(user.phoneNumber, otp);
        console.log('[FORGOT_PASSWORD_OTP] OTP SMS sent successfully.');
      } else if (deliveryMethod === 'whatsapp') {
        console.log('[FORGOT_PASSWORD_OTP] Attempting to send OTP whatsapp...');
        await sendWhatsAppOtp(user.phoneNumber, otp);
        console.log('[FORGOT_PASSWORD_OTP] OTP WhatsApp sent successfully.');
      } else {
        console.log('[FORGOT_PASSWORD_OTP] Attempting to send OTP email...');
        await sendOtpEmail(user.email, otp);
        console.log('[FORGOT_PASSWORD_OTP] OTP Email sent successfully.');
      }
      res.status(200).json({ message: 'If an account with this email/phone number exists, an OTP has been sent.' });
    } catch (otpError) {
      console.error(`[FORGOT_PASSWORD_OTP] Failed to send OTP. Rolling back OTP changes.`, otpError);
      user.passwordResetOtp = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
      res.status(500).json({ message: 'Error sending OTP. Please try again later.' });
    }

  } catch (error) {
    console.error('[FORGOT_PASSWORD_OTP] A critical error occurred in the controller:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

module.exports = {
  forgotPassword,
};