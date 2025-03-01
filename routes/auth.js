const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuthLog = require('../models/AuthLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Hardcoded admin credentials
const ADMIN_EMAIL = 'gsriram@kirusa.com';
const ADMIN_PASSWORD = 'Kirusa@23';

router.post('/login', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (fullName) { // Signup
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User({ fullName, email, password });
      await user.save();

      const authLog = new AuthLog({
        userId: user._id,
        email,
        action: 'signup'
      });
      await authLog.save();
      console.log('Signup logged:', { userId: user._id, email });

      const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
      return res.json({ token, success: true });
    }

    // Login
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const authLog = new AuthLog({
      userId: user._id,
      email,
      action: 'signin'
    });
    await authLog.save();
    console.log('Signin logged:', { userId: user._id, email });

    const token = jwt.sign({ userId: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, success: true });
  } catch (error) {
    console.error('Error in auth route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check hardcoded admin credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Find or create an admin user in MongoDB for consistency
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });
    if (!adminUser) {
      adminUser = new User({
        fullName: 'Admin User',
        email: ADMIN_EMAIL,
        password: await bcrypt.hash(ADMIN_PASSWORD, 10),
        isAdmin: true
      });
      await adminUser.save();
      console.log('Admin user created:', { userId: adminUser._id, email: ADMIN_EMAIL });
    }

    const authLog = new AuthLog({
      userId: adminUser._id,
      email: ADMIN_EMAIL,
      action: 'admin-signin'
    });
    await authLog.save();
    console.log('Admin signin logged:', { userId: adminUser._id, email: ADMIN_EMAIL });

    const token = jwt.sign({ userId: adminUser._id, isAdmin: true }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, success: true, isAdmin: true });
  } catch (error) {
    console.error('Error in admin-login route:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;