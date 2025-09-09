const User = require('../models/User');
const Transaction = require('../models/Transaction');
const ElectricityUnit = require('../models/ElectricityUnit');
const { Web3 } = require('web3');
const dotenv = require('dotenv');

dotenv.config();

const web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL || 'http://localhost:8545');

// Get all transactions pending government review
exports.getPendingTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ 
            status: { $in: ['pending', 'government_review'] }
        })
        .populate('seller', 'username location electricityUnits')
        .populate('buyer', 'username email')
        .populate('electricityUnit', 'generationSource location meterReading')
        .sort('-proposedAt');

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Get pending transactions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get specific transaction details for review
exports.getTransactionForReview = async (req, res) => {
    try {
        const { transactionId } = req.params;

        const transaction = await Transaction.findById(transactionId)
            .populate('seller', 'username location electricityUnits meterReading blockchainAddress')
            .populate('buyer', 'username email blockchainAddress')
            .populate('electricityUnit', 'generationSource location meterReading qualityCertificate description')
            .populate('governmentVerifier', 'username department');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(transaction);
    } catch (error) {
        console.error('Get transaction for review error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Approve or reject transaction
exports.reviewTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { action, verificationNotes } = req.body; // action: 'approve' or 'reject'
        const governmentId = req.user.userId;

        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action. Use approve or reject' });
        }

        const transaction = await Transaction.findOne({
            _id: transactionId,
            status: { $in: ['pending', 'government_review'] }
        });

        if (!transaction) {
            return res.status(404).json({ 
                message: 'Transaction not found or already processed' 
            });
        }

        // Update transaction
        transaction.status = action === 'approve' ? 'approved' : 'rejected';
        transaction.governmentVerified = action === 'approve';
        transaction.governmentVerifier = governmentId;
        transaction.verificationDate = new Date();
        transaction.verificationNotes = verificationNotes || '';
        
        if (action === 'approve') {
            transaction.approvedAt = new Date();
        }

        await transaction.save();

        // Populate for response
        await transaction.populate([
            { path: 'seller', select: 'username location' },
            { path: 'buyer', select: 'username email' },
            { path: 'electricityUnit', select: 'generationSource location' }
        ]);

        res.status(200).json({
            message: `Transaction ${action}d successfully`,
            transaction: transaction
        });
    } catch (error) {
        console.error('Review transaction error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all transactions (government oversight)
exports.getAllTransactions = async (req, res) => {
    try {
        const { status, startDate, endDate, limit = 50, page = 1 } = req.query;

        let query = {};
        
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
                .populate('buyer', 'username email')
                .populate('electricityUnit', 'generationSource location')
                .populate('governmentVerifier', 'username department')
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
        console.error('Get all transactions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get government dashboard statistics
exports.getGovernmentStats = async (req, res) => {
    try {
        const [
            totalTransactions,
            pendingReview,
            approvedTransactions,
            rejectedTransactions,
            completedTransactions,
            totalElectricityTraded,
            activeUsers
        ] = await Promise.all([
            Transaction.countDocuments(),
            Transaction.countDocuments({ status: { $in: ['pending', 'government_review'] } }),
            Transaction.countDocuments({ status: 'approved' }),
            Transaction.countDocuments({ status: 'rejected' }),
            Transaction.countDocuments({ status: 'completed' }),
            Transaction.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$unitsRequested' } } }
            ]),
            User.countDocuments({ isActive: true })
        ]);

        const usersByRole = await User.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        const roleStats = {};
        usersByRole.forEach(item => {
            roleStats[item._id] = item.count;
        });

        res.status(200).json({
            totalTransactions,
            pendingReview,
            approvedTransactions,
            rejectedTransactions,
            completedTransactions,
            totalElectricityTraded: totalElectricityTraded[0]?.total || 0,
            activeUsers,
            usersByRole: roleStats
        });
    } catch (error) {
        console.error('Get government stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get all registered users (for oversight)
exports.getAllUsers = async (req, res) => {
    try {
        const { role, isActive, limit = 50, page = 1 } = req.query;

        let query = {};
        
        if (role) {
            query.role = role;
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [users, total] = await Promise.all([
            User.find(query)
                .select('-passwordHash')
                .sort('-registrationDate')
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(query)
        ]);

        res.status(200).json({
            users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Suspend or activate user account
exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive, reason } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = isActive;
        await user.save();

        // Log the action (you might want to create an audit log model)
        console.log(`User ${userId} status changed to ${isActive ? 'active' : 'suspended'} by government user ${req.user.userId}. Reason: ${reason || 'No reason provided'}`);

        res.status(200).json({
            message: `User ${isActive ? 'activated' : 'suspended'} successfully`,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive
            }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get electricity units for quality verification
exports.getElectricityUnitsForVerification = async (req, res) => {
    try {
        const { generationSource, location, limit = 50, page = 1 } = req.query;

        let query = { isActive: true };
        
        if (generationSource) {
            query.generationSource = generationSource;
        }
        
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [units, total] = await Promise.all([
            ElectricityUnit.find(query)
                .populate('seller', 'username location meterReading')
                .sort('-createdAt')
                .skip(skip)
                .limit(parseInt(limit)),
            ElectricityUnit.countDocuments(query)
        ]);

        res.status(200).json({
            units,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Get electricity units for verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Verify electricity unit quality
exports.verifyElectricityUnit = async (req, res) => {
    try {
        const { unitId } = req.params;
        const { qualityCertificate, isVerified } = req.body;

        const unit = await ElectricityUnit.findById(unitId);
        if (!unit) {
            return res.status(404).json({ message: 'Electricity unit not found' });
        }

        unit.qualityCertificate = qualityCertificate;
        unit.isActive = isVerified;
        unit.updatedAt = new Date();

        await unit.save();

        res.status(200).json({
            message: 'Electricity unit verification updated successfully',
            unit: unit
        });
    } catch (error) {
        console.error('Verify electricity unit error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
