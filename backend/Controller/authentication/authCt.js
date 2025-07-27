// Get dropdown of institute names from AuthMember
const getInstituteDropdown = async (req, res) => {
  try {
    // Aggregate unique instituteId and instituteName pairs
    const data = await AuthMember.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$instituteId", instituteName: { $first: "$instituteName" } } },
      { $project: { _id: 1, instituteName: 1 } },
      { $sort: { instituteName: 1 } }
    ]);
    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch institute dropdown", details: error.message });
  }
};
const express = require('express');
const router = express.Router();
const AuthMember = require('../../config/AuthMember');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Login with memberId, email, or contactNo1
const login = async (req, res) => {
  const { identifier, password, instituteId } = req.body;
  const mode = process.env.NODE_ENV || 'production';
  console.log(`[LOGIN REQUEST] identifier: ${identifier}, instituteId: ${instituteId}, mode: ${mode}`);
  if (!identifier || !password || !instituteId) {
    return res.status(400).json({ error: 'MemberId or EmailId or MobileNo, password, and instituteId are required.' });
  }
  // Find user by memberId, email, or contactNo1 and instituteId (as ObjectId)
  const mongoose = require('mongoose');
  // Find all matching users by identifier and isActive
  const users = await AuthMember.find({
    $or: [
      { memberId: identifier },
      { email: identifier },
      { contactNo1: identifier }
    ],
    isActive: true
  });
  // Find the user with matching instituteId (string compare)
  const user = users.find(u => u.instituteId && u.instituteId.toString() === instituteId);
  if (!user) {
    console.log(`[LOGIN FAILED] identifier: ${identifier}, instituteId: ${instituteId} - Invalid credentials`);
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  let valid = false;
  if (mode === 'development') {
    valid = password === user.password;
  } else {
    valid = await bcrypt.compare(password, user.password);
  }
  if (!valid) {
    console.log(`[LOGIN FAILED] identifier: ${identifier}, instituteId: ${instituteId} - Invalid password`);
    return res.status(400).json({ error: 'Invalid credentials' });
  }
  console.log(`[LOGIN SUCCESS] identifier: ${identifier}, instituteId: ${instituteId}, memberId: ${user.memberId}`);
  const token = jwt.sign(
    { memberId: user.memberId, email: user.email, contactNo1: user.contactNo1, memberType: user.memberType, dbName: user.dbName, instituteId: user.instituteId },
    'devtest2', // Use env secret in production
    { expiresIn: '1d' }
  );
  res.json({ token, user: { memberId: user.memberId, email: user.email, contactNo1: user.contactNo1, memberType: user.memberType, dbName: user.dbName, instituteId: user.instituteId } });
};


// Auth middleware for protected routes
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.authToken;
  if (!token) return res.status(400).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, 'devtest2');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

module.exports = { authMiddleware, login, getInstituteDropdown };
