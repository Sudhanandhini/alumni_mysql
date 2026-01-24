import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

function ViewAlumni() {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  
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
    const token = localStorage.getItem('userToken');
    if (!token) {
      navigate('/user/login');
    } else {
      fetchAlumni();
    }
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

    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(searchLower) ||
        a.email.toLowerCase().includes(searchLower) ||
        (a.designation && a.designation.toLowerCase().includes(searchLower)) ||
        (a.organization_name && a.organization_name.toLowerCase().includes(searchLower))
      );
    }

    if (filters.batch) {
      filtered = filtered.filter(a => a.batch === filters.batch);
    }

    if (filters.department) {
      filtered = filtered.filter(a => a.department === filters.department);
    }

    if (filters.status) {
      filtered = filtered.filter(a => a.current_status === filters.status);
    }

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

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    navigate('/user/login');
  };

  return (
    <div className="view-alumni-page">
     

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

      <div className="container-fluid my-5 px-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h1 className="display-5 fw-bold text-danger mb-2">
                  <i className="bi bi-people-fill me-3"></i>
                  Alumni Directory
                </h1>
                <p className="text-muted">
                  <i className="bi bi-person-circle me-2"></i>
                  Welcome, <strong>{localStorage.getItem('userName')}</strong>
                </p>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn btn-outline-danger"
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="card shadow-sm mb-4">
          <div className="card-header bg-light">
            <h5 className="mb-0">
              <i className="bi bi-funnel-fill me-2 text-danger"></i>
              Search & Filter Alumni
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

        {/* Alumni Cards Grid */}
        <div className="row g-4">
          {filteredAlumni.length === 0 ? (
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body text-center py-5">
                  <i className="bi bi-inbox display-1 text-muted"></i>
                  <p className="text-muted mt-3 fs-5">
                    {alumni.length === 0 ? 'No alumni data available.' : 'No alumni found matching your filters.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            filteredAlumni.map((alumnus) => (
              <div key={alumnus.id} className="col-md-6 col-lg-4 col-xl-3">
                <div className="card h-100 shadow-sm hover-shadow" style={{ cursor: 'pointer' }}
                     onClick={() => setSelectedAlumni(alumnus)}>
                  <div className="card-body text-center">
                    <img
                      src={alumnus.photo ? `${API_BASE}${alumnus.photo}` : 'https://via.placeholder.com/150'}
                      alt={alumnus.name}
                      className="rounded-circle mb-3 border border-3 border-danger"
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                    <h5 className="card-title fw-bold text-danger">{alumnus.name}</h5>
                    <p className="text-muted mb-2">
                      <i className="bi bi-briefcase-fill me-2"></i>
                      {alumnus.designation || 'N/A'}
                    </p>
                    <p className="text-muted small mb-2">
                      <i className="bi bi-building me-2"></i>
                      {alumnus.organization_name || 'N/A'}
                    </p>
                    <div className="d-flex justify-content-center gap-2 mb-3">
                      <span className="badge bg-primary">{alumnus.batch}</span>
                      <span className="badge bg-success">{alumnus.current_status}</span>
                    </div>
                    <small className="text-muted d-block">
                      <i className="bi bi-book me-1"></i>
                      {alumnus.department}
                    </small>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Alumni Detail Modal */}
      {selectedAlumni && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
             onClick={() => setSelectedAlumni(null)}>
          <div className="modal-dialog modal-lg modal-dialog-centered"
               onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="bi bi-person-circle me-2"></i>
                  Alumni Details
                </h5>
                <button type="button" className="btn-close btn-close-white" 
                        onClick={() => setSelectedAlumni(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center mb-3">
                    <img
                      src={selectedAlumni.photo ? `${API_BASE}${selectedAlumni.photo}` : 'https://via.placeholder.com/200'}
                      alt={selectedAlumni.name}
                      className="rounded-circle border border-3 border-danger"
                      style={{ width: '200px', height: '200px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-md-8">
                    <h3 className="text-danger fw-bold">{selectedAlumni.name}</h3>
                    <p className="text-muted">{selectedAlumni.designation} at {selectedAlumni.organization_name}</p>
                    
                    <hr />
                    
                    <div className="row g-3">
                      <div className="col-6">
                        <strong>Email:</strong><br />
                        <a href={`mailto:${selectedAlumni.email}`}>{selectedAlumni.email}</a>
                      </div>
                      <div className="col-6">
                        <strong>Phone:</strong><br />
                        {selectedAlumni.phone}
                      </div>
                      <div className="col-6">
                        <strong>Batch:</strong><br />
                        {selectedAlumni.batch}
                      </div>
                      <div className="col-6">
                        <strong>Department:</strong><br />
                        {selectedAlumni.department}
                      </div>
                      <div className="col-6">
                        <strong>Status:</strong><br />
                        <span className="badge bg-success">{selectedAlumni.current_status}</span>
                      </div>
                      <div className="col-6">
                        <strong>Location:</strong><br />
                        {selectedAlumni.work_location || 'N/A'}
                      </div>
                      {selectedAlumni.linkedin && (
                        <div className="col-12">
                          <strong>LinkedIn:</strong><br />
                          <a href={selectedAlumni.linkedin} target="_blank" rel="noopener noreferrer">
                            <i className="bi bi-linkedin me-2"></i>
                            View Profile
                          </a>
                        </div>
                      )}
                      {selectedAlumni.bio && (
                        <div className="col-12">
                          <strong>Bio:</strong><br />
                          <p className="text-muted">{selectedAlumni.bio}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewAlumni;