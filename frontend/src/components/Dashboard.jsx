import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionAPI } from '../services/api';
import { motion } from 'framer-motion';
import ProposeTransaction from './ProposeTransaction';
import VerifyTransaction from './VerifyTransaction';
import CompleteTransaction from './CompleteTransaction';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
    totalUnits: 0,
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
          transactionAPI.getAll(),
          transactionAPI.getStats(),
        ]);

        setTransactions(transactionsRes.data.data || transactionsRes.data);
        setStats(statsRes.data.data || statsRes.data);
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
    const base = 'px-3 py-1 rounded-full text-sm font-medium text-white';
    switch (status.toLowerCase()) {
      case 'pending': return `${base} bg-yellow-600`;
      case 'approved': return `${base} bg-green-600`;
      case 'rejected': return `${base} bg-red-600`;
      case 'completed': return `${base} bg-blue-700`;
      default: return `${base} bg-gray-500`;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-6">
      {[
        { title: 'Total Transactions', value: stats.totalTransactions },
        { title: 'Pending Transactions', value: stats.pendingTransactions },
        { title: 'Completed Transactions', value: stats.completedTransactions },
        { title: 'Total Units Traded', value: stats.totalUnits },
      ].map((s, i) => (
        <motion.div
          key={i}
          whileHover={{ scale: 1.05 }}
          className="rounded-2xl bg-gradient-to-br from-[#152f04] via-[#3e5b3e] to-[#103121] text-white p-6 shadow-lg"
        >
          <h3 className="text-lg font-semibold">{s.title}</h3>
          <p className="text-3xl font-bold mt-2">{s.value}</p>
        </motion.div>
      ))}
    </div>
  );

  const renderTransactionList = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#0a3b24] text-white rounded-xl shadow-lg overflow-hidden"
    >
      <div className="bg-[#103121] px-6 py-4 border-b border-[#5A7C5A] flex items-center justify-between">
        <h3 className="text-xl font-semibold">Transaction History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#152f04] text-[#b7cbb7]">
            <tr>
              <th className="px-6 py-3">ID</th>
              <th className="px-6 py-3">Seller</th>
              <th className="px-6 py-3">Buyer</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Price (ETH)</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, i) => (
              <tr
                key={i}
                className="hover:bg-[#1b5032] transition duration-200"
              >
                <td className="px-6 py-3">{tx._id.slice(0, 8)}...</td>
                <td className="px-6 py-3">{tx.seller.username}</td>
                <td className="px-6 py-3">{tx.buyer.username}</td>
                <td className="px-6 py-3">{tx.amount}</td>
                <td className="px-6 py-3">{tx.price}</td>
                <td className="px-6 py-3">
                  <span className={getStatusBadgeClass(tx.status)}>
                    {tx.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {new Date(tx.timestamp).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a3b24] text-white">
        <div className="loader border-t-4 border-[#5A7C5A] border-solid rounded-full w-12 h-12 animate-spin mb-4"></div>
        <p>Loading dashboard...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a3b24] text-white">
        <h3 className="text-2xl font-bold mb-2">Error</h3>
        <p>{error}</p>
        <button
          className="mt-4 bg-[#3e5b3e] px-4 py-2 rounded-lg hover:bg-[#5A7C5A] transition"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#152f04] via-[#3e5b3e] to-[#0a3b24] text-white flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 bg-[#103121] shadow-md">
        <div className="text-2xl font-bold">⚡ Solar Draft</div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">
            Welcome, {JSON.parse(localStorage.getItem('user')).username}
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Electricity Trading Dashboard</h2>
          <p className="text-sm mt-1 opacity-80">
            Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </p>
        </div>

        {renderStats()}

        <div className="grid md:grid-cols-2 gap-6 my-6">
          {userRole === 'seller' && (
            <motion.div whileHover={{ scale: 1.02 }}>
              <ProposeTransaction onSuccess={() => window.location.reload()} />
            </motion.div>
          )}
          {userRole === 'government' && (
            <motion.div whileHover={{ scale: 1.02 }}>
              <VerifyTransaction onSuccess={() => window.location.reload()} />
            </motion.div>
          )}
          {userRole === 'buyer' && (
            <motion.div whileHover={{ scale: 1.02 }}>
              <CompleteTransaction onSuccess={() => window.location.reload()} />
            </motion.div>
          )}
        </div>

        {renderTransactionList()}
      </main>
    </div>
  );
};

export default Dashboard;
