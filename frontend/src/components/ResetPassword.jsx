import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenParam = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tokenParam) setMessage('Invalid reset link.');
  }, [tokenParam]);

  const submit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const resp = await axios.post(`${API_URL}/alumni/reset-password`, { token: tokenParam, newPassword });
      setMessage(resp.data.message || 'Password reset successful');
      // Redirect to login after short delay
      setTimeout(() => navigate('/alumni-login'), 1500);
    } catch (err) {
      console.error('Reset password error:', err);
      setMessage(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2>Reset Password</h2>
      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={submit} style={{ maxWidth: 480 }}>
        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input type="password" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm Password</label>
          <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        </div>

        <button className="btn btn-primary" disabled={loading || !tokenParam}>
          {loading ? 'Saving...' : 'Save new password'}
        </button>
      </form>
    </div>
  );
}

export default ResetPassword;
