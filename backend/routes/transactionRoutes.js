const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken, isGovernment, isSeller, isBuyer } = require('../middleware/auth');

// Statistics and listings
router.get('/stats', authenticateToken, transactionController.getTransactionStats);
router.get('/pending', authenticateToken, isGovernment, transactionController.getPendingTransactions);
router.get('/user', authenticateToken, transactionController.getUserTransactions);

// Transaction operations
router.post('/propose', authenticateToken, isSeller, transactionController.proposeTransaction);
router.post('/verify', authenticateToken, isGovernment, transactionController.verifyTransaction);
router.post('/complete', authenticateToken, isBuyer, transactionController.completeTransaction);

module.exports = router;
