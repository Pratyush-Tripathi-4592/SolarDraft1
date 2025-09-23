const express = require('express');
const router = express.Router();
const governmentController = require('../controllers/governmentController');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is government
const checkGovernmentRole = (req, res, next) => {
    if (req.user.role !== 'government') {
        return res.status(403).json({ message: 'Access denied. Government role required.' });
    }
    next();
};

// Transaction review routes
router.get('/transactions/pending', authenticateToken, checkGovernmentRole, governmentController.getPendingTransactions);
router.get('/transactions', authenticateToken, checkGovernmentRole, governmentController.getAllTransactions);
router.get('/transactions/:transactionId', authenticateToken, checkGovernmentRole, governmentController.getTransactionForReview);
router.post('/transactions/:transactionId/review', authenticateToken, checkGovernmentRole, governmentController.reviewTransaction);

// User management routes
router.get('/users', authenticateToken, checkGovernmentRole, governmentController.getAllUsers);
router.post('/users/:userId/status', authenticateToken, checkGovernmentRole, governmentController.updateUserStatus);

// Electricity unit verification routes
router.get('/units/verification', authenticateToken, checkGovernmentRole, governmentController.getElectricityUnitsForVerification);
router.post('/units/:unitId/verify', authenticateToken, checkGovernmentRole, governmentController.verifyElectricityUnit);

// Government dashboard
router.get('/stats', authenticateToken, checkGovernmentRole, governmentController.getGovernmentStats);

module.exports = router;
