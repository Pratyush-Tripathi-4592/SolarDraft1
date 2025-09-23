const SellRequest = require('../models/SellRequest');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const blockchainService = require('../services/blockchainService');
const { Web3 } = require('web3');
const web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL || 'http://localhost:8545');

exports.createSellRequest = async (req, res) => {
    try {
        const { units, price } = req.body;
        const sellerId = req.user.userId;

        if (!units || !price) return res.status(400).json({ message: 'units and price are required' });
        if (units <= 0 || price <= 0) return res.status(400).json({ message: 'units and price must be positive' });

        const sr = await SellRequest.create({ sellerId, units, price });
        return res.status(201).json(sr);
    } catch (err) {
        console.error('createSellRequest error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getPendingSellRequests = async (req, res) => {
    try {
        const list = await SellRequest.find({ status: 'pending' }).sort('-createdAt');
        return res.status(200).json(list);
    } catch (err) {
        console.error('getPendingSellRequests error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.approveSellRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const sr = await SellRequest.findById(id);
        if (!sr) return res.status(404).json({ message: 'SellRequest not found' });
        if (sr.status !== 'pending') return res.status(400).json({ message: 'Only pending requests can be approved' });

        sr.status = 'approved';
        await sr.save();
        return res.status(200).json(sr);
    } catch (err) {
        console.error('approveSellRequest error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.rejectSellRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const sr = await SellRequest.findById(id);
        if (!sr) return res.status(404).json({ message: 'SellRequest not found' });
        if (sr.status !== 'pending') return res.status(400).json({ message: 'Only pending requests can be rejected' });

        sr.status = 'rejected';
        await sr.save();
        return res.status(200).json(sr);
    } catch (err) {
        console.error('rejectSellRequest error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.getApprovedSellRequests = async (req, res) => {
    try {
        const list = await SellRequest.find({ status: 'approved' }).sort('-updatedAt');
        return res.status(200).json(list);
    } catch (err) {
        console.error('getApprovedSellRequests error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.purchaseApprovedRequest = async (req, res) => {
    try {
        const { id } = req.params; // sell request id
        const buyerId = req.user.userId;
        const sr = await SellRequest.findById(id);
        if (!sr) return res.status(404).json({ message: 'SellRequest not found' });
        if (sr.status !== 'approved') return res.status(400).json({ message: 'SellRequest is not approved' });

        // Fetch blockchain addresses
        const [seller, buyer] = await Promise.all([
            User.findById(sr.sellerId),
            User.findById(buyerId)
        ]);
        if (!seller || !buyer) return res.status(404).json({ message: 'Seller or Buyer not found' });
        if (!seller.blockchainAddress || !buyer.blockchainAddress) {
            return res.status(400).json({ message: 'Missing blockchain addresses' });
        }

        const priceWei = web3.utils.toWei(sr.price.toString(), 'ether');

        // Deploy Trade contract
        const deployment = await blockchainService.deployTradeContract({
            seller: seller.blockchainAddress,
            buyer: buyer.blockchainAddress,
            units: sr.units,
            priceWei,
            from: buyer.blockchainAddress
        });

        // Create transaction record with contract address
        const tx = await Transaction.create({
            seller: sr.sellerId,
            buyer: buyerId,
            units: sr.units,
            price: sr.price,
            deployedContractAddress: deployment.contractAddress,
            status: 'approved'
        });

        // Mark sell request as sold
        sr.status = 'sold';
        await sr.save();

        return res.status(201).json({
            message: 'Purchase initiated and contract deployed',
            transactionId: tx._id,
            contractAddress: deployment.contractAddress,
            transactionHash: deployment.transactionHash
        });
    } catch (err) {
        console.error('purchaseApprovedRequest error:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


