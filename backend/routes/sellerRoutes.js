const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const auth = require('../middleware/auth');

// Middleware to check if user is a seller
const checkSellerRole = (req, res, next) => {
    if (req.user.role !== 'seller') {
        return res.status(403).json({ message: 'Access denied. Seller role required.' });
    }
    next();
};

// Seller profile routes
router.post('/register', auth, checkSellerRole, sellerController.registerSeller);
router.get('/stats', auth, checkSellerRole, sellerController.getSellerStats);

// Electricity unit management routes
router.post('/units', auth, checkSellerRole, sellerController.createElectricityUnit);
router.get('/units', auth, checkSellerRole, sellerController.getSellerUnits);
router.put('/units/:unitId', auth, checkSellerRole, sellerController.updateElectricityUnit);
router.delete('/units/:unitId', auth, checkSellerRole, sellerController.deleteElectricityUnit);

// Transaction management routes
router.get('/transactions', auth, checkSellerRole, sellerController.getSellerTransactions);
router.post('/transactions/:transactionId/respond', auth, checkSellerRole, sellerController.respondToTransactionRequest);

module.exports = router;
