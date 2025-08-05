import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProposeTransaction from './ProposeTransaction';
import VerifyTransaction from './VerifyTransaction';
import CompleteTransaction from './CompleteTransaction';
import './Dashboard.css';

const Dashboard = () => {
    const [transactions, setTransactions] = useState([]);
    const [userRole, setUserRole] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalTransactions: 0,
        pendingTransactions: 0,
        completedTransactions: 0,
        totalUnits: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                setUserRole(user.role);
                
                const [transactionsRes, statsRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/transactions', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    }),
                    axios.get('http://localhost:5000/api/transactions/stats', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    })
                ]);

                setTransactions(transactionsRes.data);
                setStats(statsRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError(error.response?.data?.message || 'An error occurred');
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const getStatusBadgeClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'status-badge status-pending';
            case 'approved': return 'status-badge status-approved';
            case 'rejected': return 'status-badge status-rejected';
            case 'completed': return 'status-badge status-completed';
            default: return 'status-badge';
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const renderStats = () => (
        <div className="stats-container">
            <div className="stat-card">
                <h3>Total Transactions</h3>
                <p>{stats.totalTransactions}</p>
            </div>
            <div className="stat-card">
                <h3>Pending Transactions</h3>
                <p>{stats.pendingTransactions}</p>
            </div>
            <div className="stat-card">
                <h3>Completed Transactions</h3>
                <p>{stats.completedTransactions}</p>
            </div>
            <div className="stat-card">
                <h3>Total Units Traded</h3>
                <p>{stats.totalUnits}</p>
            </div>
        </div>
    );

    const renderTransactionList = () => (
        <div className="card">
            <div className="card-header">
                <h3>Transaction History</h3>
            </div>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Seller</th>
                            <th>Buyer</th>
                            <th>Amount (Units)</th>
                            <th>Price (ETH)</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx._id}>
                                <td>{tx._id.slice(0, 8)}...</td>
                                <td>{tx.seller.username}</td>
                                <td>{tx.buyer.username}</td>
                                <td>{tx.amount}</td>
                                <td>{tx.price}</td>
                                <td>
                                    <span className={getStatusBadgeClass(tx.status)}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td>{new Date(tx.timestamp).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    if (loading) return (
        <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading dashboard...</p>
        </div>
    );

    if (error) return (
        <div className="error-container">
            <h3>Error</h3>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
                Retry
            </button>
        </div>
    );

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="navbar-brand">
                    Solar Draft
                </div>
                <div className="nav-links">
                    <span className="nav-link">Welcome, {JSON.parse(localStorage.getItem('user')).username}</span>
                    <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
                </div>
            </nav>
            
            <main className="main-content">
                <div className="dashboard-header">
                    <h2>Electricity Trading Dashboard</h2>
                    <p>Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
                </div>

                {renderStats()}

                <div className="actions-container">
                    {userRole === 'seller' && (
                        <div className="card">
                            <ProposeTransaction onSuccess={() => window.location.reload()} />
                        </div>
                    )}
                    {userRole === 'government' && (
                        <div className="card">
                            <VerifyTransaction onSuccess={() => window.location.reload()} />
                        </div>
                    )}
                    {userRole === 'buyer' && (
                        <div className="card">
                            <CompleteTransaction onSuccess={() => window.location.reload()} />
                        </div>
                    )}
                </div>

                {renderTransactionList()}
            </main>
        </div>
    );
};

export default Dashboard;
