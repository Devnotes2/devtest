/* eslint-disable camelcase */
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const createUserModel = require('../../Model/authentication/regLoginMd');
const { handleCRUD } = require('../../Utilities/crudUtils');

exports.register = async (req, res) => {
  const User = createUserModel(req.collegeDB);
  const { username, password, role } = req.body;

  try {
    const user = await handleCRUD(User, 'create', {}, { username, password, role });
    res.status(201).json({ success: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ error: 'User already registered/Try different username' });
  }
};

exports.login = async (req, res) => {
  const User = createUserModel(req.collegeDB);
  const { username, password } = req.body;
  try {
    const user = await handleCRUD(User, 'findOne', { username });
    if (!user) {
      return res.status(404).json({ error: 'User not registered yet' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Username or password is wrong' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'defaultSecret', {
      expiresIn: '1h',
    });
    res.cookie('authToken', token, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 3600000, // 1 hour
    });

    res.json({ success: 'Successfully logged in' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
