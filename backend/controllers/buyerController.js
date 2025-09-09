const User = require('../models/User');
const ElectricityUnit = require('../models/ElectricityUnit');
const Transaction = require('../models/Transaction');
const { Web3 } = require('web3');
const dotenv = require('dotenv');

dotenv.config();

const web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL || 'http://localhost:8545');

// Browse available electricity units
exports.browseElectricityUnits = async (req, res) => {
    try {
        const { generationSource, minPrice, maxPrice, location, sortBy = 'pricePerUnit' } = req.query;
        
        let query = { isActive: true, unitsAvailable: { $gt: 0 } };
        
        // Apply filters
        if (generationSource) {
            query.generationSource = generationSource;
        }
        if (minPrice || maxPrice) {
            query.pricePerUnit = {};
            if (minPrice) query.pricePerUnit.$gte = parseFloat(minPrice);
            if (maxPrice) query.pricePerUnit.$lte = parseFloat(maxPrice);
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const units = await ElectricityUnit.find(query)
            .populate('seller', 'username location')
            .sort(sortBy === 'pricePerUnit' ? { pricePerUnit: 1 } : { createdAt: -1 })
            .limit(50);

        res.status(200).json(units);
    } catch (error) {
        console.error('Browse electricity units error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get specific electricity unit details
exports.getElectricityUnitDetails = async (req, res) => {
    try {
        const { unitId } = req.params;

        const unit = await ElectricityUnit.findById(unitId)
            .populate('seller', 'username location electricityUnits pricePerUnit');

        if (!unit) {
            return res.status(404).json({ message: 'Electricity unit not found' });
        }

        res.status(200).json(unit);
    } catch (error) {
        console.error('Get electricity unit details error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create purchase request (initiate transaction)
exports.createPurchaseRequest = async (req, res) => {
    try {
        const { electricityUnitId, unitsRequested, buyerNotes } = req.body;
        const buyerId = req.user.userId;

        // Validation
        if (!electricityUnitId || !unitsRequested || unitsRequested <= 0) {
            return res.status(400).json({ message: 'Invalid request parameters' });
        }

        // Check electricity unit availability
        const electricityUnit = await ElectricityUnit.findById(electricityUnitId);
        if (!electricityUnit) {
            return res.status(404).json({ message: 'Electricity unit not found' });
        }

        if (!electricityUnit.isActive) {
            return res.status(400).json({ message: 'Electricity unit is not active' });
        }

        if (electricityUnit.unitsAvailable < unitsRequested) {
            return res.status(400).json({ 
                message: `Only ${electricityUnit.unitsAvailable} units available` 
            });
        }

        // Calculate total amount
        const totalAmount = unitsRequested * electricityUnit.pricePerUnit;

        // Create transaction
        const transaction = new Transaction({
            seller: electricityUnit.seller,
            buyer: buyerId,
            electricityUnit: electricityUnitId,
            unitsRequested,
            pricePerUnit: electricityUnit.pricePerUnit,
            totalAmount,
            status: 'pending',
            buyerNotes: buyerNotes || '',
            proposedAt: new Date()
        });

        await transaction.save();

        // Populate transaction for response
        await transaction.populate([
            { path: 'seller', select: 'username location' },
            { path: 'electricityUnit', select: 'generationSource location' }
        ]);

        res.status(201).json({
            message: 'Purchase request created successfully',
            transaction: transaction
        });
    } catch (error) {
        console.error('Create purchase request error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get buyer's transactions
exports.getBuyerTransactions = async (req, res) => {
    try {
        const buyerId = req.user.userId;

        const transactions = await Transaction.find({ buyer: buyerId })
            .populate('seller', 'username location')
            .populate('electricityUnit', 'generationSource location')
            .populate('governmentVerifier', 'username department')
            .sort('-proposedAt');

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Get buyer transactions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Complete transaction (after government approval)
exports.completeTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { paymentTxHash, contractAddress } = req.body;
        const buyerId = req.user.userId;

        const transaction = await Transaction.findOne({
            _id: transactionId,
            buyer: buyerId,
            status: 'approved'
        }).populate('electricityUnit');

        if (!transaction) {
            return res.status(404).json({ 
                message: 'Transaction not found or not approved' 
            });
        }

        // Update electricity unit availability
        const electricityUnit = transaction.electricityUnit;
        electricityUnit.unitsAvailable -= transaction.unitsRequested;
        await electricityUnit.save();

        // Update transaction status
        transaction.status = 'completed';
        transaction.completionTxHash = paymentTxHash;
        transaction.deployedContractAddress = contractAddress;
        transaction.completedAt = new Date();

        await transaction.save();

        res.status(200).json({
            message: 'Transaction completed successfully',
            transaction: transaction
        });
    } catch (error) {
        console.error('Complete transaction error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Cancel transaction (only if pending)
exports.cancelTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const buyerId = req.user.userId;

        const transaction = await Transaction.findOne({
            _id: transactionId,
            buyer: buyerId,
            status: 'pending'
        });

        if (!transaction) {
            return res.status(404).json({ 
                message: 'Transaction not found or cannot be cancelled' 
            });
        }

        transaction.status = 'cancelled';
        await transaction.save();

        res.status(200).json({
            message: 'Transaction cancelled successfully',
            transaction: transaction
        });
    } catch (error) {
        console.error('Cancel transaction error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get buyer dashboard stats
exports.getBuyerStats = async (req, res) => {
    try {
        const buyerId = req.user.userId;

        const [totalTransactions, completedTransactions, pendingTransactions, totalUnitsOwned] = await Promise.all([
            Transaction.countDocuments({ buyer: buyerId }),
            Transaction.countDocuments({ buyer: buyerId, status: 'completed' }),
            Transaction.countDocuments({ buyer: buyerId, status: { $in: ['pending', 'government_review', 'approved'] } }),
            Transaction.aggregate([
                { $match: { buyer: new mongoose.Types.ObjectId(buyerId), status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$unitsRequested' } } }
            ])
        ]);

        res.status(200).json({
            totalTransactions,
            completedTransactions,
            pendingTransactions,
            totalUnitsOwned: totalUnitsOwned[0]?.total || 0
        });
    } catch (error) {
        console.error('Get buyer stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get transaction history with filters
exports.getTransactionHistory = async (req, res) => {
    try {
        const buyerId = req.user.userId;
        const { status, startDate, endDate, limit = 20, page = 1 } = req.query;

        let query = { buyer: buyerId };
        
        if (status) {
            query.status = status;
        }
        
        if (startDate || endDate) {
            query.proposedAt = {};
            if (startDate) query.proposedAt.$gte = new Date(startDate);
            if (endDate) query.proposedAt.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [transactions, total] = await Promise.all([
            Transaction.find(query)
                .populate('seller', 'username location')
                .populate('electricityUnit', 'generationSource location')
                .sort('-proposedAt')
                .skip(skip)
                .limit(parseInt(limit)),
            Transaction.countDocuments(query)
        ]);

        res.status(200).json({
            transactions,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get transaction history error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
