import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Transaction {
  _id: string;
  seller: { username: string; location: string };
  buyer: { username: string; email: string };
  electricityUnit: { generationSource: string; location: string };
  unitsRequested: number;
  totalAmount: number;
  status: string;
  proposedAt: string;
  verificationNotes?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  registrationDate: string;
}

const GovernmentDashboard: React.FC = () => {
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  useEffect(() => {
    fetchPendingTransactions();
    fetchAllTransactions();
    fetchUsers();
  }, []);

  const fetchPendingTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/government/transactions/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPendingTransactions(response.data);
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
    }
  };

  const fetchAllTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/government/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching all transactions:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/government/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleReviewTransaction = async (transactionId: string, action: 'approve' | 'reject') => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/government/transactions/${transactionId}/review`, {
        action,
        verificationNotes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowTransactionModal(false);
      setSelectedTransaction(null);
      setVerificationNotes('');
      fetchPendingTransactions();
      fetchAllTransactions();
      alert(`Transaction ${action}d successfully!`);
    } catch (error) {
      console.error('Error reviewing transaction:', error);
      alert('Error reviewing transaction');
    }
  };

  const handleUserStatusChange = async (userId: string, isActive: boolean) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/government/users/${userId}/status`, {
        isActive,
        reason: isActive ? 'Account activated by government' : 'Account suspended by government'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchUsers();
      alert(`User ${isActive ? 'activated' : 'suspended'} successfully!`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    }
  };

  const openTransactionModal = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'approved': return 'blue';
      case 'rejected': return 'red';
      case 'pending': return 'orange';
      case 'government_review': return 'purple';
      default: return 'gray';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Government Dashboard</h1>
      
      {/* Navigation Tabs */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button 
          onClick={() => setActiveTab('pending')}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            backgroundColor: activeTab === 'pending' ? '#007bff' : 'transparent',
            color: activeTab === 'pending' ? 'white' : '#007bff',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Pending Reviews ({pendingTransactions.length})
        </button>
        <button 
          onClick={() => setActiveTab('all')}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            backgroundColor: activeTab === 'all' ? '#007bff' : 'transparent',
            color: activeTab === 'all' ? 'white' : '#007bff',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          All Transactions
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ 
            padding: '10px 20px', 
            border: 'none', 
            backgroundColor: activeTab === 'users' ? '#007bff' : 'transparent',
            color: activeTab === 'users' ? 'white' : '#007bff',
            cursor: 'pointer'
          }}
        >
          User Management
        </button>
      </div>

      {/* Pending Transactions Tab */}
      {activeTab === 'pending' && (
        <div>
          <h2>Transactions Pending Review</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {pendingTransactions.map((transaction) => (
              <div key={transaction._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', backgroundColor: '#fff3cd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p><strong>Seller:</strong> {transaction.seller.username} ({transaction.seller.location})</p>
                    <p><strong>Buyer:</strong> {transaction.buyer.username}</p>
                    <p><strong>Units:</strong> {transaction.unitsRequested}</p>
                    <p><strong>Total Amount:</strong> ${transaction.totalAmount}</p>
                    <p><strong>Source:</strong> {transaction.electricityUnit.generationSource}</p>
                    <p><strong>Date:</strong> {new Date(transaction.proposedAt).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => openTransactionModal(transaction)}
                    style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Transactions Tab */}
      {activeTab === 'all' && (
        <div>
          <h2>All Transactions</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {allTransactions.map((transaction) => (
              <div key={transaction._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                <p><strong>Seller:</strong> {transaction.seller.username}</p>
                <p><strong>Buyer:</strong> {transaction.buyer.username}</p>
                <p><strong>Units:</strong> {transaction.unitsRequested}</p>
                <p><strong>Total Amount:</strong> ${transaction.totalAmount}</p>
                <p><strong>Status:</strong> 
                  <span style={{ color: getStatusColor(transaction.status), fontWeight: 'bold' }}>
                    {transaction.status.toUpperCase()}
                  </span>
                </p>
                <p><strong>Date:</strong> {new Date(transaction.proposedAt).toLocaleDateString()}</p>
                {transaction.verificationNotes && (
                  <p><strong>Notes:</strong> {transaction.verificationNotes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div>
          <h2>User Management</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {users.map((user) => (
              <div key={user._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>Status:</strong> 
                      <span style={{ color: user.isActive ? 'green' : 'red', fontWeight: 'bold' }}>
                        {user.isActive ? 'ACTIVE' : 'SUSPENDED'}
                      </span>
                    </p>
                    <p><strong>Registered:</strong> {new Date(user.registrationDate).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => handleUserStatusChange(user._id, !user.isActive)}
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: user.isActive ? '#dc3545' : '#28a745', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '3px', 
                      cursor: 'pointer' 
                    }}
                  >
                    {user.isActive ? 'Suspend' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Review Modal */}
      {showTransactionModal && selectedTransaction && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '500px', maxHeight: '80vh', overflow: 'auto' }}>
            <h3>Review Transaction</h3>
            <div style={{ marginBottom: '15px' }}>
              <p><strong>Transaction ID:</strong> {selectedTransaction._id}</p>
              <p><strong>Seller:</strong> {selectedTransaction.seller.username} ({selectedTransaction.seller.location})</p>
              <p><strong>Buyer:</strong> {selectedTransaction.buyer.username} ({selectedTransaction.buyer.email})</p>
              <p><strong>Units Requested:</strong> {selectedTransaction.unitsRequested}</p>
              <p><strong>Total Amount:</strong> ${selectedTransaction.totalAmount}</p>
              <p><strong>Generation Source:</strong> {selectedTransaction.electricityUnit.generationSource}</p>
              <p><strong>Location:</strong> {selectedTransaction.electricityUnit.location}</p>
              <p><strong>Proposed Date:</strong> {new Date(selectedTransaction.proposedAt).toLocaleString()}</p>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label><strong>Verification Notes:</strong></label>
              <textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                style={{ width: '100%', height: '80px', padding: '5px', marginTop: '5px' }}
                placeholder="Add your verification notes here..."
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => handleReviewTransaction(selectedTransaction._id, 'approve')}
                style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
              >
                Approve
              </button>
              <button 
                onClick={() => handleReviewTransaction(selectedTransaction._id, 'reject')}
                style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
              >
                Reject
              </button>
              <button 
                onClick={() => setShowTransactionModal(false)}
                style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GovernmentDashboard;
