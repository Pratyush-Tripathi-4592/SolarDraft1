const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sellRequestController');
const { authenticateToken, isSeller, isGovernment, isBuyer } = require('../middleware/auth');

// POST /api/sell-requests → Seller creates request.
router.post('/', authenticateToken, isSeller, ctrl.createSellRequest);

// GET /api/sell-requests/pending → Government views pending requests.
router.get('/pending', authenticateToken, isGovernment, ctrl.getPendingSellRequests);

// PUT /api/sell-requests/:id/approve → Government approves request.
router.put('/:id/approve', authenticateToken, isGovernment, ctrl.approveSellRequest);

// PUT /api/sell-requests/:id/reject → Government rejects request.
router.put('/:id/reject', authenticateToken, isGovernment, ctrl.rejectSellRequest);

// GET /api/sell-requests/approved → Buyer fetches approved requests.
router.get('/approved', authenticateToken, isBuyer, ctrl.getApprovedSellRequests);

// POST /api/transactions/:id/purchase → Buyer initiates purchase
router.post('/:id/purchase', authenticateToken, isBuyer, ctrl.purchaseApprovedRequest);

module.exports = router;


