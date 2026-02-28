import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info'); // 'info' or 'error'
  const [previewUrl, setPreviewUrl] = useState(null);
  const [useEthereal, setUseEthereal] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setPreviewUrl(null);
    try {
      const resp = await axios.post(`${API_URL}/alumni/forgot-password`, { username, email });
      setMessage(resp.data.message || 'If the username and email exist, a reset link has been sent');
      setMessageType('info');
      // show Ethereal preview URL if returned by server
      if (resp.data.previewUrl) {
        setPreviewUrl(resp.data.previewUrl);
        setUseEthereal(resp.data.useEthereal || false);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setMessage(err.response?.data?.message || err.response?.data?.error || 'An error occurred while sending the reset email');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h2>Forgot Password</h2>
      <p>Enter your registered username and email address. We'll send a link to reset your password.</p>

      <form onSubmit={submit} style={{ maxWidth: 480 }}>
        <div className="mb-3">
          <label className="form-label">Username</label>
          <input type="text" className="form-control" value={username} onChange={e => setUsername(e.target.value)} required />
        </div>
        
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>

        <button className="btn btn-primary" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>

      {message && (
        <div className={`alert ${messageType === 'error' ? 'alert-danger' : 'alert-info'} mt-4`}>
          {message}
        </div>
      )}
      {previewUrl && (
        <div className="alert alert-success mt-3">
          <div><strong>📧 Email Sent Successfully!</strong></div>
          {useEthereal && (
            <>
              <div className="mt-2">
                <small className="text-muted">
                  ⚠️ Using test email service (Ethereal). In production, configure real SMTP credentials.
                </small>
              </div>
              <div className="mt-2">
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary">
                  📨 View Email Preview
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
