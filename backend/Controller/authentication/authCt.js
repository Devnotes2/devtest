const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createMembersDataModel } = require('../../Model/membersModule/memberDataMd');
const Tenant = require('../../Model/authentication/tenantMd'); // Import Tenant model

exports.login = async (req, res) => {
  const { identifier, password } = req.body;
  const MemberData = createMembersDataModel(req.collegeDB);
  console.log(identifier, password)
  if (!identifier || !password) {
    return res.status(400).json({ message: 'Identifier and password are required.' });
  }

  try {
    // Find user by memberId or email
    const user = await MemberData.findOne({
      $or: [{ memberId: identifier }, { email: identifier },{ contactNo1: identifier }],
    }).lean();

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    console.log(user);
    // Check password - This is a critical security step.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Create JWT
    const payload = {
      id: user._id,
      memberId: user.memberId,
      instituteId: user.instituteId,
      dbName: req.collegeDB.name, // The name of the connected DB
      instituteCode: req.instituteCode, // Add instituteCode from middleware
    };

    // It's crucial to use a dedicated, strong secret for JWT, not a bcrypt-related one.
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'Strict', // Or 'Lax' depending on your cross-site request needs
      maxAge: 3600 * 1000, // 1 hour in milliseconds
    });

    // Prepare user data for the response, excluding sensitive fields like passwords.
    const { password: userPassword, parentOrGuardianPassword, ...userForResponse } = user;
    userForResponse.instituteCode=req.instituteCode; 

    // Fetch s3StaticUrl from Tenant model
    const tenant = await Tenant.findOne({ instituteCode: req.instituteCode }).lean();
    if (tenant && tenant.s3StaticUrl) {
      userForResponse.s3StaticUrl = tenant.s3StaticUrl;
    }

    res.status(200).json({ message: 'Login successful', token, user: userForResponse });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
  
};