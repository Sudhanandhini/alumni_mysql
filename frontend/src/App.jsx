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
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import ViewAlumni from './components/ViewAlumni';
import ManageUsers from './components/ManageUsers';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import Footer from './components/Footer';
import AlumniLogin from './components/AlumniLogin';

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
    <Router >
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Global Navbar - Appears on all pages */}
        <Navbar />
        
        <div style={{ flex: '1' }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<UserRegistration />} />
            
            {/* Admin Login */}
            <Route path="/login" element={<Login />} />

      <Route path="/alumni-login" element={<AlumniLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
            
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
        </div>

        <Footer />
      </div>
    </Router>

   
  );
}

export default App;