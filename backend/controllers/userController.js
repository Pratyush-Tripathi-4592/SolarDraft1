const User = require('../models/User');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { body, validationResult } = require('express-validator'); // ✅ include 'body'

// ==============================
// JWT Generation Helper
// ==============================
const generateToken = (userId, role) => {
  return jwt.sign(
    { 
      userId,
      role,
      iat: Math.floor(Date.now() / 1000) // issued at
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '24h',
      issuer: 'solar-draft-api',
      audience: 'solar-draft-client'
    }
  );
};

// ==============================
// Input Validation Middleware
// ==============================
exports.validateRegistration = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// ==============================
// Register User
// ==============================
exports.registerUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.badRequest('Email already registered');
    }

    // Create user using virtual password setter which will hash on save
    const newUser = new User({ username, email });
    newUser.password = password; // virtual setter assigns to passwordHash for pre-save
    // role will default to 'buyer' if not provided
    if (req.body.role) newUser.role = req.body.role;
    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id, newUser.role);

    const userResponse = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
    };

    res.status(201).json({ success: true, message: 'User registered successfully', data: { user: userResponse, token } });
  } catch (error) {
    next(error);
  }
};

// ==============================
// Login User
// ==============================
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });

    // Always return generic message for security
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if account is active
    if (!user.isActive) {
      throw ApiError.forbidden('Account is deactivated. Please contact support.');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      await user.save();
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Reset failed login attempts
    if (user.failedLoginAttempts > 0) {
      user.failedLoginAttempts = 0;
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    // Prepare clean user object
    const userResponse = user.toObject();
    delete userResponse.passwordHash;
    delete userResponse.__v;
    delete userResponse.failedLoginAttempts;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: userResponse, token },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// Logout User
// ==============================
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// ==============================
// Get Profile
// ==============================
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-passwordHash -__v -failedLoginAttempts');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// Update Profile
// ==============================
exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    const allowedUpdates = ['username', 'email', 'blockchainAddress'];

    // Filter allowed updates
    Object.keys(req.body).forEach((key) => {
      if (allowedUpdates.includes(key) && req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    });

    if (Object.keys(updates).length === 0) {
      throw ApiError.badRequest('No valid updates provided');
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash -__v -failedLoginAttempts');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================
// List users (optional role filter)
// ==============================
exports.listUsers = async (req, res, next) => {
  try {
    const role = req.query.role;
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter).select('-passwordHash -__v -failedLoginAttempts');
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};
