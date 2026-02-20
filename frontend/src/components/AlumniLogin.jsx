import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AlumniLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`${API_URL}/alumni/login`, formData);
      if (response.data.token) {
        localStorage.setItem('alumniToken', response.data.token);
        localStorage.setItem('alumniData', JSON.stringify(response.data.alumni));
        navigate('/user/view-alumni');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: 'bi-person-circle', text: 'View and update your profile' },
    { icon: 'bi-people-fill', text: 'Connect with fellow alumni' },
    { icon: 'bi-search', text: 'Browse the alumni directory' },
    { icon: 'bi-briefcase-fill', text: 'Explore career opportunities' },
    { icon: 'bi-calendar-event-fill', text: 'Join alumni events & meetups' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6fa' }}>

      {/* ── Left Panel ── */}
      <div
        className="d-none d-lg-flex"
        style={{
          width: 420, flexShrink: 0, flexDirection: 'column',
          background: 'linear-gradient(160deg, #7b1717 0%, #b91c1c 50%, #6b0f0f 100%)',
          padding: '52px 44px', justifyContent: 'space-between',
          position: 'relative', overflow: 'hidden'
        }}
      >
        {/* Background decoration */}
        <div style={{
          position: 'absolute', top: -80, right: -80, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: -60, left: -60, width: 240, height: 240,
          borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 52 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: 22 }}></i>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#fff', lineHeight: 1.2 }}>Alumni Connect</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Alumni Network Portal</div>
            </div>
          </div>

          {/* Headline */}
          <h1 style={{ fontWeight: 800, fontSize: 28, color: '#fff', lineHeight: 1.4, marginBottom: 12 }}>
            Welcome Back, Alumni!
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: 40 }}>
            Sign in to manage your profile, connect with batchmates, and explore the alumni network.
          </p>

          {/* Feature list */}
          <div>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <i className={`bi ${f.icon}`} style={{ color: '#fff', fontSize: 15 }}></i>
                </div>
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 24, position: 'relative' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', margin: 0 }}>
            "Once an alumnus, always part of the family."
          </p>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 24px', minWidth: 0
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="d-flex d-lg-none align-items-center gap-3 mb-5">
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #dc3545, #8b0000)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: 18 }}></i>
            </div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#7b1717' }}>Alumni Connect</div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#fff5f5', border: '1px solid #fecaca',
              borderRadius: 20, padding: '5px 14px', marginBottom: 16
            }}>
              <i className="bi bi-mortarboard-fill" style={{ color: '#dc3545', fontSize: 13 }}></i>
              <span style={{ fontSize: 12, color: '#b91c1c', fontWeight: 600 }}>Alumni Portal</span>
            </div>
            <h2 style={{ fontWeight: 800, fontSize: 26, color: '#1a1a2e', marginBottom: 6 }}>
              Sign in to your account
            </h2>
            <p style={{ fontSize: 14, color: '#888', margin: 0 }}>
              Use your registered alumni credentials to log in
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div style={{
              background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 10,
              padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10
            }}>
              <i className="bi bi-exclamation-circle-fill" style={{ color: '#dc3545', fontSize: 16, flexShrink: 0 }}></i>
              <span style={{ fontSize: 14, color: '#b91c1c' }}>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-person-fill" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#9ca3af', fontSize: 16, pointerEvents: 'none'
                }}></i>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  required
                  autoFocus
                  autoComplete="username"
                  style={{
                    width: '100%', padding: '13px 14px 13px 40px',
                    border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14,
                    outline: 'none', transition: 'border 0.2s',
                    boxSizing: 'border-box', background: '#fafafa'
                  }}
                  onFocus={e => e.target.style.borderColor = '#dc3545'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-lock-fill" style={{
                  position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                  color: '#9ca3af', fontSize: 16, pointerEvents: 'none'
                }}></i>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '13px 44px 13px 40px',
                    border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14,
                    outline: 'none', transition: 'border 0.2s',
                    boxSizing: 'border-box', background: '#fafafa'
                  }}
                  onFocus={e => e.target.style.borderColor = '#dc3545'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4
                  }}
                >
                  <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} style={{ fontSize: 16 }}></i>
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div style={{ textAlign: 'right', marginBottom: 28 }}>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 13, color: '#dc3545', fontWeight: 600, padding: 0
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #dc3545, #8b0000)',
                color: '#fff', border: 'none', borderRadius: 10,
                fontWeight: 700, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 4px 14px rgba(220,53,69,0.35)', transition: 'all 0.2s',
                marginBottom: 20
              }}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm"></span> Signing in...</>
              ) : (
                <><i className="bi bi-box-arrow-in-right"></i> Sign In</>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>OR</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }}></div>
            </div>

            {/* User login */}
            <button
              type="button"
              onClick={() => navigate('/user/login')}
              style={{
                width: '100%', padding: '13px',
                background: '#fff', color: '#374151',
                border: '1.5px solid #d1d5db', borderRadius: 10,
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.2s', marginBottom: 24
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#dc3545'; e.currentTarget.style.background = '#fff5f5'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fff'; }}
            >
              <i className="bi bi-person-fill"></i> Sign in as User
            </button>

            {/* Register link */}
            <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', margin: 0 }}>
              New alumni?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontWeight: 700, padding: 0, fontSize: 13 }}
              >
                Register here
              </button>
            </p>
          </form>

          {/* Back to home */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: 6
              }}
            >
              <i className="bi bi-arrow-left"></i> Back to Home
            </button>
          </div>

          {/* Security note */}
          <p style={{ textAlign: 'center', fontSize: 12, color: '#c4c4c4', marginTop: 20 }}>
            <i className="bi bi-shield-lock-fill me-1"></i>Your credentials are secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}

export default AlumniLogin;
