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

  const navLinkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 14px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    color: location.pathname === path ? '#fff' : 'rgba(255,255,255,0.7)',
    background: location.pathname === path ? 'rgba(255,255,255,0.12)' : 'transparent',
    transition: 'all 0.15s',
  });

  return (
    <nav style={{
      background: '#1a2744',
      boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Brand */}
        <Link to="/" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-mortarboard-fill" style={{ color: '#fff', fontSize: 17 }}></i>
          </div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>Alumni Portal</span>
        </Link>

        {/* Desktop nav */}
        <div className="d-none d-lg-flex" style={{ alignItems: 'center', gap: 4 }}>
          <Link to="/" style={navLinkStyle('/')}>
            <i className="bi bi-house-fill"></i> Home
          </Link>
          <Link to="/register" style={navLinkStyle('/register')}>
            <i className="bi bi-person-plus-fill"></i> Register
          </Link>
          <Link to="/user/login" style={navLinkStyle('/user/login')}>
            <i className="bi bi-person-circle"></i> User Login
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/admin" style={navLinkStyle('/admin')}>
                <i className="bi bi-grid-fill"></i> Dashboard
              </Link>
              <button onClick={handleLogout} style={{
                marginLeft: 8, padding: '8px 18px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.35)',
                background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
              }}>
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </>
          ) : (
            <Link to="/login" style={{
              marginLeft: 8, padding: '8px 18px', borderRadius: 8, border: '1.5px solid rgba(255,255,255,0.35)',
              background: 'transparent', color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s'
            }}>
              <i className="bi bi-lock-fill"></i> Admin Login
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="d-lg-none"
          onClick={() => setIsOpen(p => !p)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 24, padding: 4 }}
        >
          <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="d-lg-none" style={{ background: '#141e36', padding: '12px 24px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { to: '/',          icon: 'bi-house-fill',       label: 'Home'       },
            { to: '/register',  icon: 'bi-person-plus-fill', label: 'Register'   },
            { to: '/user/login',icon: 'bi-person-circle',    label: 'User Login' },
          ].map(item => (
            <Link key={item.to} to={item.to} onClick={() => setIsOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 9,
              textDecoration: 'none', color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500,
              marginBottom: 4, background: location.pathname === item.to ? 'rgba(255,255,255,0.1)' : 'transparent',
            }}>
              <i className={`bi ${item.icon}`}></i> {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/admin" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 9, textDecoration: 'none', color: 'rgba(255,255,255,0.75)', fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                <i className="bi bi-grid-fill"></i> Dashboard
              </Link>
              <button onClick={handleLogout} style={{ width: '100%', marginTop: 8, padding: '11px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, padding: '11px 12px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.2)', textDecoration: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: 600, justifyContent: 'center' }}>
              <i className="bi bi-lock-fill"></i> Admin Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;