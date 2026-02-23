import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import PendingApprovals from './components/PendingApprovals';
import AlumniEditProfile from './components/AlumniEditProfile';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import Footer from './components/Footer';

// Protected Route Component for Admin
const AdminProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('adminToken');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Protected Route Component for User
const UserProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('userToken') || localStorage.getItem('alumniToken');
  return isAuthenticated ? children : <Navigate to="/user/login" />;
};

// Layout wrapper — hides global Navbar/Footer on admin & user-dashboard routes
function Layout() {
  const location = useLocation();
  const hideShell = location.pathname.startsWith('/admin') ||
                    location.pathname.startsWith('/user/') ||
                    location.pathname.startsWith('/alumni/');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideShell && <Navbar />}
      <div style={{ flex: '1' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<UserRegistration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/add" element={<AdminProtectedRoute><AddAlumni /></AdminProtectedRoute>} />
          <Route path="/admin/edit/:id" element={<AdminProtectedRoute><AddAlumni /></AdminProtectedRoute>} />
          <Route path="/admin/manage" element={<AdminProtectedRoute><ManageAlumni /></AdminProtectedRoute>} />
          <Route path="/admin/manage-users" element={<AdminProtectedRoute><ManageUsers /></AdminProtectedRoute>} />
          <Route path="/admin/pending" element={<AdminProtectedRoute><PendingApprovals /></AdminProtectedRoute>} />

          {/* Alumni edit profile */}
          <Route path="/alumni/edit-profile" element={<UserProtectedRoute><AlumniEditProfile /></UserProtectedRoute>} />

          {/* User routes */}
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/view-alumni" element={<UserProtectedRoute><ViewAlumni /></UserProtectedRoute>} />
        </Routes>
      </div>
      {!hideShell && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;