import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProposeTransaction = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        buyerId: '',
        amount: '',
        price: ''
    });
    const [buyers, setBuyers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchBuyers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/users/buyers', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setBuyers(response.data);
            } catch (error) {
                console.error('Error fetching buyers:', error);
                setError('Failed to load buyers list');
            }
        };

        fetchBuyers();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                'http://localhost:5000/api/transactions/propose',
                formData,
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }
            );
            setSuccess(true);
            setFormData({ buyerId: '', amount: '', price: '' });
            if (onSuccess) onSuccess();
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to propose transaction');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3>Propose New Transaction</h3>
            </div>
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}
            {success && (
                <div className="alert alert-success">
                    Transaction proposed successfully!
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Select Buyer</label>
                    <select
                        name="buyerId"
                        value={formData.buyerId}
                        onChange={handleChange}
                        className="form-control"
                        required
                    >
                        <option value="">Select a buyer</option>
                        {buyers.map(buyer => (
                            <option key={buyer._id} value={buyer._id}>
                                {buyer.username}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Amount (Units)</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter amount of electricity units"
                        min="1"
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Price (ETH)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter price in ETH"
                        step="0.001"
                        min="0"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Proposing...' : 'Propose Transaction'}
                </button>
            </form>
        </div>
    );
};

export default ProposeTransaction;
