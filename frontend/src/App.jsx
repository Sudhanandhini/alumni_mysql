import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AddAlumni from './components/AddAlumni';
import ManageAlumni from './components/ManageAlumni';
import UserRegistration from './components/UserRegistration';
import UserLogin from './components/UserLogin';
import ViewAlumni from './components/ViewAlumni';
import ManageUsers from './components/ManageUsers';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Protected Route Component for Admin
const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Protected Route Component for User
const UserProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('userToken');
  return isAuthenticated ? children : <Navigate to="/user/login" />;
};

function App() {
  return (
    <Router>
      {/* Global Navbar - Appears on all pages */}
      <Navbar />
      
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<UserRegistration />} />
        
        {/* Admin Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/add" 
          element={
            <AdminProtectedRoute>
              <AddAlumni />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/edit/:id" 
          element={
            <AdminProtectedRoute>
              <AddAlumni />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage" 
          element={
            <AdminProtectedRoute>
              <ManageAlumni />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin/manage-users" 
          element={
            <AdminProtectedRoute>
              <ManageUsers />
            </AdminProtectedRoute>
          } 
        />
        
        {/* User Login */}
        <Route path="/user/login" element={<UserLogin />} />
        
        {/* Protected User Routes */}
        <Route 
          path="/user/view-alumni" 
          element={
            <UserProtectedRoute>
              <ViewAlumni />
            </UserProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;