const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const auth = require('../middleware/auth');

// MetaMask integration routes
router.get('/transaction/:transactionId/metamask', auth, blockchainController.generateMetaMaskTransaction);
router.post('/transaction/:transactionId/confirm', auth, blockchainController.confirmBlockchainTransaction);
router.get('/status/:txHash', auth, blockchainController.getBlockchainTransactionStatus);
router.post('/deploy/:transactionId', auth, blockchainController.deployTransactionContract);

module.exports = router;
