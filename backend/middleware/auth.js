const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw ApiError.unauthorized('No token provided');
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) {
            throw ApiError.unauthorized('No token provided');
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                throw ApiError.unauthorized('Token expired', 'TOKEN_EXPIRED');
            }
            throw ApiError.unauthorized('Invalid token');
        }

        // Check if user still exists
        const user = await User.findById(decoded.userId).select('-passwordHash');
        if (!user) {
            throw ApiError.unauthorized('User no longer exists');
        }

        // Check if user is active
        if (!user.isActive) {
            throw ApiError.forbidden('User account is deactivated');
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

const roleCheck = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ApiError.unauthorized('Authentication required'));
        }
        
        if (!roles.includes(req.user.role)) {
            return next(ApiError.forbidden(`Access denied. Required role: ${roles.join(', ')}`));
        }
        next();
    };
};

// Role-specific middlewares
const isGovernment = roleCheck(['government']);
const isSeller = roleCheck(['seller']);
const isBuyer = roleCheck(['buyer']);

module.exports = {
    authenticateToken,
    isGovernment,
    isSeller,
    isBuyer,
    roleCheck
};