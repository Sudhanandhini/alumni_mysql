import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    place: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchAllUsers();
  }, []);

  // Fetch users from BOTH tables (users + alumni)
  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch from users table (admin-created)
      const usersResponse = await axios.get(`${API_URL}/users`);
      const adminUsers = usersResponse.data.map(user => ({
        ...user,
        source: 'admin',
        type: 'Admin Created'
      }));

      // Fetch from alumni table (self-registered)
      const alumniResponse = await axios.get(`${API_URL}/alumni`);
      const selfRegisteredUsers = alumniResponse.data.map(user => ({
        ...user,
        source: 'alumni',
        type: 'Self Registered',
        place: user.institution || user.work_location || 'N/A'
      }));

      // Merge both lists
      const allUsers = [...adminUsers, ...selfRegisteredUsers];
      
      // Sort by created_at date (newest first)
      allUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setUsers(allUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Check username availability across BOTH tables
  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    if (editingUser && editingUser.username === username) {
      setUsernameAvailable(true);
      return;
    }

    try {
      setCheckingUsername(true);
      
      // Check in users table
      const usersCheck = await axios.get(`${API_URL}/users/check-username/${username}`);
      
      // Check in alumni table
      const alumniCheck = await axios.get(`${API_URL}/alumni/check-username/${username}`);
      
      // Username is available only if it's free in BOTH tables
      setUsernameAvailable(usersCheck.data.available && alumniCheck.data.available);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(true); // Assume available on error
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'username') {
      const timeoutId = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setUsernameAvailable(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      confirmPassword: '',
      place: '',
      email: '',
      phone: ''
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setUsernameAvailable(true);
    setFormData({
      name: user.name,
      username: user.username,
      password: '',
      confirmPassword: '',
      place: user.place || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setShowModal(true);
  };

  const validateForm = () => {
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return false;
    }

    if (formData.password && formData.password.length < 6) {
      alert('Password must be at least 6 characters long!');
      return false;
    }

    if (usernameAvailable === false) {
      alert('Username is already taken. Please choose a different username.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const dataToSend = {
        name: formData.name,
        username: formData.username,
        place: formData.place,
        email: formData.email,
        phone: formData.phone
      };

      if (formData.password) {
        dataToSend.password = formData.password;
      }
      
      if (editingUser) {
        // Update user in the appropriate table
        const endpoint = editingUser.source === 'admin' ? 'users' : 'alumni';
        await axios.put(`${API_URL}/${endpoint}/${editingUser.id}`, dataToSend);
        alert('User updated successfully!');
      } else {
        // Create new user in users table (admin-created)
        if (!formData.password) {
          alert('Password is required for new users!');
          setLoading(false);
          return;
        }
        await axios.post(`${API_URL}/users`, dataToSend);
        alert('User created successfully!');
      }
      
      setShowModal(false);
      setShowPassword(false);
      setShowConfirmPassword(false);
      fetchAllUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        setLoading(true);
        const endpoint = user.source === 'admin' ? 'users' : 'alumni';
        await axios.delete(`${API_URL}/${endpoint}/${user.id}`);
        alert('User deleted successfully!');
        fetchAllUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      } finally {
        setLoading(false);
      }
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 2) return { strength, text: 'Weak', color: 'danger' };
    if (strength <= 3) return { strength, text: 'Medium', color: 'warning' };
    return { strength, text: 'Strong', color: 'success' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Filter users
  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'admin') return user.source === 'admin';
    if (filter === 'self') return user.source === 'alumni';
    return true;
  });

  return (
    <AdminLayout title="Manage Users">
    <div className="manage-users-page">
      {loading && (
        <div className="loading-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div className="spinner-border" style={{ width: '3rem', height: '3rem', color: '#1a2744' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="container my-5">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 className="display-5 fw-bold text-primary mb-2">
                  <i className="bi bi-person-badge-fill me-3"></i>
                  Manage All Users
                </h1>
                <p className="text-muted">View and manage all user accounts (Admin + Self-Registered)</p>
              </div>
              <button 
                onClick={openAddModal} 
                className="btn btn-primary btn-lg"
              >
                <i className="bi bi-plus-circle-fill me-2"></i>
                Add New User (Admin)
              </button>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="card shadow-sm border-0 mb-3">
          <div className="card-body">
            <div className="btn-group w-100" role="group">
              <button 
                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('all')}
              >
                <i className="bi bi-people-fill me-2"></i>
                All Users ({users.length})
              </button>
              <button 
                className={`btn ${filter === 'admin' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('admin')}
              >
                <i className="bi bi-shield-fill-check me-2"></i>
                Admin Created ({users.filter(u => u.source === 'admin').length})
              </button>
              <button 
                className={`btn ${filter === 'self' ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setFilter('self')}
              >
                <i className="bi bi-person-check-fill me-2"></i>
                Self Registered ({users.filter(u => u.source === 'alumni').length})
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card shadow-lg border-0">
          <div className="card-header bg-primary text-white py-3">
            <h4 className="mb-0">
              <i className="bi bi-list-ul me-2"></i>
              User List ({filteredUsers.length})
            </h4>
          </div>
          <div className="card-body p-0">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <p className="text-muted mt-3 fs-5">No users found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">ID</th>
                      <th>Type</th>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Email/Phone</th>
                      <th>Place</th>
                      <th>Created At</th>
                      <th className="text-center pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={`${user.source}-${user.id}`}>
                        <td className="ps-4">
                          <span className="badge bg-primary">{user.id}</span>
                        </td>
                        <td>
                          <span className={`badge ${user.source === 'admin' ? 'bg-success' : 'bg-info'}`}>
                            <i className={`bi ${user.source === 'admin' ? 'bi-shield-fill-check' : 'bi-person-check-fill'} me-1`}></i>
                            {user.type}
                          </span>
                        </td>
                        <td>
                          <strong>
                            <i className="bi bi-person-circle me-2 text-primary"></i>
                            {user.name}
                          </strong>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            <i className="bi bi-at me-1"></i>
                            {user.username}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {user.email && (
                              <div><i className="bi bi-envelope me-1"></i>{user.email}</div>
                            )}
                            {user.phone && (
                              <div><i className="bi bi-telephone me-1"></i>{user.phone}</div>
                            )}
                            {!user.email && !user.phone && 'N/A'}
                          </small>
                        </td>
                        <td>
                          <i className="bi bi-geo-alt-fill me-1 text-muted"></i>
                          {user.place || 'N/A'}
                        </td>
                        <td>
                          <small className="text-muted">
                            <i className="bi bi-calendar3 me-1"></i>
                            {new Date(user.created_at).toLocaleDateString()}
                          </small>
                        </td>
                        <td className="text-center pe-4">
                          <div className="btn-group">
                            {/* <button
                              onClick={() => openEditModal(user)}
                              className="btn btn-sm btn-outline-primary"
                              title="Edit User"
                            >
                              <i className="bi bi-pencil-square"></i> Edit
                            </button> */}
                            <button
                              onClick={() => handleDelete(user)}
                              className="btn btn-sm btn-outline-secondary"
                              title="Delete User"
                            >
                              <i className="bi bi-trash3-fill"></i> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit User Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className={`bi ${editingUser ? 'bi-pencil-square' : 'bi-person-plus-fill'} me-2`}></i>
                  {editingUser ? `Edit User (${editingUser.type})` : 'Add New User (Admin)'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => {
                    setShowModal(false);
                    setShowPassword(false);
                    setShowConfirmPassword(false);
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-person-fill me-1 text-primary"></i>
                        Name <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-control form-control-lg"
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-geo-alt-fill me-1 text-primary"></i>
                        Place
                      </label>
                      <input
                        type="text"
                        name="place"
                        value={formData.place}
                        onChange={handleInputChange}
                        className="form-control form-control-lg"
                        placeholder="Enter place/location"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-envelope me-1 text-primary"></i>
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-control form-control-lg"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-telephone me-1 text-primary"></i>
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-control form-control-lg"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-at me-1 text-primary"></i>
                        Username <span className="text-primary">*</span>
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="form-control form-control-lg"
                        placeholder="Enter unique username"
                        required
                        minLength="3"
                      />
                      {checkingUsername && (
                        <small className="text-muted d-block mt-1">
                          <i className="bi bi-hourglass-split me-1"></i>
                          Checking availability...
                        </small>
                      )}
                      {usernameAvailable === true && formData.username.length >= 3 && (
                        <small className="text-success d-block mt-1">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Username is available
                        </small>
                      )}
                      {usernameAvailable === false && (
                        <small className="text-primary d-block mt-1">
                          <i className="bi bi-x-circle-fill me-1"></i>
                          Username is already taken
                        </small>
                      )}
                    </div>

                    <div className="col-12">
                      <hr className="my-2" />
                      <h6 className="text-primary mb-3">
                        <i className="bi bi-shield-lock-fill me-2"></i>
                        {editingUser ? 'Change Password (Optional)' : 'Set Password'}
                      </h6>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-lock-fill me-1 text-primary"></i>
                        Password {!editingUser && <span className="text-primary">*</span>}
                      </label>
                      <div className="input-group">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                          required={!editingUser}
                          minLength="6"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                      {editingUser && (
                        <small className="text-muted d-block mt-1">
                          Leave blank to keep the current password
                        </small>
                      )}
                      {formData.password && (
                        <div className="mt-2">
                          <small className="text-muted d-block">Password Strength:</small>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className={`progress-bar bg-${passwordStrength.color}`}
                              style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                            ></div>
                          </div>
                          <small className={`text-${passwordStrength.color} d-block mt-1`}>
                            {passwordStrength.text}
                          </small>
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">
                        <i className="bi bi-lock-fill me-1 text-primary"></i>
                        Confirm Password {!editingUser && <span className="text-primary">*</span>}
                      </label>
                      <div className="input-group">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="form-control form-control-lg"
                          placeholder="Re-enter password"
                          required={!editingUser && formData.password}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                      </div>
                      {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                        <small className="text-primary d-block mt-1">
                          <i className="bi bi-x-circle-fill me-1"></i>
                          Passwords do not match
                        </small>
                      )}
                      {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password && (
                        <small className="text-success d-block mt-1">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Passwords match
                        </small>
                      )}
                    </div>

                    {!editingUser && (
                      <div className="col-12">
                        <div className="alert alert-info mb-0">
                          <small>
                            <i className="bi bi-info-circle-fill me-2"></i>
                            <strong>Password Requirements:</strong>
                            <ul className="mb-0 mt-2">
                              <li>Minimum 6 characters</li>
                              <li>Recommended: Mix of uppercase, lowercase, numbers & symbols</li>
                            </ul>
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowModal(false);
                      setShowPassword(false);
                      setShowConfirmPassword(false);
                    }}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading || (usernameAvailable === false)}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {editingUser ? 'Update User' : 'Add User'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
}

export default ManageUsers;