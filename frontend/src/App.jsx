import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/public/Home';
import Login from './pages/public/Login';
import UserRegistration from './pages/public/UserRegistration';
import UserLogin from './pages/public/UserLogin';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddAlumni from './pages/admin/AddAlumni';
import ManageAlumni from './pages/admin/ManageAlumni';
import ManageUsers from './pages/admin/ManageUsers';
import PendingApprovals from './pages/admin/PendingApprovals';
import Broadcast from './pages/admin/Broadcast';
import Events from './pages/admin/Events';
import ViewAlumni from './pages/user/ViewAlumni';
import AlumniEditProfile from './pages/alumni/AlumniEditProfile';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';
import Terms from './pages/public/Terms';
import Privacy from './pages/public/Privacy';
import FeaturedAlumniEmbed from './pages/embed/FeaturedAlumniEmbed';

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
                    location.pathname.startsWith('/alumni/') ||
                    location.pathname.startsWith('/embed/');

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
          <Route path="/terms" element={<Terms />}  />
          <Route path="/privacy" element={<Privacy />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
          <Route path="/admin/add" element={<AdminProtectedRoute><AddAlumni /></AdminProtectedRoute>} />
          <Route path="/admin/edit/:id" element={<AdminProtectedRoute><AddAlumni /></AdminProtectedRoute>} />
          <Route path="/admin/manage" element={<AdminProtectedRoute><ManageAlumni /></AdminProtectedRoute>} />
          <Route path="/admin/manage-users" element={<AdminProtectedRoute><ManageUsers /></AdminProtectedRoute>} />
          <Route path="/admin/pending" element={<AdminProtectedRoute><PendingApprovals /></AdminProtectedRoute>} />
          <Route path="/admin/events" element={<AdminProtectedRoute><Events /></AdminProtectedRoute>} />
          <Route path="/admin/broadcast" element={<AdminProtectedRoute><Broadcast /></AdminProtectedRoute>} />

          {/* Alumni edit profile */}
          <Route path="/alumni/edit-profile" element={<UserProtectedRoute><AlumniEditProfile /></UserProtectedRoute>} />

          {/* Embed routes — no navbar/footer, open to external iframes */}
          <Route path="/embed/featured-alumni" element={<FeaturedAlumniEmbed />} />

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
    <Router basename="/alumni_app">
      <Layout />
    </Router>
  );
}

export default App;