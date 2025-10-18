const ApiError = require('../utils/ApiError');

const errorHandler = (err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} - Error:`, err);
  
  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      error: 'UNAUTHORIZED'
    });
  }

  // Handle JWT expiration
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
      error: 'TOKEN_EXPIRED'
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: messages,
      error: 'VALIDATION_ERROR'
    });
  }

  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err.errorCode || 'API_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
      error: 'DUPLICATE_KEY',
      field
    });
  }

  // Handle other errors
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
