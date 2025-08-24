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
	// Returns ABI and bytecode for a requested contract. Query param: ?contract=TransactionManager|ElectricityToken
	const contractName = req.query.contract || 'TransactionManager';
	const candidates = [
		`../../backend/build/contracts/${contractName}.json`,
		`../build/contracts/${contractName}.json`,
		`../../backend/build/contracts/TransactionManager.json`,
		`../build/contracts/TransactionManager.json`
	];
	try {
		let json = null;
		for (const path of candidates) {
			try {
				// eslint-disable-next-line global-require, import/no-dynamic-require
				json = require(path);
				if (json) break;
			} catch (e) {
				// ignore and try next
			}
		}
		if (!json) return res.status(500).json({ message: 'Contract artifact not found on server' });

		// Some build artifacts place bytecode under 'bytecode' or 'deployedBytecode'
		const abi = json.abi;
		const bytecode = json.bytecode || json.deployedBytecode || null;
		res.json({ abi, bytecode });
	} catch (err) {
		res.status(500).json({ message: 'ABI not found on server', error: err.message });
	}
});

// Transaction operations
router.post('/propose', authenticateToken, isSeller, transactionController.proposeTransaction);
router.post('/verify', authenticateToken, isGovernment, transactionController.verifyTransaction);
router.post('/complete', authenticateToken, isBuyer, transactionController.completeTransaction);

// Frontend will call this after MetaMask finishes the on-chain transaction
router.put('/:id/complete', authenticateToken, transactionController.markCompletedFromFrontend);

module.exports = router;
