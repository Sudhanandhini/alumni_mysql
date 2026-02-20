import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

function AdminDashboard() {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchAlumni();
    fetchPendingCount();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/alumni?all=true`);
      setAlumni(response.data);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/alumni/pending-count`);
      setPendingCount(res.data.count);
    } catch (error) {
      console.error('Error fetching pending count:', error);
    }
  };

  return (
    <div className="admin-dashboard">
   

      <div className="container my-5">
        {/* Dashboard Header */}
        <div className="row mb-5">
          <div className="col-12 text-center">
            <h1 className="display-4 fw-bold text-danger mb-3">
              <i className="bi bi-speedometer2 me-3"></i>
              Admin Dashboard
            </h1>
            <p className="lead text-muted">Manage your alumni database efficiently</p>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-6 col-lg-4 mb-4">
            <div
              className="card action-card bg-danger text-white shadow-lg h-100 cursor-pointer"
              onClick={() => navigate('/admin/add')}
            >
              <div className="card-body d-flex align-items-center p-5">
                <div className="flex-shrink-0 me-4">
                  <i className="bi bi-person-plus-fill display-1"></i>
                </div>
                <div>
                  <h3 className="card-title mb-2">Add New Alumni</h3>
                  <p className="card-text mb-0">Create a new alumni profile with complete details</p>
                </div>
              </div>
            </div>
          </div>

                 
          <div className="col-md-6 col-lg-4 mb-4">
            <div
              className="card action-card bg-primary text-white shadow-lg h-100 cursor-pointer"
              onClick={() => navigate('/admin/manage')}
            >
              <div className="card-body d-flex align-items-center p-5">
                <div className="flex-shrink-0 me-4">
                  <i className="bi bi-people-fill display-1"></i>
                </div>
                <div>
                  <h3 className="card-title mb-2">Manage Alumni</h3>
                  <p className="card-text mb-0">View, filter, edit, and delete alumni profiles</p>
                </div>
              </div>
            </div>
          </div> 
          
     

        <div className="col-md-6 col-lg-4 mb-4">
          <div className="card  bg-success  action-card text-white shadow-lg h-100 cursor-pointer"
            onClick={() => navigate('/admin/manage-users')}>
            <div className="card-body d-flex align-items-center p-5">
              <div className="flex-shrink-0 me-4">
                <i className="bi bi-person-badge-fill display-4"></i>
              </div>
              <div>
              <h4 className="card-title mb-2">Manage Users</h4>
              <p className="card-text mb-0">Add, edit, and manage user accounts</p>
              </div>
            </div>
          </div>
        </div>

          <div className="col-md-6 col-lg-4 mb-4">
            <div
              className="card action-card text-white shadow-lg h-100 cursor-pointer"
              style={{ backgroundColor: '#e67e22', cursor: 'pointer' }}
              onClick={() => navigate('/admin/pending')}
            >
              <div className="card-body d-flex align-items-center p-5 position-relative">
                {pendingCount > 0 && (
                  <span className="position-absolute top-0 end-0 m-3 badge bg-white text-danger fs-6">
                    {pendingCount} new
                  </span>
                )}
                <div className="flex-shrink-0 me-4">
                  <i className="bi bi-hourglass-split display-1"></i>
                </div>
                <div>
                  <h3 className="card-title mb-2">Pending Approvals</h3>
                  <p className="card-text mb-0">Review and approve alumni self-registrations</p>
                </div>
              </div>
            </div>
          </div>

           </div>

        {/* Stats Section */}
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="fw-bold mb-4">
              <i className="bi bi-bar-chart-fill me-2 text-danger"></i>
              Statistics Overview
            </h3>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card stat-card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-people-fill text-danger display-3 mb-3"></i>
                <h2 className="fw-bold mb-2">{alumni.length}</h2>
                <p className="text-muted mb-0">Total Alumni</p>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card stat-card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-briefcase-fill text-success display-3 mb-3"></i>
                <h2 className="fw-bold mb-2">
                  {alumni.filter(a => a.current_status === 'Employed').length}
                </h2>
                <p className="text-muted mb-0">Employed</p>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card stat-card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-laptop-fill text-primary display-3 mb-3"></i>
                <h2 className="fw-bold mb-2">
                  {alumni.filter(a => a.current_status === 'Self-Employed').length}
                </h2>
                <p className="text-muted mb-0">Self-Employed</p>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card stat-card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-book-fill text-info display-3 mb-3"></i>
                <h2 className="fw-bold mb-2">
                  {alumni.filter(a => a.current_status === 'Studying').length}
                </h2>
                <p className="text-muted mb-0">Studying</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Alumni */}
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="bi bi-clock-history me-2 text-danger"></i>
                  Recent Alumni
                </h5>
              </div>
              <div className="card-body">
                {alumni.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-inbox display-1 text-muted"></i>
                    <p className="text-muted mt-3">No alumni added yet.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Photo</th>
                          <th>Name</th>
                          <th>Designation</th>
                          <th>Batch</th>
                          <th>Status</th>
                          <th>Approval</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {alumni.slice(0, 5).map((alumnus) => (
                          <tr key={alumnus.id}>
                            <td>
                              <img
                                src={alumnus.photo ? `${API_BASE}${alumnus.photo}` : 'https://via.placeholder.com/50'}
                                alt={alumnus.name}
                                className="rounded-circle"
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              />
                            </td>
                            <td>
                              <strong>{alumnus.name}</strong>
                              <br />
                              <small className="text-muted">{alumnus.email}</small>
                            </td>
                            <td>{alumnus.designation || 'N/A'}</td>
                            <td><span className="badge bg-primary">{alumnus.batch}</span></td>
                            <td>
                              <span className={`badge ${alumnus.current_status === 'Employed' ? 'bg-success' :
                                  alumnus.current_status === 'Self-Employed' ? 'bg-primary' : 'bg-info'
                                }`}>
                                {alumnus.current_status}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                alumnus.approval_status === 'approved' ? 'bg-success' :
                                alumnus.approval_status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'
                              }`}>
                                {alumnus.approval_status || 'approved'}
                              </span>
                            </td>
                            <td>
                              <button
                                onClick={() => navigate(`/admin/edit/${alumnus.id}`)}
                                className="btn btn-sm btn-outline-primary me-2"
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {alumni.length > 5 && (
                  <div className="text-center mt-3">
                    <button
                      onClick={() => navigate('/admin/manage')}
                      className="btn btn-outline-danger"
                    >
                      View All Alumni
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;