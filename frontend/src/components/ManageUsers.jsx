import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const API_URL = 'http://localhost:5000/api';

function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    place: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      password: '',
      place: ''
    });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: '',
      place: user.place
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingUser) {
        // Update user
        await axios.put(`${API_URL}/users/${editingUser.id}`, formData);
        alert('User updated successfully!');
      } else {
        // Create new user
        await axios.post(`${API_URL}/users`, formData);
        alert('User added successfully!');
      }
      
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/users/${id}`);
        alert('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
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
          <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="container my-5">
        <div className="row mb-4">
          <div className="col-12">
            <button 
              onClick={() => navigate('/admin')} 
              className="btn btn-outline-danger mb-3"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 className="display-5 fw-bold text-danger mb-2">
                  <i className="bi bi-person-badge-fill me-3"></i>
                  Manage Users
                </h1>
                <p className="text-muted">Manage user login credentials and access</p>
              </div>
              <button 
                onClick={openAddModal} 
                className="btn btn-danger btn-lg"
              >
                <i className="bi bi-plus-circle-fill me-2"></i>
                Add New User
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card shadow-lg border-0">
          <div className="card-header bg-danger text-white py-3">
            <h4 className="mb-0">
              <i className="bi bi-list-ul me-2"></i>
              User List ({users.length})
            </h4>
          </div>
          <div className="card-body p-0">
            {users.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <p className="text-muted mt-3 fs-5">No users added yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">ID</th>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Place</th>
                      <th>Created At</th>
                      <th className="text-center pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="ps-4">
                          <span className="badge bg-primary">{user.id}</span>
                        </td>
                        <td>
                          <strong>
                            <i className="bi bi-person-circle me-2 text-danger"></i>
                            {user.name}
                          </strong>
                        </td>
                        <td>
                          <code>{user.username}</code>
                        </td>
                        <td>
                          <i className="bi bi-geo-alt-fill me-1 text-muted"></i>
                          {user.place}
                        </td>
                        <td>
                          <small className="text-muted">
                            {new Date(user.created_at).toLocaleDateString()}
                          </small>
                        </td>
                        <td className="text-center pe-4">
                          <div className="btn-group">
                            <button
                              onClick={() => openEditModal(user)}
                              className="btn btn-sm btn-outline-primary"
                              title="Edit"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="btn btn-sm btn-outline-danger"
                              title="Delete"
                            >
                              <i className="bi bi-trash3-fill"></i>
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus-fill me-2"></i>
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Name <span className="text-danger">*</span>
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

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Username <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="form-control form-control-lg"
                      placeholder="Enter username"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Password {editingUser ? '' : <span className="text-danger">*</span>}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="form-control form-control-lg"
                      placeholder={editingUser ? 'Leave blank to keep current password' : 'Enter password'}
                      required={!editingUser}
                    />
                    {editingUser && (
                      <small className="text-muted">
                        Leave blank to keep the current password
                      </small>
                    )}
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Place <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      name="place"
                      value={formData.place}
                      onChange={handleInputChange}
                      className="form-control form-control-lg"
                      placeholder="Enter place/location"
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-danger"
                    disabled={loading}
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
  );
}

export default ManageUsers;