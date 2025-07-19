
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import AuthPage from './pages/Authpage';
import ProfilePage from './pages/ProfilePage';
// import './App.css';

// Placeholder components for future development
// const LoginPage = () => (
//   <div style={{ 
//     display: 'flex', 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     height: '100vh',
//     fontSize: '1.5rem',
//     color: '#166534'
//   }}>
//     Login Page - Coming Soon
//   </div>
// );

// const UserAuth = () => (
//   <div style={{ 
//     display: 'flex', 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     height: '100vh',
//     fontSize: '1.5rem',
//     color: '#166534'
//   }}>
//     User Authentication - Coming Soon
//   </div>
// );

// const Dashboard = () => (
//   <div style={{ 
//     display: 'flex', 
//     justifyContent: 'center', 
//     alignItems: 'center', 
//     height: '100vh',
//     fontSize: '1.5rem',
//     color: '#166534'
//   }}>
//     Dashboard - Coming Soon
//   </div>
// );

function App() {
  return (
    <Router>
      <Routes>
        {/* Main landing page */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthPage />} />
        {/* <Route 
          path="/profile" 
          element={
            isAuthenticated ? (
              <ProfilePage onLogout={() => setIsAuthenticated(false)} />
            ) : (
              <Navigate to="/auth" replace />
            )
          } 
        /> */}
        
        {/* Authentication routes */}
        {/* <Route path="/login" element={<LoginPage />} />
        <Route path="/UserAuth" element={<UserAuth />} />
        <Route path="/register" element={<UserAuth />} /> */}
        
        {/* Dashboard route */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;