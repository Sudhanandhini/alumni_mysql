import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

// ─── Data ────────────────────────────────────────────────────────────────────
const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Singapore', 'UAE', 'Saudi Arabia',
  'New Zealand', 'South Africa', 'Japan', 'China', 'Other'
];
const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur',
  'Nagpur', 'Indore', 'Bhopal', 'Patna', 'Vadodara', 'Coimbatore', 'Other'
];
const INDUSTRIES = [
  'Information Technology', 'Finance & Banking', 'Healthcare', 'Education',
  'Manufacturing', 'Retail & E-Commerce', 'Media & Entertainment', 'Consulting',
  'Government & Public Sector', 'Real Estate', 'Telecommunications',
  'Agriculture', 'Pharmaceuticals', 'Automobile', 'Hospitality', 'Other'
];
const FUNCTIONAL_AREAS = [
  'Engineering / Technology', 'Sales & Business Development', 'Marketing',
  'Finance & Accounting', 'Human Resources', 'Operations',
  'IT & Software', 'Research & Development', 'Design / Creative',
  'Legal & Compliance', 'Customer Service', 'Healthcare / Medical',
  'Teaching / Training', 'Management', 'Other'
];
const EMPLOYMENT_TYPES = [
  'Full-time', 'Part-time', 'Contract', 'Freelance / Consulting',
  'Internship', 'Self-employed / Entrepreneur'
];
const SENIORITY_LEVELS = [
  'Fresher / Intern', 'Entry Level (0-2 years)', 'Junior (2-5 years)',
  'Mid-level (5-8 years)', 'Senior (8-12 years)', 'Lead / Principal',
  'Manager', 'Senior Manager', 'Director / VP', 'C-Suite (CEO, CTO, etc.)'
];
const EDUCATION_LEVELS = [
  'Class 10 (SSC/ICSE)', 'Class 11', 'Class 12 (HSC/CBSE)',
  'Undergraduate (B.Tech/B.Sc/BA/B.Com)',
  'Postgraduate (MBA/M.Tech/M.Sc)', 'Doctoral (PhD)'
];
const STEP_LABELS = ['Account Setup', 'Personal Info', 'Academic Info', 'Professional Info'];

