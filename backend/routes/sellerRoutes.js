const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const { authenticateToken } = require('../middleware/auth');

// Middleware to check if user is a seller
const checkSellerRole = (req, res, next) => {
    if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Access denied. Seller role required.' });
    }
    next();
};

// Seller profile routes
router.post('/register', authenticateToken, checkSellerRole, sellerController.registerSeller);
router.get('/stats', authenticateToken, checkSellerRole, sellerController.getSellerStats);

// Electricity unit management routes
router.post('/units', authenticateToken, checkSellerRole, sellerController.createElectricityUnit);
router.get('/units', authenticateToken, checkSellerRole, sellerController.getSellerUnits);
router.put('/units/:unitId', authenticateToken, checkSellerRole, sellerController.updateElectricityUnit);
router.delete('/units/:unitId', authenticateToken, checkSellerRole, sellerController.deleteElectricityUnit);

// Transaction management routes
router.get('/transactions', authenticateToken, checkSellerRole, sellerController.getSellerTransactions);
router.post('/transactions/:transactionId/respond', authenticateToken, checkSellerRole, sellerController.respondToTransactionRequest);

module.exports = router;
