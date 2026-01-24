import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function UserLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post(`${API_URL}/user/login`, formData);
      
      if (response.data.token) {
        localStorage.setItem('userToken', response.data.token);
        localStorage.setItem('userName', response.data.name);
        navigate('/user/view-alumni');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-login-page min-vh-100 d-flex align-items-center" 
         style={{ background: 'linear-gradient(135deg, #eff0f1ff 0%, #ffffffff 100%)' }}>
    
      
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-5 col-lg-4">
            <div className="card shadow-lg border-0 rounded-4">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="bg-danger text-white rounded-circle d-inline-flex p-3 mb-3">
                    <i className="bi bi-person-circle" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h2 className="fw-bold text-danger">User Login</h2>
                  <p className="text-muted">Access Alumni Directory</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-person-fill me-2 text-danger"></i>
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="form-control form-control-lg"
                      placeholder="Enter your username"
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold">
                      <i className="bi bi-lock-fill me-2 text-danger"></i>
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-control form-control-lg"
                      placeholder="Enter your password"
                      required
                    />
                  </div>

                  <div className="mb-3 text-end">
                    <button type="button" className="btn btn-link p-0" onClick={() => navigate('/forgot-password')}>
                      Forgot password?
                    </button>
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
                      Don't have an account? Contact admin
                    </small>
                  </div>
                </form>

                <hr className="my-4" />

                <div className="text-center">
                  <button 
                    onClick={() => navigate('/')} 
                    className="btn btn-outline-secondary"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;