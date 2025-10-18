// server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');

dotenv.config();

// ========================
//  Models
// ========================

const User = require('./models/User'); // Make sure this exists with fields: name, email, password, role

// ========================
//  Initialize App
// ========================

const app = express();
const PORT = process.env.PORT || 5000;

// ========================
//  Middleware
// ========================

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use(limiter);

// Parse cookies
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  })
);

// Body parser
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ========================
//  Simple validator
// ========================
function validateRegisterInput(data) {
  const errors = {};
  if (!data.name) errors.name = 'Name is required';
  if (!data.email) errors.email = 'Email is required';
  if (!data.password) errors.password = 'Password is required';
  const isValid = Object.keys(errors).length === 0;
  return { errors, isValid };
}

// ========================
//  Routes
// ========================

// Root route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Register route
app.post('/register', async (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) return res.status(400).json(errors);

  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ email: 'Email already exists' });

    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'user'
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    await newUser.save();
    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ========================
//  API Routes
// ========================
// Example: replace with your existing route files
// Make sure each route exports an express.Router()
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/seller', require('./routes/sellerRoutes'));
app.use('/api/buyer', require('./routes/buyerRoutes'));
app.use('/api/government', require('./routes/governmentRoutes'));
app.use('/api/blockchain', require('./routes/blockchainRoutes'));
app.use('/api/sell-requests', require('./routes/sellRequestRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========================
//  Database Connection
// ========================

mongoose
  .connect(process.env.MONGODB_URI, {})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// ========================
//  Start Server
// ========================

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
