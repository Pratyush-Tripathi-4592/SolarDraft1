const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is a buyer
const checkBuyerRole = (req, res, next) => {
    if (req.user.role !== 'buyer') {
        return res.status(403).json({ message: 'Access denied. Buyer role required.' });
    }
    next();
};

// Browse electricity units
router.get('/units', authenticateToken, checkBuyerRole, buyerController.browseElectricityUnits);
router.get('/units/:unitId', authenticateToken, checkBuyerRole, buyerController.getElectricityUnitDetails);

// Transaction management routes
router.post('/purchase-request', authenticateToken, checkBuyerRole, buyerController.createPurchaseRequest);
router.get('/transactions', authenticateToken, checkBuyerRole, buyerController.getBuyerTransactions);
router.get('/transactions/history', authenticateToken, checkBuyerRole, buyerController.getTransactionHistory);
router.post('/transactions/:transactionId/complete', authenticateToken, checkBuyerRole, buyerController.completeTransaction);
router.post('/transactions/:transactionId/cancel', authenticateToken, checkBuyerRole, buyerController.cancelTransaction);

// Buyer dashboard
router.get('/stats', authenticateToken, checkBuyerRole, buyerController.getBuyerStats);

module.exports = router;
