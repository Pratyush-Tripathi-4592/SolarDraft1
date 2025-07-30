import React from 'react';

const Profile = () => {
  // Sample user data, replace with actual user data from your state management or API
  const userData = {
    connectionNumber: 'SC123456789',
    electricityBoard: 'Green Energy Board',
    aadharCard: '1234-5678-9012',
    name: 'John Doe',
    email: 'john.doe@example.com',
  };

  const profileStyles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '400px',
      textAlign: 'center',
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '1.5rem',
    },
    info: {
      margin: '1rem 0',
      fontSize: '1rem',
      color: '#4b5563',
    },
    button: {
      padding: '0.8rem 1.5rem',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      border: 'none',
      background: 'linear-gradient(90deg, #22c55e, #059669)',
      color: 'white',
      transition: 'all 0.3s ease',
    },
  };

  const handleLogout = () => {
    // Implement logout logic here
    alert('Logged out!');
    // Example: Clear user session, redirect to login page
  };

  return (
    <div style={profileStyles.container}>
      <div style={profileStyles.card}>
        <h2 style={profileStyles.title}>User  Profile</h2>
        <div style={profileStyles.info}>
          <strong>Name:</strong> {userData.name}
        </div>
        <div style={profileStyles.info}>
          <strong>Email:</strong> {userData.email}
        </div>
        <div style={profileStyles.info}>
          <strong>Connection Number:</strong> {userData.connectionNumber}
        </div>
        <div style={profileStyles.info}>
          <strong>Electricity Board:</strong> {userData.electricityBoard}
        </div>
        <div style={profileStyles.info}>
          <strong>Aadhar Card:</strong> {userData.aadharCard}
        </div>
        <button style={profileStyles.button} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;