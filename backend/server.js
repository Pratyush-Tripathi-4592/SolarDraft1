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
// CORS: allow multiple origins via comma-separated env var, and respond to preflight
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(',').map(s => s.trim());
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

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
//  Start Server (with port fallback)
// ========================

function startServer(preferredPort, maxRetries = 10) {
  let port = Number(preferredPort) || 5000;

  const tryListen = () => {
    const srv = app.listen(port);

    srv.on('listening', () => {
      console.log(`Server running on http://localhost:${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });

    srv.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} in use. Trying port ${port + 1}...`);
        if (maxRetries > 0) {
          port += 1;
          maxRetries -= 1;
          setTimeout(tryListen, 200);
        } else {
          console.error('Failed to bind to a port after multiple attempts. Exiting.');
          process.exit(1);
        }
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  };

  tryListen();
}

startServer(process.env.PORT || PORT);
