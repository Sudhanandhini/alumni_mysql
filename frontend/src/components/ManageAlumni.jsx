import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

function ManageAlumni() {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'deleted'
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState({
    searchTerm: '', batch: '', department: '', status: '', location: ''
  });

  const departments = [
    'Engineering & Technology', 'Economics & Commerce',
    'Journalism, Media, PR & Communication', 'Law', 'Medicine',
    'Arts & Humanities', 'Science', 'Business Administration'
  ];
  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Remote', 'International'
  ];
  const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => { fetchAlumni(); }, [activeTab]);
  useEffect(() => { applyFilters(); }, [alumni, filters]);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const url = activeTab === 'deleted'
        ? `${API_URL}/alumni?show_deleted=true`
        : `${API_URL}/alumni?all=true`;
      const res = await axios.get(url);
      setAlumni(res.data);
    } catch (err) {
      console.error('Error fetching alumni:', err);
      showToast('danger', 'Failed to fetch alumni data.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...alumni];
    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.designation?.toLowerCase().includes(q) ||
        a.organization_name?.toLowerCase().includes(q)
      );
    }
    if (filters.batch) filtered = filtered.filter(a => a.batch === filters.batch);
    if (filters.department) filtered = filtered.filter(a => a.department === filters.department);
    if (filters.status) filtered = filtered.filter(a => a.current_status === filters.status);
    if (filters.location) filtered = filtered.filter(a => a.work_location === filters.location);
    setFilteredAlumni(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => setFilters({ searchTerm: '', batch: '', department: '', status: '', location: '' });

  // Soft delete (move to trash)
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Move "${name}" to Deleted? They can be restored later.`)) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/alumni/${id}`);
      setAlumni(prev => prev.filter(a => a.id !== id));
      showToast('warning', `"${name}" moved to Deleted.`);
    } catch (err) {
      console.error('Error deleting:', err);
      showToast('danger', 'Failed to delete alumni.');
    } finally {
      setLoading(false);
    }
  };

  // Restore from trash
  const handleRestore = async (id, name) => {
    try {
      setLoading(true);
      await axios.put(`${API_URL}/alumni/${id}/restore`);
      setAlumni(prev => prev.filter(a => a.id !== id));
      showToast('success', `"${name}" restored successfully.`);
    } catch (err) {
      console.error('Error restoring:', err);
      showToast('danger', 'Failed to restore alumni.');
    } finally {
      setLoading(false);
    }
  };

  // Permanent delete
  const handlePermanentDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"? This CANNOT be undone.`)) return;
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/alumni/${id}/permanent`);
      setAlumni(prev => prev.filter(a => a.id !== id));
      showToast('danger', `"${name}" permanently deleted.`);
    } catch (err) {
      console.error('Error permanent delete:', err);
      showToast('danger', 'Failed to permanently delete alumni.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setFilters({ searchTerm: '', batch: '', department: '', status: '', location: '' });
  };

  return (
    <div className="manage-alumni-page">
      {/* Toast */}
      {toast && (
        <div className={`alert alert-${toast.type}`} style={{
          position: 'fixed', top: 80, right: 20, zIndex: 9999, minWidth: 320,
          borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
        }}>
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : toast.type === 'warning' ? 'bi-trash3-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {toast.msg}
        </div>
      )}

      {loading && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9998 }}>
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
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 className="display-5 fw-bold text-danger mb-2">
                  <i className="bi bi-people-fill me-3"></i>Manage Alumni
                </h1>
                <p className="text-muted">View, filter, and manage alumni profiles</p>
              </div>
              <button onClick={() => navigate('/admin/add')} className="btn btn-danger btn-lg">
                <i className="bi bi-plus-circle-fill me-2"></i>Add New Alumni
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div style={{ display: 'flex', gap: 4, background: '#f0f0f0', padding: 4, borderRadius: 12, width: 'fit-content' }}>
            <button
              onClick={() => switchTab('active')}
              style={{
                padding: '9px 24px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 14,
                background: activeTab === 'active' ? '#fff' : 'transparent',
                color: activeTab === 'active' ? '#dc3545' : '#888',
                boxShadow: activeTab === 'active' ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
              <i className="bi bi-people-fill me-2"></i>Active Alumni
            </button>
            <button
              onClick={() => switchTab('deleted')}
              style={{
                padding: '9px 24px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 14,
                background: activeTab === 'deleted' ? '#fff' : 'transparent',
                color: activeTab === 'deleted' ? '#dc3545' : '#888',
                boxShadow: activeTab === 'deleted' ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
              <i className="bi bi-trash3-fill me-2"></i>Deleted Alumni
            </button>
          </div>
          {activeTab === 'deleted' && (
            <div className="alert alert-warning d-flex align-items-center gap-2 mt-3 mb-0" style={{ borderRadius: 10, maxWidth: 560 }}>
              <i className="bi bi-info-circle-fill"></i>
              <span style={{ fontSize: 13 }}>Deleted alumni are hidden from the directory. You can restore or permanently delete them.</span>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0"><i className="bi bi-funnel-fill me-2 text-danger"></i>Filters</h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold"><i className="bi bi-search me-2"></i>Search</label>
                <input type="text" name="searchTerm" value={filters.searchTerm}
                  onChange={handleFilterChange} className="form-control form-control-lg"
                  placeholder="Search by name, email, designation..." />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold"><i className="bi bi-calendar me-2"></i>Batch</label>
                <select name="batch" value={filters.batch} onChange={handleFilterChange} className="form-select form-select-lg">
                  <option value="">All Batches</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold"><i className="bi bi-book me-2"></i>Department</label>
                <select name="department" value={filters.department} onChange={handleFilterChange} className="form-select form-select-lg">
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold"><i className="bi bi-briefcase me-2"></i>Status</label>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="form-select form-select-lg">
                  <option value="">All Status</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Studying">Studying</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold"><i className="bi bi-geo-alt me-2"></i>Location</label>
                <select name="location" value={filters.location} onChange={handleFilterChange} className="form-select form-select-lg">
                  <option value="">All Locations</option>
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button onClick={resetFilters} className="btn btn-outline-danger btn-lg w-100">
                  <i className="bi bi-arrow-clockwise me-2"></i>Reset
                </button>
              </div>
            </div>
            <div className="mt-3">
              <small className="text-muted">
                Showing <strong>{filteredAlumni.length}</strong> of <strong>{alumni.length}</strong> alumni
              </small>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card shadow-lg border-0">
          <div className="card-header py-3" style={{ background: activeTab === 'deleted' ? '#6c757d' : '#dc3545' }}>
            <h4 className="mb-0 text-white">
              <i className={`bi ${activeTab === 'deleted' ? 'bi-trash3-fill' : 'bi-list-ul'} me-2`}></i>
              {activeTab === 'deleted' ? 'Deleted Alumni' : 'Alumni List'} ({filteredAlumni.length})
            </h4>
          </div>
          <div className="card-body p-0">
            {filteredAlumni.length === 0 ? (
              <div className="text-center py-5">
                <i className={`bi ${activeTab === 'deleted' ? 'bi-trash3' : 'bi-inbox'} display-1 text-muted`}></i>
                <p className="text-muted mt-3 fs-5">
                  {alumni.length === 0
                    ? (activeTab === 'deleted' ? 'No deleted alumni found.' : 'No alumni added yet.')
                    : 'No alumni match the current filters.'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Photo</th>
                      <th>Name & Email</th>
                      <th>Designation</th>
                      <th>Organization</th>
                      <th>Batch</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Location</th>
                      <th className="text-center pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlumni.map(alumnus => (
                      <tr key={alumnus.id} style={{ opacity: activeTab === 'deleted' ? 0.65 : 1, background: activeTab === 'deleted' ? '#fafafa' : 'transparent' }}>
                        <td className="ps-4">
                          <img
                            src={alumnus.photo ? `${API_BASE}${alumnus.photo}` : 'https://via.placeholder.com/50'}
                            alt={alumnus.name}
                            className="rounded-circle shadow-sm"
                            style={{ width: 60, height: 60, objectFit: 'cover', filter: activeTab === 'deleted' ? 'grayscale(60%)' : 'none' }}
                          />
                        </td>
                        <td>
                          <strong className="d-block" style={{ textDecoration: activeTab === 'deleted' ? 'line-through' : 'none', color: activeTab === 'deleted' ? '#888' : 'inherit' }}>
                            {alumnus.name}
                          </strong>
                          <small className="text-muted"><i className="bi bi-envelope me-1"></i>{alumnus.email}</small>
                        </td>
                        <td>{alumnus.designation || 'N/A'}</td>
                        <td>{alumnus.organization_name || 'N/A'}</td>
                        <td><span className="badge bg-primary">{alumnus.batch}</span></td>
                        <td><small>{alumnus.department}</small></td>
                        <td>
                          <span className={`badge ${
                            alumnus.current_status === 'Employed' ? 'bg-success' :
                            alumnus.current_status === 'Self-Employed' ? 'bg-primary' : 'bg-info'
                          }`}>{alumnus.current_status}</span>
                        </td>
                        <td>{alumnus.work_location || 'N/A'}</td>
                        <td className="text-center pe-4">
                          {activeTab === 'active' ? (
                            <div className="btn-group">
                              <button onClick={() => navigate(`/admin/edit/${alumnus.id}`)}
                                className="btn btn-sm btn-outline-primary" title="Edit">
                                <i className="bi bi-pencil-square"></i>
                              </button>
                              <button onClick={() => handleDelete(alumnus.id, alumnus.name)}
                                className="btn btn-sm btn-outline-warning" title="Move to Trash">
                                <i className="bi bi-trash3"></i>
                              </button>
                            </div>
                          ) : (
                            <div className="btn-group">
                              <button onClick={() => handleRestore(alumnus.id, alumnus.name)}
                                className="btn btn-sm btn-outline-success" title="Restore">
                                <i className="bi bi-arrow-counterclockwise me-1"></i>Restore
                              </button>
                              <button onClick={() => handlePermanentDelete(alumnus.id, alumnus.name)}
                                className="btn btn-sm btn-outline-danger" title="Delete Permanently">
                                <i className="bi bi-trash3-fill"></i>
                              </button>
                            </div>
                          )}
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
    </div>
  );
}

export default ManageAlumni;
