import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

const departments = [
  'Engineering & Technology', 'Economics & Commerce',
  'Journalism, Media, PR & Communication', 'Law', 'Medicine',
  'Arts & Humanities', 'Science', 'Business Administration'
];
const industries = [
  'Information Technology', 'Finance & Banking', 'Healthcare', 'Education',
  'Manufacturing', 'Retail', 'Media & Entertainment', 'Consulting', 'Government', 'Other'
];
const locations = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Remote', 'International'
];
const experienceYears = Array.from({ length: 51 }, (_, i) => i.toString());
const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

function AlumniEditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', gender: '', dob: '', batch: '', department: '',
    address: '', linkedin: '', bio: '', current_status: '', organization_name: '',
    designation: '', industry: '', work_location: '', experience_years: '',
    skills: '', achievements: '', higher_education: '', institution: '', photo: ''
  });

  const token = localStorage.getItem('alumniToken');

  useEffect(() => {
    if (!token) {
      navigate('/alumni-login');
      return;
    }
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/alumni/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        gender: data.gender || '',
        dob: data.dob ? data.dob.split('T')[0] : '',
        batch: data.batch || '',
        department: data.department || '',
        address: data.address || '',
        linkedin: data.linkedin || '',
        bio: data.bio || '',
        current_status: data.current_status || '',
        organization_name: data.organization_name || '',
        designation: data.designation || '',
        industry: data.industry || '',
        work_location: data.work_location || '',
        experience_years: data.experience_years != null ? String(data.experience_years) : '',
        skills: data.skills || '',
        achievements: data.achievements || '',
        higher_education: data.higher_education || '',
        institution: data.institution || '',
        photo: data.photo || ''
      });
      if (data.photo) setImagePreview(`${API_BASE}${data.photo}`);
    } catch (err) {
      console.error('Error loading profile:', err);
      showToast('danger', 'Failed to load your profile.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
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
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'photo' && formData[key] !== undefined && formData[key] !== null) {
          fd.append(key, formData[key]);
        }
      });
      if (selectedImage) {
        fd.append('photo', selectedImage);
      } else if (formData.photo) {
        fd.append('existing_photo', formData.photo);
      }

      await axios.put(`${API_URL}/alumni/me`, fd, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update alumniData in localStorage with new name
      const stored = JSON.parse(localStorage.getItem('alumniData') || '{}');
      localStorage.setItem('alumniData', JSON.stringify({ ...stored, name: formData.name }));

      showToast('success', 'Profile updated successfully!');
      setTimeout(() => navigate('/user/view-alumni'), 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      showToast('danger', err.response?.data?.message || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="alumni-edit-profile-page">
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

      <div className="container my-5">
        <div className="row mb-4">
          <div className="col-12">
            <button onClick={() => navigate('/user/view-alumni')} className="btn btn-outline-danger mb-3">
              <i className="bi bi-arrow-left me-2"></i>Back to Directory
            </button>
            <h1 className="display-5 fw-bold text-danger">
              <i className="bi bi-person-gear me-3"></i>Edit My Profile
            </h1>
            <p className="text-muted">Update your alumni profile information below.</p>
          </div>
        </div>

        <div className="card shadow-lg border-0">
          <div className="card-body p-4 p-md-5">
            <form onSubmit={handleSubmit}>
              <div className="row g-4">

                {/* Photo Upload */}
                <div className="col-12 text-center mb-2">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="rounded-circle border border-3 border-danger mb-3"
                      style={{ width: '140px', height: '140px', objectFit: 'cover', display: 'block', margin: '0 auto 1rem' }}
                    />
                  )}
                  <label htmlFor="photo" className="btn btn-outline-danger">
                    <i className="bi bi-camera-fill me-2"></i>
                    {imagePreview ? 'Change Photo' : 'Upload Photo'}
                  </label>
                  <input type="file" id="photo" accept="image/*" onChange={handleImageChange} className="d-none" />
                  <p className="text-muted mt-2 small">Max 5MB — JPG, PNG, GIF</p>
                </div>

                {/* Personal Info */}
                <div className="col-12">
                  <h5 className="text-danger fw-bold mb-2"><i className="bi bi-person-fill me-2"></i>Personal Information</h5>
                  <hr />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Full Name <span className="text-danger">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                    className="form-control form-control-lg" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email <span className="text-danger">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                    className="form-control form-control-lg" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Phone <span className="text-danger">*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                    className="form-control form-control-lg" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Gender <span className="text-danger">*</span></label>
                  <select name="gender" value={formData.gender} onChange={handleInputChange}
                    className="form-select form-select-lg" required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Date of Birth <span className="text-danger">*</span></label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange}
                    className="form-control form-control-lg" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                    className="form-control form-control-lg" />
                </div>

                {/* Education */}
                <div className="col-12 mt-3">
                  <h5 className="text-danger fw-bold mb-2"><i className="bi bi-mortarboard-fill me-2"></i>Educational Details</h5>
                  <hr />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Institution <span className="text-danger">*</span></label>
                  <input type="text" name="institution" value={formData.institution} onChange={handleInputChange}
                    className="form-control form-control-lg" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Batch (Year) <span className="text-danger">*</span></label>
                  <select name="batch" value={formData.batch} onChange={handleInputChange}
                    className="form-select form-select-lg" required>
                    <option value="">Select Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Department <span className="text-danger">*</span></label>
                  <select name="department" value={formData.department} onChange={handleInputChange}
                    className="form-select form-select-lg" required>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Higher Education</label>
                  <textarea name="higher_education" value={formData.higher_education} onChange={handleInputChange}
                    className="form-control" rows="2" placeholder="e.g., MBA from XYZ University" />
                </div>

                {/* Professional */}
                <div className="col-12 mt-3">
                  <h5 className="text-danger fw-bold mb-2"><i className="bi bi-briefcase-fill me-2"></i>Professional Details</h5>
                  <hr />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Current Status <span className="text-danger">*</span></label>
                  <select name="current_status" value={formData.current_status} onChange={handleInputChange}
                    className="form-select form-select-lg" required>
                    <option value="">Select Status</option>
                    <option value="Employed">Employed</option>
                    <option value="Self-Employed">Self-Employed</option>
                    <option value="Studying">Studying</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Organisation Name</label>
                  <input type="text" name="organization_name" value={formData.organization_name} onChange={handleInputChange}
                    className="form-control form-control-lg" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Designation</label>
                  <input type="text" name="designation" value={formData.designation} onChange={handleInputChange}
                    className="form-control form-control-lg" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Industry</label>
                  <select name="industry" value={formData.industry} onChange={handleInputChange}
                    className="form-select form-select-lg">
                    <option value="">Select Industry</option>
                    {industries.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Work Location</label>
                  <select name="work_location" value={formData.work_location} onChange={handleInputChange}
                    className="form-select form-select-lg">
                    <option value="">Select Location</option>
                    {locations.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Experience (Years)</label>
                  <select name="experience_years" value={formData.experience_years} onChange={handleInputChange}
                    className="form-select form-select-lg">
                    <option value="">Select Experience</option>
                    {experienceYears.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                {/* Additional Info */}
                <div className="col-12 mt-3">
                  <h5 className="text-danger fw-bold mb-2"><i className="bi bi-info-circle-fill me-2"></i>Additional Information</h5>
                  <hr />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">LinkedIn</label>
                  <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange}
                    className="form-control form-control-lg" placeholder="https://linkedin.com/in/username" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Skills</label>
                  <textarea name="skills" value={formData.skills} onChange={handleInputChange}
                    className="form-control" rows="3" placeholder="e.g., JavaScript, React, Node.js" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Achievements</label>
                  <textarea name="achievements" value={formData.achievements} onChange={handleInputChange}
                    className="form-control" rows="3" placeholder="List your notable achievements..." />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Bio</label>
                  <textarea name="bio" value={formData.bio} onChange={handleInputChange}
                    className="form-control" rows="4" placeholder="Write a brief professional biography..." />
                </div>

                {/* Buttons */}
                <div className="col-12 mt-4">
                  <div className="d-flex gap-3 justify-content-end">
                    <button type="button" onClick={() => navigate('/user/view-alumni')}
                      className="btn btn-secondary btn-lg px-5">
                      <i className="bi bi-x-circle me-2"></i>Cancel
                    </button>
                    <button type="submit" className="btn btn-danger btn-lg px-5" disabled={saving}>
                      {saving ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                      ) : (
                        <><i className="bi bi-check-circle-fill me-2"></i>Save Changes</>
                      )}
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

export default AlumniEditProfile;