// ─── ComboBox ────────────────────────────────────────────────────────────────
function ComboBox({ name, value, onChange, options, placeholder, required = false }) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value || '');
  const wrapRef = useRef(null);

  useEffect(() => { setInputVal(value || ''); }, [value]);
  useEffect(() => {
    const close = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const filtered = inputVal ? options.filter(o => o.toLowerCase().includes(inputVal.toLowerCase())) : options;

  const handleInput = (e) => {
    setInputVal(e.target.value);
    onChange({ target: { name, value: e.target.value } });
    setOpen(true);
  };
  const select = (opt) => {
    setInputVal(opt);
    onChange({ target: { name, value: opt } });
    setOpen(false);
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={{ display: 'flex' }}>
        <input type="text" className="form-control" value={inputVal} onChange={handleInput}
          onFocus={() => setOpen(true)} placeholder={placeholder} required={required}
          autoComplete="off" style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }} />
        <button type="button" onClick={() => setOpen(!open)} style={{
          border: '1px solid #ced4da', borderLeft: 'none', background: '#f8f9fa',
          borderRadius: '0 8px 8px 0', padding: '0 12px', cursor: 'pointer'
        }}>
          <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} style={{ fontSize: 12 }}></i>
        </button>
      </div>
      {open && filtered.length > 0 && (
        <ul style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          maxHeight: 220, overflowY: 'auto', background: '#fff',
          border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 8px 8px',
          listStyle: 'none', padding: '4px 0', margin: 0,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}>
          {filtered.map(opt => (
            <li key={opt} onMouseDown={() => select(opt)}
              style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 14, color: '#333' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Step Indicator ──────────────────────────────────────────────────────────
function StepIndicator({ step, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
      {Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const isActive = n === step;
        const isDone = n < step;
        return (
          <React.Fragment key={n}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13,
              background: isActive ? '#dc3545' : isDone ? '#28a745' : '#e9ecef',
              color: isActive || isDone ? '#fff' : '#aaa', flexShrink: 0, transition: 'all 0.3s',
              boxShadow: isActive ? '0 2px 8px rgba(220,53,69,0.4)' : 'none'
            }}>
              {isDone ? <i className="bi bi-check2" style={{ fontSize: 16 }}></i> : n}
            </div>
            {i < total - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 6px',
                background: isDone ? '#28a745' : '#e9ecef', transition: 'all 0.3s'
              }}></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}><i className="bi bi-exclamation-circle me-1"></i>{msg}</div>;
}

function CardRadio({ name, value, options, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
      {options.map(opt => (
        <label key={opt.val} style={{
          flex: '1 1 140px', border: `2px solid ${value === opt.val ? '#dc3545' : '#e9ecef'}`,
          borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
          background: value === opt.val ? '#fff5f5' : '#fff',
          display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s', userSelect: 'none'
        }}>
          <input type="radio" name={name} value={opt.val} checked={value === opt.val}
            onChange={onChange} style={{ accentColor: '#dc3545', width: 15, height: 15, flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: value === opt.val ? '#dc3545' : '#333' }}>
              {opt.icon && <i className={`bi ${opt.icon} me-2`}></i>}{opt.label}
            </div>
            {opt.desc && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{opt.desc}</div>}
          </div>
        </label>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function AddAlumni() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const TOTAL_STEPS = 4;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    // Step 1 – credentials (only add mode)
    username: '', password: '', confirmPassword: '',
    // Step 1 – basic
    firstName: '', lastName: '', email: '', countryCode: '+91', phone: '',
    attended_program: '', program_type: '',
    // Step 2
    country: '', city: '', dob: '', gender: '',
    education_status: '', education_level: '', working_status: '',
    // Step 3
    institution: '', enrollment_number: '', batch: '', completion_year: '',
    linkedin: '', facebook: '',
    // Step 4
    organization_name: '', designation: '', industry: '',
    functional_area: '', work_country: '', work_city: '',
    employment_type: '', seniority_level: '', work_mode: 'Office',
    skills: '', bio: '', achievements: '',
    // stored separately for edit
    existingPhoto: ''
  });

  const years = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  // Pre-fill form on edit
  useEffect(() => {
    if (isEdit) loadAlumni();
  }, [id]);

  const loadAlumni = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/alumni/${id}`);
      const d = res.data;
      const nameParts = (d.name || '').split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const phoneFull = d.phone || '';
      let countryCode = '+91';
      let phoneNum = phoneFull;
      const knownCodes = ['+971', '+44', '+61', '+65', '+49', '+1'];
      for (const code of knownCodes) {
        if (phoneFull.startsWith(code)) { countryCode = code; phoneNum = phoneFull.slice(code.length); break; }
      }
      if (phoneNum.startsWith('+91')) { countryCode = '+91'; phoneNum = phoneFull.slice(3); }

      setFormData({
        username: '', password: '', confirmPassword: '',
        firstName, lastName,
        email: d.email || '', countryCode, phone: phoneNum,
        attended_program: d.attended_program || '',
        program_type: d.program_type || '',
        country: d.country || '', city: d.city || '',
        dob: d.dob ? d.dob.split('T')[0] : '', gender: d.gender || '',
        education_status: '',
        education_level: d.education_level || d.department || '',
        working_status: d.current_status === 'Studying' ? 'Not Working' : (d.current_status === 'Employed' ? 'Working' : 'Not Working'),
        institution: d.institution || '',
        enrollment_number: d.enrollment_number || '',
        batch: d.batch || '', completion_year: d.completion_year || '',
        linkedin: d.linkedin || '', facebook: d.facebook || '',
        organization_name: d.organization_name || '', designation: d.designation || '',
        industry: d.industry || '', functional_area: d.functional_area || '',
        work_country: d.work_location || '', work_city: d.work_city || '',
        employment_type: d.employment_type || '', seniority_level: d.seniority_level || '',
        work_mode: 'Office', skills: d.skills || '', bio: d.bio || '',
        achievements: d.achievements || '', existingPhoto: d.photo || ''
      });
      if (d.photo) setImagePreview(`${API_BASE}${d.photo}`);
    } catch (err) {
      console.error('Error loading alumni:', err);
      showToast('danger', 'Failed to load alumni data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Max file size is 5MB'); return; }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!isEdit) {
        if (!formData.username.trim()) e.username = 'Username is required';
        else if (formData.username.length < 3) e.username = 'At least 3 characters required';
        if (!formData.password) e.password = 'Password is required';
        else if (formData.password.length < 6) e.password = 'At least 6 characters required';
        if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
      }
      if (!formData.firstName.trim()) e.firstName = 'First name is required';
      if (!formData.lastName.trim()) e.lastName = 'Last name is required';
      if (!formData.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email address';
      if (!formData.phone.trim()) e.phone = 'Phone number is required';
    }
    if (s === 2) {
      if (!formData.country.trim()) e.country = 'Country is required';
      if (!formData.city.trim()) e.city = 'City is required';
      if (!formData.dob) e.dob = 'Date of birth is required';
      if (!formData.gender) e.gender = 'Gender is required';
    }
    if (s === 3) {
      if (!formData.institution.trim()) e.institution = 'Institution name is required';
      if (!formData.batch) e.batch = 'Start year is required';
    }
    return e;
  };

  const nextStep = () => {
    const errs = validate(step);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`;
    const phone = `${formData.countryCode}${formData.phone.trim()}`;
    const address = [formData.city, formData.country].filter(Boolean).join(', ');
    let current_status = '';
    if (formData.program_type === 'student') current_status = 'Studying';
    else if (formData.working_status === 'Working') current_status = 'Employed';
    else current_status = 'Self-Employed';

    const fd = new FormData();
    const fields = {
      name, email: formData.email.trim(), phone, gender: formData.gender,
      dob: formData.dob, batch: formData.batch,
      department: formData.education_level || '',
      address, linkedin: formData.linkedin || '', bio: formData.bio || '',
      current_status, organization_name: formData.organization_name || '',
      designation: formData.designation || '', industry: formData.industry || '',
      work_location: formData.work_country || '', skills: formData.skills || '',
      achievements: formData.achievements || '',
      higher_education: formData.education_level || '',
      institution: formData.institution || '',
      attended_program: formData.attended_program || '',
      program_type: formData.program_type || '',
      facebook: formData.facebook || '',
      enrollment_number: formData.enrollment_number || '',
      completion_year: formData.completion_year || '',
      functional_area: formData.functional_area || '',
      employment_type: formData.employment_type || '',
      seniority_level: formData.seniority_level || '',
      country: formData.country || '', city: formData.city || '',
      education_level: formData.education_level || '',
      work_city: formData.work_city || '',
    };
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));

    if (!isEdit) {
      fd.append('username', formData.username.trim());
      fd.append('password', formData.password);
    }

    if (selectedImage) {
      fd.append('photo', selectedImage);
    } else if (isEdit && formData.existingPhoto) {
      fd.append('existing_photo', formData.existingPhoto);
    }

    try {
      setLoading(true);
      if (isEdit) {
        await axios.put(`${API_URL}/alumni/${id}`, fd);
        showToast('success', 'Alumni updated successfully!');
      } else {
        await axios.post(`${API_URL}/alumni`, fd);
        showToast('success', 'Alumni added successfully!');
      }
      setTimeout(() => navigate('/admin/manage'), 1500);
    } catch (err) {
      console.error('Error saving alumni:', err);
      showToast('danger', err.response?.data?.message || 'Failed to save alumni data.');
    } finally {
      setLoading(false);
    }
  };

  const rightPanelInfo = {
    1: { icon: 'bi-person-plus-fill', title: isEdit ? 'Edit Alumni Profile' : 'Add New Alumni', desc: isEdit ? 'Update the alumni profile with accurate information.' : 'Fill in all steps to create a complete alumni profile.' },
    2: { icon: 'bi-geo-alt-fill', title: 'Personal Details', desc: 'Location and education details help connect alumni with the right network.' },
    3: { icon: 'bi-mortarboard-fill', title: 'Academic Details', desc: 'Academic history and social links make the profile more complete.' },
    4: { icon: 'bi-briefcase-fill', title: 'Professional Details', desc: 'Career information helps other alumni network and collaborate.' },
  };
  const info = rightPanelInfo[step];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fc' }}>

      {/* Toast */}
      {toast && (
        <div className={`alert alert-${toast.type}`} style={{
          position: 'fixed', top: 80, right: 20, zIndex: 9999, minWidth: 300,
          borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
        }}>
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
          {toast.msg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
          <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}></div>
        </div>
      )}

      {/* ── Left: Form Panel ── */}
      <div style={{ flex: 1, overflowX: 'hidden', padding: '48px 40px 80px', minWidth: 0 }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <button onClick={() => navigate('/admin/manage')} style={{
              background: 'none', border: '1.5px solid #dee2e6', borderRadius: 8,
              padding: '7px 16px', cursor: 'pointer', color: '#555', fontSize: 13,
              display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600
            }}>
              <i className="bi bi-arrow-left"></i> Back
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#1a1a2e' }}>
                <i className="bi bi-person-plus-fill text-danger me-2"></i>
                {isEdit ? 'Edit Alumni' : 'Add New Alumni'}
              </div>
              <div style={{ fontSize: 12, color: '#aaa' }}>
                {isEdit ? 'Update alumni profile information' : 'Create a new alumni profile'}
              </div>
            </div>
          </div>

          <StepIndicator step={step} total={TOTAL_STEPS} />

          <h2 style={{ fontWeight: 800, fontSize: 22, color: '#1a1a2e', marginBottom: 4 }}>
            {step === 1 && (isEdit ? 'Basic Information' : 'Account & Basic Info')}
            {step === 2 && 'Personal Information'}
            {step === 3 && 'Academic Details'}
            {step === 4 && 'Professional Details'}
          </h2>
          <p style={{ color: '#999', fontSize: 13, marginBottom: 24 }}>
            Step {step} of {TOTAL_STEPS} — {['Account setup', 'About the alumni', 'Academic journey', 'Career information'][step - 1]}
          </p>

          {/* Form Card */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px', boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
            {step === 1 && <Step1 formData={formData} onChange={handleChange} errors={errors} isEdit={isEdit} />}
            {step === 2 && <Step2 formData={formData} onChange={handleChange} errors={errors} />}
            {step === 3 && <Step3 formData={formData} onChange={handleChange} errors={errors} years={years} />}
            {step === 4 && <Step4 formData={formData} onChange={handleChange} imagePreview={imagePreview} onImageChange={handleImageChange} />}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 28 }}>
            {step > 1 ? (
              <button onClick={prevStep} style={{
                background: 'none', border: '1.5px solid #dee2e6', borderRadius: 10,
                padding: '10px 22px', fontWeight: 600, cursor: 'pointer', color: '#555',
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 14
              }}>
                <i className="bi bi-arrow-left"></i> Back
              </button>
            ) : (
              <div></div>
            )}
            {step < TOTAL_STEPS ? (
              <button onClick={nextStep} style={{
                background: 'linear-gradient(135deg, #dc3545, #8b0000)', color: '#fff',
                border: 'none', borderRadius: 10, padding: '12px 30px', fontWeight: 700,
                fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 12px rgba(220,53,69,0.35)'
              }}>
                Continue <i className="bi bi-arrow-right"></i>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{
                background: 'linear-gradient(135deg, #dc3545, #8b0000)', color: '#fff',
                border: 'none', borderRadius: 10, padding: '12px 30px', fontWeight: 700,
                fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, minWidth: 180,
                boxShadow: '0 4px 12px rgba(220,53,69,0.35)'
              }}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Saving...</>
                  : <><i className="bi bi-check-circle-fill me-2"></i>{isEdit ? 'Save Changes' : 'Add Alumni'}</>
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Info Panel ── */}
      <div className="d-none d-lg-flex" style={{
        width: 340, flexShrink: 0,
        background: 'linear-gradient(160deg, #c62828 0%, #7b1717 55%, #4a0e0e 100%)',
        position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
        flexDirection: 'column', justifyContent: 'space-between', padding: '56px 32px'
      }}>
        <div>
          <div style={{ fontSize: 48, color: 'rgba(255,255,255,0.92)', marginBottom: 20 }}>
            <i className={`bi ${info.icon}`}></i>
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 12, lineHeight: 1.4 }}>
            {info.title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
            {info.desc}
          </p>
          <div>
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const isDone = n < step;
              const isActive = n === step;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: isDone || isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s'
                  }}>
                    {isDone
                      ? <i className="bi bi-check2" style={{ color: '#c62828', fontSize: 13 }}></i>
                      : <span style={{ fontSize: 11, fontWeight: 700, color: isActive ? '#c62828' : 'rgba(255,255,255,0.5)' }}>{n}</span>
                    }
                  </div>
                  <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 400, color: isDone || isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)', transition: 'all 0.3s' }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 24 }}>
            {['Profiles are auto-approved', 'Login credentials created instantly', 'Profile appears in alumni directory', 'Admin can edit any profile later'].map(b => (
              <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <i className="bi bi-check-circle-fill" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, flexShrink: 0 }}></i>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)' }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({ formData, onChange, errors, isEdit }) {
  return (
    <div className="row g-3">
      {!isEdit && (
        <>
          <div className="col-12">
            <div style={{ background: '#fff5f5', borderRadius: 10, padding: '12px 16px', marginBottom: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#dc3545' }}>
                <i className="bi bi-shield-lock-fill me-2"></i>Login Credentials
              </span>
            </div>
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Username <span className="text-danger">*</span></label>
            <input type="text" name="username" value={formData.username} onChange={onChange}
              className={`form-control ${errors.username ? 'is-invalid' : ''}`} placeholder="Choose a username" />
            <FieldError msg={errors.username} />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Password <span className="text-danger">*</span></label>
            <input type="password" name="password" value={formData.password} onChange={onChange}
              className={`form-control ${errors.password ? 'is-invalid' : ''}`} placeholder="Min 6 characters" />
            <FieldError msg={errors.password} />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Confirm Password <span className="text-danger">*</span></label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={onChange}
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`} placeholder="Re-enter password" />
            <FieldError msg={errors.confirmPassword} />
          </div>
          <div className="col-12"><hr style={{ margin: '4px 0 8px' }} /></div>
        </>
      )}
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">First Name <span className="text-danger">*</span></label>
        <input type="text" name="firstName" value={formData.firstName} onChange={onChange}
          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`} placeholder="First name" />
        <FieldError msg={errors.firstName} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Last Name <span className="text-danger">*</span></label>
        <input type="text" name="lastName" value={formData.lastName} onChange={onChange}
          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`} placeholder="Last name" />
        <FieldError msg={errors.lastName} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Email <span className="text-danger">*</span></label>
        <input type="email" name="email" value={formData.email} onChange={onChange}
          className={`form-control ${errors.email ? 'is-invalid' : ''}`} placeholder="email@example.com" />
        <FieldError msg={errors.email} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Mobile <span className="text-danger">*</span></label>
        <div className="input-group">
          <select name="countryCode" value={formData.countryCode} onChange={onChange}
            className="form-select" style={{ maxWidth: 110 }}>
            <option value="+91">+91 IN</option>
            <option value="+1">+1 US</option>
            <option value="+44">+44 UK</option>
            <option value="+61">+61 AU</option>
            <option value="+971">+971 AE</option>
            <option value="+65">+65 SG</option>
          </select>
          <input type="tel" name="phone" value={formData.phone} onChange={onChange}
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`} placeholder="Mobile number" />
        </div>
        <FieldError msg={errors.phone} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Attended Program</label>
        <select name="attended_program" value={formData.attended_program} onChange={onChange} className="form-select">
          <option value="">Select class</option>
          {['Class 8','Class 9','Class 10','Class 11','Class 12'].map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Program Status</label>
        <CardRadio name="program_type" value={formData.program_type} onChange={onChange} options={[
          { val: 'alumni', label: 'Alumni', icon: 'bi-person-check-fill', desc: 'Former student' },
          { val: 'student', label: 'Student', icon: 'bi-book-fill', desc: 'Currently studying' }
        ]} />
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({ formData, onChange, errors }) {
  return (
    <div className="row g-3">
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Country <span className="text-danger">*</span></label>
        <ComboBox name="country" value={formData.country} onChange={onChange} options={COUNTRIES} placeholder="Search or type country" required />
        <FieldError msg={errors.country} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">City <span className="text-danger">*</span></label>
        <ComboBox name="city" value={formData.city} onChange={onChange} options={CITIES} placeholder="Search or type city" required />
        <FieldError msg={errors.city} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Date of Birth <span className="text-danger">*</span></label>
        <input type="date" name="dob" value={formData.dob} onChange={onChange}
          className={`form-control ${errors.dob ? 'is-invalid' : ''}`} />
        <FieldError msg={errors.dob} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Gender <span className="text-danger">*</span></label>
        <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
          {['Male', 'Female', 'Other'].map(g => (
            <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
              <input type="radio" name="gender" value={g} checked={formData.gender === g}
                onChange={onChange} style={{ accentColor: '#dc3545', width: 15, height: 15 }} />
              <span style={{ fontSize: 14 }}>{g}</span>
            </label>
          ))}
        </div>
        <FieldError msg={errors.gender} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Education Level</label>
        <ComboBox name="education_level" value={formData.education_level} onChange={onChange}
          options={EDUCATION_LEVELS} placeholder="Select or type level" />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Education Status</label>
        <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
          {['Pursuing Studies', 'Completed'].map(s => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
              <input type="radio" name="education_status" value={s} checked={formData.education_status === s}
                onChange={onChange} style={{ accentColor: '#dc3545', width: 15, height: 15 }} />
              <span style={{ fontSize: 14 }}>{s}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="col-12">
        <label className="form-label fw-semibold small">Working Status</label>
        <CardRadio name="working_status" value={formData.working_status} onChange={onChange} options={[
          { val: 'Working', label: 'Working', icon: 'bi-briefcase-fill', desc: 'Currently employed' },
          { val: 'Not Working', label: 'Not Working', icon: 'bi-house-heart-fill', desc: 'Currently not working' }
        ]} />
      </div>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function Step3({ formData, onChange, errors, years }) {
  return (
    <div className="row g-3">
      <div className="col-sm-8">
        <label className="form-label fw-semibold small">Institution / School Name <span className="text-danger">*</span></label>
        <input type="text" name="institution" value={formData.institution} onChange={onChange}
          className={`form-control ${errors.institution ? 'is-invalid' : ''}`} placeholder="Name of school / college" />
        <FieldError msg={errors.institution} />
      </div>
      <div className="col-sm-4">
        <label className="form-label fw-semibold small">Enrollment No.</label>
        <input type="text" name="enrollment_number" value={formData.enrollment_number} onChange={onChange}
          className="form-control" placeholder="Optional" />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Start Year <span className="text-danger">*</span></label>
        <select name="batch" value={formData.batch} onChange={onChange}
          className={`form-select ${errors.batch ? 'is-invalid' : ''}`}>
          <option value="">Select year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <FieldError msg={errors.batch} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Completion Year</label>
        <select name="completion_year" value={formData.completion_year} onChange={onChange} className="form-select">
          <option value="">Select year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">LinkedIn URL</label>
        <div className="input-group">
          <span className="input-group-text" style={{ background: '#0a66c2', border: 'none', color: '#fff', borderRadius: '8px 0 0 8px' }}>
            <i className="bi bi-linkedin"></i>
          </span>
          <input type="url" name="linkedin" value={formData.linkedin} onChange={onChange}
            className="form-control" placeholder="LinkedIn profile URL" />
        </div>
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Facebook URL</label>
        <div className="input-group">
          <span className="input-group-text" style={{ background: '#1877f2', border: 'none', color: '#fff', borderRadius: '8px 0 0 8px' }}>
            <i className="bi bi-facebook"></i>
          </span>
          <input type="url" name="facebook" value={formData.facebook} onChange={onChange}
            className="form-control" placeholder="Facebook profile URL" />
        </div>
      </div>
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────
function Step4({ formData, onChange, imagePreview, onImageChange }) {
  const isWorking = formData.working_status === 'Working';
  return (
    <div className="row g-3">
      <div className="col-12">
        <label className="form-label fw-semibold small">Profile Photo</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" style={{ width: 84, height: 84, borderRadius: '50%', objectFit: 'cover', border: '3px solid #dc3545', flexShrink: 0 }} />
          ) : (
            <div style={{ width: 84, height: 84, borderRadius: '50%', background: '#f0f0f0', border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="bi bi-person-circle" style={{ fontSize: 40, color: '#bbb' }}></i>
            </div>
          )}
          <div>
            <label htmlFor="photo-admin" className="btn btn-outline-danger btn-sm" style={{ borderRadius: 8 }}>
              <i className="bi bi-camera-fill me-2"></i>{imagePreview ? 'Change Photo' : 'Upload Photo'}
            </label>
            <input type="file" id="photo-admin" accept="image/*" onChange={onImageChange} className="d-none" />
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>JPG, PNG or GIF · Max 5MB</div>
          </div>
        </div>
      </div>

      {isWorking && (
        <>
          <div className="col-12 mt-1">
            <label className="form-label fw-semibold small">Work Mode</label>
            <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
              {['Office', 'Remote', 'Hybrid'].map(mode => (
                <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="radio" name="work_mode" value={mode} checked={formData.work_mode === mode}
                    onChange={onChange} style={{ accentColor: '#dc3545', width: 15, height: 15 }} />
                  <span style={{ fontSize: 14 }}>{mode}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Organization</label>
            <input type="text" name="organization_name" value={formData.organization_name} onChange={onChange}
              className="form-control" placeholder="Company name" />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Designation</label>
            <input type="text" name="designation" value={formData.designation} onChange={onChange}
              className="form-control" placeholder="Job title" />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Industry</label>
            <ComboBox name="industry" value={formData.industry} onChange={onChange} options={INDUSTRIES} placeholder="Select or type" />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Functional Area</label>
            <ComboBox name="functional_area" value={formData.functional_area} onChange={onChange} options={FUNCTIONAL_AREAS} placeholder="Select or type area" />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Working Country</label>
            <ComboBox name="work_country" value={formData.work_country} onChange={onChange} options={COUNTRIES} placeholder="Select or type" />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Working City</label>
            <ComboBox name="work_city" value={formData.work_city} onChange={onChange} options={CITIES} placeholder="Select or type" />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Employment Type</label>
            <ComboBox name="employment_type" value={formData.employment_type} onChange={onChange} options={EMPLOYMENT_TYPES} placeholder="Select or type" />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Seniority Level</label>
            <ComboBox name="seniority_level" value={formData.seniority_level} onChange={onChange} options={SENIORITY_LEVELS} placeholder="Select or type" />
          </div>
        </>
      )}

      <div className="col-12">
        <label className="form-label fw-semibold small">Skills</label>
        <input type="text" name="skills" value={formData.skills} onChange={onChange}
          className="form-control" placeholder="e.g., JavaScript, React, Leadership" />
      </div>
      <div className="col-12">
        <label className="form-label fw-semibold small">Achievements</label>
        <textarea name="achievements" value={formData.achievements} onChange={onChange}
          className="form-control" rows={2} placeholder="Notable achievements..." />
      </div>
      <div className="col-12">
        <label className="form-label fw-semibold small">Bio</label>
        <textarea name="bio" value={formData.bio} onChange={onChange}
          className="form-control" rows={3} placeholder="Brief professional bio..." />
      </div>
    </div>
  );
}

export default AddAlumni;
