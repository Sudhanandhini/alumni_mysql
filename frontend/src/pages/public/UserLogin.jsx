import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Single unified login â€” tries alumni table first, then users table
function UserLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1ï¸âƒ£  Try Alumni login first
    try {
      const res = await axios.post(`${API_URL}/alumni/login`, formData);
      if (res.data.token) {
        localStorage.setItem('alumniToken', res.data.token);
        localStorage.setItem('alumniData', JSON.stringify(res.data.alumni));
        // Also clear any stale userToken so Navbar state is clean
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        navigate('/user/view-alumni');
        return;
      }
    } catch (alumniErr) {
      const alumniStatus = alumniErr.response?.status;
      // 401 = wrong password for an existing alumni account â†’ show error, don't try user table
      if (alumniStatus === 401) {
        setError('Invalid username or password.');
        setLoading(false);
        return;
      }
      // Any other error (404, 500, network) â†’ fall through and try user table
    }

    // 2ï¸âƒ£  Fall back to regular User login
    try {
      const res = await axios.post(`${API_URL}/user/login`, formData);
      if (res.data.token) {
        localStorage.setItem('userToken', res.data.token);
        localStorage.setItem('userName', res.data.name);
        localStorage.removeItem('alumniToken');
        localStorage.removeItem('alumniData');
        navigate('/user/view-alumni');
        return;
      }
    } catch (userErr) {
      setError(userErr.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: 'bi-people-fill',        text: 'Connect with fellow alumni' },
    { icon: 'bi-search',             text: 'Browse the alumni directory' },
    { icon: 'bi-person-circle',      text: 'View and update your profile' },
    { icon: 'bi-briefcase-fill',     text: 'Explore career opportunities' },
    { icon: 'bi-calendar-event-fill',text: 'Join alumni events & meetups' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>

      {/* â”€â”€ Left Panel â”€â”€ */}
      <div
        className="d-none d-lg-flex"
        style={{
          width: 420, flexShrink: 0, flexDirection: 'column',
          background: 'linear-gradient(160deg, var(--color-primary) 0%, var(--color-primary-dark) 55%, var(--color-primary-darker) 100%)',
          padding: '52px 44px', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: 22 }}></i>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#fff', lineHeight: 1.2 }}>Alumni Connect</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Alumni Network Portal</div>
            </div>
          </div>

          <h1 style={{ fontWeight: 800, fontSize: 28, color: '#fff', lineHeight: 1.4, marginBottom: 12 }}>
            Welcome Back to Your Alumni Network
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: 40 }}>
            Sign in to reconnect with batchmates, manage your profile, and explore career opportunities.
          </p>

          <div>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`bi ${f.icon}`} style={{ color: '#fff', fontSize: 15 }}></i>
                </div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.78)', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, position: 'relative' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', margin: 0 }}>
            "Once an alumnus, always part of the family."
          </p>
        </div>
      </div>

      {/* â”€â”€ Right Panel â”€â”€ */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', minWidth: 0 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="d-flex d-lg-none align-items-center gap-3 mb-5">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: 18 }}></i>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-secondary)' }}>Alumni Connect</div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontWeight: 800, fontSize: 26, color: 'var(--color-secondary)', marginBottom: 6 }}>Sign in to your account</h2>
            <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Enter your registered username and password</p>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: 'var(--color-primary-light)', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <i className="bi bi-exclamation-circle-fill" style={{ color: 'var(--color-primary)', fontSize: 16, flexShrink: 0 }}></i>
              <span style={{ fontSize: 14, color: 'var(--color-primary)' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Username</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person-fill" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16, pointerEvents: 'none' }}></i>
                <input
                  type="text" name="username" value={formData.username} onChange={handleChange}
                  placeholder="Enter your username" required autoFocus autoComplete="username"
                  style={{ width: '100%', padding: '13px 14px 13px 40px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fafafa' }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock-fill" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 16, pointerEvents: 'none' }}></i>
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                  placeholder="Enter your password" required autoComplete="current-password"
                  style={{ width: '100%', padding: '13px 44px 13px 40px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fafafa' }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: 16 }}></i>
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginBottom: 28 }}>
              <button type="button" onClick={() => navigate('/forgot-password')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, padding: 0 }}>
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(25,127,230,0.3)', marginBottom: 24
              }}>
              {loading
                ? <><span className="spinner-border spinner-border-sm"></span> Signing in...</>
                : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>
              }
            </button>

            {/* Register link */}
            <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', margin: 0 }}>
              New alumni?{' '}
              <button type="button" onClick={() => navigate('/register')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: 700, padding: 0, fontSize: 13 }}>
                Register here
              </button>
            </p>
          </form>

          {/* Back to home */}
          <div style={{ textAlign: 'center', marginTop: 28 }}>
            <button onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <i className="bi bi-arrow-left"></i> Back to Home
            </button>
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#c4c4c4', marginTop: 16 }}>
            <i className="bi bi-shield-lock-fill me-1"></i>Your credentials are secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
