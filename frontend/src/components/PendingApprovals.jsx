import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

function PendingApprovals() {
  const navigate = useNavigate();
  const [allAlumni, setAllAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [filters, setFilters] = useState({ search: '', batch: '', department: '' });

  const departments = [
    'Engineering & Technology', 'Economics & Commerce',
    'Journalism, Media, PR & Communication', 'Law', 'Medicine',
    'Arts & Humanities', 'Science', 'Business Administration'
  ];
  const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/alumni?all=true`);
      setAllAlumni(res.data);
    } catch (err) {
      console.error('Error fetching alumni:', err);
      showToast('danger', 'Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await axios.put(`${API_URL}/admin/alumni/${id}/approve`);
      showToast('success', 'Alumni approved and is now visible in the directory.');
      setAllAlumni(prev => prev.map(a => a.id === id ? { ...a, approval_status: 'approved' } : a));
      if (selectedAlumni?.id === id) setSelectedAlumni(prev => ({ ...prev, approval_status: 'approved' }));
    } catch (err) {
      console.error('Error approving:', err);
      showToast('danger', 'Failed to approve alumni.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this registration?')) return;
    setActionLoading(id);
    try {
      await axios.put(`${API_URL}/admin/alumni/${id}/reject`);
      showToast('success', 'Alumni registration rejected.');
      setAllAlumni(prev => prev.map(a => a.id === id ? { ...a, approval_status: 'rejected' } : a));
      if (selectedAlumni?.id === id) setSelectedAlumni(prev => ({ ...prev, approval_status: 'rejected' }));
    } catch (err) {
      console.error('Error rejecting:', err);
      showToast('danger', 'Failed to reject alumni.');
    } finally {
      setActionLoading(null);
    }
  };

  // Counts
  const counts = {
    all: allAlumni.length,
    pending: allAlumni.filter(a => a.approval_status === 'pending').length,
    approved: allAlumni.filter(a => a.approval_status === 'approved').length,
    rejected: allAlumni.filter(a => a.approval_status === 'rejected').length,
  };

  const filtered = allAlumni
    .filter(a => activeTab === 'all' || a.approval_status === activeTab)
    .filter(a => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        return (
          (a.name && a.name.toLowerCase().includes(s)) ||
          (a.email && a.email.toLowerCase().includes(s)) ||
          (a.designation && a.designation.toLowerCase().includes(s)) ||
          (a.organization_name && a.organization_name.toLowerCase().includes(s))
        );
      }
      return true;
    })
    .filter(a => !filters.batch || a.batch === filters.batch)
    .filter(a => !filters.department || a.department === filters.department);

  const statusBadge = (status) => {
    if (status === 'approved') return <span className="badge bg-success"><i className="bi bi-check-circle-fill me-1"></i>Approved</span>;
    if (status === 'rejected') return <span className="badge bg-danger"><i className="bi bi-x-circle-fill me-1"></i>Rejected</span>;
    return <span className="badge bg-warning text-dark"><i className="bi bi-hourglass-split me-1"></i>Pending</span>;
  };

  const tabStyle = (tab) => ({
    cursor: 'pointer',
    borderBottom: activeTab === tab ? '3px solid #dc3545' : '3px solid transparent',
    color: activeTab === tab ? '#dc3545' : '#6c757d',
    fontWeight: activeTab === tab ? '700' : '500',
    padding: '10px 20px',
    background: 'none',
    border: 'none',
    outline: 'none',
  });

  return (
    <div className="pending-approvals-page">
      {/* Toast */}
      {toast && (
        <div
          className={`alert alert-${toast.type}`}
          style={{ position: 'fixed', top: '80px', right: '20px', zIndex: 9999, minWidth: '300px' }}
        >
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {toast.msg}
        </div>
      )}

      {loading && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          justifyContent: 'center', alignItems: 'center', zIndex: 9998
        }}>
          <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="container-fluid my-5 px-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <button onClick={() => navigate('/admin')} className="btn btn-outline-danger mb-3">
              <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
            </button>
            <h1 className="display-5 fw-bold text-danger mb-1">
              <i className="bi bi-person-check-fill me-3"></i>
              Registration Approvals
            </h1>
            <p className="text-muted">Review and manage all alumni self-registrations.</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-3">
              <div className="fs-2 fw-bold text-dark">{counts.all}</div>
              <div className="text-muted small">Total</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-3" style={{ borderLeft: '4px solid #ffc107' }}>
              <div className="fs-2 fw-bold text-warning">{counts.pending}</div>
              <div className="text-muted small">Pending</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-3" style={{ borderLeft: '4px solid #198754' }}>
              <div className="fs-2 fw-bold text-success">{counts.approved}</div>
              <div className="text-muted small">Approved</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center py-3" style={{ borderLeft: '4px solid #dc3545' }}>
              <div className="fs-2 fw-bold text-danger">{counts.rejected}</div>
              <div className="text-muted small">Rejected</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card shadow-sm mb-3 border-0">
          <div className="card-body py-3">
            <div className="row g-2 align-items-end">
              <div className="col-md-4">
                <label className="form-label fw-semibold small mb-1">
                  <i className="bi bi-search me-1"></i>Search
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Name, email, designation..."
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold small mb-1">
                  <i className="bi bi-calendar me-1"></i>Batch
                </label>
                <select
                  className="form-select"
                  value={filters.batch}
                  onChange={e => setFilters(f => ({ ...f, batch: e.target.value }))}
                >
                  <option value="">All Batches</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold small mb-1">
                  <i className="bi bi-book me-1"></i>Department
                </label>
                <select
                  className="form-select"
                  value={filters.department}
                  onChange={e => setFilters(f => ({ ...f, department: e.target.value }))}
                >
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <button
                  className="btn btn-outline-danger w-100"
                  onClick={() => setFilters({ search: '', batch: '', department: '' })}
                >
                  <i className="bi bi-arrow-clockwise me-1"></i>Reset
                </button>
              </div>
            </div>
            {(filters.search || filters.batch || filters.department) && (
              <div className="mt-2">
                <small className="text-muted">
                  Showing <strong>{filtered.length}</strong> result{filtered.length !== 1 ? 's' : ''}
                </small>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="card shadow-lg border-0">
          <div className="card-header bg-white border-bottom p-0">
            <div className="d-flex overflow-auto">
              {[
                { key: 'pending', label: 'Pending', count: counts.pending },
                { key: 'approved', label: 'Approved', count: counts.approved },
                { key: 'rejected', label: 'Rejected', count: counts.rejected },
                { key: 'all', label: 'All', count: counts.all },
              ].map(tab => (
                <button key={tab.key} style={tabStyle(tab.key)} onClick={() => setActiveTab(tab.key)}>
                  {tab.label}
                  <span className={`ms-2 badge ${
                    tab.key === 'pending' ? 'bg-warning text-dark' :
                    tab.key === 'approved' ? 'bg-success' :
                    tab.key === 'rejected' ? 'bg-danger' : 'bg-secondary'
                  }`}>{tab.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card-body p-0">
            {filtered.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <p className="text-muted mt-3 fs-5">No {activeTab === 'all' ? '' : activeTab} registrations found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Photo</th>
                      <th>Name & Email</th>
                      <th>Batch</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Approval</th>
                      <th>Registered On</th>
                      <th className="text-center pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((alumnus) => (
                      <tr key={alumnus.id} className={
                        alumnus.approval_status === 'rejected' ? 'table-danger bg-opacity-25' :
                        alumnus.approval_status === 'approved' ? 'table-success bg-opacity-10' : ''
                      }>
                        <td className="ps-4">
                          <img
                            src={alumnus.photo ? `${API_BASE}${alumnus.photo}` : 'https://via.placeholder.com/50'}
                            alt={alumnus.name}
                            className="rounded-circle shadow-sm"
                            style={{ width: '55px', height: '55px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => setSelectedAlumni(alumnus)}
                          />
                        </td>
                        <td>
                          <strong
                            className="d-block text-primary"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedAlumni(alumnus)}
                          >
                            {alumnus.name}
                          </strong>
                          <small className="text-muted">
                            <i className="bi bi-envelope me-1"></i>{alumnus.email}
                          </small>
                        </td>
                        <td>
                          <span className="badge bg-primary">{alumnus.batch || 'N/A'}</span>
                        </td>
                        <td><small>{alumnus.department || 'N/A'}</small></td>
                        <td>
                          <span className={`badge ${
                            alumnus.current_status === 'Employed' ? 'bg-success' :
                            alumnus.current_status === 'Self-Employed' ? 'bg-info' : 'bg-secondary'
                          }`}>
                            {alumnus.current_status || 'N/A'}
                          </span>
                        </td>
                        <td>{statusBadge(alumnus.approval_status)}</td>
                        <td>
                          <small className="text-muted">
                            {new Date(alumnus.created_at).toLocaleDateString('en-IN', {
                              day: '2-digit', month: 'short', year: 'numeric'
                            })}
                          </small>
                        </td>
                        <td className="text-center pe-4">
                          <div className="d-flex gap-1 justify-content-center flex-wrap">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              title="View Details"
                              onClick={() => setSelectedAlumni(alumnus)}
                            >
                              <i className="bi bi-eye-fill"></i>
                            </button>
                            {alumnus.approval_status !== 'approved' && (
                              <button
                                className="btn btn-sm btn-success"
                                title="Approve"
                                disabled={actionLoading === alumnus.id}
                                onClick={() => handleApprove(alumnus.id)}
                              >
                                {actionLoading === alumnus.id ? (
                                  <span className="spinner-border spinner-border-sm"></span>
                                ) : (
                                  <><i className="bi bi-check-lg me-1"></i>Approve</>
                                )}
                              </button>
                            )}
                            {alumnus.approval_status !== 'rejected' && (
                              <button
                                className="btn btn-sm btn-danger"
                                title="Reject"
                                disabled={actionLoading === alumnus.id}
                                onClick={() => handleReject(alumnus.id)}
                              >
                                <i className="bi bi-x-lg me-1"></i>Reject
                              </button>
                            )}
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

      {/* Detail Modal */}
      {selectedAlumni && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
             onClick={() => setSelectedAlumni(null)}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
               onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className={`modal-header ${
                selectedAlumni.approval_status === 'approved' ? 'bg-success text-white' :
                selectedAlumni.approval_status === 'rejected' ? 'bg-danger text-white' :
                'bg-warning text-dark'
              }`}>
                <h5 className="modal-title">
                  <i className="bi bi-person-circle me-2"></i>
                  Registration Details
                </h5>
                <button type="button"
                  className={`btn-close ${selectedAlumni.approval_status !== 'pending' ? 'btn-close-white' : ''}`}
                  onClick={() => setSelectedAlumni(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center mb-3">
                    <img
                      src={selectedAlumni.photo ? `${API_BASE}${selectedAlumni.photo}` : 'https://via.placeholder.com/150'}
                      alt={selectedAlumni.name}
                      className={`rounded-circle border border-3 ${
                        selectedAlumni.approval_status === 'approved' ? 'border-success' :
                        selectedAlumni.approval_status === 'rejected' ? 'border-danger' : 'border-warning'
                      }`}
                      style={{ width: '160px', height: '160px', objectFit: 'cover' }}
                    />
                    <h5 className="mt-3 fw-bold">{selectedAlumni.name}</h5>
                    {statusBadge(selectedAlumni.approval_status)}
                  </div>
                  <div className="col-md-8">
                    <div className="row g-3">
                      <div className="col-6"><strong>Email:</strong><br /><span className="text-muted">{selectedAlumni.email || '—'}</span></div>
                      <div className="col-6"><strong>Phone:</strong><br /><span className="text-muted">{selectedAlumni.phone || '—'}</span></div>
                      <div className="col-6"><strong>Batch:</strong><br /><span className="text-muted">{selectedAlumni.batch || '—'}</span></div>
                      <div className="col-6"><strong>Department:</strong><br /><span className="text-muted">{selectedAlumni.department || '—'}</span></div>
                      <div className="col-6"><strong>Gender:</strong><br /><span className="text-muted">{selectedAlumni.gender || '—'}</span></div>
                      <div className="col-6"><strong>Date of Birth:</strong><br /><span className="text-muted">{selectedAlumni.dob ? new Date(selectedAlumni.dob).toLocaleDateString() : '—'}</span></div>
                      <div className="col-6"><strong>Current Status:</strong><br /><span className="text-muted">{selectedAlumni.current_status || '—'}</span></div>
                      <div className="col-6"><strong>Organisation:</strong><br /><span className="text-muted">{selectedAlumni.organization_name || '—'}</span></div>
                      <div className="col-6"><strong>Designation:</strong><br /><span className="text-muted">{selectedAlumni.designation || '—'}</span></div>
                      <div className="col-6"><strong>Work Location:</strong><br /><span className="text-muted">{selectedAlumni.work_location || '—'}</span></div>
                      <div className="col-6"><strong>Industry:</strong><br /><span className="text-muted">{selectedAlumni.industry || '—'}</span></div>
                      <div className="col-6"><strong>Experience:</strong><br /><span className="text-muted">{selectedAlumni.experience_years ? `${selectedAlumni.experience_years} yrs` : '—'}</span></div>
                      {selectedAlumni.skills && (
                        <div className="col-12"><strong>Skills:</strong><br /><span className="text-muted">{selectedAlumni.skills}</span></div>
                      )}
                      {selectedAlumni.bio && (
                        <div className="col-12"><strong>Bio:</strong><br /><span className="text-muted">{selectedAlumni.bio}</span></div>
                      )}
                      {selectedAlumni.linkedin && (
                        <div className="col-12">
                          <strong>LinkedIn:</strong><br />
                          <a href={selectedAlumni.linkedin} target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-linkedin me-1"></i>View Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedAlumni(null)}>Close</button>
                {selectedAlumni.approval_status !== 'rejected' && (
                  <button
                    className="btn btn-danger"
                    disabled={actionLoading === selectedAlumni.id}
                    onClick={() => handleReject(selectedAlumni.id)}
                  >
                    <i className="bi bi-x-lg me-1"></i>Reject
                  </button>
                )}
                {selectedAlumni.approval_status !== 'approved' && (
                  <button
                    className="btn btn-success"
                    disabled={actionLoading === selectedAlumni.id}
                    onClick={() => handleApprove(selectedAlumni.id)}
                  >
                    {actionLoading === selectedAlumni.id
                      ? <span className="spinner-border spinner-border-sm me-2"></span>
                      : <i className="bi bi-check-lg me-1"></i>
                    }
                    Approve
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingApprovals;
