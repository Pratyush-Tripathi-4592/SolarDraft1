// frontend/src/components/CompleteTransaction.js
import React, { useState } from 'react';
import axios from 'axios';
import { useWeb3 } from './Web3Context'; // Assuming you have a Web3 context provider

const CompleteTransaction = () => {
    const [transactionId, setTransactionId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { web3, account } = useWeb3(); // Get web3 instance and connected account

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Step 1: Get transaction details from backend
            const transactionRes = await axios.get(`http://localhost:5000/api/transactions/${transactionId}`);
            const { amount, price, seller, status } = transactionRes.data;

            // Validation checks
            if (status !== 'Approved') {
                throw new Error('Transaction must be approved by government before completion');
            }

            // Calculate total price in wei (assuming price is per unit in ETH)
            const totalPriceWei = web3.utils.toWei((amount * price).toString(), 'ether');

            // Step 2: Call blockchain contract to complete transaction
            const transactionManagerContract = new web3.eth.Contract(
                TransactionManagerABI, // Import your contract ABI
                process.env.REACT_APP_TRANSACTION_MANAGER_ADDRESS
            );

            const tx = await transactionManagerContract.methods
                .completeTransaction(transactionId)
                .send({
                    from: account,
                    value: totalPriceWei,
                    gas: 500000 // Adjust gas limit as needed
                });

            // Step 3: Update backend status
            await axios.put(`http://localhost:5000/api/transactions/${transactionId}/complete`, {
                transactionHash: tx.transactionHash
            });

            setSuccess(`Transaction completed successfully! Tx Hash: ${tx.transactionHash}`);
        } catch (err) {
            console.error('Transaction completion error:', err);
            setError(err.message || 'Failed to complete transaction');
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
