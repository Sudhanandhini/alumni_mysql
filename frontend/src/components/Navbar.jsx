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

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/register', label: 'Directory' },
    { to: '/user/login', label: 'Events' },
    { to: '/mentorship', label: 'Mentorship' },
  ];

  return (
    <nav style={{
      background: '#fff',
      boxShadow: '0 1px 0 #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>

        {/* Brand */}
        <Link to="/" onClick={() => setIsOpen(false)} style={{
          display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none'
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: '#197fe6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(25,127,230,0.3)'
          }}>
            <i className="bi bi-mortarboard-fill" style={{ color: '#fff', fontSize: 18 }}></i>
          </div>
          <span style={{ color: '#111827', fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>
            AlumniConnect
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="d-none d-lg-flex" style={{ alignItems: 'center', gap: 4 }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} style={{
              padding: '8px 14px',
              borderRadius: 8,
              textDecoration: 'none',
              fontSize: 14.5,
              fontWeight: 500,
              color: location.pathname === link.to ? '#197fe6' : '#374151',
              background: 'transparent',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => { if (location.pathname !== link.to) e.currentTarget.style.color = '#197fe6'; }}
              onMouseLeave={e => { if (location.pathname !== link.to) e.currentTarget.style.color = '#374151'; }}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated && (
            <Link to="/admin" style={{
              padding: '8px 14px', borderRadius: 8, textDecoration: 'none',
              fontSize: 14.5, fontWeight: 500,
              color: location.pathname === '/admin' ? '#197fe6' : '#374151',
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => { if (location.pathname !== '/admin') e.currentTarget.style.color = '#197fe6'; }}
              onMouseLeave={e => { if (location.pathname !== '/admin') e.currentTarget.style.color = '#374151'; }}
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Desktop CTA */}
        <div className="d-none d-lg-flex" style={{ alignItems: 'center', gap: 10 }}>
          {isAuthenticated ? (
            <button onClick={handleLogout} style={{
              padding: '9px 22px', borderRadius: 9,
              border: '1.5px solid #197fe6',
              background: 'transparent', color: '#197fe6',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#197fe6'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#197fe6'; }}
            >
              <i className="bi bi-box-arrow-right"></i> Logout
            </button>
          ) : (
            <Link to="/login" style={{
              padding: '9px 22px', borderRadius: 9,
              background: '#197fe6', color: '#fff',
              fontSize: 14, fontWeight: 700, textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(25,127,230,0.3)',
              transition: 'all 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#1368c4'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#197fe6'; }}
            >
              Portal Login
            </Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="d-lg-none"
          onClick={() => setIsOpen(p => !p)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#374151', fontSize: 24, padding: 4
          }}
        >
          <i className={`bi ${isOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="d-lg-none" style={{
          background: '#fff', padding: '12px 24px 20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          {navLinks.map(item => (
            <Link key={item.to} to={item.to} onClick={() => setIsOpen(false)} style={{
              display: 'flex', alignItems: 'center', padding: '11px 12px',
              borderRadius: 9, textDecoration: 'none',
              color: location.pathname === item.to ? '#197fe6' : '#374151',
              fontSize: 14.5, fontWeight: 500, marginBottom: 4,
              background: location.pathname === item.to ? '#e8f2fd' : 'transparent',
            }}>
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/admin" onClick={() => setIsOpen(false)} style={{
                display: 'flex', alignItems: 'center', padding: '11px 12px',
                borderRadius: 9, textDecoration: 'none',
                color: '#374151', fontSize: 14.5, fontWeight: 500, marginBottom: 4,
              }}>
                Dashboard
              </Link>
              <button onClick={handleLogout} style={{
                width: '100%', marginTop: 8, padding: '11px 12px', borderRadius: 9,
                border: '1.5px solid #197fe6', background: 'transparent',
                color: '#197fe6', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10
              }}>
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 8, padding: '11px 12px', borderRadius: 9,
              background: '#197fe6', textDecoration: 'none',
              color: '#fff', fontSize: 14, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(25,127,230,0.3)'
            }}>
              Portal Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
