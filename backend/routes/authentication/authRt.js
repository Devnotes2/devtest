const express = require('express');
const router = express.Router();
const authCt = require('../../Controller/authentication/authCt');
const { forgotPassword } = require('../../Controller/authentication/forgotPasswordCt');
const { resetPassword } = require('../../Controller/authentication/resetPasswordCt');
const { verifyOtp } = require('../../Controller/authentication/verifyOtpCt'); // Import new controller

// router.post('/register', authCt.register);

router.post('/login', authCt.login);

// Forgot Password Routes (OTP based)
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp); // New OTP verification route
router.post('/reset-password', resetPassword); // Modified: no :token in URL

// Test route (keep for now)
router.get('/test', (req, res) => {
  console.log('[/authRt/test] Test route was hit successfully!');
  res.status(200).json({ message: 'Test route is working!' });
});

module.exports = router;

