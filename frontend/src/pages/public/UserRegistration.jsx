import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// â"€â"€â"€ Data â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia',
  'Austria','Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin',
  'Bhutan','Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi',
  'Cabo Verde','Cambodia','Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia',
  'Comoros','Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica',
  'Dominican Republic','Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini',
  'Ethiopia','Fiji','Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada',
  'Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia',
  'Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati',
  'Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein','Lithuania',
  'Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania',
  'Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique',
  'Myanmar','Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria',
  'North Korea','North Macedonia','Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea',
  'Paraguay','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia','Rwanda',
  'Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa','San Marino',
  'Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain',
  'Sri Lanka','Sudan','Suriname','Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand',
  'Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey','Turkmenistan','Tuvalu','Uganda',
  'Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu',
  'Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe'
];

const CITIES_BY_COUNTRY = {
  'India': ['Agra','Ahmedabad','Amritsar','Aurangabad','Bangalore','Bhopal','Bhubaneswar','Chandigarh',
    'Chennai','Coimbatore','Delhi','Faridabad','Ghaziabad','Guwahati','Hyderabad','Indore','Jaipur',
    'Jodhpur','Kanpur','Kochi','Kolkata','Lucknow','Ludhiana','Madurai','Meerut','Mumbai','Mysore',
    'Nagpur','Nashik','Patna','Pune','Rajkot','Surat','Thane','Tiruchirappalli','Vadodara',
    'Varanasi','Visakhapatnam'],
  'United States': ['Atlanta','Austin','Boston','Charlotte','Chicago','Columbus','Dallas','Denver',
    'Detroit','El Paso','Fort Worth','Houston','Indianapolis','Jacksonville','Las Vegas','Los Angeles',
    'Memphis','Miami','Milwaukee','Nashville','New York','Oklahoma City','Philadelphia','Phoenix',
    'Portland','San Antonio','San Diego','San Francisco','San Jose','Seattle','Washington DC'],
  'United Kingdom': ['Birmingham','Bristol','Edinburgh','Glasgow','Leeds','Leicester','Liverpool',
    'London','Manchester','Newcastle','Nottingham','Sheffield'],
  'Canada': ['Calgary','Edmonton','Halifax','Montreal','Ottawa','Quebec City','Regina','Saskatoon',
    'Toronto','Vancouver','Winnipeg'],
  'Australia': ['Adelaide','Brisbane','Canberra','Darwin','Gold Coast','Hobart','Melbourne',
    'Newcastle','Perth','Sydney'],
  'Germany': ['Berlin','Bremen','Cologne','Dortmund','Dresden','Düsseldorf','Essen','Frankfurt',
    'Hamburg','Hanover','Leipzig','Munich','Nuremberg','Stuttgart'],
  'France': ['Bordeaux','Lille','Lyon','Marseille','Nantes','Nice','Paris','Rennes','Strasbourg',
    'Toulouse'],
  'China': ['Beijing','Chengdu','Chongqing','Guangzhou','Hangzhou','Nanjing','Shanghai','Shenzhen',
    'Tianjin','Wuhan','Xi\'an'],
  'Japan': ['Fukuoka','Hiroshima','Kobe','Kyoto','Nagoya','Osaka','Sapporo','Sendai','Tokyo',
    'Yokohama'],
  'Singapore': ['Singapore'],
  'United Arab Emirates': ['Abu Dhabi','Ajman','Dubai','Ras Al Khaimah','Sharjah'],
  'Saudi Arabia': ['Dammam','Jeddah','Medina','Mecca','Riyadh'],
  'Pakistan': ['Faisalabad','Islamabad','Karachi','Lahore','Multan','Peshawar','Rawalpindi'],
  'Bangladesh': ['Chittagong','Dhaka','Khulna','Rajshahi','Sylhet'],
  'Sri Lanka': ['Colombo','Galle','Jaffna','Kandy'],
  'Nepal': ['Bharatpur','Kathmandu','Lalitpur','Pokhara'],
  'Malaysia': ['George Town','Ipoh','Johor Bahru','Kota Kinabalu','Kuala Lumpur','Kuching','Petaling Jaya'],
  'Brazil': ['Brasília','Curitiba','Fortaleza','Manaus','Porto Alegre','Recife','Rio de Janeiro',
    'Salvador','São Paulo'],
  'South Africa': ['Cape Town','Durban','East London','Johannesburg','Port Elizabeth','Pretoria'],
  'Nigeria': ['Abuja','Ibadan','Kano','Lagos','Port Harcourt'],
  'Kenya': ['Kisumu','Mombasa','Nairobi'],
  'Egypt': ['Alexandria','Cairo','Giza','Luxor','Port Said'],
  'Turkey': ['Ankara','Antalya','Bursa','Istanbul','Izmir'],
  'Russia': ['Ekaterinburg','Kazan','Moscow','Novosibirsk','Saint Petersburg','Samara'],
  'Italy': ['Bologna','Florence','Milan','Naples','Palermo','Rome','Turin','Venice'],
  'Spain': ['Barcelona','Bilbao','Madrid','Malaga','Seville','Valencia','Zaragoza'],
  'Mexico': ['Guadalajara','Mexico City','Monterrey','Puebla','Tijuana'],
  'Indonesia': ['Bali','Bandung','Jakarta','Medan','Surabaya','Yogyakarta'],
  'Philippines': ['Cebu City','Davao','Manila','Quezon City','Zamboanga'],
  'Thailand': ['Bangkok','Chiang Mai','Pattaya','Phuket'],
  'Vietnam': ['Da Nang','Hanoi','Ho Chi Minh City'],
  'South Korea': ['Busan','Daegu','Daejeon','Gwangju','Incheon','Seoul'],
  'Iran': ['Isfahan','Mashhad','Shiraz','Tabriz','Tehran'],
  'Iraq': ['Baghdad','Basra','Erbil','Mosul'],
  'Israel': ['Haifa','Jerusalem','Tel Aviv'],
  'Jordan': ['Amman','Aqaba','Irbid','Zarqa'],
  'Kuwait': ['Kuwait City'],
  'Bahrain': ['Manama','Riffa'],
  'Qatar': ['Doha'],
  'Oman': ['Muscat','Salalah','Sohar'],
  'Lebanon': ['Beirut','Sidon','Tripoli'],
  'New Zealand': ['Auckland','Christchurch','Hamilton','Wellington'],
  'Argentina': ['Buenos Aires','Córdoba','Mendoza','Rosario'],
  'Colombia': ['Barranquilla','Bogotá','Cali','Medellín'],
  'Chile': ['Concepción','Santiago','Valparaíso'],
  'Peru': ['Arequipa','Lima','Trujillo'],
  'Ghana': ['Accra','Kumasi','Tamale'],
  'Ethiopia': ['Addis Ababa','Dire Dawa','Mekelle'],
  'Tanzania': ['Dar es Salaam','Dodoma','Mwanza'],
  'Uganda': ['Entebbe','Kampala','Mbarara'],
  'Zimbabwe': ['Bulawayo','Harare','Mutare'],
  'Zambia': ['Kitwe','Livingstone','Lusaka','Ndola'],
  'Portugal': ['Braga','Lisbon','Porto'],
  'Netherlands': ['Amsterdam','Rotterdam','The Hague','Utrecht'],
  'Belgium': ['Antwerp','Brussels','Ghent','Liège'],
  'Sweden': ['Gothenburg','Malmö','Stockholm'],
  'Norway': ['Bergen','Oslo','Stavanger','Trondheim'],
  'Denmark': ['Aarhus','Copenhagen','Odense'],
  'Finland': ['Espoo','Helsinki','Tampere','Turku'],
  'Switzerland': ['Basel','Bern','Geneva','Zurich'],
  'Austria': ['Graz','Linz','Salzburg','Vienna'],
  'Poland': ['Gdańsk','Kraków','Łódź','Poznań','Warsaw','Wrocław'],
  'Ukraine': ['Dnipro','Kharkiv','Kyiv','Lviv','Odessa'],
  'Greece': ['Athens','Patras','Thessaloniki'],
  'Romania': ['Bucharest','Cluj-Napoca','Iași','Timișoara'],
  'Hungary': ['Budapest','Debrecen','Miskolc','Pécs'],
  'Czech Republic': ['Brno','Ostrava','Prague'],
  'Morocco': ['Casablanca','Fez','Marrakech','Rabat','Tangier'],
  'Tunisia': ['Sfax','Sousse','Tunis'],
  'Algeria': ['Algiers','Constantine','Oran'],
  'Myanmar': ['Mandalay','Naypyidaw','Yangon'],
  'Cambodia': ['Phnom Penh','Siem Reap'],
  'Laos': ['Luang Prabang','Vientiane'],
};

