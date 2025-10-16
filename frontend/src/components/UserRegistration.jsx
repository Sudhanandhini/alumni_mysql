import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function UserRegistration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  // Debounce timer ref
  const debounceTimer = useRef(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
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

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    try {
      setCheckingUsername(true);
      const response = await axios.get(`${API_URL}/alumni/check-username/${username}`);
      setUsernameAvailable(response.data.available);
    } catch (error) {
      console.error('Error checking username:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Check username availability when username field changes
    if (name === 'username') {
      // Clear previous timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      
      // Reset availability status while typing
      if (value.length < 3) {
        setUsernameAvailable(null);
      } else {
        // Set new timer to check after 500ms
        debounceTimer.current = setTimeout(() => {
          checkUsernameAvailability(value);
        }, 500);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }
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
    
    // Validate password
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // If username hasn't been checked yet, check it now
    if (formData.username.length >= 3 && usernameAvailable === null) {
      setCheckingUsername(true);
      await checkUsernameAvailability(formData.username);
      alert('Username checked. Please click Submit again.');
      return;
    }

    // Only block if username is explicitly unavailable
    if (usernameAvailable === false) {
      alert('This username is already taken. Please choose a different one.');
      return;
    }

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'confirmPassword') {
        formDataToSend.append(key, formData[key]);
      }
    });
    
    if (selectedImage) {
      formDataToSend.append('photo', selectedImage);
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/alumni/register`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSubmitSuccess(true);
      
      // Reset form after 2 seconds and navigate to login
      setTimeout(() => {
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
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
        setSelectedImage(null);
        setImagePreview(null);
        setSubmitSuccess(false);
        navigate('/alumni-login');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert(error.response?.data?.message || 'Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-registration-page">
    
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

      {submitSuccess && (
        <div className="alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3" 
             style={{ zIndex: 10000, minWidth: '300px' }}>
          <i className="bi bi-check-circle-fill me-2"></i>
          Registration successful! Redirecting to login...
        </div>
      )}

      <div className="container my-5">
        <div className="row mb-4">
          <div className="col-12 text-center">
            <h1 className="display-4 fw-bold text-danger mb-3">
              <i className="bi bi-person-plus-fill me-3"></i>
              Alumni Registration
            </h1>
            <p className="lead text-muted">
              Join our alumni network and stay connected with your alma mater
            </p>
            <p className="text-muted">
              <i className="bi bi-info-circle me-2"></i>
              Fields marked with <span className="text-danger">*</span> are required
            </p>
          </div>
        </div>

        <div className="card shadow-lg border-0">
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Image Upload */}
                <div className="col-12 text-center mb-4">
                  <div className="image-upload-container">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        style={{
                          width: '200px',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '50%',
                          border: '5px solid #dc3545',
                          marginBottom: '20px'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '200px',
                        height: '200px',
                        borderRadius: '50%',
                        border: '3px dashed #dc3545',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 20px',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <i className="bi bi-person-circle" style={{ fontSize: '100px', color: '#dc3545' }}></i>
                      </div>
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

                {/* Login Credentials Section */}
                <div className="col-12">
                  <h5 className="text-danger fw-bold mb-3">
                    <i className="bi bi-shield-lock-fill me-2"></i>
                    Login Credentials
                  </h5>
                  <hr />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Username <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="Choose a unique username"
                    required
                    minLength="3"
                  />
                  {checkingUsername && (
                    <small className="text-muted d-block mt-1">
                      <i className="bi bi-hourglass-split me-1"></i>
                      Checking availability...
                    </small>
                  )}
                  {usernameAvailable === true && (
                    <small className="text-success d-block mt-1">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Username is available
                    </small>
                  )}
                  {usernameAvailable === false && (
                    <small className="text-danger d-block mt-1">
                      <i className="bi bi-x-circle-fill me-1"></i>
                      Username is already taken
                    </small>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="Enter a strong password"
                    required
                    minLength="6"
                  />
                  <small className="text-muted d-block mt-1">
                    <i className="bi bi-info-circle me-1"></i>
                    Minimum 6 characters
                  </small>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Confirm Password <span className="text-danger">*</span>
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="Re-enter your password"
                    required
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <small className="text-danger d-block mt-1">
                      <i className="bi bi-x-circle-fill me-1"></i>
                      Passwords do not match
                    </small>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <small className="text-success d-block mt-1">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Passwords match
                    </small>
                  )}
                </div>

                {/* Personal Details Section */}
                <div className="col-12 mt-5">
                  <h5 className="text-danger fw-bold mb-3">
                    <i className="bi bi-person-fill me-2"></i>
                    Personal Information
                  </h5>
                  <hr />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Full Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Phone Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="+91 XXXXXXXXXX"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Gender <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label fw-semibold">
                    Date of Birth <span className="text-danger">*</span>
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="Your address"
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
                  <label className="form-label fw-semibold">
                    Institution Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="Your institution name"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Graduation Year <span className="text-danger">*</span>
                  </label>
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
                  <label className="form-label fw-semibold">
                    Department/Field <span className="text-danger">*</span>
                  </label>
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
                    placeholder="e.g., MBA from Harvard University, PhD in Computer Science"
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
                  <label className="form-label fw-semibold">
                    Current Status <span className="text-danger">*</span>
                  </label>
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
                    placeholder="Company/Organization name"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Designation/Role</label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="form-control form-control-lg"
                    placeholder="Your job title"
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
                  <label className="form-label fw-semibold">Years of Experience</label>
                  <select
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    className="form-select form-select-lg"
                  >
                    <option value="">Select Experience</option>
                    {experienceYears.map(exp => (
                      <option key={exp} value={exp}>{exp} {exp === '1' ? 'year' : 'years'}</option>
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
                  <label className="form-label fw-semibold">
                    <i className="bi bi-linkedin me-2"></i>LinkedIn Profile
                  </label>
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
                    placeholder="e.g., JavaScript, React, Node.js, Python, Project Management"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Achievements & Awards</label>
                  <textarea
                    name="achievements"
                    value={formData.achievements}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="3"
                    placeholder="List your notable achievements, awards, publications, etc."
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Professional Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="4"
                    placeholder="Write a brief professional biography about yourself..."
                  />
                </div>

                {/* Submit Buttons */}
                <div className="col-12 mt-5">
                  <div className="d-flex gap-3 justify-content-center">
                    <button 
                      type="button" 
                      onClick={() => navigate('/')} 
                      className="btn btn-outline-secondary btn-lg px-5"
                    >
                      <i className="bi bi-x-circle me-2"></i>
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-danger btn-lg px-5" 
                      disabled={loading || (formData.username.length >= 3 && usernameAvailable === false)}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-send-fill me-2"></i>
                          Submit Registration
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="col-12 text-center mt-3">
                  <p className="text-muted small">
                    <i className="bi bi-shield-check me-2"></i>
                    Your information will be securely stored and you can login after registration
                  </p>
                  <p className="text-muted small">
                    Already have an account? <a href="/alumni-login" className="text-danger">Login here</a>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserRegistration;