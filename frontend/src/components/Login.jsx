import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        localStorage.setItem('adminToken', 'authenticated');
        navigate('/admin');
      } else {
        setError('Invalid username or password');
      }
      setLoading(false);
    }, 1000);
  };

  const inputStyle = {
    width: '100%', padding: '13px 14px 13px 42px', border: '1.5px solid #e5e7eb',
    borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fafafa'
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Left panel */}
      <div className="d-none d-lg-flex" style={{ width: 420, flexShrink: 0, flexDirection: 'column', background: '#1a2744', padding: '52px 44px', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-shield-lock-fill text-white" style={{ fontSize: 22 }}></i>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#fff' }}>Admin Portal</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Secure Admin Access</div>
            </div>
          </div>
          <h1 style={{ fontWeight: 800, fontSize: 28, color: '#fff', lineHeight: 1.4, marginBottom: 12 }}>Admin Control Panel</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 40 }}>
            Manage alumni records, approve registrations, and oversee the entire alumni network.
          </p>
          {['Manage all alumni profiles', 'Approve pending registrations', 'View analytics & reports', 'Full database control'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="bi bi-check2" style={{ color: '#fff', fontSize: 14 }}></i>
              </div>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', fontWeight: 500 }}>{f}</span>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', margin: 0, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24 }}>
          "Restricted access — administrators only."
        </p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div className="d-flex d-lg-none align-items-center gap-3 mb-5">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1a2744', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-shield-lock-fill text-white" style={{ fontSize: 18 }}></i>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#1a2744' }}>Admin Portal</div>
          </div>

          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontWeight: 800, fontSize: 26, color: '#1a2744', marginBottom: 6 }}>Admin Sign In</h2>
            <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Enter your administrator credentials</p>
          </div>

          {error && (
            <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="bi bi-exclamation-circle-fill" style={{ color: '#dc2626', fontSize: 16, flexShrink: 0 }}></i>
              <span style={{ fontSize: 14, color: '#b91c1c' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person-fill" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16, pointerEvents: 'none' }}></i>
                <input type="text" name="username" value={credentials.username} onChange={handleChange}
                  placeholder="Enter admin username" required autoFocus autoComplete="username"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#1a2744'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock-fill" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16, pointerEvents: 'none' }}></i>
                <input type={showPass ? 'text' : 'password'} name="password" value={credentials.password} onChange={handleChange}
                  placeholder="Enter password" required autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: 44 }}
                  onFocus={e => e.target.style.borderColor = '#1a2744'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: 16 }}></i>
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: 14, background: loading ? '#9ca3af' : '#1a2744',
              color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(26,39,68,0.3)', marginBottom: 20
            }}>
              {loading
                ? <><span className="spinner-border spinner-border-sm"></span> Signing in...</>
                : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>
              }
            </button>

            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#6b7280', textAlign: 'center' }}>
              <i className="bi bi-info-circle me-1" style={{ color: '#1a2744' }}></i>
              Demo: <strong style={{ color: '#1a2744' }}>admin</strong> / <strong style={{ color: '#1a2744' }}>admin123</strong>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <i className="bi bi-arrow-left"></i> Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

