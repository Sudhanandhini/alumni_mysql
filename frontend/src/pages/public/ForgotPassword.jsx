import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const resp = await axios.post(`${API_URL}/alumni/forgot-password`, { email });
      setMessage(resp.data.message || 'If the email is registered, a reset link has been sent.');
      setMessageType('info');
    } catch (err) {
      setMessage(err.response?.data?.message || err.response?.data?.error || 'An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f4f6fa', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 16, padding: '40px 36px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>

        <div style={{ marginBottom: 28 }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <i className="bi bi-lock-fill" style={{ fontSize: 22, color: 'var(--color-primary)' }}></i>
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 24, color: '#1a1a2e', marginBottom: 6 }}>Forgot Password?</h2>
          <p style={{ fontSize: 14, color: '#888', margin: 0 }}>Enter your registered email address. We'll send a password reset link.</p>
        </div>

        <form onSubmit={submit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <i className="bi bi-envelope-fill" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 15, pointerEvents: 'none' }}></i>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Enter your registered email" required autoFocus
                style={{ width: '100%', padding: '13px 14px 13px 40px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#fafafa' }}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16
            }}>
            {loading
              ? <><span className="spinner-border spinner-border-sm"></span> Sending...</>
              : <><i className="bi bi-send-fill"></i> Send Reset Link</>
            }
          </button>
        </form>

        {message && (
          <div style={{
            background: messageType === 'error' ? '#fff1f1' : '#f0fdf4',
            border: `1px solid ${messageType === 'error' ? '#ffd5d5' : '#bbf7d0'}`,
            borderRadius: 10, padding: '12px 16px', marginBottom: 16,
            display: 'flex', alignItems: 'flex-start', gap: 10
          }}>
            <i className={`bi ${messageType === 'error' ? 'bi-exclamation-circle-fill' : 'bi-check-circle-fill'}`}
              style={{ color: messageType === 'error' ? '#dc3545' : '#16a34a', fontSize: 16, flexShrink: 0, marginTop: 1 }}></i>
            <span style={{ fontSize: 14, color: messageType === 'error' ? '#dc3545' : '#15803d' }}>{message}</span>
          </div>
        )}

        <button onClick={() => navigate('/user/login')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 6, margin: '0 auto' }}>
          <i className="bi bi-arrow-left"></i> Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
