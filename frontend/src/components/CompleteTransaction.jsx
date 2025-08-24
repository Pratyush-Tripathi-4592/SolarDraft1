// frontend/src/components/CompleteTransaction.js
import React, { useState } from 'react';
import axios from 'axios';
import { useWeb3 } from './Web3Context';

const CompleteTransaction = () => {
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { web3, account, connect, loadContract } = useWeb3(); // web3 helpers

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Ensure web3/account connected
            let acct = account;
            if (!acct) {
                await connect();
                acct = (await web3.eth.getAccounts())[0];
            }

            // Step 1: Get transaction details from backend
            const transactionRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/transactions/${transactionId}`);
            const txData = transactionRes.data;
            const { amount, price, seller, status } = txData;

            // Validation checks (backend stores statuses lowercased sometimes)
            if (!status || status.toLowerCase() !== 'approved') {
                throw new Error('Transaction must be approved by government before completion');
            }

            // Calculate total price in wei (price assumed in ETH per unit)
            const totalEth = (Number(amount) * Number(price));
            const totalPriceWei = web3.utils.toWei(totalEth.toString(), 'ether');

            // Step 2: Fetch TransactionManager ABI and call completeTransaction (MetaMask popup)
            const tmAbiRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/transactions/abi/transactionManager?contract=TransactionManager`);
            const tmAbi = tmAbiRes.data.abi;
            const tmAddress = import.meta.env.VITE_TRANSACTION_MANAGER_ADDRESS;
            const tmContract = loadContract(tmAbi, tmAddress);

            const receipt = await tmContract.methods.completeTransaction(Number(transactionId)).send({
                from: acct,
                value: totalPriceWei
            });

            // After completion, optionally deploy an ElectricityToken contract (example flow)
            // Fetch ElectricityToken ABI+bytecode from backend
            const etRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/transactions/abi/transactionManager?contract=ElectricityToken`);
            const etAbi = etRes.data.abi;
            const etBytecode = etRes.data.bytecode;

            let deployedAddress = null;
            if (etBytecode) {
                // Use web3 to deploy via MetaMask (this opens a MetaMask deploy popup)
                const deployContract = new web3.eth.Contract(etAbi);
                const deployTx = deployContract.deploy({ data: etBytecode, arguments: ['ElectricityToken', 'ELT'] });

                const gas = await deployTx.estimateGas({ from: acct });
                const deployed = await deployTx.send({ from: acct, gas });
                deployedAddress = deployed.options.address;
            }

            // Step 3: Notify backend that transaction completed on-chain and provide deployed contract address
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/transactions/${transactionId}/complete`, {
                transactionHash: receipt.transactionHash,
                deployedContractAddress: deployedAddress
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setSuccess(`Transaction completed successfully! Tx Hash: ${receipt.transactionHash}${deployedAddress ? `, Deployed contract: ${deployedAddress}` : ''}`);
        } catch (err) {
            console.error('Transaction completion error:', err);
            setError(err.response?.data?.message || err.message || 'Failed to complete transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Electricity Transaction</h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="transactionId" className="block text-sm font-medium text-gray-700">
                        Transaction ID
                    </label>
                    <input
                        type="text"
                        id="transactionId"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>

                <div className="flex items-center justify-between">
                    {account ? (
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 rounded-md text-white font-medium ${
                                loading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {loading ? 'Processing...' : 'Complete Transaction'}
                        </button>
                    ) : (
                        <p className="text-red-500">Please connect your wallet first</p>
                    )}
                </div>
            </form>

            <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900">Transaction Flow</h3>
                <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-600">
                    <li>Enter approved transaction ID</li>
                    <li>Smart contract verifies details</li>
                    <li>Payment is automatically transferred to seller</li>
                    <li>Electricity units are credited to your account</li>
                </ol>
            </div>
        </div>
    );
};

export default CompleteTransaction;
