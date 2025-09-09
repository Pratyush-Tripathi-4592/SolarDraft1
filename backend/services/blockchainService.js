const { Web3 } = require('web3');
const dotenv = require('dotenv');

dotenv.config();

class BlockchainService {
    constructor() {
        this.web3 = new Web3(process.env.BLOCKCHAIN_NODE_URL || 'http://localhost:8545');
        this.initializeContracts();
    }

    initializeContracts() {
        try {
            // Load contract ABIs and addresses
            this.electricityTokenABI = require('../build/contracts/ElectricityToken.json').abi;
            this.transactionManagerABI = require('../build/contracts/TransactionManager.json').abi;
            
            this.electricityTokenAddress = process.env.ELECTRICITY_TOKEN_ADDRESS;
            this.transactionManagerAddress = process.env.TRANSACTION_MANAGER_ADDRESS;

            if (this.electricityTokenAddress) {
                this.electricityTokenContract = new this.web3.eth.Contract(
                    this.electricityTokenABI,
                    this.electricityTokenAddress
                );
            }

            if (this.transactionManagerAddress) {
                this.transactionManagerContract = new this.web3.eth.Contract(
                    this.transactionManagerABI,
                    this.transactionManagerAddress
                );
            }
        } catch (error) {
            console.error('Error initializing contracts:', error);
        }
    }

    // Deploy new smart contract for a transaction
    async deployTransactionContract(transactionData) {
        try {
            const { seller, buyer, amount, price } = transactionData;
            
            // Contract bytecode for transaction-specific contract
            const contractBytecode = this.getTransactionContractBytecode();
            
            const contract = new this.web3.eth.Contract(this.transactionManagerABI);
            
            const deployTx = contract.deploy({
                data: contractBytecode,
                arguments: [seller, buyer, amount, price]
            });

            const gasEstimate = await deployTx.estimateGas();
            
            const deployedContract = await deployTx.send({
                from: process.env.DEPLOYER_ADDRESS,
                gas: gasEstimate,
                gasPrice: await this.web3.eth.getGasPrice()
            });

            return {
                contractAddress: deployedContract.options.address,
                transactionHash: deployedContract.transactionHash,
                gasUsed: deployedContract.gasUsed
            };
        } catch (error) {
            console.error('Error deploying contract:', error);
            throw error;
        }
    }

    // Propose transaction on blockchain
    async proposeTransaction(seller, buyer, amount, price) {
        try {
            if (!this.transactionManagerContract) {
                throw new Error('Transaction Manager contract not initialized');
            }

            const tx = await this.transactionManagerContract.methods
                .proposeTransaction(buyer, amount, price)
                .send({
                    from: seller,
                    gas: 200000
                });

            return {
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            console.error('Error proposing transaction:', error);
            throw error;
        }
    }

    // Government verification on blockchain
    async verifyTransaction(transactionId, approved, governmentAddress) {
        try {
            if (!this.transactionManagerContract) {
                throw new Error('Transaction Manager contract not initialized');
            }

            const tx = await this.transactionManagerContract.methods
                .verifyPayment(transactionId, approved)
                .send({
                    from: governmentAddress,
                    gas: 200000
                });

            return {
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            console.error('Error verifying transaction:', error);
            throw error;
        }
    }

    // Complete transaction on blockchain
    async completeTransaction(transactionId, buyerAddress, paymentAmount) {
        try {
            if (!this.transactionManagerContract) {
                throw new Error('Transaction Manager contract not initialized');
            }

            const tx = await this.transactionManagerContract.methods
                .completeTransaction(transactionId)
                .send({
                    from: buyerAddress,
                    value: paymentAmount,
                    gas: 300000
                });

            return {
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            console.error('Error completing transaction:', error);
            throw error;
        }
    }

    // Transfer electricity tokens
    async transferElectricityTokens(from, to, amount) {
        try {
            if (!this.electricityTokenContract) {
                throw new Error('Electricity Token contract not initialized');
            }

            const tx = await this.electricityTokenContract.methods
                .transferUnits(from, to, amount)
                .send({
                    from: from,
                    gas: 150000
                });

            return {
                transactionHash: tx.transactionHash,
                blockNumber: tx.blockNumber,
                gasUsed: tx.gasUsed
            };
        } catch (error) {
            console.error('Error transferring tokens:', error);
            throw error;
        }
    }

    // Get account balance
    async getAccountBalance(address) {
        try {
            const balance = await this.web3.eth.getBalance(address);
            return this.web3.utils.fromWei(balance, 'ether');
        } catch (error) {
            console.error('Error getting account balance:', error);
            throw error;
        }
    }

    // Get electricity token balance
    async getElectricityTokenBalance(address) {
        try {
            if (!this.electricityTokenContract) {
                throw new Error('Electricity Token contract not initialized');
            }

            const balance = await this.electricityTokenContract.methods
                .balanceOf(address)
                .call();

            return balance;
        } catch (error) {
            console.error('Error getting token balance:', error);
            throw error;
        }
    }

    // Generate MetaMask transaction data
    generateMetaMaskTransactionData(contractAddress, methodName, params) {
        try {
            const contract = new this.web3.eth.Contract(this.transactionManagerABI, contractAddress);
            const data = contract.methods[methodName](...params).encodeABI();
            
            return {
                to: contractAddress,
                data: data,
                gas: '0x30D40', // 200000 in hex
                gasPrice: '0x9184e72a000' // 10 gwei in hex
            };
        } catch (error) {
            console.error('Error generating MetaMask transaction data:', error);
            throw error;
        }
    }

    // Get transaction contract bytecode (simplified)
    getTransactionContractBytecode() {
        // This would contain the actual bytecode for deploying transaction-specific contracts
        // For now, returning a placeholder
        return "0x608060405234801561001057600080fd5b50..."; // Contract bytecode would go here
    }

    // Validate blockchain address
    isValidAddress(address) {
        return this.web3.utils.isAddress(address);
    }

    // Convert Wei to Ether
    weiToEther(wei) {
        return this.web3.utils.fromWei(wei.toString(), 'ether');
    }

    // Convert Ether to Wei
    etherToWei(ether) {
        return this.web3.utils.toWei(ether.toString(), 'ether');
    }
}

module.exports = new BlockchainService();
