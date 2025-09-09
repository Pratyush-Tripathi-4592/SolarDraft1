import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ElectricityUnit {
  _id: string;
  unitsAvailable: number;
  pricePerUnit: number;
  generationSource: string;
  location: string;
  isActive: boolean;
}

interface Transaction {
  _id: string;
  buyer: { username: string };
  unitsRequested: number;
  totalAmount: number;
  status: string;
  proposedAt: string;
}

const SellerDashboard: React.FC = () => {
  const [units, setUnits] = useState<ElectricityUnit[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({
    unitsAvailable: '',
    pricePerUnit: '',
    generationSource: 'solar',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchUnits();
    fetchTransactions();
  }, []);

  const fetchUnits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/seller/units', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/seller/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/seller/units', newUnit, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewUnit({
        unitsAvailable: '',
        pricePerUnit: '',
        generationSource: 'solar',
        location: '',
        description: ''
      });
      setShowAddUnit(false);
      fetchUnits();
    } catch (error) {
      console.error('Error adding unit:', error);
    }
  };

  const handleRespondToTransaction = async (transactionId: string, action: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/seller/transactions/${transactionId}/respond`, 
        { action, sellerNotes: `${action}ed by seller` },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTransactions();
    } catch (error) {
      console.error('Error responding to transaction:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Seller Dashboard</h1>
      
      {/* Add New Unit Section */}
      <div style={{ marginBottom: '30px', border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
        <h2>Electricity Units Management</h2>
        <button 
          onClick={() => setShowAddUnit(!showAddUnit)}
          style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
        >
          {showAddUnit ? 'Cancel' : 'Add New Unit'}
        </button>

        {showAddUnit && (
          <form onSubmit={handleAddUnit} style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label>Units Available:</label>
              <input
                type="number"
                value={newUnit.unitsAvailable}
                onChange={(e) => setNewUnit({...newUnit, unitsAvailable: e.target.value})}
                style={{ marginLeft: '10px', padding: '5px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Price per Unit:</label>
              <input
                type="number"
                step="0.01"
                value={newUnit.pricePerUnit}
                onChange={(e) => setNewUnit({...newUnit, pricePerUnit: e.target.value})}
                style={{ marginLeft: '10px', padding: '5px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Generation Source:</label>
              <select
                value={newUnit.generationSource}
                onChange={(e) => setNewUnit({...newUnit, generationSource: e.target.value})}
                style={{ marginLeft: '10px', padding: '5px' }}
              >
                <option value="solar">Solar</option>
                <option value="wind">Wind</option>
                <option value="hydro">Hydro</option>
                <option value="thermal">Thermal</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Location:</label>
              <input
                type="text"
                value={newUnit.location}
                onChange={(e) => setNewUnit({...newUnit, location: e.target.value})}
                style={{ marginLeft: '10px', padding: '5px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label>Description:</label>
              <textarea
                value={newUnit.description}
                onChange={(e) => setNewUnit({...newUnit, description: e.target.value})}
                style={{ marginLeft: '10px', padding: '5px', width: '200px' }}
              />
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
              Add Unit
            </button>
          </form>
        )}
      </div>

      {/* Units List */}
      <div style={{ marginBottom: '30px' }}>
        <h3>My Electricity Units</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {units.map((unit) => (
            <div key={unit._id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
              <p><strong>Units Available:</strong> {unit.unitsAvailable}</p>
              <p><strong>Price per Unit:</strong> ${unit.pricePerUnit}</p>
              <p><strong>Source:</strong> {unit.generationSource}</p>
              <p><strong>Location:</strong> {unit.location}</p>
              <p><strong>Status:</strong> {unit.isActive ? 'Active' : 'Inactive'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h3>Transaction Requests</h3>
        <div style={{ display: 'grid', gap: '10px' }}>
          {transactions.filter(t => t.status === 'pending').map((transaction) => (
            <div key={transaction._id} style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
              <p><strong>Buyer:</strong> {transaction.buyer.username}</p>
              <p><strong>Units Requested:</strong> {transaction.unitsRequested}</p>
              <p><strong>Total Amount:</strong> ${transaction.totalAmount}</p>
              <p><strong>Status:</strong> {transaction.status}</p>
              <p><strong>Date:</strong> {new Date(transaction.proposedAt).toLocaleDateString()}</p>
              <div style={{ marginTop: '10px' }}>
                <button 
                  onClick={() => handleRespondToTransaction(transaction._id, 'accept')}
                  style={{ padding: '5px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '10px' }}
                >
                  Accept
                </button>
                <button 
                  onClick={() => handleRespondToTransaction(transaction._id, 'reject')}
                  style={{ padding: '5px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
