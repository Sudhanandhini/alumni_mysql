import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AddAlumni from './components/AddAlumni';
import ManageAlumni from './components/ManageAlumni';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/add" 
          element={
            <ProtectedRoute>
              <AddAlumni />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/edit/:id" 
          element={
            <ProtectedRoute>
              <AddAlumni />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage" 
          element={
            <ProtectedRoute>
              <ManageAlumni />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;