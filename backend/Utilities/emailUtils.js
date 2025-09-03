const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendOtpEmail = async (to, otp) => {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  // --- DEVELOPMENT WORKAROUND: Log to console instead of sending email ---
  console.log('====================================');
  console.log('PASSWORD RESET OTP (DEV WORKAROUND)');
  console.log('====================================');
  console.log(`Recipient: ${to}`);
  console.log(`OTP: ${otp}`);
  console.log('====================================');
  
  return; // End the function here for the workaround.

  /*
  // Original email sending logic
  const msg = {
    to: to,
    from: fromEmail,
    subject: 'Your Password Reset Code',
    html: `
      <p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
      <p>Your password reset code is:</p>
      <h2 style="text-align:center; letter-spacing: 4px;">${otp}</h2>
      <p>This code will expire in 15 minutes.</p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log('OTP email sent successfully');
  } catch (error) {
    console.error('Error sending OTP email:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error('Email could not be sent');
  }
  */
};

module.exports = {
  sendOtpEmail,
};
