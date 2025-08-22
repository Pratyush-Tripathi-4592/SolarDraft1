const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken, isGovernment, isSeller, isBuyer } = require('../middleware/auth');

// Statistics and listings
router.get('/stats', authenticateToken, transactionController.getTransactionStats);
router.get('/pending', authenticateToken, isGovernment, transactionController.getPendingTransactions);
router.get('/user', authenticateToken, transactionController.getUserTransactions);

// Get transaction by id
router.get('/:id', authenticateToken, transactionController.getTransactionById);

// ABI endpoint for frontend to fetch contract ABI
router.get('/abi/transactionManager', (req, res) => {
	try {
		const abi = require('../../backend/build/contracts/TransactionManager.json').abi || require('../build/contracts/TransactionManager.json').abi;
		res.json({ abi });
	} catch (err) {
		// fallback to build folder
		try {
			const abi = require('../build/contracts/TransactionManager.json').abi;
			res.json({ abi });
		} catch (error) {
			res.status(500).json({ message: 'ABI not found on server' });
		}
	}
});

// Transaction operations
router.post('/propose', authenticateToken, isSeller, transactionController.proposeTransaction);
router.post('/verify', authenticateToken, isGovernment, transactionController.verifyTransaction);
router.post('/complete', authenticateToken, isBuyer, transactionController.completeTransaction);

// Frontend will call this after MetaMask finishes the on-chain transaction
router.put('/:id/complete', authenticateToken, transactionController.markCompletedFromFrontend);

module.exports = router;
