import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';


const API_URL = 'http://localhost:5000/api';

function AddAlumni() {
  const navigate = useNavigate();
  const { id } = useParams();
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
    if (id) {
      fetchAlumniById(id);
    }
  }, [id]);

  const fetchAlumniById = async (alumniId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/alumni/${alumniId}`);
      setFormData(response.data);
      if (response.data.photo) {
        setImagePreview(`http://localhost:5000${response.data.photo}`);
      }
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
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    
    if (selectedImage) {
      formDataToSend.append('photo', selectedImage);
    }
    
    if (id && !selectedImage && formData.photo) {
      formDataToSend.append('existing_photo', formData.photo);
    }

    try {
      setLoading(true);
      if (id) {
        await axios.put(`${API_URL}/alumni/${id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Alumni updated successfully!');
      } else {
        await axios.post(`${API_URL}/alumni`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('Alumni added successfully!');
      }
      navigate('/admin/manage');
    } catch (error) {
      console.error('Error saving alumni:', error);
      alert('Failed to save alumni data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-alumni-page">
   

      {loading && (
        <div className="loading-overlay">
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
            <h1 className="display-5 fw-bold text-danger">
              <i className="bi bi-person-plus-fill me-3"></i>
              {id ? 'Edit Alumni' : 'Add New Alumni'}
            </h1>
            <p className="text-muted">Fill in the details below to {id ? 'update' : 'add'} an alumni profile</p>
          </div>
        </div>

        <div className="card shadow-lg border-0">
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Image Upload */}
                <div className="col-12 text-center mb-4">
                  <div className="image-upload-container">
                    {imagePreview && (
                      <img src={imagePreview} alt="Preview" className="img-preview mb-3" />
                    )}
                    <label htmlFor="photo" className="btn btn-outline-danger btn-lg">
                      <i className="bi bi-camera-fill me-2"></i>
                      {imagePreview ? 'Change Photo' : 'Upload Photo'}
                    </label>
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="d-none"
                    />
                    <p className="text-muted mt-2 small">
                      <i className="bi bi-info-circle me-1"></i>
                      Max size: 5MB (JPG, PNG, GIF)
                    </p>
                  </div>
                </div>

                {/* Personal Details Section */}
                <div className="col-12">
                  <h5 className="text-danger fw-bold mb-3">
                    <i className="bi bi-person-fill me-2"></i>
                    Personal Information
                  </h5>
                  <hr />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Phone <span className="text-danger">*</span></label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Gender <span className="text-danger">*</span></label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="form-select form-select-lg"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Date of Birth <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                  />
                </div>

                {/* Educational Details Section */}
                <div className="col-12 mt-5">
                  <h5 className="text-danger fw-bold mb-3">
                    <i className="bi bi-mortarboard-fill me-2"></i>
                    Educational Details
                  </h5>
                  <hr />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Institution <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Batch (Year) <span className="text-danger">*</span></label>
                  <select
                    name="batch"
                    value={formData.batch}
                    onChange={handleInputChange}
                    className="form-select form-select-lg"
                    required
                  >
                    <option value="">Select Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Department <span className="text-danger">*</span></label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="form-select form-select-lg"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Higher Education</label>
                  <textarea
                    name="higher_education"
                    value={formData.higher_education}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="3"
                    placeholder="e.g., MBA from Harvard University"
                  />
                </div>

                {/* Professional Details Section */}
                <div className="col-12 mt-5">
                  <h5 className="text-danger fw-bold mb-3">
                    <i className="bi bi-briefcase-fill me-2"></i>
                    Professional Details
                  </h5>
                  <hr />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Current Status <span className="text-danger">*</span></label>
                  <select
                    name="current_status"
                    value={formData.current_status}
                    onChange={handleInputChange}
                    className="form-select form-select-lg"
                    required
                  >
                    <option value="">Select Status</option>
                    <option value="Employed">Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Studying">Studying</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Organization Name</label>
                  <input
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Designation</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Industry</label>
                  <select
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    className="form-select form-select-lg"
                  >
                    <option value="">Select Industry</option>
                    {industries.map(ind => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Work Location</label>
                  <select
                    name="work_location"
                    value={formData.work_location}
                    onChange={handleInputChange}
                    className="form-select form-select-lg"
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Experience (Years)</label>
                  <select
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    className="form-select form-select-lg"
                  >
                    <option value="">Select Experience</option>
                    {experienceYears.map(exp => (
                      <option key={exp} value={exp}>{exp}</option>
                    ))}
                  </select>
                </div>

                {/* Additional Information Section */}
                <div className="col-12 mt-5">
                  <h5 className="text-danger fw-bold mb-3">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Additional Information
                  </h5>
                  <hr />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">LinkedIn</label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Skills</label>
                  <textarea
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="3"
                    placeholder="e.g., JavaScript, React, Node.js"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Achievements</label>
                  <textarea
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="3"
                    placeholder="List your achievements..."
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="4"
                    placeholder="Write a brief bio..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="col-12 mt-5">
                  <div className="d-flex gap-3 justify-content-end">
                    <button 
                      type="button" 
                      onClick={() => navigate('/admin/manage')} 
                      className="btn btn-secondary btn-lg px-5"
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-danger btn-lg px-5" 
                      disabled={loading}
                    >
                      <i className="bi bi-check-circle-fill me-2"></i>
                      {id ? 'Update Alumni' : 'Add Alumni'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddAlumni;