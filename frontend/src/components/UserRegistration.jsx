import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// ─── ComboBox ────────────────────────────────────────────────────────────────
function ComboBox({ name, value, onChange, options, placeholder, required = false }) {
  const [open, setOpen] = useState(false);
  const [inputVal, setInputVal] = useState(value || '');
  const wrapRef = useRef(null);

  useEffect(() => { setInputVal(value || ''); }, [value]);

  useEffect(() => {
    const close = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const filtered = inputVal
    ? options.filter(o => o.toLowerCase().includes(inputVal.toLowerCase()))
    : options;

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
        <input
          type="text"
          className="form-control"
          value={inputVal}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          style={{ borderRadius: '8px 0 0 8px', borderRight: 'none' }}
        />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            border: '1px solid #ced4da', borderLeft: 'none', background: '#f8f9fa',
            borderRadius: '0 8px 8px 0', padding: '0 12px', cursor: 'pointer'
          }}
        >
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
            <li
              key={opt}
              onMouseDown={() => select(opt)}
              style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 14, color: '#333' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
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
              color: isActive || isDone ? '#fff' : '#aaa',
              flexShrink: 0, transition: 'all 0.3s',
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

// ─── Field Error ─────────────────────────────────────────────────────────────
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
      <i className="bi bi-exclamation-circle me-1"></i>{msg}
    </div>
  );
}

