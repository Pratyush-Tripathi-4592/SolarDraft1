const express = require('express');
const router = express.Router();
const governmentController = require('../controllers/governmentController');
const auth = require('../middleware/auth');

// Middleware to check if user is government
const checkGovernmentRole = (req, res, next) => {
    if (req.user.role !== 'government') {
        return res.status(403).json({ message: 'Access denied. Government role required.' });
    }
    next();
};

// Transaction review routes
router.get('/transactions/pending', auth, checkGovernmentRole, governmentController.getPendingTransactions);
router.get('/transactions', auth, checkGovernmentRole, governmentController.getAllTransactions);
router.get('/transactions/:transactionId', auth, checkGovernmentRole, governmentController.getTransactionForReview);
router.post('/transactions/:transactionId/review', auth, checkGovernmentRole, governmentController.reviewTransaction);

// User management routes
router.get('/users', auth, checkGovernmentRole, governmentController.getAllUsers);
router.post('/users/:userId/status', auth, checkGovernmentRole, governmentController.updateUserStatus);

// Electricity unit verification routes
router.get('/units/verification', auth, checkGovernmentRole, governmentController.getElectricityUnitsForVerification);
router.post('/units/:unitId/verify', auth, checkGovernmentRole, governmentController.verifyElectricityUnit);

// Government dashboard
router.get('/stats', auth, checkGovernmentRole, governmentController.getGovernmentStats);

module.exports = router;
