import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

function Login() {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simple authentication (Replace with actual API call)
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

  return (
    <div className="login-page">
      <Navbar />
      
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                       style={{ width: '80px', height: '80px' }}>
                    <i className="bi bi-shield-lock-fill" style={{ fontSize: '2.5rem' }}></i>
                  </div>
                  <h2 className="fw-bold text-danger">Admin Login</h2>
                  <p className="text-muted">Enter your credentials to access the dashboard</p>
                </div>

                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-person-fill me-2"></i>
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={credentials.username}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      placeholder="Enter username"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-lock-fill me-2"></i>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={credentials.password}
                      onChange={handleChange}
                      className="form-control form-control-lg"
                      placeholder="Enter password"
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-danger btn-lg w-100 mb-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Demo: username: <strong>admin</strong>, password: <strong>admin123</strong>
                    </small>
                  </div>
                </form>
              </div>
            </div>

            <div className="text-center mt-4">
              <a href="/" className="text-decoration-none">
                <i className="bi bi-arrow-left me-2"></i>
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

