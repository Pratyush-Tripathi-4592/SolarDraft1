import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VerifyTransaction = ({ onSuccess }) => {
    const [pendingTransactions, setPendingTransactions] = useState([]);
    const [selectedTransaction, setSelectedTransaction] = useState('');
    const [approved, setApproved] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchPendingTransactions();
    }, []);

    const fetchPendingTransactions = async () => {
        try {
            const response = await axios.get(
                'http://localhost:5000/api/transactions/pending',
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setPendingTransactions(response.data);
        } catch (error) {
            console.error('Error fetching pending transactions:', error);
            setError('Failed to load pending transactions');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                'http://localhost:5000/api/transactions/verify',
                {
                    transactionId: selectedTransaction,
                    approved
                },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setSuccess(true);
            setSelectedTransaction('');
            fetchPendingTransactions();
            if (onSuccess) onSuccess();
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to verify transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>Verify Transaction</h3>
            </div>
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    Transaction verification completed successfully!
                </div>
            )}
            {pendingTransactions.length === 0 ? (
                <div className="alert alert-info">
                    No pending transactions to verify.
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Select Transaction</label>
                        <select
                            value={selectedTransaction}
                            onChange={(e) => setSelectedTransaction(e.target.value)}
                            className="form-control"
                            required
                        >
                            <option value="">Select a transaction</option>
                            {pendingTransactions.map(tx => (
                                <option key={tx._id} value={tx._id}>
                                    {`${tx.seller.username} → ${tx.buyer.username} (${tx.amount} units, ${tx.price} ETH)`}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Decision</label>
                        <div className="button-group">
                            <button
                                type="button"
                                className={`btn ${approved ? 'btn-success' : 'btn-outline-success'}`}
                                onClick={() => setApproved(true)}
                            >
                                Approve
                            </button>
                            <button
                                type="button"
                                className={`btn ${!approved ? 'btn-danger' : 'btn-outline-danger'}`}
                                onClick={() => setApproved(false)}
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !selectedTransaction}
                    >
                        {loading ? 'Processing...' : 'Submit Verification'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default VerifyTransaction;
