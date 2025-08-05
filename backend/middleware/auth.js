const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

const isGovernment = (req, res, next) => {
    if (req.user.role !== 'government') {
        return res.status(403).json({ message: 'Access denied. Government role required.' });
    }
    next();
};

const isSeller = (req, res, next) => {
    if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Access denied. Seller role required.' });
    }
    next();
};

const isBuyer = (req, res, next) => {
    if (req.user.role !== 'buyer') {
        return res.status(403).json({ message: 'Access denied. Buyer role required.' });
    }
    next();
};

module.exports = {
    authenticateToken,
    isGovernment,
    isSeller,
    isBuyer
};