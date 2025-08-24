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

