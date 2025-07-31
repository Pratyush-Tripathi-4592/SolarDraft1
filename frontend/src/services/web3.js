import Web3 from 'web3';

class Web3Service {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.account = null;
  }

  // Initialize Web3 connection
  async init() {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        this.web3 = new Web3(window.ethereum);
        
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        this.account = accounts[0];
        console.log('Connected to MetaMask:', this.account);
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          this.account = accounts[0];
          console.log('Account changed:', this.account);
        });

        return true;
      } else {
        console.error('MetaMask is not installed');
        return false;
      }
    } catch (error) {
      console.error('Web3 initialization error:', error);
      return false;
    }
  }

  // Get current account
  getAccount() {
    return this.account;
  }

  // Get Web3 instance
  getWeb3() {
    return this.web3;
  }

  // Check if connected
  isConnected() {
    return this.web3 !== null && this.account !== null;
  }

  // Get network ID
  async getNetworkId() {
    if (!this.web3) return null;
    return await this.web3.eth.net.getId();
  }

  // Get balance
  async getBalance(address = this.account) {
    if (!this.web3 || !address) return null;
    const balance = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(balance, 'ether');
  }

  // Send transaction
  async sendTransaction(to, value, data = '') {
    if (!this.web3 || !this.account) {
      throw new Error('Web3 not initialized or no account connected');
    }

    const transaction = {
      from: this.account,
      to: to,
      value: this.web3.utils.toWei(value.toString(), 'ether'),
      data: data
    };

    try {
      const result = await this.web3.eth.sendTransaction(transaction);
      return result;
    } catch (error) {
      console.error('Transaction error:', error);
      throw error;
    }
  }

  // Load smart contract
  async loadContract(contractAddress, contractABI) {
    if (!this.web3) {
      throw new Error('Web3 not initialized');
    }

    try {
      this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
      return this.contract;
    } catch (error) {
      console.error('Contract loading error:', error);
      throw error;
    }
  }

  // Get contract instance
  getContract() {
    return this.contract;
  }
}

// Create singleton instance
const web3Service = new Web3Service();
export default web3Service; 