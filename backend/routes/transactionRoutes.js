const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.post('/propose', transactionController.proposeTransaction);
router.post('/verify', transactionController.verifyTransaction);
router.post('/complete', transactionController.completeTransaction);

module.exports = router;
