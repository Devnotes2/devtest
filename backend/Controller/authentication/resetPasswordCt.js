const crypto = require('crypto');

const resetPassword = async (req, res) => {
  console.log('[RESET_PASSWORD] Received a request.');
  const { email, token, password } = req.body; 

  console.log(`[RESET_PASSWORD] Request body: Email=${email}, Token=${token}, Password=***`);

  // Validate required fields
  if (!email || !token || !password) {
    return res.status(400).json({ message: 'Email, token, and password are required.' });
  }

  // 1. Hash the token from the body
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  console.log(`[RESET_PASSWORD] Hashed Token: ${hashedToken}`);

  const db = req.collegeDB; // Get DB from request object
  const MembersData = db.model('MembersData'); // Changed to db.model()

  try {
    console.log('[RESET_PASSWORD] Searching for user with hashed token and unexpired date...');
    console.log(`[RESET_PASSWORD] Current time: ${new Date(Date.now()).toISOString()}`);

    // First, find the user by email to inspect their token state
    const userBeforeQuery = await MembersData.findOne({ email });
    if (userBeforeQuery) {
      console.log(`[RESET_PASSWORD] User's stored token: ${userBeforeQuery.passwordResetToken}`);
      console.log(`[RESET_PASSWORD] User's token expiry: ${new Date(userBeforeQuery.passwordResetExpires).toISOString()}`);
      console.log(`[RESET_PASSWORD] Is stored token expired? ${userBeforeQuery.passwordResetExpires < Date.now()}`);
      console.log(`[RESET_PASSWORD] Does stored token match hashed token? ${userBeforeQuery.passwordResetToken === hashedToken}`);
    } else {
      console.log(`[RESET_PASSWORD] User with email ${email} not found in DB before query.`);
    }

    // 2. Find the user by the hashed token and check if it's expired
    const user = await MembersData.findOne({
      email, // Find by email as well for extra security/specificity
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }, // Check that the token is not expired
    });

    if (!user) {
      console.log('[RESET_PASSWORD] User not found or token invalid/expired.');
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    console.log('[RESET_PASSWORD] User found. Resetting password...');
    // 3. Set the new password
    user.password = password;
    // 4. Clear the reset token fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // The pre-save hook in the model will automatically hash the new password
    await user.save();

    console.log('[RESET_PASSWORD] Password reset successfully.');
    res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (error) {
    console.error('[RESET_PASSWORD] A critical error occurred in the controller:', error);
    res.status(500).json({ message: 'An internal server error occurred.' });
  }
};

module.exports = {
  resetPassword,
};