const PHONE_CODES = [
  '+91 IN', '+1 US', '+44 UK', '+61 AU', '+1 CA', '+49 DE', '+33 FR',
  '+65 SG', '+971 AE', '+966 SA', '+92 PK', '+880 BD', '+94 LK', '+977 NP',
  '+60 MY', '+62 ID', '+63 PH', '+66 TH', '+84 VN', '+82 KR', '+81 JP',
  '+86 CN', '+7 RU', '+55 BR', '+27 ZA', '+234 NG', '+254 KE', '+20 EG',
  '+90 TR', '+39 IT', '+34 ES', '+52 MX', '+98 IR', '+962 JO', '+965 KW',
  '+973 BH', '+974 QA', '+968 OM', '+961 LB', '+64 NZ', '+54 AR', '+57 CO',
  '+56 CL', '+51 PE', '+351 PT', '+31 NL', '+32 BE', '+46 SE', '+47 NO',
  '+45 DK', '+358 FI', '+41 CH', '+43 AT', '+48 PL', '+380 UA', '+30 GR',
  '+40 RO', '+36 HU', '+420 CZ', '+212 MA', '+216 TN', '+213 DZ', '+95 MM',
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

// â"€â"€â"€ ComboBox â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â
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

// â"€â"€â"€ Step Indicator "€â"€â
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
              background: isActive ? 'var(--color-primary)' : isDone ? '#28a745' : '#e9ecef',
              color: isActive || isDone ? '#fff' : '#aaa',
              flexShrink: 0, transition: 'all 0.3s',
              boxShadow: isActive ? '0 2px 8px rgba(25,127,230,0.4)' : 'none'
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

// â"€â"€â"€ Field Error â"€â"€â"€â"â
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ color: '#dc3545', fontSize: 12, marginTop: 4 }}>
      <i className="bi bi-exclamation-circle me-1"></i>{msg}
    </div>
  );
}

