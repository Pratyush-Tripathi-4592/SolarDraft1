// frontend/src/components/ProposeTransaction.js
import React, { useState } from 'react';
import axios from 'axios';

const ProposeTransaction = () => {
    const [buyerId, setBuyerId] = useState('');
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/transactions/propose', {
                buyerId,
                amount,
                price
            });
            alert(response.data.message);
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    return (
        <div>
            <h2>Propose Transaction</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Buyer ID" value={buyerId} onChange={(e) => setBuyerId(e.target.value)} required />
                <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required />
                <button type="submit">Propose</button>
            </form>
        </div>
    );
};

export default ProposeTransaction;
