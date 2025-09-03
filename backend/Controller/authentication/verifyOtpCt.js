const crypto = require('crypto');
// Removed: const createMemberDataModel = require('../../Model/membersModule/memberDataMd');

const verifyOtp = async (req, res) => {
  console.log('[VERIFY_OTP] Received a request.');
  const { email, otp } = req.body;
  const db = req.collegeDB;
  const MembersData = db.model('MembersData'); // Changed to db.model()

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    const user = await MembersData.findOne({
      email,
      passwordResetOtp: otp,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid OTP or OTP has expired.' });
    }

    console.log('[VERIFY_OTP] OTP verified successfully.');

    // OTP is correct. Clear the OTP fields.
    user.passwordResetOtp = undefined;
    user.passwordResetExpires = undefined;
    
    // For added security, create a new, short-lived, single-use token for the final password reset step.
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // This token is valid for 10 minutes

    await user.save();
    console.log(`[VERIFY_OTP] User saved. passwordResetToken after save: ${user.passwordResetToken}`);
    
    console.log('[VERIFY_OTP] Granted temporary password reset token.');

    // Send the temporary token back to the client
    res.status(200).json({ 
      message: 'OTP verified. You can now reset your password.',
      resetToken: resetToken, // The unhashed token
    });

  } catch (error) {
    console.error('[VERIFY_OTP] A critical error occurred:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

module.exports = {
  verifyOtp,
};