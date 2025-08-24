const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { Web3 } = require('web3');
const dotenv = require('dotenv');

dotenv.config();

const web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL);
const transactionManagerContract = new web3.eth.Contract(
    require('../build/contracts/TransactionManager.json').abi,
    process.env.TRANSACTION_MANAGER_ADDRESS
);

exports.getTransactionStats = async (req, res) => {
    try {
        const stats = await Promise.all([
            Transaction.countDocuments(),
            Transaction.countDocuments({ status: 'pending' }),
            Transaction.countDocuments({ status: 'completed' }),
            Transaction.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, totalUnits: { $sum: '$amount' } } }
            ])
        ]);

        res.status(200).json({
            totalTransactions: stats[0],
            pendingTransactions: stats[1],
            completedTransactions: stats[2],
            totalUnits: stats[3][0]?.totalUnits || 0
        });
    } catch (error) {
        console.error('Error fetching transaction stats:', error);
        res.status(500).json({ message: 'Error fetching transaction statistics' });
    }
};

exports.proposeTransaction = async (req, res) => {
    try {
        const { buyerId, amount, price } = req.body;
        const sellerId = req.user.id;

        // Input validation
        if (!buyerId || !amount || !price) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        if (amount <= 0 || price <= 0) {
            return res.status(400).json({ message: 'Amount and price must be positive values' });
        }

        // Fetch seller and buyer
        const [seller, buyer] = await Promise.all([
            User.findById(sellerId),
            User.findById(buyerId)
        ]);

        if (!seller || !buyer) {
            return res.status(404).json({ message: 'Seller or Buyer not found' });
        }

        if (buyer.role !== 'buyer') {
            return res.status(400).json({ message: 'Selected user is not a buyer' });
        }

        // Create transaction
        const transaction = new Transaction({
            seller: sellerId,
            buyer: buyerId,
            amount,
            price,
            status: 'pending',
            timestamp: new Date()
        });

        // Interact with smart contract
        try {
            const tx = await transactionManagerContract.methods.proposeTransaction(
                buyer.blockchainAddress,
                web3.utils.toWei(amount.toString(), 'ether'),
                web3.utils.toWei(price.toString(), 'ether')
            ).send({
                from: seller.blockchainAddress,
                gas: 200000
            });

            transaction.blockchainTxHash = tx.transactionHash;
            await transaction.save();

            res.status(201).json({
                message: 'Transaction proposed successfully',
                transactionId: transaction._id,
                blockchainTxHash: tx.transactionHash
            });
        } catch (blockchainError) {
            console.error('Blockchain error:', blockchainError);
            res.status(500).json({
                message: 'Error while processing blockchain transaction',
                error: blockchainError.message
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.verifyTransaction = async (req, res) => {
    try {
        const { transactionId, approved } = req.body;

        // Input validation
        if (!transactionId || approved === undefined) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Find and validate transaction
        const transaction = await Transaction.findById(transactionId)
            .populate('seller', 'blockchainAddress')
            .populate('buyer', 'blockchainAddress');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status !== 'pending') {
            return res.status(400).json({ message: 'Transaction is not in pending state' });
        }

        // Verify on blockchain
        try {
            const tx = await transactionManagerContract.methods
                .verifyTransaction(
                    transaction.blockchainTxHash,
                    approved
                )
                .send({
                    from: process.env.GOVERNMENT_ADDRESS,
                    gas: 200000
                });

            // Update transaction status
            transaction.governmentVerified = approved;
            transaction.status = approved ? 'approved' : 'rejected';
            transaction.verificationTime = new Date();
            transaction.verificationTxHash = tx.transactionHash;
            await transaction.save();

            // Notify users (you could implement WebSocket notifications here)
            
            res.status(200).json({
                message: `Transaction ${approved ? 'approved' : 'rejected'} successfully`,
                transactionId: transaction._id,
                blockchainTxHash: tx.transactionHash
            });
        } catch (blockchainError) {
            console.error('Blockchain error:', blockchainError);
            res.status(500).json({
                message: 'Error while processing blockchain verification',
                error: blockchainError.message
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.completeTransaction = async (req, res) => {
    try {
        const { transactionId } = req.body;
        const buyerId = req.user.id;

        // Input validation
        if (!transactionId) {
            return res.status(400).json({ message: 'Transaction ID is required' });
        }

        // Find and validate transaction
        const transaction = await Transaction.findById(transactionId)
            .populate('seller', 'blockchainAddress username')
            .populate('buyer', 'blockchainAddress username');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.buyer._id.toString() !== buyerId) {
            return res.status(403).json({ message: 'Unauthorized to complete this transaction' });
        }

        if (transaction.status !== 'approved') {
            return res.status(400).json({ message: 'Transaction must be approved before completion' });
        }

        // Complete transaction on blockchain
        try {
            const tx = await transactionManagerContract.methods
                .completeTransaction(
                    transaction.blockchainTxHash,
                    transaction.seller.blockchainAddress,
                    web3.utils.toWei(transaction.price.toString(), 'ether')
                )
                .send({
                    from: transaction.buyer.blockchainAddress,
                    value: web3.utils.toWei(transaction.price.toString(), 'ether'),
                    gas: 300000
                });

            // Update transaction status
            transaction.status = 'completed';
            transaction.completionTime = new Date();
            transaction.completionTxHash = tx.transactionHash;
            await transaction.save();

            // Update electricity token balances (if you're tracking them)
            // You could implement token transfer here

            res.status(200).json({
                message: 'Transaction completed successfully',
                transactionId: transaction._id,
                blockchainTxHash: tx.transactionHash
            });
        } catch (blockchainError) {
            console.error('Blockchain error:', blockchainError);
            res.status(500).json({
                message: 'Error while processing blockchain transaction',
                error: blockchainError.message
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

exports.getPendingTransactions = async (req, res) => {
    try {
        const pendingTransactions = await Transaction.find({ status: 'pending' })
            .populate('seller', 'username')
            .populate('buyer', 'username')
            .select('-blockchainTxHash -__v')
            .sort('-timestamp');

        res.status(200).json(pendingTransactions);
    } catch (error) {
        console.error('Error fetching pending transactions:', error);
        res.status(500).json({ message: 'Error fetching pending transactions' });
    }
};

exports.getUserTransactions = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = {};
        if (userRole === 'seller') {
            query.seller = userId;
        } else if (userRole === 'buyer') {
            query.buyer = userId;
        }
        // Government users can see all transactions

        const transactions = await Transaction.find(query)
            .populate('seller', 'username')
            .populate('buyer', 'username')
            .select('-blockchainTxHash -__v')
            .sort('-timestamp');

        res.status(200).json(transactions);
    } catch (error) {
        console.error('Error fetching user transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

exports.getTransactionById = async (req, res) => {
    try {
        const tx = await Transaction.findById(req.params.id)
            .populate('seller', 'username blockchainAddress')
            .populate('buyer', 'username blockchainAddress')
            .select('-__v');

        if (!tx) return res.status(404).json({ message: 'Transaction not found' });
        res.status(200).json(tx);
    } catch (error) {
        console.error('Error fetching transaction by id:', error);
        res.status(500).json({ message: 'Error fetching transaction' });
    }
};

// Called by frontend after MetaMask on-chain completeTransaction returns
exports.markCompletedFromFrontend = async (req, res) => {
    try {
        const { id } = req.params;
        const { transactionHash } = req.body;

        const transaction = await Transaction.findById(id);
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    transaction.status = 'completed';
    if (transactionHash) transaction.completionTxHash = transactionHash;
    if (req.body.deployedContractAddress) transaction.deployedContractAddress = req.body.deployedContractAddress;
    transaction.completionTime = new Date();
    await transaction.save();

        res.status(200).json({ message: 'Transaction marked completed', transactionId: id });
    } catch (error) {
        console.error('Error marking transaction completed:', error);
        res.status(500).json({ message: 'Error updating transaction' });
    }
};
