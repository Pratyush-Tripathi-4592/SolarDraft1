
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


const REQUIRED_ENVS = ['MONGODB_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENVS.filter((k) => !process.env[k] || String(process.env[k]).trim() === '');
if (missing.length) {

  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}



const User = require('./models/User');


const app = express();
const PORT = process.env.PORT || 5000;


app.use(helmet());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);


app.use(cookieParser());


const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((s) => s.trim());
app.use(cors());


// NOTE: preflight handled by the CORS middleware above. Avoid using app.options with '*' because
// some path parsers (path-to-regexp) treat '*' specially and can throw a PathError in certain
// dependency versions. The cors() middleware registered with app.use(...) will respond to
// OPTIONS requests for allowed routes.


app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));


if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}


function validateRegisterInput(data) {
  const errors = {};
  if (!data.name) errors.name = 'Name is required';
  if (!data.email) errors.email = 'Email is required';
  if (!data.password) errors.password = 'Password is required';
  const isValid = Object.keys(errors).length === 0;
  return { errors, isValid };
}


app.get('/', (req, res) => {
  res.send('API is running...');
});


app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});


app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/seller', require('./routes/sellerRoutes'));
app.use('/api/buyer', require('./routes/buyerRoutes'));
app.use('/api/government', require('./routes/governmentRoutes'));
app.use('/api/blockchain', require('./routes/blockchainRoutes'));
app.use('/api/sell-requests', require('./routes/sellRequestRoutes'));


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});


app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.statusCode || err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});


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
