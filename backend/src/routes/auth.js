import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwt';

// POST Register
router.post('/register', (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Check if user already exists
    const existing = db.users.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const newUser = db.users.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'sales' // Default role
    });

    const { password: _, ...userWithoutPassword } = newUser;

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '30d' });

    res.status(210 || 201).json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

// POST Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please send email and password' });
    }

    const user = db.users.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// GET Profile
router.get('/me', protect, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router;
