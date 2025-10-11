import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const API_URL = 'http://localhost:5000/api';

function ManageAlumni() {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    searchTerm: '',
    batch: '',
    department: '',
    status: '',
    location: ''
  });

  const departments = [
    'Engineering & Technology',
    'Economics & Commerce',
    'Journalism, Media, PR & Communication',
    'Law',
    'Medicine',
    'Arts & Humanities',
    'Science',
    'Business Administration'
  ];

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Remote', 'International'
  ];

  const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    fetchAlumni();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [alumni, filters]);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/alumni`);
      setAlumni(response.data);
      setFilteredAlumni(response.data);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      alert('Failed to fetch alumni data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...alumni];

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchLower) ||
        a.email.toLowerCase().includes(searchLower) ||
        (a.designation && a.designation.toLowerCase().includes(searchLower)) ||
        (a.organization_name && a.organization_name.toLowerCase().includes(searchLower))
      );
    }

    // Batch filter
    if (filters.batch) {
      filtered = filtered.filter(a => a.batch === filters.batch);
    }

    // Department filter
    if (filters.department) {
      filtered = filtered.filter(a => a.department === filters.department);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(a => a.current_status === filters.status);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(a => a.work_location === filters.location);
    }

    setFilteredAlumni(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      batch: '',
      department: '',
      status: '',
      location: ''
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this alumni?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/alumni/${id}`);
        alert('Alumni deleted successfully!');
        fetchAlumni();
      } catch (error) {
        console.error('Error deleting alumni:', error);
        alert('Failed to delete alumni');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="manage-alumni-page">
      <Navbar />

      {loading && (
        <div className="loading-overlay">
          <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      <div className="container-fluid my-5 px-4">
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
                  <i className="bi bi-people-fill me-3"></i>
                  Manage Alumni
                </h1>
                <p className="text-muted">View, filter, and manage alumni profiles</p>
              </div>
              <button 
                onClick={() => navigate('/admin/add')} 
                className="btn btn-danger btn-lg"
              >
                <i className="bi bi-plus-circle-fill me-2"></i>
                Add New Alumni
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">
              <i className="bi bi-funnel-fill me-2 text-danger"></i>
              Filters
            </h5>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">
                  <i className="bi bi-search me-2"></i>
                  Search
                </label>
                <input
                  type="text"
                  name="searchTerm"
                  value={filters.searchTerm}
                  onChange={handleFilterChange}
                  className="form-control form-control-lg"
                  placeholder="Search by name, email, designation..."
                />
              </div>

              <div className="col-md-2">
                <label className="form-label fw-semibold">
                  <i className="bi bi-calendar me-2"></i>
                  Batch
                </label>
                <select
                  name="batch"
                  value={filters.batch}
                  onChange={handleFilterChange}
                  className="form-select form-select-lg"
                >
                  <option value="">All Batches</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-book me-2"></i>
                  Department
                </label>
                <select
                  name="department"
                  value={filters.department}
                  onChange={handleFilterChange}
                  className="form-select form-select-lg"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <label className="form-label fw-semibold">
                  <i className="bi bi-briefcase me-2"></i>
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="form-select form-select-lg"
                >
                  <option value="">All Status</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Studying">Studying</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">
                  <i className="bi bi-geo-alt me-2"></i>
                  Location
                </label>
                <select
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  className="form-select form-select-lg"
                >
                  <option value="">All Locations</option>
                  {locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-2 d-flex align-items-end">
                <button 
                  onClick={resetFilters} 
                  className="btn btn-outline-danger btn-lg w-100"
                >
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Reset
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

        {/* Alumni Table */}
        <div className="card shadow-lg border-0">
          <div className="card-header bg-danger text-white py-3">
            <h4 className="mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Alumni List ({filteredAlumni.length})
            </h4>
          </div>
          <div className="card-body p-0">
            {filteredAlumni.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <p className="text-muted mt-3 fs-5">
                  {alumni.length === 0 ? 'No alumni added yet.' : 'No alumni found matching your filters.'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light sticky-top">
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
                    {filteredAlumni.map((alumnus) => (
                      <tr key={alumnus.id}>
                        <td className="ps-4">
                          <img
                            src={alumnus.photo ? `http://localhost:5000${alumnus.photo}` : 'https://via.placeholder.com/50'}
                            alt={alumnus.name}
                            className="rounded-circle shadow-sm"
                            style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                          />
                        </td>
                        <td>
                          <strong className="d-block">{alumnus.name}</strong>
                          <small className="text-muted">
                            <i className="bi bi-envelope me-1"></i>
                            {alumnus.email}
                          </small>
                        </td>
                        <td>{alumnus.designation || 'N/A'}</td>
                        <td>{alumnus.organization_name || 'N/A'}</td>
                        <td>
                          <span className="badge bg-primary fs-6">{alumnus.batch}</span>
                        </td>
                        <td>
                          <small>{alumnus.department}</small>
                        </td>
                        <td>
                          <span className={`badge ${
                            alumnus.current_status === 'Employed' ? 'bg-success' :
                            alumnus.current_status === 'Self-Employed' ? 'bg-primary' : 'bg-info'
                          }`}>
                            {alumnus.current_status}
                          </span>
                        </td>
                        <td>{alumnus.work_location || 'N/A'}</td>
                        <td className="text-center pe-4">
                          <div className="btn-group">
                            <button
                              onClick={() => navigate(`/admin/edit/${alumnus.id}`)}
                              className="btn btn-sm btn-outline-primary"
                              title="Edit"
                            >
                              <i className="bi bi-pencil-square"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(alumnus.id)}
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
    </div>
  );
}

export default ManageAlumni;