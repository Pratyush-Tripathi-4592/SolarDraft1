const express = require('express');
const router = express.Router();
const buyerController = require('../controllers/buyerController');
const auth = require('../middleware/auth');

// Middleware to check if user is a buyer
const checkBuyerRole = (req, res, next) => {
    if (req.user.role !== 'buyer') {
        return res.status(403).json({ message: 'Access denied. Buyer role required.' });
    }
    next();
};

// Browse electricity units
router.get('/units', auth, checkBuyerRole, buyerController.browseElectricityUnits);
router.get('/units/:unitId', auth, checkBuyerRole, buyerController.getElectricityUnitDetails);

// Transaction management routes
router.post('/purchase-request', auth, checkBuyerRole, buyerController.createPurchaseRequest);
router.get('/transactions', auth, checkBuyerRole, buyerController.getBuyerTransactions);
router.get('/transactions/history', auth, checkBuyerRole, buyerController.getTransactionHistory);
router.post('/transactions/:transactionId/complete', auth, checkBuyerRole, buyerController.completeTransaction);
router.post('/transactions/:transactionId/cancel', auth, checkBuyerRole, buyerController.cancelTransaction);

// Buyer dashboard
router.get('/stats', auth, checkBuyerRole, buyerController.getBuyerStats);

module.exports = router;