// â"€â"€â"€ Card Radio â"€â"€â"€â"€â"€â"€â"€
function CardRadio({ name, value, options, onChange, errors }) {
  return (
    <>
      <div style={{ display: 'flex', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
        {options.map(opt => (
          <label key={opt.val} style={{
            flex: '1 1 140px', border: `2px solid ${value === opt.val ? 'var(--color-primary)' : '#e9ecef'}`,
            borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
            background: value === opt.val ? 'var(--color-primary-light)' : '#fff',
            display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.2s',
            userSelect: 'none'
          }}>
            <input type="radio" name={name} value={opt.val} checked={value === opt.val}
              onChange={onChange} style={{ accentColor: 'var(--color-primary)', width: 16, height: 16, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: value === opt.val ? 'var(--color-primary)' : '#333' }}>
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

// â"€â"€â"€ Step 1 â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â
function Step1({ formData, onChange, errors }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Row 1: First Name | Last Name */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">
            First Name <span style={{ color: '#dc3545' }}>*</span>
            <span style={{ fontWeight: 400, color: '#888', fontSize: 11, marginLeft: 6 }}>(as per school/college record)</span>
          </label>
          <input type="text" name="firstName" value={formData.firstName} onChange={onChange}
            className="form-control"
            style={{ borderColor: errors.firstName ? '#dc3545' : '' }}
            placeholder="Enter first name" />
          <FieldError msg={errors.firstName} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">
            Last Name <span style={{ color: '#dc3545' }}>*</span>
            <span style={{ fontWeight: 400, color: '#888', fontSize: 11, marginLeft: 6 }}>(as per school/college record)</span>
          </label>
          <input type="text" name="lastName" value={formData.lastName} onChange={onChange}
            className="form-control"
            style={{ borderColor: errors.lastName ? '#dc3545' : '' }}
            placeholder="Enter last name" />
          <FieldError msg={errors.lastName} />
        </div>
      </div>

      {/* Row 2: Phone Number (full width) */}
      <div>
        <label className="form-label fw-semibold small">Mobile Number <span style={{ color: '#dc3545' }}>*</span></label>
        <div style={{ display: 'flex' }}>
          <input type="text" name="countryCode" value={formData.countryCode} onChange={onChange}
            list="phone-codes-list"
            className="form-control" style={{ maxWidth: 110, borderRadius: '8px 0 0 8px', borderRight: 'none' }}
            placeholder="+91" autoComplete="off" />
          <datalist id="phone-codes-list">
            {PHONE_CODES.map(c => <option key={c} value={c.split(' ')[0]}>{c}</option>)}
          </datalist>
          <input type="tel" name="phone" value={formData.phone} onChange={onChange}
            className="form-control"
            style={{ borderRadius: '0 8px 8px 0', borderColor: errors.phone ? '#dc3545' : '' }}
            placeholder="Mobile number" />
        </div>
        <FieldError msg={errors.phone} />
      </div>

      {/* Row 3: Email | Parent Name */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">Email Address <span style={{ color: '#dc3545' }}>*</span></label>
          <input type="email" name="email" value={formData.email} onChange={onChange}
            className="form-control"
            style={{ borderColor: errors.email ? '#dc3545' : '' }}
            placeholder="you@example.com" />
          <FieldError msg={errors.email} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">Parent Name
              <span style={{ fontWeight: 400, color: '#888', fontSize: 11, marginLeft: 6 }}>(as per school/college record)</span>
             <span style={{ color: '#dc3545' }}>*</span></label>
          <input type="text" name="parent_name" value={formData.parent_name} onChange={onChange}
            className="form-control"
            style={{ borderColor: errors.parent_name ? '#dc3545' : '' }}
            placeholder="Enter parent name" />
          <FieldError msg={errors.parent_name} />
        </div>
      </div>

      {/* Row 4: Password | Confirm Password */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">Password <span style={{ color: '#dc3545' }}>*</span></label>
          <input type="password" name="password" value={formData.password} onChange={onChange}
            className="form-control"
            style={{ borderColor: errors.password ? '#dc3545' : '' }}
            placeholder="Minimum 6 characters" autoComplete="new-password" />
          <FieldError msg={errors.password} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">Confirm Password <span style={{ color: '#dc3545' }}>*</span></label>
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={onChange}
            className="form-control"
            style={{ borderColor: errors.confirmPassword ? '#dc3545' : '' }}
            placeholder="Re-enter password" autoComplete="new-password" />
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <div style={{ fontSize: 12, color: '#28a745', marginTop: 4 }}>
              <i className="bi bi-check-circle-fill me-1"></i>Passwords match
            </div>
          )}
          <FieldError msg={errors.confirmPassword} />
        </div>
      </div>
      <div className="col-12 mt-1">
        <label className="form-label fw-semibold small">Program Status <span className="text-primary">*</span></label>
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
              style={{ marginTop: 2, accentColor: 'var(--color-primary)', width: 16, height: 16, flexShrink: 0 }} />
            {/* <span style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
              I agree to the <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>Terms & Conditions</span> and{' '}
              <span style={{ color: 'var(--color-primary)', cursor: 'pointer' }}>Privacy Policy</span>
              <span className="text-primary"> *</span>
            </span> */}
            <span style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>
  I agree to the{" "}
  
  <Link
    to="/terms"
    target="_blank" rel="noopener noreferrer"
    style={{ color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'none' }}
  >
    Terms & Conditions
  </Link>

  {" "}and{" "}

  <Link
    to="/privacy"
    target="_blank" rel="noopener noreferrer"
    style={{ color: 'var(--color-primary)', cursor: 'pointer', textDecoration: 'none' }}
  >
    Privacy Policy
  </Link>
  
  <span className="text-primary"> *</span>
</span>
          </label>
          <FieldError msg={errors.terms} />
        </div>
      </div>
    </div>
  );
}

const ATTENDED_PROGRAMS = ['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
const SOCIAL_PLATFORMS = ['LinkedIn', 'Facebook', 'Instagram', 'Twitter/X', 'YouTube', 'GitHub', 'Website', 'Other'];
const PLATFORM_ICONS = {
  'LinkedIn': { icon: 'bi-linkedin', bg: '#0a66c2' },
  'Facebook': { icon: 'bi-facebook', bg: '#1877f2' },
  'Instagram': { icon: 'bi-instagram', bg: '#e1306c' },
  'Twitter/X': { icon: 'bi-twitter-x', bg: '#000' },
  'YouTube': { icon: 'bi-youtube', bg: '#ff0000' },
  'GitHub': { icon: 'bi-github', bg: '#333' },
  'Website': { icon: 'bi-globe', bg: '#555' },
  'Other': { icon: 'bi-link-45deg', bg: '#888' },
};

// --- Step 2 (Academic Info) ---
function Step2({ formData, onChange, errors, years, socialLinks, onAddSocialLink, onRemoveSocialLink, onSocialLinkChange }) {
  const showUG = ['Undergraduate (B.Tech/B.Sc/BA/B.Com)', 'Postgraduate (MBA/M.Tech/M.Sc)', 'Doctoral (PhD)'].includes(formData.education_level);
  const showPG = ['Postgraduate (MBA/M.Tech/M.Sc)', 'Doctoral (PhD)'].includes(formData.education_level);
  const showDoc = formData.education_level === 'Doctoral (PhD)';

  const selectStyle = (hasError) => ({
    width: '100%', padding: '6px 12px', borderRadius: 6, fontSize: 14,
    border: `1px solid ${hasError ? '#dc3545' : '#ced4da'}`,
    background: '#fff', color: '#212529', outline: 'none', height: 38,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Row 1: Institution | Enrollment No */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 2 }}>
          <label className="form-label fw-semibold small">Institution / School Name <span style={{ color: '#dc3545' }}>*</span></label>
          <input type="text" name="institution" value={formData.institution} onChange={onChange}
            className="form-control" style={{ borderColor: errors.institution ? '#dc3545' : '' }}
            placeholder="KAL School" />
          <FieldError msg={errors.institution} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">Enrollment No. <span style={{ fontWeight: 400, color: '#888', fontSize: 11 }}>(optional)</span></label>
          <input type="text" name="enrollment_number" value={formData.enrollment_number} onChange={onChange}
            className="form-control" placeholder="e.g. 2020CS001" />
        </div>
      </div>

      {/* Row 2: Attended Program | Passout Year */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">Attended Program <span style={{ color: '#dc3545' }}>*</span></label>
          <select name="attended_program" value={formData.attended_program} onChange={onChange}
            style={selectStyle(errors.attended_program)}>
            <option value="">Select class attended</option>
            {ATTENDED_PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <FieldError msg={errors.attended_program} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">Completion / Passout Year <span style={{ fontWeight: 400, color: '#888', fontSize: 11 }}>(optional)</span></label>
          <select name="completion_year" value={formData.completion_year} onChange={onChange} style={selectStyle(false)}>
            <option value="">Select year</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Row 3: Education Level | Present Education Status */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">Education Level <span style={{ color: '#dc3545' }}>*</span></label>
          <ComboBox name="education_level" value={formData.education_level} onChange={onChange}
            options={EDUCATION_LEVELS} placeholder="Select or type level" required />
          <FieldError msg={errors.education_level} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">Present Education Status</label>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            {['Pursuing Studies', 'Completed'].map(s => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                <input type="radio" name="education_status" value={s} checked={formData.education_status === s}
                  onChange={onChange} style={{ accentColor: 'var(--color-primary)', width: 15, height: 15 }} />
                <span style={{ fontSize: 14, color: '#444' }}>{s}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Conditional college fields */}
      {(showUG || showPG || showDoc) && (
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {showUG && (
            <div style={{ flex: 1, minWidth: 180 }}>
              <label className="form-label fw-semibold small">UG College Name</label>
              <input type="text" name="ug_college" value={formData.ug_college} onChange={onChange}
                className="form-control" placeholder="Enter UG college name" />
            </div>
          )}
          {showPG && (
            <div style={{ flex: 1, minWidth: 180 }}>
              <label className="form-label fw-semibold small">PG College Name</label>
              <input type="text" name="pg_college" value={formData.pg_college} onChange={onChange}
                className="form-control" placeholder="Enter PG college name" />
            </div>
          )}
          {showDoc && (
            <div style={{ flex: 1, minWidth: 180 }}>
              <label className="form-label fw-semibold small">Doctorate Institution</label>
              <input type="text" name="doctorate_name" value={formData.doctorate_name} onChange={onChange}
                className="form-control" placeholder="Enter doctorate institution name" />
            </div>
          )}
        </div>
      )}

      {/* Row 4: Date of Birth | Gender */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">Date of Birth <span style={{ color: '#dc3545' }}>*</span></label>
          <input type="date" name="dob" value={formData.dob} onChange={onChange}
            className="form-control" style={{ borderColor: errors.dob ? '#dc3545' : '' }} />
          <FieldError msg={errors.dob} />
        </div>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">Gender <span style={{ color: '#dc3545' }}>*</span></label>
          <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
            {['Male', 'Female', 'Other'].map(g => (
              <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer' }}>
                <input type="radio" name="gender" value={g} checked={formData.gender === g}
                  onChange={onChange} style={{ accentColor: 'var(--color-primary)', width: 15, height: 15 }} />
                <span style={{ fontSize: 14, color: '#444' }}>{g}</span>
              </label>
            ))}
          </div>
          <FieldError msg={errors.gender} />
        </div>
      </div>

      {/* Row 5: Social Profiles */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <label className="form-label fw-semibold small mb-0">
            Social Profiles <span style={{ fontWeight: 400, color: '#888', fontSize: 11 }}>(optional)</span>
          </label>
          <button type="button" onClick={onAddSocialLink}
            style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8,
              padding: '5px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="bi bi-plus-circle-fill"></i> Add Link
          </button>
        </div>
        {socialLinks.length === 0 && (
          <div style={{ fontSize: 13, color: '#aaa', padding: '6px 0' }}>No social links added. Click "Add Link" to add your profiles.</div>
        )}
        {socialLinks.map((link, idx) => {
          const pi = PLATFORM_ICONS[link.platform] || PLATFORM_ICONS['Other'];
          return (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1, border: '1px solid #ced4da', borderRadius: 8, overflow: 'hidden' }}>
                <span style={{ background: pi.bg, color: '#fff', padding: '8px 12px', flexShrink: 0 }}>
                  <i className={`bi ${pi.icon}`}></i>
                </span>
                <select value={link.platform} onChange={e => onSocialLinkChange(idx, 'platform', e.target.value)}
                  style={{ border: 'none', borderRight: '1px solid #ced4da', padding: '8px 8px', fontSize: 13, flexShrink: 0, background: '#f8f9fa', outline: 'none' }}>
                  {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input type="url" value={link.url} onChange={e => onSocialLinkChange(idx, 'url', e.target.value)}
                  placeholder="Profile URL"
                  style={{ flex: 1, border: 'none', padding: '8px 12px', fontSize: 13, outline: 'none' }} />
              </div>
              <button type="button" onClick={() => onRemoveSocialLink(idx)}
                style={{ background: '#fff1f1', border: '1px solid #ffd5d5', borderRadius: 8,
                  padding: '8px 10px', cursor: 'pointer', color: '#dc3545', flexShrink: 0 }}>
                <i className="bi bi-trash3"></i>
              </button>
            </div>
          );
        })}
      </div>

      {/* Row 6: Working Status */}
      <div>
        <label className="form-label fw-semibold small">Working Status <span style={{ color: '#dc3545' }}>*</span></label>
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

      {/* Authorization */}
      <div style={{ background: '#fff8f0', border: '1px solid #ffd9b3', borderRadius: 12, padding: '16px 20px' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
          <input type="checkbox" name="authorization" checked={formData.authorization} onChange={onChange}
            style={{ marginTop: 3, accentColor: 'var(--color-primary)', width: 16, height: 16, flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
            I authorize the institution to use my information for alumni networking and communications, and confirm that all the details I have provided are accurate.
            <span style={{ color: '#dc3545' }}> *</span>
          </span>
        </label>
        <FieldError msg={errors.authorization} />
      </div>
    </div>
  );
}

// --- Step 3 (Professional Details) ---
function Step3({ formData, onChange, imagePreview, onImageChange }) {
  const isWorking = formData.working_status === 'Working';
  const workCities = CITIES_BY_COUNTRY[formData.work_country] || [];
  const opt = () => ({ fontWeight: 400, color: '#888', fontSize: 11, marginLeft: 6 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Profile Photo */}
      <div>
        <label className="form-label fw-semibold small">
          Profile Photo <span style={{ fontWeight: 400, color: '#888', fontSize: 11 }}>(optional)</span>
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" style={{
              width: 84, height: 84, borderRadius: '50%', objectFit: 'cover',
              border: '3px solid var(--color-primary)', flexShrink: 0
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
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 6 }}>JPG, PNG or GIF &middot; Max 5MB</div>
          </div>
        </div>
      </div>

      {/* Row: Organization | Designation */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">
            Current Organization <span style={opt()}>optional</span>
          </label>
          <input type="text" name="organization_name" value={formData.organization_name} onChange={onChange}
            className="form-control" placeholder="Company / Organization name" />
        </div>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">
            Designation / Job Title <span style={opt()}>optional</span>
          </label>
          <input type="text" name="designation" value={formData.designation} onChange={onChange}
            className="form-control" placeholder="e.g., Software Engineer" />
        </div>
      </div>

      {/* Row: Industry | Years of Experience */}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">
            Industry <span style={opt()}>optional</span>
          </label>
          <ComboBox name="industry" value={formData.industry} onChange={onChange}
            options={INDUSTRIES} placeholder="Select or type industry" />
        </div>
        <div style={{ flex: 1 }}>
          <label className="form-label fw-semibold small">
            Years of Experience <span style={opt()}>optional</span>
          </label>
          <select name="experience_years" value={formData.experience_years} onChange={onChange}
            style={{ width: '100%', padding: '6px 12px', borderRadius: 6, fontSize: 14,
              border: '1px solid #ced4da', background: '#fff', color: '#212529', height: 38 }}>
            <option value="">Select experience</option>
            {Array.from({ length: 51 }, (_, i) => i).map(n => (
              <option key={n} value={n}>{n === 0 ? 'Fresher (0 years)' : `${n} year${n > 1 ? 's' : ''}`}</option>
            ))}
          </select>
        </div>
      </div>

      {isWorking && (
        <>
          {/* Work Mode */}
          <div>
            <label className="form-label fw-semibold small">Work Mode</label>
            <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
              {['Office', 'Remote', 'Hybrid'].map(mode => (
                <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="radio" name="work_mode" value={mode} checked={formData.work_mode === mode}
                    onChange={onChange} style={{ accentColor: 'var(--color-primary)', width: 15, height: 15 }} />
                  <span style={{ fontSize: 14 }}>{mode}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Row: Functional Area | Employment Type */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label className="form-label fw-semibold small">Functional Area</label>
              <ComboBox name="functional_area" value={formData.functional_area} onChange={onChange}
                options={FUNCTIONAL_AREAS} placeholder="Select or type area" />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label fw-semibold small">Employment Type</label>
              <ComboBox name="employment_type" value={formData.employment_type} onChange={onChange}
                options={EMPLOYMENT_TYPES} placeholder="Select or type" />
            </div>
          </div>

          {/* Row: Seniority Level | Working Country */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label className="form-label fw-semibold small">Seniority Level</label>
              <ComboBox name="seniority_level" value={formData.seniority_level} onChange={onChange}
                options={SENIORITY_LEVELS} placeholder="Select or type level" />
            </div>
            <div style={{ flex: 1 }}>
              <label className="form-label fw-semibold small">Working Country</label>
              <ComboBox name="work_country" value={formData.work_country} onChange={onChange}
                options={COUNTRIES} placeholder="Select or type country" />
            </div>
          </div>

          {/* Working City */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label className="form-label fw-semibold small">Working City</label>
              <ComboBox name="work_city" value={formData.work_city} onChange={onChange}
                options={workCities} placeholder="Select or type city" />
            </div>
            <div style={{ flex: 1 }}></div>
          </div>
        </>
      )}

      {/* Skills */}
      <div>
        <label className="form-label fw-semibold small">
          Skills <span style={opt()}>optional</span>
        </label>
        <input type="text" name="skills" value={formData.skills} onChange={onChange}
          className="form-control" placeholder="e.g., JavaScript, React, Python, Public Speaking" />
      </div>

      {/* Brief Bio */}
      <div>
        <label className="form-label fw-semibold small">
          Brief Bio <span style={opt()}>optional</span>
        </label>
        <textarea name="bio" value={formData.bio} onChange={onChange}
          className="form-control" rows={3}
          placeholder="Tell other alumni a little about yourself..." />
      </div>
    </div>
  );
}

// â"€â"€â"€ Success Screen â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â
function SuccessScreen({ navigate }) {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: 'linear-gradient(135deg, var(--color-primary-light) 0%, #fff 100%)' }}>
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

// â"€â"€â"€ Right Panel Info â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€â"€
const RIGHT_PANEL_INFO = {
  1: {
    icon: 'bi-stars',
    title: 'Welcome to Alumni Connect!',
    desc: 'Join thousands of alumni who are connected, collaborating, and growing together.'
  },
  2: {
    icon: 'bi-mortarboard-fill',
    title: 'Academic Info',
    desc: 'Share your academic journey, education level, and social profiles to connect with the right alumni network.'
  },
  3: {
    icon: 'bi-trophy-fill',
    title: 'Career Highlights',
    desc: 'Inspire others with your professional journey and share your current achievements.'
  },
};

const STEP_LABELS = ['Account Setup', 'Academic Info', 'Professional Info'];

// ── OTP Input Component ───────────────────────────────────────────────────────
function OtpInput({ value, onChange }) {
  const inputs = useRef([]);
  const digits = value.split('');

  const arr6 = () => Array.from({ length: 6 }, (_, i) => digits[i] || '');

  const handleKey = (e, idx) => {
    if (e.key === 'Backspace') {
      const arr = arr6();
      if (arr[idx]) {
        arr[idx] = '';
        onChange(arr.join(''));
      } else if (idx > 0) {
        inputs.current[idx - 1]?.focus();
      }
    }
  };

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const arr = arr6();
    arr[idx] = val;
    onChange(arr.join(''));
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) { onChange(text); inputs.current[5]?.focus(); }
    e.preventDefault();
  };

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
      {Array.from({ length: 6 }, (_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          style={{
            width: 48, height: 54, textAlign: 'center', fontSize: 22, fontWeight: 700,
            border: `2px solid ${digits[i] ? '#197fe6' : '#d1d5db'}`,
            borderRadius: 10, outline: 'none', color: '#111827',
            background: digits[i] ? '#eff6ff' : '#fff',
            transition: 'all 0.15s'
          }}
        />
      ))}
    </div>
  );
}

// â"€â"€â"€ Main Component â"€â"€â"€â"€â"€â"€â"
function UserRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // OTP state
  const [otpPhase, setOtpPhase]       = useState(false);   // showing OTP input?
  const [otpVerified, setOtpVerified] = useState(false);   // email verified?
  const [otp, setOtp]                 = useState('');
  const [otpLoading, setOtpLoading]   = useState(false);
  const [otpError, setOtpError]       = useState('');
  const [otpSuccess, setOtpSuccess]   = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', countryCode: '+91', phone: '',
    username: '', parent_name: '', password: '', confirmPassword: '',
    attended_program: '', program_type: '', terms: false,
    country: '', city: '', dob: '', gender: '',
    education_status: '', education_level: '', working_status: '',
    institution: '', enrollment_number: '', batch: '', completion_year: '',
    ug_college: '', pg_college: '', doctorate_name: '',
    authorization: false,
    organization_name: '', designation: '', industry: '', experience_years: '',
    functional_area: '', work_country: '', work_city: '',
    employment_type: '', seniority_level: '', work_mode: 'Office',
    skills: '', bio: '', achievements: '',
  });
  const [socialLinks, setSocialLinks] = useState([]);

  const startTimer = (secs = 60) => {
    setResendTimer(secs);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(t => { if (t <= 1) { clearInterval(timerRef.current); return 0; } return t - 1; });
    }, 1000);
  };

  const sendOtp = async () => {
    setOtpLoading(true); setOtpError(''); setOtpSuccess('');
    try {
      await axios.post(`${API_URL}/alumni/send-otp`, { email: formData.email });
      setOtpPhase(true);
      setOtp('');
      setOtpSuccess('OTP sent! Check your email.');
      startTimer(60);
    } catch (e) {
      setOtpError(e.response?.data?.message || 'Failed to send OTP');
    } finally { setOtpLoading(false); }
  };

  const verifyOtp = async () => {
    if (otp.length !== 6) { setOtpError('Enter the 6-digit OTP'); return; }
    setOtpLoading(true); setOtpError('');
    try {
      await axios.post(`${API_URL}/alumni/verify-otp`, { email: formData.email, otp });
      setOtpVerified(true);
      setOtpPhase(false);
      clearInterval(timerRef.current);
      setErrors({});
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setOtpError(e.response?.data?.message || 'Verification failed');
    } finally { setOtpLoading(false); }
  };

  const addSocialLink = () => setSocialLinks(prev => [...prev, { platform: 'LinkedIn', url: '' }]);
  const removeSocialLink = (idx) => setSocialLinks(prev => prev.filter((_, i) => i !== idx));
  const changeSocialLink = (idx, field, val) => setSocialLinks(prev =>
    prev.map((l, i) => i === idx ? { ...l, [field]: val } : l)
  );

  const years = Array.from({ length: 50 }, (_, i) => String(new Date().getFullYear() - i));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newVal = type === 'checkbox' ? checked : value;
    setFormData(prev => {
      const updated = { ...prev, [name]: newVal };
      if (name === 'firstName' || name === 'lastName') {
        const fn = name === 'firstName' ? newVal : prev.firstName;
        const ln = name === 'lastName' ? newVal : prev.lastName;
        updated.username = (fn + ln).toLowerCase().replace(/\s+/g, '');
      }
      if (name === 'country') updated.city = '';
      return updated;
    });
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!formData.firstName.trim()) e.firstName = 'First name is required';
      if (!formData.lastName.trim()) e.lastName = 'Last name is required';
      if (!formData.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Enter a valid email address';
      if (!formData.phone.trim()) e.phone = 'Mobile number is required';
      if (!formData.parent_name.trim()) e.parent_name = 'Parent name is required';
      if (!formData.password) e.password = 'Password is required';
      else if (formData.password.length < 6) e.password = 'At least 6 characters required';
      if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match';
      if (!formData.program_type) e.program_type = 'Please select your status';
      if (!formData.terms) e.terms = 'You must accept the Terms & Conditions to continue';
    }
    if (s === 2) {
      if (!formData.institution.trim()) e.institution = 'Institution name is required';
      if (!formData.attended_program) e.attended_program = 'Please select class attended';
      if (!formData.education_level) e.education_level = 'Education level is required';
      if (!formData.dob) e.dob = 'Date of birth is required';
      if (!formData.gender) e.gender = 'Please select your gender';
      if (!formData.working_status) e.working_status = 'Please select your working status';
      if (!formData.authorization) e.authorization = 'Authorization is required to proceed';
    }
    return e;
  };

  const nextStep = () => {
    const errs = validate(step);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    if (step === 1 && !otpVerified) {
      sendOtp();
      return;
    }
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
      batch: formData.completion_year || '',
      department: formData.education_level || '',
      address,
      linkedin: socialLinks.find(l => l.platform === 'LinkedIn')?.url || '',
      facebook: socialLinks.find(l => l.platform === 'Facebook')?.url || '',
      social_links: JSON.stringify(socialLinks),
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
      enrollment_number: formData.enrollment_number || '',
      completion_year: formData.completion_year || '',
      ug_college: formData.ug_college || '',
      pg_college: formData.pg_college || '',
      doctorate_name: formData.doctorate_name || '',
      functional_area: formData.functional_area || '',
      employment_type: formData.employment_type || '',
      seniority_level: formData.seniority_level || '',
      country: formData.country || '',
      city: formData.city || '',
      education_level: formData.education_level || '',
      work_city: formData.work_city || '',
      parent_name: formData.parent_name || '',
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
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* â"€â"€ Left: Form Panel â"€â"€ */}
      <div style={{ flex: 1, overflowX: 'hidden', padding: '48px 40px 80px', minWidth: 0 }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          {/* Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{
              width: 42, height: 42, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
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
            {step === 2 && 'Academic Info'}
            {step === 3 && 'Professional Details'}
          </h2>
          <p style={{ color: '#999', fontSize: 13, marginBottom: 28 }}>
            Step {step} of {TOTAL_STEPS} &mdash; {['Account setup', 'Academic details', 'Career information'][step - 1]}
          </p>

          {/* Form */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 28px', boxShadow: '0 1px 12px rgba(0,0,0,0.06)' }}>
            {step === 1 && !otpPhase && (
              <Step1 formData={formData} onChange={handleChange} errors={errors} />
            )}

            {/* OTP Verification Panel */}
            {step === 1 && otpPhase && (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <i className="bi bi-shield-lock-fill" style={{ fontSize: 32, color: '#197fe6' }}></i>
                </div>
                <h4 style={{ fontWeight: 800, fontSize: 18, color: '#111827', marginBottom: 6 }}>Verify Your Email</h4>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                  We sent a 6-digit OTP to
                </p>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#197fe6', marginBottom: 24 }}>{formData.email}</p>

                <OtpInput value={otp} onChange={v => { setOtp(v); setOtpError(''); }} />

                {otpError && (
                  <div style={{ marginTop: 14, padding: '10px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    <i className="bi bi-x-circle-fill"></i> {otpError}
                  </div>
                )}
                {otpSuccess && !otpError && (
                  <div style={{ marginTop: 14, padding: '10px 16px', background: '#dcfce7', color: '#16a34a', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    <i className="bi bi-check-circle-fill"></i> {otpSuccess}
                  </div>
                )}

                <button
                  onClick={verifyOtp}
                  disabled={otpLoading || otp.length !== 6}
                  style={{
                    marginTop: 22, width: '100%', padding: '13px', borderRadius: 10, border: 'none',
                    background: otp.length === 6 ? 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))' : '#e5e7eb',
                    color: otp.length === 6 ? '#fff' : '#9ca3af',
                    fontWeight: 700, fontSize: 15, cursor: otp.length === 6 ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: otp.length === 6 ? '0 4px 12px rgba(25,127,230,0.35)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {otpLoading
                    ? <><span className="spinner-border spinner-border-sm"></span> Verifying...</>
                    : <><i className="bi bi-check-circle-fill"></i> Verify OTP</>
                  }
                </button>

                <div style={{ marginTop: 18, fontSize: 13, color: '#6b7280' }}>
                  {resendTimer > 0
                    ? <>Resend OTP in <strong style={{ color: '#197fe6' }}>{resendTimer}s</strong></>
                    : <>Didn't receive it?{' '}
                        <button onClick={sendOtp} disabled={otpLoading} style={{ background: 'none', border: 'none', color: '#197fe6', fontWeight: 700, cursor: 'pointer', fontSize: 13, padding: 0 }}>
                          Resend OTP
                        </button>
                      </>
                  }
                </div>

                <button
                  onClick={() => { setOtpPhase(false); setOtpError(''); setOtp(''); clearInterval(timerRef.current); }}
                  style={{ marginTop: 12, background: 'none', border: 'none', color: '#9ca3af', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  ← Change email address
                </button>
              </div>
            )}

            {step === 2 && (
              <Step2 formData={formData} onChange={handleChange} errors={errors} years={years}
                socialLinks={socialLinks} onAddSocialLink={addSocialLink}
                onRemoveSocialLink={removeSocialLink} onSocialLinkChange={changeSocialLink} />
            )}
            {step === 3 && (
              <Step3 formData={formData} onChange={handleChange} errors={errors}
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
                Already registered? <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Login</span>
              </a>
            )}

            {step < TOTAL_STEPS ? (
              <button onClick={nextStep} style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', color: '#fff',
                border: 'none', borderRadius: 10, padding: '12px 30px', fontWeight: 700,
                fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 4px 12px rgba(25,127,230,0.35)'
              }}>
                Continue <i className="bi bi-arrow-right"></i>
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))', color: '#fff',
                border: 'none', borderRadius: 10, padding: '12px 30px', fontWeight: 700,
                fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, minWidth: 180,
                boxShadow: '0 4px 12px rgba(25,127,230,0.35)'
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

      {/* â"€â"€ Right: Info Panel â"€â"€ */}
      <div
        className="d-none d-lg-flex"
        style={{
          width: 360, flexShrink: 0,
          background: 'linear-gradient(160deg, var(--color-primary) 0%, var(--color-primary-dark) 55%, var(--color-primary-darker) 100%)',
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
                      ? <i className="bi bi-check2" style={{ color: 'var(--color-primary)', fontSize: 14, fontWeight: 900 }}></i>
                      : <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.5)' }}>{n}</span>
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
