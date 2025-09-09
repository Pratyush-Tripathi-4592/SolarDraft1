const Transaction = require('../models/Transaction');
const blockchainService = require('../services/blockchainService');
const { Web3 } = require('web3');

// Generate MetaMask transaction data for completing a purchase
exports.generateMetaMaskTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.userId;

        const transaction = await Transaction.findById(transactionId)
            .populate('seller', 'blockchainAddress')
            .populate('buyer', 'blockchainAddress')
            .populate('electricityUnit');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Verify user authorization
        if (transaction.buyer._id.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        if (transaction.status !== 'approved') {
            return res.status(400).json({ message: 'Transaction not approved for completion' });
        }

        // Generate MetaMask transaction data
        const totalAmountWei = blockchainService.etherToWei(transaction.totalAmount);
        
        const metaMaskData = {
            to: process.env.TRANSACTION_MANAGER_ADDRESS,
            from: transaction.buyer.blockchainAddress,
            value: `0x${parseInt(totalAmountWei).toString(16)}`,
            data: blockchainService.generateMetaMaskTransactionData(
                process.env.TRANSACTION_MANAGER_ADDRESS,
                'completeTransaction',
                [transactionId]
            ).data,
            gas: '0x493E0', // 300000 in hex
            gasPrice: '0x9184e72a000' // 10 gwei in hex
        };

        res.status(200).json({
            message: 'MetaMask transaction data generated',
            transactionData: metaMaskData,
            transactionDetails: {
                id: transaction._id,
                seller: transaction.seller.blockchainAddress,
                buyer: transaction.buyer.blockchainAddress,
                amount: transaction.unitsRequested,
                totalPrice: transaction.totalAmount,
                pricePerUnit: transaction.pricePerUnit
            }
        });
    } catch (error) {
        console.error('Generate MetaMask transaction error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Handle successful blockchain transaction completion
exports.confirmBlockchainTransaction = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const { txHash, contractAddress } = req.body;
        const userId = req.user.userId;

        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Verify user authorization
        if (transaction.buyer.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        // Update transaction with blockchain details
        transaction.completionTxHash = txHash;
        transaction.deployedContractAddress = contractAddress;
        transaction.status = 'completed';
        transaction.completedAt = new Date();

        await transaction.save();

        // Update electricity unit availability
        const ElectricityUnit = require('../models/ElectricityUnit');
        await ElectricityUnit.findByIdAndUpdate(
            transaction.electricityUnit,
            { $inc: { unitsAvailable: -transaction.unitsRequested } }
        );

        res.status(200).json({
            message: 'Transaction confirmed successfully',
            transaction: {
                id: transaction._id,
                status: transaction.status,
                txHash: transaction.completionTxHash,
                contractAddress: transaction.deployedContractAddress
            }
        });
    } catch (error) {
        console.error('Confirm blockchain transaction error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Get blockchain transaction status
exports.getBlockchainTransactionStatus = async (req, res) => {
    try {
        const { txHash } = req.params;

        const web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL || 'http://localhost:8545');
        const receipt = await web3.eth.getTransactionReceipt(txHash);

        if (!receipt) {
            return res.status(404).json({ message: 'Transaction not found on blockchain' });
        }

        res.status(200).json({
            status: receipt.status ? 'success' : 'failed',
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed,
            transactionHash: receipt.transactionHash,
            contractAddress: receipt.contractAddress
        });
    } catch (error) {
        console.error('Get blockchain transaction status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Deploy new smart contract for transaction
exports.deployTransactionContract = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.user.userId;

        const transaction = await Transaction.findById(transactionId)
            .populate('seller', 'blockchainAddress')
            .populate('buyer', 'blockchainAddress');

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        // Verify government user
        if (req.user.role !== 'government') {
            return res.status(403).json({ message: 'Only government can deploy contracts' });
        }

        const contractData = {
            seller: transaction.seller.blockchainAddress,
            buyer: transaction.buyer.blockchainAddress,
            amount: transaction.unitsRequested,
            price: transaction.totalAmount
        };

        const deploymentResult = await blockchainService.deployTransactionContract(contractData);

        // Update transaction with contract address
        transaction.deployedContractAddress = deploymentResult.contractAddress;
        await transaction.save();

        res.status(200).json({
            message: 'Smart contract deployed successfully',
            contractAddress: deploymentResult.contractAddress,
            transactionHash: deploymentResult.transactionHash,
            gasUsed: deploymentResult.gasUsed
        });
    } catch (error) {
        console.error('Deploy transaction contract error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
