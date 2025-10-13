import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('adminToken');
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
    setIsOpen(false);
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black shadow-sm">
      <div className="container py-3">
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeMenu}>
          <i className="bi bi-mortarboard-fill me-2"></i>
          <span className="fw-bold">Alumni Portal</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                to="/"
                onClick={closeMenu}
              >
                <i className="bi bi-house-fill me-1"></i>
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link
                className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}
                to="/register"
                onClick={closeMenu}
              >
                <i className="bi bi-person-plus-fill me-1"></i>
                Register
              </Link>
            </li>

            <li className="nav-item">
              <Link className="nav-link" to="/user/login">
                <i className="bi bi-person-circle me-1"></i>
                User Login
              </Link>
            </li>

            {isAuthenticated ? (
              <>
                <li className="nav-item">
                  <Link
                    className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                    to="/admin"
                    onClick={closeMenu}
                  >
                    <i className="bi bi-gear-fill me-1"></i>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item mt-2 mt-lg-0">
                  <button
                    className="btn btn-outline-light ms-lg-2 w-100"
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item mt-2 mt-lg-0">
                <Link
                  className="btn btn-outline-light ms-lg-2 w-100"
                  to="/login"
                  onClick={closeMenu}
                >
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