const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Web3 = require('web3');
const dotenv = require('dotenv');

dotenv.config();

const web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL);
const transactionManagerContract = new web3.eth.Contract(
    require('../contracts/TransactionManager.json').abi,
    process.env.TRANSACTION_MANAGER_ADDRESS
);

exports.proposeTransaction = async (req, res) => {
    try {
        const { buyerId, amount, price } = req.body;
        const sellerId = req.user.id; // Assuming user is authenticated
        const seller = await User.findById(sellerId);
        const buyer = await User.findById(buyerId);

        if (!seller || !buyer) {
            return res.status(404).json({ message: 'Seller or Buyer not found' });
        }

        const transaction = new Transaction({ seller: sellerId, buyer: buyerId, amount, price });
        await transaction.save();

        // Interact with smart contract
        const tx = await transactionManagerContract.methods.proposeTransaction(
            buyer.blockchainAddress,
            amount,
            price
        ).send({ from: seller.blockchainAddress });

        res.status(200).json({ message: 'Transaction proposed', transactionId: transaction._id, transactionHash: tx.transactionHash });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.verifyTransaction = async (req, res) => {
    try {
        const { transactionId, approved } = req.body;
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const tx = await transactionManagerContract.methods.verifyPayment(transactionId, approved).send({ from: process.env.GOVERNMENT_ADDRESS });
        transaction.governmentVerified = approved;
        transaction.status = approved ? 'Approved' : 'Rejected';
        await transaction.save();

        res.status(200).json({ message: 'Transaction verified', transactionHash: tx.transactionHash });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.completeTransaction = async (req, res) => {
    try {
        const { transactionId } = req.body;
        const transaction = await Transaction.findById(transactionId);
        if (!transaction || transaction.status !== 'Approved') {
            return res.status(400).json({ message: 'Transaction not approved or not found' });
        }

        const tx = await transactionManagerContract.methods.completeTransaction(transactionId).send({ from: transaction.buyer.blockchainAddress });
        transaction.status = 'Completed';
        await transaction.save();

        res.status(200).json({ message: 'Transaction completed', transactionHash: tx.transactionHash });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
