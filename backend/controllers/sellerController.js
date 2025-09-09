const User = require('../models/User');
const ElectricityUnit = require('../models/ElectricityUnit');
const Transaction = require('../models/Transaction');
const { Web3 } = require('web3');
const dotenv = require('dotenv');

dotenv.config();

const web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL || 'http://localhost:8545');

// Register as seller or update seller profile
exports.registerSeller = async (req, res) => {
    try {
        const { electricityUnits, pricePerUnit, location, meterReading } = req.body;
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'seller') {
            return res.status(403).json({ message: 'Only sellers can access this endpoint' });
        }

        // Update seller-specific fields
        user.electricityUnits = electricityUnits || user.electricityUnits;
        user.pricePerUnit = pricePerUnit || user.pricePerUnit;
        user.location = location || user.location;
        user.meterReading = meterReading || user.meterReading;

        await user.save();

        res.status(200).json({
            message: 'Seller profile updated successfully',
            seller: {
                id: user._id,
                username: user.username,
                electricityUnits: user.electricityUnits,
                pricePerUnit: user.pricePerUnit,
                location: user.location,
                meterReading: user.meterReading
            }
        });
    } catch (error) {
        console.error('Register seller error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Create electricity unit listing
exports.createElectricityUnit = async (req, res) => {
    try {
        const { unitsAvailable, pricePerUnit, generationSource, location, meterReading, description, expiryDate } = req.body;
        const sellerId = req.user.userId;

        // Validation
        if (!unitsAvailable || !pricePerUnit || !generationSource || !location || !meterReading) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const electricityUnit = new ElectricityUnit({
            seller: sellerId,
            unitsAvailable,
            pricePerUnit,
            generationSource,
            location,
            meterReading,
            description,
            expiryDate: expiryDate ? new Date(expiryDate) : undefined
        });

        await electricityUnit.save();

        res.status(201).json({
            message: 'Electricity unit created successfully',
            electricityUnit: electricityUnit
        });
    } catch (error) {
        console.error('Create electricity unit error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get seller's electricity units
exports.getSellerUnits = async (req, res) => {
    try {
        const sellerId = req.user.userId;

        const units = await ElectricityUnit.find({ seller: sellerId })
            .populate('seller', 'username location')
            .sort('-createdAt');

        res.status(200).json(units);
    } catch (error) {
        console.error('Get seller units error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Update electricity unit
exports.updateElectricityUnit = async (req, res) => {
    try {
        const { unitId } = req.params;
        const sellerId = req.user.userId;
        const updates = req.body;

        const unit = await ElectricityUnit.findOne({ _id: unitId, seller: sellerId });
        if (!unit) {
            return res.status(404).json({ message: 'Electricity unit not found or unauthorized' });
        }

        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                unit[key] = updates[key];
            }
        });

        unit.updatedAt = new Date();
        await unit.save();

        res.status(200).json({
            message: 'Electricity unit updated successfully',
            electricityUnit: unit
        });
    } catch (error) {
        console.error('Update electricity unit error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Delete electricity unit
exports.deleteElectricityUnit = async (req, res) => {
    try {
        const { unitId } = req.params;
        const sellerId = req.user.userId;

        const unit = await ElectricityUnit.findOne({ _id: unitId, seller: sellerId });
        if (!unit) {
            return res.status(404).json({ message: 'Electricity unit not found or unauthorized' });
        }

        // Check if there are pending transactions for this unit
        const pendingTransactions = await Transaction.find({
            electricityUnit: unitId,
            status: { $in: ['pending', 'government_review', 'approved'] }
        });

        if (pendingTransactions.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete unit with pending transactions' 
            });
        }

        await ElectricityUnit.findByIdAndDelete(unitId);

        res.status(200).json({ message: 'Electricity unit deleted successfully' });
    } catch (error) {
        console.error('Delete electricity unit error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get seller's transactions
exports.getSellerTransactions = async (req, res) => {
    try {
        const sellerId = req.user.userId;

        const transactions = await Transaction.find({ seller: sellerId })
            .populate('buyer', 'username email')
            .populate('electricityUnit', 'generationSource location')
            .populate('governmentVerifier', 'username department')
            .sort('-proposedAt');

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Get seller transactions error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Accept or reject a transaction request (if buyer initiates)
exports.respondToTransactionRequest = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { action, sellerNotes } = req.body; // action: 'accept' or 'reject'
        const sellerId = req.user.userId;

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action. Use accept or reject' });
        }

        const transaction = await Transaction.findOne({ 
            _id: transactionId, 
            seller: sellerId,
            status: 'pending'
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found or unauthorized' });
        }

        if (action === 'accept') {
            transaction.status = 'government_review';
            transaction.sellerNotes = sellerNotes;
        } else {
            transaction.status = 'rejected';
            transaction.sellerNotes = sellerNotes || 'Rejected by seller';
        }

        await transaction.save();

        res.status(200).json({
            message: `Transaction ${action}ed successfully`,
            transaction: transaction
        });
    } catch (error) {
        console.error('Respond to transaction error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get seller dashboard stats
exports.getSellerStats = async (req, res) => {
    try {
        const sellerId = req.user.userId;

        const [totalUnits, activeListings, totalTransactions, completedTransactions, pendingTransactions] = await Promise.all([
            ElectricityUnit.aggregate([
                { $match: { seller: new mongoose.Types.ObjectId(sellerId) } },
                { $group: { _id: null, total: { $sum: '$unitsAvailable' } } }
            ]),
            ElectricityUnit.countDocuments({ seller: sellerId, isActive: true }),
            Transaction.countDocuments({ seller: sellerId }),
            Transaction.countDocuments({ seller: sellerId, status: 'completed' }),
            Transaction.countDocuments({ seller: sellerId, status: { $in: ['pending', 'government_review', 'approved'] } })
        ]);

        res.status(200).json({
            totalUnits: totalUnits[0]?.total || 0,
            activeListings,
            totalTransactions,
            completedTransactions,
            pendingTransactions
        });
    } catch (error) {
        console.error('Get seller stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
