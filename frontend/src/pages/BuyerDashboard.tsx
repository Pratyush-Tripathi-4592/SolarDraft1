import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ElectricityUnit {
  _id: string;
  seller: { username: string; location: string };
  unitsAvailable: number;
  pricePerUnit: number;
  generationSource: string;
  location: string;
  description?: string;
}

interface Transaction {
  _id: string;
  seller: { username: string };
  electricityUnit: { generationSource: string; location: string };
  unitsRequested: number;
  totalAmount: number;
  status: string;
  proposedAt: string;
}

const BuyerDashboard: React.FC = () => {
  const [availableUnits, setAvailableUnits] = useState<ElectricityUnit[]>([]);
  const [myTransactions, setMyTransactions] = useState<Transaction[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<ElectricityUnit | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  useEffect(() => {
    fetchAvailableUnits();
    fetchMyTransactions();
  }, []);

  const fetchAvailableUnits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/buyer/units', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAvailableUnits(response.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const fetchMyTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/buyer/transactions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handlePurchaseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/buyer/purchase-request', {
        electricityUnitId: selectedUnit._id,
        unitsRequested: parseInt(purchaseAmount),
        buyerNotes: 'Purchase request from buyer dashboard'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowPurchaseForm(false);
      setSelectedUnit(null);
      setPurchaseAmount('');
      fetchMyTransactions();
      alert('Purchase request submitted successfully!');
    } catch (error) {
      console.error('Error creating purchase request:', error);
      alert('Error submitting purchase request');
    }
  };

  const handleCompleteTransaction = async (transactionId: string) => {
    try {
      // Generate MetaMask transaction data
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/blockchain/transaction/${transactionId}/metamask`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { transactionData } = response.data;

      // Check if MetaMask is available
      if (typeof window.ethereum !== 'undefined') {
        try {
          // Request account access
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Send transaction via MetaMask
          const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [transactionData]
          });

          // Confirm transaction completion
          await axios.post(`/api/blockchain/transaction/${transactionId}/confirm`, {
            txHash: txHash,
            contractAddress: transactionData.to
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          alert('Transaction completed successfully!');
          fetchMyTransactions();
        } catch (error) {
          console.error('MetaMask transaction error:', error);
          alert('Transaction failed. Please try again.');
        }
      } else {
        alert('MetaMask not detected. Please install MetaMask to complete transactions.');
      }
    } catch (error) {
      console.error('Error completing transaction:', error);
      alert('Error completing transaction');
    }
  };

  const openPurchaseForm = (unit: ElectricityUnit) => {
    setSelectedUnit(unit);
    setShowPurchaseForm(true);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Buyer Dashboard</h1>
      
      {/* Available Units */}
      <div style={{ marginBottom: '30px' }}>
        <h2>Available Electricity Units</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          {availableUnits.map((unit) => (
            <div key={unit._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p><strong>Seller:</strong> {unit.seller.username}</p>
                  <p><strong>Units Available:</strong> {unit.unitsAvailable}</p>
                  <p><strong>Price per Unit:</strong> ${unit.pricePerUnit}</p>
                  <p><strong>Source:</strong> {unit.generationSource}</p>
                  <p><strong>Location:</strong> {unit.location}</p>
                  {unit.description && <p><strong>Description:</strong> {unit.description}</p>}
                </div>
                <button 
                  onClick={() => openPurchaseForm(unit)}
                  style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                >
                  Purchase
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchase Form Modal */}
      {showPurchaseForm && selectedUnit && (
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
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '5px', width: '400px' }}>
            <h3>Purchase Electricity Units</h3>
            <p><strong>Seller:</strong> {selectedUnit.seller.username}</p>
            <p><strong>Available:</strong> {selectedUnit.unitsAvailable} units</p>
            <p><strong>Price per Unit:</strong> ${selectedUnit.pricePerUnit}</p>
            
            <form onSubmit={handlePurchaseRequest}>
              <div style={{ marginBottom: '15px' }}>
                <label>Units to Purchase:</label>
                <input
                  type="number"
                  min="1"
                  max={selectedUnit.unitsAvailable}
                  value={purchaseAmount}
                  onChange={(e) => setPurchaseAmount(e.target.value)}
                  style={{ marginLeft: '10px', padding: '5px', width: '100px' }}
                  required
                />
              </div>
              <p><strong>Total Cost:</strong> ${(parseFloat(purchaseAmount) * selectedUnit.pricePerUnit || 0).toFixed(2)}</p>
              
              <div style={{ marginTop: '20px' }}>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginRight: '10px' }}>
                  Submit Request
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPurchaseForm(false)}
                  style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* My Transactions */}
      <div>
        <h2>My Transactions</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          {myTransactions.map((transaction) => (
            <div key={transaction._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p><strong>Seller:</strong> {transaction.seller.username}</p>
                  <p><strong>Units:</strong> {transaction.unitsRequested}</p>
                  <p><strong>Total Amount:</strong> ${transaction.totalAmount}</p>
                  <p><strong>Status:</strong> 
                    <span style={{ 
                      color: transaction.status === 'completed' ? 'green' : 
                            transaction.status === 'approved' ? 'blue' : 
                            transaction.status === 'rejected' ? 'red' : 'orange' 
                    }}>
                      {transaction.status.toUpperCase()}
                    </span>
                  </p>
                  <p><strong>Date:</strong> {new Date(transaction.proposedAt).toLocaleDateString()}</p>
                </div>
                {transaction.status === 'approved' && (
                  <button 
                    onClick={() => handleCompleteTransaction(transaction._id)}
                    style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}
                  >
                    Complete Payment (MetaMask)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
