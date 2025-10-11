import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('adminToken');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black shadow-sm">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-mortarboard-fill me-2"></i>
          <span className="fw-bold">Alumni Portal</span>
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
              >
                <i className="bi bi-house-fill me-1"></i>
                Home
              </Link>
            </li>
            
            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`} 
                    to="/admin"
                  >
                    <i className="bi bi-gear-fill me-1"></i>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <button 
                    className="btn btn-outline-light ms-2" 
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="btn btn-outline-light ms-2" to="/login">
                  <i className="bi bi-lock-fill me-1"></i>
                  Admin Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;