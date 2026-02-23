import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

// Univariety-inspired color constants
const NAV_COLOR = '#1a2744';
const NAV_TEXT = 'rgba(255,255,255,0.85)';

const TABS = [
  { id: 'personal',   icon: 'bi-person-fill',       label: 'Personal Info' },
  { id: 'education',  icon: 'bi-mortarboard-fill',   label: 'Education' },
  { id: 'work',       icon: 'bi-briefcase-fill',     label: 'Work Experience' },
  { id: 'skills',     icon: 'bi-stars',              label: 'Skills & Bio' },
  { id: 'social',     icon: 'bi-share-fill',         label: 'Social' },
];

const industries = [
  'Information Technology', 'Finance & Banking', 'Healthcare', 'Education',
  'Manufacturing', 'Retail & E-Commerce', 'Media & Entertainment', 'Consulting',
  'Government & Public Sector', 'Real Estate', 'Telecommunications', 'Other'
];
const departments = [
  'Engineering & Technology', 'Economics & Commerce', 'Science',
  'Arts & Humanities', 'Business Administration', 'Law', 'Medicine',
  'Journalism, Media, PR & Communication', 'Other'
];
const experienceYears = Array.from({ length: 51 }, (_, i) => i.toString());
const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

function AlumniEditProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [loading, setLoading]   = useState(false);
  const [saving,  setSaving]    = useState(false);
  const [toast,   setToast]     = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview,  setImagePreview]  = useState(null);

  const [profile, setProfile] = useState(null); // raw fetched data
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', gender: '', dob: '', address: '',
    institution: '', batch: '', department: '', higher_education: '',
    current_status: '', organization_name: '', designation: '',
    industry: '', work_location: '', experience_years: '',
    skills: '', achievements: '', bio: '',
    linkedin: '', photo: ''
  });

  const token = localStorage.getItem('alumniToken');

  useEffect(() => {
    if (!token) {
      // User may be logged in as a regular user but not as alumni
      // Redirect to alumni login
      navigate('/user/login');
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
      const d = res.data;
      setProfile(d);
      setFormData({
        name:              d.name || '',
        email:             d.email || '',
        phone:             d.phone || '',
        gender:            d.gender || '',
        dob:               d.dob ? d.dob.split('T')[0] : '',
        address:           d.address || (d.city ? [d.city, d.country].filter(Boolean).join(', ') : ''),
        institution:       d.institution || '',
        batch:             d.batch || '',
        department:        d.department || d.education_level || '',
        higher_education:  d.higher_education || '',
        current_status:    d.current_status || '',
        organization_name: d.organization_name || '',
        designation:       d.designation || '',
        industry:          d.industry || '',
        work_location:     d.work_location || d.work_city || '',
        experience_years:  d.experience_years != null ? String(d.experience_years) : '',
        skills:            d.skills || '',
        achievements:      d.achievements || '',
        bio:               d.bio || '',
        linkedin:          d.linkedin || '',
        photo:             d.photo || ''
      });
      if (d.photo) setImagePreview(`${API_BASE}${d.photo}`);
    } catch (err) {
      console.error('Profile load error:', err);
      const status = err.response?.status;
      if (status === 401) {
        // Token expired or invalid — clear and redirect to login
        localStorage.removeItem('alumniToken');
        localStorage.removeItem('alumniData');
        showToast('danger', 'Session expired. Please log in again.');
        setTimeout(() => navigate('/user/login'), 1800);
      } else {
        showToast('danger', err.response?.data?.message || `Failed to load profile (${status || 'network error'})`);
      }
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      Object.keys(formData).forEach(k => {
        if (k !== 'photo' && formData[k] !== undefined && formData[k] !== null)
          fd.append(k, formData[k]);
      });
      if (selectedImage) {
        fd.append('photo', selectedImage);
      } else if (formData.photo) {
        fd.append('existing_photo', formData.photo);
      }
      await axios.put(`${API_URL}/alumni/me`, fd, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const stored = JSON.parse(localStorage.getItem('alumniData') || '{}');
      localStorage.setItem('alumniData', JSON.stringify({ ...stored, name: formData.name }));
      showToast('success', 'Profile updated successfully!');
      fetchProfile();
    } catch (err) {
      console.error('Profile save error:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('alumniToken');
        localStorage.removeItem('alumniData');
        showToast('danger', 'Session expired. Please log in again.');
        setTimeout(() => navigate('/user/login'), 1800);
      } else {
        showToast('danger', err.response?.data?.message || 'Failed to save profile.');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Status badge colour
  const statusColor = (s) => {
    if (!s) return '#6b7280';
    if (s === 'Employed') return '#059669';
    if (s === 'Self-Employed') return '#d97706';
    return '#2563eb';
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f6f8' }}>
      <div className="spinner-border" style={{ width: '3rem', height: '3rem', color: NAV_COLOR }}></div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f5f6f8', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 80, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? '#059669' : '#dc2626',
          color: '#fff', borderRadius: 10, padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)', minWidth: 280, fontSize: 14
        }}>
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} style={{ fontSize: 18 }}></i>
          {toast.msg}
        </div>
      )}

      {/* ── Top Sub-Navigation (Univariety-style) ── */}
      <div style={{ background: NAV_COLOR, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
          {/* Left nav items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[
              { icon: 'bi-grid-fill', label: 'My Dashboard', active: false },
              { icon: 'bi-people-fill', label: 'Directory', active: false },
              { icon: 'bi-person-gear', label: 'Edit Profile', active: true },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => item.label === 'Directory' && navigate('/user/view-alumni')}
                style={{
                  background: item.active ? 'rgba(255,255,255,0.12)' : 'none',
                  border: 'none', color: item.active ? '#fff' : NAV_TEXT,
                  padding: '8px 16px', borderRadius: 6, cursor: 'pointer',
                  fontSize: 13, fontWeight: item.active ? 600 : 400,
                  display: 'flex', alignItems: 'center', gap: 7
                }}
              >
                <i className={`bi ${item.icon}`} style={{ fontSize: 13 }}></i>
                {item.label}
              </button>
            ))}
          </div>
          {/* Right: back + logout */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigate('/user/view-alumni')}
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6
              }}
            >
              <i className="bi bi-arrow-left"></i> Back to Directory
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px 60px' }}>

        {/* ── Profile Header Card ── */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.07)', marginBottom: 20, overflow: 'hidden' }}>
          {/* Cover strip */}
          <div style={{ height: 90, background: `linear-gradient(135deg, ${NAV_COLOR} 0%, #2d4a8a 100%)` }}></div>

          <div style={{ padding: '0 32px 24px', display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
            {/* Photo */}
            <div style={{ marginTop: -50, position: 'relative', flexShrink: 0 }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Profile"
                  style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }} />
              ) : (
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#e5e7eb', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-person-fill" style={{ fontSize: 46, color: '#9ca3af' }}></i>
                </div>
              )}
              <label htmlFor="photoUpload" style={{
                position: 'absolute', bottom: 4, right: 4, width: 28, height: 28,
                background: NAV_COLOR, borderRadius: '50%', border: '2px solid #fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}>
                <i className="bi bi-camera-fill" style={{ color: '#fff', fontSize: 12 }}></i>
              </label>
              <input type="file" id="photoUpload" accept="image/*" onChange={onImageChange} className="d-none" />
            </div>

            {/* Name / info */}
            <div style={{ flex: 1, paddingBottom: 4, paddingTop: 16, minWidth: 200 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h2 style={{ fontWeight: 800, fontSize: 22, color: '#111827', margin: 0 }}>{formData.name || '—'}</h2>
                {formData.current_status && (
                  <span style={{ background: statusColor(formData.current_status) + '18', color: statusColor(formData.current_status), fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                    {formData.current_status}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 6, flexWrap: 'wrap' }}>
                {formData.designation && (
                  <span style={{ fontSize: 14, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <i className="bi bi-briefcase-fill" style={{ color: NAV_COLOR, fontSize: 12 }}></i>
                    {formData.designation}
                  </span>
                )}
                {formData.organization_name && (
                  <span style={{ fontSize: 14, color: '#4b5563', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <i className="bi bi-building" style={{ color: NAV_COLOR, fontSize: 12 }}></i>
                    {formData.organization_name}
                  </span>
                )}
                {formData.address && (
                  <span style={{ fontSize: 14, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <i className="bi bi-geo-alt-fill" style={{ color: '#dc3545', fontSize: 12 }}></i>
                    {formData.address}
                  </span>
                )}
              </div>
              {(formData.batch || formData.institution) && (
                <div style={{ marginTop: 6, paddingLeft: 10, borderLeft: `3px solid ${NAV_COLOR}` }}>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>
                    {formData.institution && <>{formData.institution}</>}
                    {formData.batch && <> · Batch {formData.batch}</>}
                  </span>
                </div>
              )}
            </div>

            {/* Save button */}
            <div style={{ paddingBottom: 4, paddingTop: 16 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: saving ? '#9ca3af' : NAV_COLOR,
                  color: '#fff', border: 'none', borderRadius: 8,
                  padding: '10px 24px', fontWeight: 700, fontSize: 14,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  boxShadow: '0 2px 8px rgba(26,39,68,0.3)'
                }}
              >
                {saving
                  ? <><span className="spinner-border spinner-border-sm"></span> Saving...</>
                  : <><i className="bi bi-check-circle-fill"></i> Save Changes</>
                }
              </button>
            </div>
          </div>

          {/* ── Tab Navigation ── */}
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '0 32px', display: 'flex', gap: 4, overflowX: 'auto' }}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: 'none', border: 'none', padding: '14px 18px',
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
                  color: activeTab === tab.id ? NAV_COLOR : '#6b7280',
                  borderBottom: activeTab === tab.id ? `3px solid ${NAV_COLOR}` : '3px solid transparent',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 7
                }}
              >
                <i className={`bi ${tab.icon}`} style={{ fontSize: 13 }}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 8px rgba(0,0,0,0.07)', padding: '32px' }}>

          {/* ─── Personal Info ─── */}
          {activeTab === 'personal' && (
            <div>
              <SectionTitle icon="bi-person-fill" title="Personal Information" />
              <div className="row g-3 mt-1">
                <div className="col-md-6">
                  <Field label="Full Name" required>
                    <input className="form-control" name="name" value={formData.name} onChange={onChange} placeholder="Full name" />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Email Address" required>
                    <input className="form-control" type="email" name="email" value={formData.email} onChange={onChange} placeholder="Email" />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Phone Number">
                    <input className="form-control" type="tel" name="phone" value={formData.phone} onChange={onChange} placeholder="Phone" />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Gender">
                    <select className="form-select" name="gender" value={formData.gender} onChange={onChange}>
                      <option value="">Select gender</option>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Date of Birth">
                    <input className="form-control" type="date" name="dob" value={formData.dob} onChange={onChange} />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Current Address / Location">
                    <input className="form-control" name="address" value={formData.address} onChange={onChange} placeholder="City, State, Country" />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ─── Education ─── */}
          {activeTab === 'education' && (
            <div>
              <SectionTitle icon="bi-mortarboard-fill" title="Education Details" />
              <div className="row g-3 mt-1">
                <div className="col-md-8">
                  <Field label="Institution / School / University" required>
                    <input className="form-control" name="institution" value={formData.institution} onChange={onChange} placeholder="Name of institution" />
                  </Field>
                </div>
                <div className="col-md-4">
                  <Field label="Batch / Passout Year" required>
                    <select className="form-select" name="batch" value={formData.batch} onChange={onChange}>
                      <option value="">Select year</option>
                      {years.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Department / Stream">
                    <select className="form-select" name="department" value={formData.department} onChange={onChange}>
                      <option value="">Select department</option>
                      {departments.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Higher Education">
                    <input className="form-control" name="higher_education" value={formData.higher_education} onChange={onChange} placeholder="e.g. MBA from XYZ University" />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ─── Work Experience ─── */}
          {activeTab === 'work' && (
            <div>
              <SectionTitle icon="bi-briefcase-fill" title="Work Experience" />
              <div className="row g-3 mt-1">
                <div className="col-md-6">
                  <Field label="Current Status">
                    <select className="form-select" name="current_status" value={formData.current_status} onChange={onChange}>
                      <option value="">Select status</option>
                      <option>Employed</option>
                      <option>Self-Employed</option>
                      <option>Studying</option>
                      <option>Not Working</option>
                    </select>
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Organisation / Company Name">
                    <input className="form-control" name="organization_name" value={formData.organization_name} onChange={onChange} placeholder="Company name" />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Designation / Job Title">
                    <input className="form-control" name="designation" value={formData.designation} onChange={onChange} placeholder="e.g. Software Engineer" />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Industry">
                    <select className="form-select" name="industry" value={formData.industry} onChange={onChange}>
                      <option value="">Select industry</option>
                      {industries.map(i => <option key={i}>{i}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Work Location">
                    <input className="form-control" name="work_location" value={formData.work_location} onChange={onChange} placeholder="City, Country or Remote" />
                  </Field>
                </div>
                <div className="col-md-6">
                  <Field label="Years of Experience">
                    <select className="form-select" name="experience_years" value={formData.experience_years} onChange={onChange}>
                      <option value="">Select experience</option>
                      {experienceYears.map(e => <option key={e} value={e}>{e === '0' ? 'Fresher (0 yrs)' : `${e} year${e !== '1' ? 's' : ''}`}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* ─── Skills & Bio ─── */}
          {activeTab === 'skills' && (
            <div>
              <SectionTitle icon="bi-stars" title="Skills & Bio" />
              <div className="row g-3 mt-1">
                <div className="col-12">
                  <Field label="Skills">
                    <input className="form-control" name="skills" value={formData.skills} onChange={onChange}
                      placeholder="e.g. JavaScript, React, Leadership, Public Speaking" />
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 5 }}>Separate skills with commas</div>
                  </Field>
                </div>
                <div className="col-12">
                  <Field label="Achievements">
                    <textarea className="form-control" rows={3} name="achievements" value={formData.achievements} onChange={onChange}
                      placeholder="List your notable achievements, awards, certifications..." />
                  </Field>
                </div>
                <div className="col-12">
                  <Field label="Brief Bio / About Me">
                    <textarea className="form-control" rows={4} name="bio" value={formData.bio} onChange={onChange}
                      placeholder="Write a short professional biography about yourself..." />
                  </Field>
                </div>
              </div>

              {/* Skills preview */}
              {formData.skills && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Skills Preview</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {formData.skills.split(',').map(s => s.trim()).filter(Boolean).map((s, i) => (
                      <span key={i} style={{
                        background: NAV_COLOR + '12', color: NAV_COLOR,
                        padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 500
                      }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Social Links ─── */}
          {activeTab === 'social' && (
            <div>
              <SectionTitle icon="bi-share-fill" title="Social & Online Presence" />
              <div className="row g-3 mt-1">
                <div className="col-md-8">
                  <Field label="LinkedIn Profile">
                    <div className="input-group">
                      <span className="input-group-text" style={{ background: '#0a66c2', border: 'none', color: '#fff', borderRadius: '8px 0 0 8px' }}>
                        <i className="bi bi-linkedin"></i>
                      </span>
                      <input className="form-control" type="url" name="linkedin" value={formData.linkedin} onChange={onChange}
                        placeholder="https://linkedin.com/in/username" />
                    </div>
                  </Field>
                </div>

                {/* Profile summary read-only */}
                <div className="col-12 mt-3">
                  <div style={{ background: '#f9fafb', borderRadius: 12, padding: '20px 24px', border: '1px solid #e5e7eb' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14 }}>
                      <i className="bi bi-shield-check-fill me-2" style={{ color: NAV_COLOR }}></i>
                      Account Details (Read-only)
                    </div>
                    <div className="row g-2">
                      {[
                        { label: 'Username', value: profile?.username, icon: 'bi-person-circle' },
                        { label: 'Registered Email', value: formData.email, icon: 'bi-envelope-fill' },
                        { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '—', icon: 'bi-calendar-check' },
                        { label: 'Approval Status', value: profile?.approval_status || '—', icon: 'bi-check-circle' },
                      ].map(item => (
                        <div key={item.label} className="col-sm-6">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <i className={`bi ${item.icon}`} style={{ color: NAV_COLOR, fontSize: 14, flexShrink: 0 }}></i>
                            <div>
                              <div style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</div>
                              <div style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>{item.value || '—'}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Bottom Save bar ── */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button
              onClick={() => navigate('/user/view-alumni')}
              style={{
                background: '#fff', border: '1.5px solid #d1d5db', borderRadius: 8,
                padding: '10px 24px', fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#374151'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                background: saving ? '#9ca3af' : NAV_COLOR,
                color: '#fff', border: 'none', borderRadius: 8,
                padding: '10px 28px', fontWeight: 700, fontSize: 14,
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              {saving
                ? <><span className="spinner-border spinner-border-sm"></span> Saving...</>
                : <><i className="bi bi-check-circle-fill"></i> Save Changes</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small reusable helpers ────────────────────────────────────────────────────
function SectionTitle({ icon, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: '#1a2744', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <i className={`bi ${icon}`} style={{ color: '#fff', fontSize: 14 }}></i>
      </div>
      <h5 style={{ fontWeight: 700, fontSize: 16, color: '#111827', margin: 0 }}>{title}</h5>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export default AlumniEditProfile;
