// frontend/src/components/VerifyTransaction.js
import React, { useState } from 'react';
import axios from 'axios';

const VerifyTransaction = () => {
    const [transactionId, setTransactionId] = useState('');
    const [approved, setApproved] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/transactions/verify', {
                transactionId,
                approved
            });
            alert(response.data.message);
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    return (
        <div>
            <h2>Verify Transaction</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} required />
                <select value={approved} onChange={(e) => setApproved(e.target.value === 'true')}>
                    <option value="false">Reject</option>
                    <option value="true">Approve</option>
                </select>
                <button type="submit">Verify</button>
            </form>
        </div>
    );
};

export default VerifyTransaction;
