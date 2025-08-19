
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import Landing from './pages/Landing';
// import AuthPage from './pages/Authpage';
// import Profile from './pages/ProfilePage';
// // import './App.css';

// // Placeholder components for future development
// // const LoginPage = () => (
// //   <div style={{ 
// //     display: 'flex', 
// //     justifyContent: 'center', 
// //     alignItems: 'center', 
// //     height: '100vh',
// //     fontSize: '1.5rem',
// //     color: '#166534'
// //   }}>
// //     Login Page - Coming Soon
// //   </div>
// // );

// // const UserAuth = () => (
// //   <div style={{ 
// //     display: 'flex', 
// //     justifyContent: 'center', 
// //     alignItems: 'center', 
// //     height: '100vh',
// //     fontSize: '1.5rem',
// //     color: '#166534'
// //   }}>
// //     User Authentication - Coming Soon
// //   </div>
// // );

// // const Dashboard = () => (
// //   <div style={{ 
// //     display: 'flex', 
// //     justifyContent: 'center', 
// //     alignItems: 'center', 
// //     height: '100vh',
// //     fontSize: '1.5rem',
// //     color: '#166534'
// //   }}>
// //     Dashboard - Coming Soon
// //   </div>
// // );

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Main landing page */}
//         <Route path="/" element={<Landing />} />
//         <Route path="/auth" element={<AuthPage />} />
//         <Route path="/profile" element={<Profile />} />
//         {/* <Route 
//           path="/profile" 
//           element={
//             isAuthenticated ? (
//               <ProfilePage onLogout={() => setIsAuthenticated(false)} />
//             ) : (
//               <Navigate to="/auth" replace />
//             )
//           } 
//         /> */}
        
//         {/* Authentication routes */}
//         {/* <Route path="/login" element={<LoginPage />} />
//         <Route path="/UserAuth" element={<UserAuth />} />
//         <Route path="/register" element={<UserAuth />} /> */}
        
//         {/* Dashboard route */}
//         {/* <Route path="/dashboard" element={<Dashboard />} /> */}
        
//         {/* Catch all route - redirect to home */}
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from 'frontend/src/components/Register.jsx';
import Login from 'frontend/src/components/Login.jsx';
import ProposeTransaction from 'frontedn/src/components/ProposeTransaction.jsx';
import VerifyTransaction from 'frontend/src/components/VerifyTransaction.jsx';
import CompleteTransaction from 'frontend/src/components/CompleteTransaction.jsx';
import Dashboard from 'frontend/src/components/Dashboard.jsx';
import './App.css';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/propose" element={<ProposeTransaction />} />
                <Route path="/verify" element={<VerifyTransaction />} />
                <Route path="/complete" element={<CompleteTransaction />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/" element={<Login />} />
            </Routes>
        </Router>
    );
}
export default App;

