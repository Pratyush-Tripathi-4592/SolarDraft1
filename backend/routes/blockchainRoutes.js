const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const { authenticateToken } = require('../middleware/auth');

// MetaMask integration routes
router.get('/transaction/:transactionId/metamask', authenticateToken, blockchainController.generateMetaMaskTransaction);
router.post('/transaction/:transactionId/confirm', authenticateToken, blockchainController.confirmBlockchainTransaction);
router.get('/status/:txHash', authenticateToken, blockchainController.getBlockchainTransactionStatus);
router.post('/deploy/:transactionId', authenticateToken, blockchainController.deployTransactionContract);

module.exports = router;
