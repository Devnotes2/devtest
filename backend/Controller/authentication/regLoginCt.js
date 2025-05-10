/* eslint-disable camelcase */
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const createUserModel = require('../../Model/authentication/regLoginMd');

exports.register = async (req, res) => {
  const User = createUserModel(req.collegeDB);
  const { username, password, role } = req.body;

  try {
    const user = new User({ username, password, role });
    await user.save();

    res.status(201).json({ success: 'User registered successfully' });
  } catch (error) {
    res.json({ error: 'User already registered/Try different username' });
  }
};

exports.login = async (req, res) => {
  const User = createUserModel(req.collegeDB);
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ error: 'User not registered yet' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ error: 'username or password is wrong' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, 'Shiva@45', {
      expiresIn: '1h',
    });
    res.cookie('authToken', token, {
      httpOnly: false, // Make sure this is not set if you want JavaScript access
      sameSite: 'None',
      maxAge: 3600000 // 1 hour
    });

    res.json({success: 'Successfully logged in' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
