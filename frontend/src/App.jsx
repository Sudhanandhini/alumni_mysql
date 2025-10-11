import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal } from 'bootstrap';
import './App.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [view, setView] = useState('public');
  const [alumni, setAlumni] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    dob: '',
    batch: '',
    department: '',
    address: '',
    linkedin: '',
    bio: '',
    current_status: '',
    organization_name: '',
    designation: '',
    industry: '',
    work_location: '',
    experience_years: '',
    skills: '',
    achievements: '',
    higher_education: '',
    institution: ''
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

  const industries = [
    'Information Technology',
    'Finance & Banking',
    'Healthcare',
    'Education',
    'Manufacturing',
    'Retail',
    'Media & Entertainment',
    'Consulting',
    'Government',
    'Other'
  ];

  const locations = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Remote', 'International'
  ];

  const experienceYears = Array.from({ length: 51 }, (_, i) => i.toString());
  const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/alumni`);
      setAlumni(response.data);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      alert('Failed to fetch alumni data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    
    // Append all form fields
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    // Append image if selected
    if (selectedImage) {
      formDataToSend.append('photo', selectedImage);
    }
    
    // If editing and no new image, send existing photo path
    if (editingId && !selectedImage && formData.photo) {
      formDataToSend.append('existing_photo', formData.photo);
    }

    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`${API_URL}/alumni/${editingId}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Alumni updated successfully!');
      } else {
        await axios.post(`${API_URL}/alumni`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Alumni added successfully!');
      }
      
      resetForm();
      fetchAlumni();
    } catch (error) {
      console.error('Error saving alumni:', error);
      alert('Failed to save alumni data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (alumnus) => {
    setFormData(alumnus);
    setEditingId(alumnus.id);
    setImagePreview(alumnus.photo ? `http://localhost:5000${alumnus.photo}` : null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      gender: '',
      dob: '',
      batch: '',
      department: '',
      address: '',
      linkedin: '',
      bio: '',
      current_status: '',
      organization_name: '',
      designation: '',
      industry: '',
      work_location: '',
      experience_years: '',
      skills: '',
      achievements: '',
      higher_education: '',
      institution: ''
    });
    setEditingId(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-danger shadow-sm">
        <div className="container">
          <a className="navbar-brand d-flex align-items-center" href="#home">
            <i className="bi bi-mortarboard-fill me-2"></i>
            <span className="fw-bold">Alumni Portal</span>
          </a>
          <div className="ms-auto">
            <button
              onClick={() => setView('public')}
              className={`btn me-2 ${view === 'public' ? 'btn-light' : 'btn-outline-light'}`}
            >
              <i className="bi bi-globe me-1"></i> Public View
            </button>
            <button
              onClick={() => setView('admin')}
              className={`btn ${view === 'admin' ? 'btn-light' : 'btn-outline-light'}`}
            >
              <i className="bi bi-gear-fill me-1"></i> Admin
            </button>
          </div>
        </div>
      </nav>

      {/* Loading Spinner */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Public View */}
      {view === 'public' && (
        <div className="public-view">
          <div className="hero-section bg-gradient-danger text-white py-5">
            <div className="container text-center">
              <h1 className="display-4 fw-bold mb-3">Guiding Alumni</h1>
              <p className="lead">
                We are proud of our alumni who are setting an example and motivating younger students.
              </p>
            </div>
          </div>

          <div className="container my-5">
            <div className="row g-4">
              {alumni.map((alumnus) => (
                <div key={alumnus.id} className="col-md-6 col-lg-3">
                  <div className="card alumni-card h-100 shadow-sm">
                    <div className="card-body text-center">
                      <img
                        src={alumnus.photo ? `http://localhost:5000${alumnus.photo}` : 'https://via.placeholder.com/150'}
                        alt={alumnus.name}
                        className="rounded-circle alumni-img mb-3"
                      />
                      <h5 className="card-title fw-bold">{alumnus.name}</h5>
                      
                      {alumnus.current_status && (
                        <span className={`badge mb-3 ${
                          alumnus.current_status === 'Employed' ? 'bg-success' :
                          alumnus.current_status === 'Self-Employed' ? 'bg-primary' : 'bg-info'
                        }`}>
                          {alumnus.current_status}
                        </span>
                      )}

                      <div className="alumni-details text-start">
                        {alumnus.institution && (
                          <p className="mb-2">
                            <i className="bi bi-mortarboard text-danger me-2"></i>
                            <small>{alumnus.institution} ({alumnus.batch})</small>
                          </p>
                        )}
                        
                        {alumnus.designation && (
                          <p className="mb-2">
                            <i className="bi bi-briefcase text-danger me-2"></i>
                            <small>{alumnus.designation}</small>
                          </p>
                        )}
                        
                        {alumnus.organization_name && (
                          <p className="mb-2">
                            <i className="bi bi-building text-danger me-2"></i>
                            <small>{alumnus.organization_name}</small>
                          </p>
                        )}
                        
                        {alumnus.department && (
                          <p className="mb-2">
                            <i className="bi bi-book text-danger me-2"></i>
                            <small>{alumnus.department}</small>
                          </p>
                        )}
                        
                        {alumnus.work_location && (
                          <p className="mb-2">
                            <i className="bi bi-geo-alt text-danger me-2"></i>
                            <small>{alumnus.work_location}</small>
                          </p>
                        )}
                        
                        {alumnus.experience_years && (
                          <p className="mb-2">
                            <i className="bi bi-award text-danger me-2"></i>
                            <small>{alumnus.experience_years} years experience</small>
                          </p>
                        )}

                        {alumnus.linkedin && (
                          <a href={alumnus.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary mt-2">
                            <i className="bi bi-linkedin me-1"></i> LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {alumni.length === 0 && !loading && (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <p className="text-muted mt-3">No alumni added yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Dashboard */}
      {view === 'admin' && (
        <div className="container my-5">
          {/* Add/Edit Form */}
          <div className="card shadow mb-4">
            <div className="card-header bg-danger text-white">
              <h4 className="mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                {editingId ? 'Edit Alumni' : 'Add New Alumni'}
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Image Upload */}
                  <div className="col-md-12 text-center mb-3">
                    <div className="image-upload-container">
                      {imagePreview && (
                        <img src={imagePreview} alt="Preview" className="img-preview mb-3" />
                      )}
                      <label htmlFor="photo" className="btn btn-outline-danger">
                        <i className="bi bi-camera me-2"></i>
                        {imagePreview ? 'Change Photo' : 'Upload Photo'}
                      </label>
                      <input
                        type="file"
                        id="photo"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="d-none"
                      />
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="col-md-6">
                    <label className="form-label">Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Email <span className="text-danger">*</span></label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Phone <span className="text-danger">*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Gender <span className="text-danger">*</span></label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Date of Birth <span className="text-danger">*</span></label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Batch (Year) <span className="text-danger">*</span></label>
                    <select
                      name="batch"
                      value={formData.batch}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Department <span className="text-danger">*</span></label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Institution <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      className="form-control"
                      required
                    />
                  </div>

                  {/* Professional Details */}
                  <div className="col-12 mt-4">
                    <h5 className="text-danger"><i className="bi bi-briefcase me-2"></i>Professional Details</h5>
                    <hr />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Current Status <span className="text-danger">*</span></label>
                    <select
                      name="current_status"
                      value={formData.current_status}
                      onChange={handleInputChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select</option>
                      <option value="Employed">Employed</option>
                      <option value="Self-Employed">Self-Employed</option>
                      <option value="Studying">Studying</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Organization Name</label>
                    <input
                      type="text"
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Designation</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Industry</label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select</option>
                      {industries.map(ind => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Work Location</label>
                    <select
                      name="work_location"
                      value={formData.work_location}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Experience (Years)</label>
                    <select
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleInputChange}
                      className="form-select"
                    >
                      <option value="">Select</option>
                      {experienceYears.map(exp => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-control"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">LinkedIn</label>
                    <input
                      type="url"
                      name="linkedin"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      className="form-control"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>

                  {/* Additional Details */}
                  <div className="col-12">
                    <label className="form-label">Skills</label>
                    <textarea
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="2"
                      placeholder="e.g., JavaScript, React, Node.js"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Achievements</label>
                    <textarea
                      name="achievements"
                      value={formData.achievements}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Higher Education</label>
                    <textarea
                      name="higher_education"
                      value={formData.higher_education}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="2"
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="form-control"
                      rows="3"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="col-12">
                    <button type="submit" className="btn btn-danger me-2" disabled={loading}>
                      <i className="bi bi-check-circle me-2"></i>
                      {editingId ? 'Update Alumni' : 'Add Alumni'}
                    </button>
                    {editingId && (
                      <button type="button" onClick={resetForm} className="btn btn-secondary">
                        <i className="bi bi-x-circle me-2"></i>
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Alumni List */}
          <div className="card shadow">
            <div className="card-header bg-danger text-white">
              <h4 className="mb-0"><i className="bi bi-list me-2"></i>Manage Alumni</h4>
            </div>
            <div className="card-body">
              {alumni.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted">No alumni added yet.</p>
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alumni.map((alumnus) => (
                        <tr key={alumnus.id}>
                          <td>
                            <img
                              src={alumnus.photo ? `http://localhost:5000${alumnus.photo}` : 'https://via.placeholder.com/50'}
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
                          <td>{alumnus.batch}</td>
                          <td>
                            <button
                              onClick={() => handleEdit(alumnus)}
                              className="btn btn-sm btn-outline-primary me-2"
                            > Edit
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleDelete(alumnus.id)}
                              className="btn btn-sm btn-outline-danger"
                            > Delete
                              <i className="bi bi-trash"></i>
                            </button>
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
      )}
    </div>
  );
}

export default App;