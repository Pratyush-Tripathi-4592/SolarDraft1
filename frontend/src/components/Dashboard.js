import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProposeTransaction from './ProposeTransaction';
import VerifyTransaction from './VerifyTransaction';
import CompleteTransaction from './CompleteTransaction';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                setUserRole(user.role);
                
                const response = await axios.get('http://localhost:5000/api/transactions', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                setTransactions(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderTransactionList = () => (
        <div className="transaction-list">
            <h3>Transaction History</h3>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Seller</th>
                        <th>Buyer</th>
                        <th>Amount</th>
                        <th>Price</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(tx => (
                        <tr key={tx._id}>
                            <td>{tx._id}</td>
                            <td>{tx.seller.username}</td>
                            <td>{tx.buyer.username}</td>
                            <td>{tx.amount}</td>
                            <td>{tx.price}</td>
                            <td>{tx.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    if (loading) return <div>Loading...</div>;

    return (
        <div className="dashboard">
            <h2>Electricity Trading Dashboard</h2>
            {userRole === 'owner' && <ProposeTransaction />}
            {userRole === 'government' && <VerifyTransaction />}
            {userRole === 'buyer' && <CompleteTransaction />}
            {renderTransactionList()}
        </div>
    );
};

export default Dashboard;