// ─── Card Radio ──────────────────────────────────────────────────────────────
function CardRadio({ name, value, options, onChange, errors }) {
  return (
    <>
      <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <label key={opt.val} style={{
            flex: '1 1 140px', border: `2px solid ${value === opt.val ? '#dc3545' : '#e9ecef'}`,
            borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
            background: value === opt.val ? '#fff5f5' : '#fff',
            display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
            userSelect: 'none'
          }}>
            <input type="radio" name={name} value={opt.val} checked={value === opt.val}
              onChange={onChange} style={{ accentColor: '#dc3545', width: 16, height: 16, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: value === opt.val ? '#dc3545' : '#333' }}>
                {opt.icon && <i className={`bi ${opt.icon} me-2`}></i>}
                {opt.label}
              </div>
              {opt.desc && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{opt.desc}</div>}
            </div>
          </label>
        ))}
      </div>
      <FieldError msg={errors} />
    </>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({ formData, onChange, errors, usernameAvailable, checkingUsername }) {
  return (
    <div className="row g-3">
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">First Name <span className="text-danger">*</span></label>
        <input type="text" name="firstName" value={formData.firstName} onChange={onChange}
          className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
          placeholder="Enter first name" />
        <FieldError msg={errors.firstName} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Last Name <span className="text-danger">*</span></label>
        <input type="text" name="lastName" value={formData.lastName} onChange={onChange}
          className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
          placeholder="Enter last name" />
        <FieldError msg={errors.lastName} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Email Address <span className="text-danger">*</span></label>
        <input type="email" name="email" value={formData.email} onChange={onChange}
          className={`form-control ${errors.email ? 'is-invalid' : ''}`}
          placeholder="you@example.com" />
        <FieldError msg={errors.email} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Mobile Number <span className="text-danger">*</span></label>
        <div className="input-group">
          <select name="countryCode" value={formData.countryCode} onChange={onChange}
            className="form-select" style={{ maxWidth: 110 }}>
            <option value="+91">+91 IN</option>
            <option value="+1">+1 US</option>
            <option value="+44">+44 UK</option>
            <option value="+61">+61 AU</option>
            <option value="+971">+971 AE</option>
            <option value="+65">+65 SG</option>
            <option value="+49">+49 DE</option>
          </select>
          <input type="tel" name="phone" value={formData.phone} onChange={onChange}
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            placeholder="Mobile number" />
        </div>
        <FieldError msg={errors.phone} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Username <span className="text-danger">*</span></label>
        <input type="text" name="username" value={formData.username} onChange={onChange}
          className={`form-control ${errors.username ? 'is-invalid' : usernameAvailable === true ? 'is-valid' : ''}`}
          placeholder="Choose a unique username" minLength={3} autoComplete="off" />
        {checkingUsername && (
          <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
            <i className="bi bi-hourglass-split me-1"></i>Checking availability...
          </div>
        )}
        {!checkingUsername && usernameAvailable === true && (
          <div style={{ fontSize: 12, color: '#28a745', marginTop: 4 }}>
            <i className="bi bi-check-circle-fill me-1"></i>Username is available
          </div>
        )}
        <FieldError msg={errors.username} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Attended Program <span className="text-danger">*</span></label>
        <select name="attended_program" value={formData.attended_program} onChange={onChange}
          className={`form-select ${errors.attended_program ? 'is-invalid' : ''}`}>
          <option value="">Select class attended</option>
          <option value="Class 8">Class 8</option>
          <option value="Class 9">Class 9</option>
          <option value="Class 10">Class 10</option>
          <option value="Class 11">Class 11</option>
          <option value="Class 12">Class 12</option>
        </select>
        <FieldError msg={errors.attended_program} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Password <span className="text-danger">*</span></label>
        <input type="password" name="password" value={formData.password} onChange={onChange}
          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
          placeholder="Minimum 6 characters" autoComplete="new-password" />
        <FieldError msg={errors.password} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Confirm Password <span className="text-danger">*</span></label>
        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={onChange}
          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
          placeholder="Re-enter password" autoComplete="new-password" />
        {formData.confirmPassword && formData.password === formData.confirmPassword && (
          <div style={{ fontSize: 12, color: '#28a745', marginTop: 4 }}>
            <i className="bi bi-check-circle-fill me-1"></i>Passwords match
          </div>
        )}
        <FieldError msg={errors.confirmPassword} />
      </div>
      <div className="col-12 mt-1">
        <label className="form-label fw-semibold small">Program Status <span className="text-danger">*</span></label>
        <CardRadio
          name="program_type"
          value={formData.program_type}
          onChange={onChange}
          errors={errors.program_type}
          options={[
            { val: 'alumni', label: 'Alumni', desc: 'Former student of the institution', icon: 'bi-person-check-fill' },
            { val: 'student', label: 'Student', desc: 'Currently studying at the institution', icon: 'bi-book-fill' }
          ]}
        />
      </div>
      <div className="col-12 mt-2">
        <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '16px 20px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 12 }}>
            <input type="checkbox" name="terms" checked={formData.terms} onChange={onChange}
              style={{ marginTop: 2, accentColor: '#dc3545', width: 16, height: 16, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
              I agree to the <span style={{ color: '#dc3545', cursor: 'pointer' }}>Terms & Conditions</span> and{' '}
              <span style={{ color: '#dc3545', cursor: 'pointer' }}>Privacy Policy</span>
              <span className="text-danger"> *</span>
            </span>
          </label>
          <FieldError msg={errors.terms} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" name="whatsapp_updates" checked={formData.whatsapp_updates} onChange={onChange}
              style={{ accentColor: '#25D366', width: 16, height: 16, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#555' }}>
              <i className="bi bi-whatsapp me-2" style={{ color: '#25D366' }}></i>
              Receive updates on WhatsApp
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({ formData, onChange, errors }) {
  return (
    <div className="row g-3">
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Current Country <span className="text-danger">*</span></label>
        <ComboBox name="country" value={formData.country} onChange={onChange}
          options={COUNTRIES} placeholder="Search or type country" required />
        <FieldError msg={errors.country} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Current City <span className="text-danger">*</span></label>
        <ComboBox name="city" value={formData.city} onChange={onChange}
          options={CITIES} placeholder="Search or type city" required />
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
              <span style={{ fontSize: 14, color: '#444' }}>{g}</span>
            </label>
          ))}
        </div>
        <FieldError msg={errors.gender} />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Present Education Status</label>
        <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
          {['Pursuing Studies', 'Completed'].map(s => (
            <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
              <input type="radio" name="education_status" value={s} checked={formData.education_status === s}
                onChange={onChange} style={{ accentColor: '#dc3545', width: 15, height: 15 }} />
              <span style={{ fontSize: 14, color: '#444' }}>{s}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Education Level <span className="text-danger">*</span></label>
        <ComboBox name="education_level" value={formData.education_level} onChange={onChange}
          options={EDUCATION_LEVELS} placeholder="Select or type level" required />
        <FieldError msg={errors.education_level} />
      </div>
      <div className="col-12 mt-1">
        <label className="form-label fw-semibold small">Working Status <span className="text-danger">*</span></label>
        <CardRadio
          name="working_status"
          value={formData.working_status}
          onChange={onChange}
          errors={errors.working_status}
          options={[
            { val: 'Working', label: 'Working', desc: 'Currently employed / running business', icon: 'bi-briefcase-fill' },
            { val: 'Not Working', label: 'Not Working', desc: 'Currently not employed', icon: 'bi-house-heart-fill' }
          ]}
        />
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
          className={`form-control ${errors.institution ? 'is-invalid' : ''}`}
          placeholder="Name of your school / college / university" />
        <FieldError msg={errors.institution} />
      </div>
      <div className="col-sm-4">
        <label className="form-label fw-semibold small">Enrollment No. <span className="text-muted small">(optional)</span></label>
        <input type="text" name="enrollment_number" value={formData.enrollment_number} onChange={onChange}
          className="form-control" placeholder="e.g. 2020CS001" />
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
        <label className="form-label fw-semibold small">Completion / Passout Year <span className="text-muted small">(optional)</span></label>
        <select name="completion_year" value={formData.completion_year} onChange={onChange} className="form-select">
          <option value="">Select year</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="col-12 mt-2">
        <label className="form-label fw-semibold small">Social Profiles <span className="text-muted small">(optional)</span></label>
      </div>
      <div className="col-sm-6">
        <div className="input-group">
          <span className="input-group-text" style={{ background: '#0a66c2', border: 'none', color: '#fff', borderRadius: '8px 0 0 8px' }}>
            <i className="bi bi-linkedin"></i>
          </span>
          <input type="url" name="linkedin" value={formData.linkedin} onChange={onChange}
            className="form-control" placeholder="LinkedIn profile URL" />
        </div>
      </div>
      <div className="col-sm-6">
        <div className="input-group">
          <span className="input-group-text" style={{ background: '#1877f2', border: 'none', color: '#fff', borderRadius: '8px 0 0 8px' }}>
            <i className="bi bi-facebook"></i>
          </span>
          <input type="url" name="facebook" value={formData.facebook} onChange={onChange}
            className="form-control" placeholder="Facebook profile URL" />
        </div>
      </div>

      <div className="col-12 mt-3">
        <div style={{ background: '#fff8f0', border: '1px solid #ffd9b3', borderRadius: 12, padding: '16px 20px' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" name="authorization" checked={formData.authorization} onChange={onChange}
              style={{ marginTop: 3, accentColor: '#dc3545', width: 16, height: 16, flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
              I authorize the institution to use my information for alumni networking and communications, and confirm that all the details I have provided are accurate.
              <span className="text-danger"> *</span>
            </span>
          </label>
          <FieldError msg={errors.authorization} />
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
      {/* Profile Photo */}
      <div className="col-12">
        <label className="form-label fw-semibold small">Profile Photo <span className="text-muted small">(optional)</span></label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" style={{
              width: 84, height: 84, borderRadius: '50%', objectFit: 'cover',
              border: '3px solid #dc3545', flexShrink: 0
            }} />
          ) : (
            <div style={{
              width: 84, height: 84, borderRadius: '50%', background: '#f0f0f0',
              border: '2px dashed #ccc', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0
            }}>
              <i className="bi bi-person-circle" style={{ fontSize: 40, color: '#bbb' }}></i>
            </div>
          )}
          <div>
            <label htmlFor="photo" className="btn btn-outline-danger btn-sm" style={{ borderRadius: 8 }}>
              <i className="bi bi-camera-fill me-2"></i>
              {imagePreview ? 'Change Photo' : 'Upload Photo'}
            </label>
            <input type="file" id="photo" accept="image/*" onChange={onImageChange} className="d-none" />
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>JPG, PNG or GIF · Max 5MB</div>
          </div>
        </div>
      </div>

      {/* Professional fields - always visible */}
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Current Organization <span className="text-muted small">(optional)</span></label>
        <input type="text" name="organization_name" value={formData.organization_name} onChange={onChange}
          className="form-control" placeholder="Company / Organization name" />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Designation / Job Title <span className="text-muted small">(optional)</span></label>
        <input type="text" name="designation" value={formData.designation} onChange={onChange}
          className="form-control" placeholder="e.g., Software Engineer" />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Industry <span className="text-muted small">(optional)</span></label>
        <ComboBox name="industry" value={formData.industry} onChange={onChange}
          options={INDUSTRIES} placeholder="Select or type industry" />
      </div>
      <div className="col-sm-6">
        <label className="form-label fw-semibold small">Years of Experience <span className="text-muted small">(optional)</span></label>
        <select name="experience_years" value={formData.experience_years} onChange={onChange} className="form-select">
          <option value="">Select experience</option>
          {Array.from({ length: 51 }, (_, i) => i).map(n => (
            <option key={n} value={n}>{n === 0 ? 'Fresher (0 years)' : `${n} year${n > 1 ? 's' : ''}`}</option>
          ))}
        </select>
      </div>

      {isWorking && (
        <>
          {/* Work mode toggle */}
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
            <label className="form-label fw-semibold small">Functional Area</label>
            <ComboBox name="functional_area" value={formData.functional_area} onChange={onChange}
              options={FUNCTIONAL_AREAS} placeholder="Select or type area" />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Employment Type</label>
            <ComboBox name="employment_type" value={formData.employment_type} onChange={onChange}
              options={EMPLOYMENT_TYPES} placeholder="Select or type" />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Seniority Level</label>
            <ComboBox name="seniority_level" value={formData.seniority_level} onChange={onChange}
              options={SENIORITY_LEVELS} placeholder="Select or type level" />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Working Country</label>
            <ComboBox name="work_country" value={formData.work_country} onChange={onChange}
              options={COUNTRIES} placeholder="Select or type country" />
          </div>
          <div className="col-sm-6">
            <label className="form-label fw-semibold small">Working City</label>
            <ComboBox name="work_city" value={formData.work_city} onChange={onChange}
              options={CITIES} placeholder="Select or type city" />
          </div>
        </>
      )}

      <div className="col-12">
        <label className="form-label fw-semibold small">Skills <span className="text-muted small">(optional)</span></label>
        <input type="text" name="skills" value={formData.skills} onChange={onChange}
          className="form-control" placeholder="e.g., JavaScript, React, Python, Public Speaking" />
      </div>
      <div className="col-12">
        <label className="form-label fw-semibold small">Brief Bio <span className="text-muted small">(optional)</span></label>
        <textarea name="bio" value={formData.bio} onChange={onChange}
          className="form-control" rows={3}
          placeholder="Tell other alumni a little about yourself..." />
      </div>
    </div>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ navigate }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, #fff5f5 0%, #fff 100%)' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6">
            <div className="card shadow-lg border-0 text-center p-5" style={{ borderRadius: 20 }}>
              <div className="mb-4">
                <div style={{ background: 'rgba(255,193,7,0.1)', borderRadius: '50%', display: 'inline-flex', padding: 24, marginBottom: 12 }}>
                  <i className="bi bi-hourglass-split text-warning" style={{ fontSize: '4rem' }}></i>
                </div>
              </div>
              <h2 className="fw-bold text-dark mb-2">Registration Submitted!</h2>
              <h5 className="fw-semibold mb-4" style={{ color: '#f0a500' }}>
                <i className="bi bi-clock-history me-2"></i>Awaiting Admin Approval
              </h5>
              <div className="alert alert-warning border-0 text-start mb-4" style={{ borderRadius: 12 }}>
                <p className="mb-2"><i className="bi bi-info-circle-fill me-2"></i><strong>Your registration has been received.</strong></p>
                <p className="mb-0 text-muted small">
                  An administrator will review your profile shortly. Once approved, you can log in and access the alumni directory.
                </p>
              </div>
              <div className="row g-3 text-start mb-4">
                {[
                  { icon: 'bi-check-circle-fill text-success', bg: '#d1fae5', text: 'Step 1: Registration Complete', sub: 'Your information has been saved.' },
                  { icon: 'bi-hourglass-split text-warning', bg: '#fef9c3', text: 'Step 2: Admin Review', sub: 'Your profile is being reviewed.' },
                  { icon: 'bi-person-check text-secondary', bg: '#f1f5f9', text: 'Step 3: Access Granted', sub: 'After approval, you can log in.' },
                ].map((s, i) => (
                  <div key={i} className="col-12">
                    <div className="d-flex align-items-start gap-3 p-3 rounded-3" style={{ background: s.bg }}>
                      <div className="rounded-circle p-2 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.6)' }}>
                        <i className={`bi ${s.icon} fs-5`}></i>
                      </div>
                      <div>
                        <strong className="d-block">{s.text}</strong>
                        <small className="text-muted">{s.sub}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button className="btn btn-danger btn-lg px-4" onClick={() => navigate('/user/login')}
                  style={{ borderRadius: 10 }}>
                  <i className="bi bi-box-arrow-in-right me-2"></i>Go to Login
                </button>
                <button className="btn btn-outline-secondary btn-lg px-4" onClick={() => navigate('/')}
                  style={{ borderRadius: 10 }}>
                  <i className="bi bi-house-fill me-2"></i>Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Right Panel Info ─────────────────────────────────────────────────────────
const RIGHT_PANEL_INFO = {
  1: {
    icon: 'bi-stars',
    title: 'Welcome to Alumni Connect!',
    desc: 'Join thousands of alumni who are connected, collaborating, and growing together.'
  },
  2: {
    icon: 'bi-geo-alt-fill',
    title: 'Tell Us About You',
    desc: 'Share your location and education details to connect with the right alumni network.'
  },
  3: {
    icon: 'bi-mortarboard-fill',
    title: 'Your Academic Journey',
    desc: 'Your time at the institution shaped you. Let batchmates know about your experience.'
  },
  4: {
    icon: 'bi-trophy-fill',
    title: 'Career Highlights',
    desc: 'Inspire others with your professional journey and share your current achievements.'
  }
};

const STEP_LABELS = ['Account Setup', 'Personal Info', 'Academic Info', 'Professional Info'];

// ─── Main Component ───────────────────────────────────────────────────────────
function UserRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 4;
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const debounceTimer = useRef(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', countryCode: '+91', phone: '',
    username: '', password: '', confirmPassword: '',
    attended_program: '', program_type: '', terms: false, whatsapp_updates: false,
    country: '', city: '', dob: '', gender: '',
    education_status: '', education_level: '', working_status: '',
    institution: '', enrollment_number: '', batch: '', completion_year: '',
    linkedin: '', facebook: '', authorization: false,
    organization_name: '', designation: '', industry: '', experience_years: '',
    functional_area: '', work_country: '', work_city: '',
    employment_type: '', seniority_level: '', work_mode: 'Office',
    skills: '', bio: '', achievements: '',
  });

  const years = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));

  useEffect(() => () => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newVal }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (name === 'username') {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (value.length < 3) { setUsernameAvailable(null); return; }
      debounceTimer.current = setTimeout(() => checkUsername(value), 500);
    }
  };

  const checkUsername = async (username) => {
    try {
      setCheckingUsername(true);
      const res = await axios.get(`${API_URL}/alumni/check-username/${username}`);
      setUsernameAvailable(res.data.available);
    } catch { setUsernameAvailable(null); }
    finally { setCheckingUsername(false); }
  };

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!formData.firstName.trim()) e.firstName = 'First name is required';
      if (!formData.lastName.trim()) e.lastName = 'Last name is required';
      if (!formData.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter a valid email address';
      if (!formData.phone.trim()) e.phone = 'Mobile number is required';
      if (!formData.username.trim()) e.username = 'Username is required';
      else if (formData.username.length < 3) e.username = 'At least 3 characters required';
      if (usernameAvailable === false) e.username = 'This username is already taken';
      if (!formData.password) e.password = 'Password is required';
      else if (formData.password.length < 6) e.password = 'At least 6 characters required';
      if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
      if (!formData.attended_program) e.attended_program = 'Please select the class you attended';
      if (!formData.program_type) e.program_type = 'Please select your status';
      if (!formData.terms) e.terms = 'You must accept the Terms & Conditions to continue';
    }
    if (s === 2) {
      if (!formData.country.trim()) e.country = 'Country is required';
      if (!formData.city.trim()) e.city = 'City is required';
      if (!formData.dob) e.dob = 'Date of birth is required';
      if (!formData.gender) e.gender = 'Please select your gender';
      if (!formData.education_level) e.education_level = 'Education level is required';
      if (!formData.working_status) e.working_status = 'Please select your working status';
    }
    if (s === 3) {
      if (!formData.institution.trim()) e.institution = 'Institution name is required';
      if (!formData.batch) e.batch = 'Please select start year';
      if (!formData.authorization) e.authorization = 'Authorization is required to proceed';
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('Max file size is 5MB'); return; }
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
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
      username: formData.username.trim(),
      password: formData.password,
      name,
      email: formData.email.trim(),
      phone,
      gender: formData.gender,
      dob: formData.dob,
      batch: formData.batch,
      department: formData.education_level || '',
      address,
      linkedin: formData.linkedin || '',
      bio: formData.bio || '',
      current_status,
      organization_name: formData.organization_name || '',
      designation: formData.designation || '',
      industry: formData.industry || '',
      experience_years: formData.experience_years || '',
      work_location: formData.work_country || '',
      skills: formData.skills || '',
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
      country: formData.country || '',
      city: formData.city || '',
      education_level: formData.education_level || '',
      work_city: formData.work_city || '',
    };
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    if (selectedImage) fd.append('photo', selectedImage);

    try {
      setLoading(true);
      await axios.post(`${API_URL}/alumni/register`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitSuccess) return <SuccessScreen navigate={navigate} />;

  const info = RIGHT_PANEL_INFO[step];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f7f8fc' }}>
      {/* Loading overlay */}
      {loading && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* ── Left: Form Panel ── */}
      <div style={{ flex: 1, overflowX: 'hidden', padding: '48px 40px 80px', minWidth: 0 }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {/* Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'linear-gradient(135deg, #dc3545, #8b0000)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: 20 }}></i>
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#1a1a2e', lineHeight: 1.2 }}>Alumni Connect</div>
              <div style={{ fontSize: 12, color: '#aaa' }}>Alumni Registration Portal</div>
            </div>
          </div>

          {/* Step indicator */}
          <StepIndicator step={step} total={TOTAL_STEPS} />

          {/* Heading */}
          <h2 style={{ fontWeight: 800, fontSize: 24, color: '#1a1a2e', marginBottom: 4 }}>
            {step === 1 && 'Create Your Account'}
            {step === 2 && 'Personal Information'}
            {step === 3 && 'Academic Details'}
            {step === 4 && 'Professional Details'}
          </h2>
          <p style={{ color: '#999', fontSize: 13, marginBottom: 28 }}>
            Step {step} of {TOTAL_STEPS} &mdash; {['Account setup', 'About yourself', 'Academic journey', 'Career information'][step - 1]}
          </p>

          {/* Form */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 28px', boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
            {step === 1 && (
              <Step1 formData={formData} onChange={handleChange} errors={errors}
                usernameAvailable={usernameAvailable} checkingUsername={checkingUsername} />
            )}
            {step === 2 && <Step2 formData={formData} onChange={handleChange} errors={errors} />}
            {step === 3 && <Step3 formData={formData} onChange={handleChange} errors={errors} years={years} />}
            {step === 4 && (
              <Step4 formData={formData} onChange={handleChange} errors={errors}
                imagePreview={imagePreview} onImageChange={handleImageChange} />
            )}
          </div>

          {/* Navigation */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 28, paddingTop: 0
          }}>
            {step > 1 ? (
              <button onClick={prevStep} style={{
                background: 'none', border: '1.5px solid #dee2e6', borderRadius: 10,
                padding: '10px 22px', fontWeight: 600, cursor: 'pointer', color: '#555',
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 14
              }}>
                <i className="bi bi-arrow-left"></i> Back
              </button>
            ) : (
              <a href="/user/login" style={{ fontSize: 13, color: '#999', textDecoration: 'none' }}>
                Already registered? <span style={{ color: '#dc3545', fontWeight: 600 }}>Login</span>
              </a>
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
                  ? <><span className="spinner-border spinner-border-sm me-2"></span>Submitting...</>
                  : <><i className="bi bi-check-circle-fill me-2"></i>Complete Registration</>
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Right: Info Panel ── */}
      <div
        className="d-none d-lg-flex"
        style={{
          width: 360, flexShrink: 0,
          background: 'linear-gradient(160deg, #c62828 0%, #7b1717 55%, #4a0e0e 100%)',
          position: 'sticky', top: 0, height: '100vh', overflow: 'hidden',
          flexDirection: 'column', justifyContent: 'space-between',
          padding: '56px 36px'
        }}
      >
        {/* Top section */}
        <div>
          <div style={{ fontSize: 48, color: 'rgba(255,255,255,0.92)', marginBottom: 20 }}>
            <i className={`bi ${info.icon}`}></i>
          </div>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 12, lineHeight: 1.4 }}>
            {info.title}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.8, marginBottom: 36 }}>
            {info.desc}
          </p>

          {/* Step list */}
          <div>
            {STEP_LABELS.map((label, i) => {
              const n = i + 1;
              const isDone = n < step;
              const isActive = n === step;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: isDone || isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s'
                  }}>
                    {isDone
                      ? <i className="bi bi-check2" style={{ color: '#c62828', fontSize: 14, fontWeight: 900 }}></i>
                      : <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? '#c62828' : 'rgba(255,255,255,0.5)' }}>{n}</span>
                    }
                  </div>
                  <span style={{
                    fontSize: 13, fontWeight: isActive ? 700 : 400,
                    color: isDone || isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.4)',
                    transition: 'all 0.3s'
                  }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom: benefits */}
        <div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 24 }}>
            {[
              'Connect with 1000+ alumni',
              'Access the alumni directory',
              'Career networking & mentorship',
              'Exclusive alumni events & news'
            ].map(b => (
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

export default UserRegistration;
