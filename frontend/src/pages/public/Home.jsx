// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../components/AlumniCards.css';


import hero from "../../assets/po.jpg"


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const API_BASE = API_URL.replace(/\/api\/?$/, '');

// Animated Counter Component
function AnimatedCounter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <>{count}{suffix}</>;
}

// Custom Slider Arrows
function PrevArrow({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', left: -52, top: '50%', transform: 'translateY(-50%)',
      width: 40, height: 40, borderRadius: '50%',
      background: '#fff', border: '1.5px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', zIndex: 10, transition: 'all 0.2s',
      padding: 0,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.querySelector('i').style.color = '#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.querySelector('i').style.color = '#374151'; }}
    >
      <i className="bi bi-chevron-left" style={{ fontSize: 14, color: '#374151' }}></i>
    </button>
  );
}

function NextArrow({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'absolute', right: -52, top: '50%', transform: 'translateY(-50%)',
      width: 40, height: 40, borderRadius: '50%',
      background: '#fff', border: '1.5px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', zIndex: 10, transition: 'all 0.2s',
      padding: 0,
    }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary)'; e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.querySelector('i').style.color = '#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.querySelector('i').style.color = '#374151'; }}
    >
      <i className="bi bi-chevron-right" style={{ fontSize: 14, color: '#374151' }}></i>
    </button>
  );
}

const EVENT_TABS = [
  { value: 'all',          label: 'All'           },
  { value: 'reunion',      label: 'Reunions'      },
  { value: 'webinar',      label: 'Webinars'      },
  { value: 'hackathon',    label: 'Hackathons'    },
  { value: 'campus_event', label: 'Campus Events' },
  { value: 'other',        label: 'Other'         },
];

const EVENT_CAT_COLORS = {
  reunion:      { bg: '#ede9fe', text: '#7c3aed' },
  webinar:      { bg: '#e0f2fe', text: '#0891b2' },
  hackathon:    { bg: '#dcfce7', text: '#16a34a' },
  campus_event: { bg: '#fff7ed', text: '#c2410c' },
  other:        { bg: '#f3f4f6', text: '#6b7280' },
};

const evCatLabel = v => EVENT_TABS.find(t => t.value === v)?.label || v;
const evCatColor = v => EVENT_CAT_COLORS[v] || EVENT_CAT_COLORS.other;

function sortEvents(list) {
  const now = new Date();
  return [...list].sort((a, b) => {
    const da = a.event_date ? new Date(a.event_date) : null;
    const db = b.event_date ? new Date(b.event_date) : null;
    const upA = da && da >= now;
    const upB = db && db >= now;
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    if (upA && !upB) return -1;
    if (!upA && upB) return 1;
    return da - db;
  });
}

function Home() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents]             = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [activeEvtTab, setActiveEvtTab] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [stats, setStats] = useState({
    totalAlumni: 0,
    totalCareers: 0,
    totalCompanies: 0,
    totalCountries: 0,
    loading: true
  });

  useEffect(() => {
    let mounted = true;
    const fetchAlumni = async () => {
      setLoading(true);
      const url = `${API_URL.replace(/\/$/, '')}/featured-alumni?limit=50`;
      try {
        const res = await axios.get(url);
        if (mounted) setAlumni(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        if (error.response) {
          console.error('[Home] fetch error response:', error.response.status, error.response.data);
        } else {
          console.error('[Home] fetch error:', error.message || error);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchAlumni();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const baseUrl = API_URL.replace(/\/$/, '');
        const [alumniRes, careersRes, companiesRes, countriesRes] = await Promise.all([
          axios.get(`${baseUrl}/stats/total-alumni`),
          axios.get(`${baseUrl}/stats/careers`),
          axios.get(`${baseUrl}/stats/companies`),
          axios.get(`${baseUrl}/stats/countries`)
        ]);
        if (mounted) {
          setStats({
            totalAlumni: alumniRes.data.count || 0,
            totalCareers: careersRes.data.count || 0,
            totalCompanies: companiesRes.data.count || 0,
            totalCountries: countriesRes.data.count || 0,
            loading: false
          });
        }
      } catch (error) {
        console.error('[Home] Error fetching stats:', error);
        if (mounted) setStats(prev => ({ ...prev, loading: false }));
      }
    };
    fetchStats();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    axios.get(`${API_URL}/events`)
      .then(res => { if (mounted) setEvents(Array.isArray(res.data) ? res.data : []); })
      .catch(() => {})
      .finally(() => { if (mounted) setEventsLoading(false); });
    return () => { mounted = false; };
  }, []);

  const filteredEvents = sortEvents(activeEvtTab === 'all' ? events : events.filter(e => e.category === activeEvtTab));

  const slidesToShow = Math.min(4, Math.max(1, alumni.length || 1));
  const slidesToShowMD = Math.min(2, Math.max(1, alumni.length || 1));

  const carouselSettings = {
    dots: true,
    infinite: alumni.length > slidesToShow,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    autoplay: alumni.length > 1,
    autoplaySpeed: 3500,
    pauseOnHover: true,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    afterChange: (current) => setCurrentSlide(current),
    appendDots: dots => {
      const total = dots.length;
      if (total <= 5) return <div><ul style={{ margin: '0px' }}>{dots}</ul></div>;
      let start = Math.max(0, currentSlide - 2);
      let end = Math.min(total, start + 5);
      if (end - start < 5) start = Math.max(0, end - 5);
      return <div><ul style={{ margin: '0px' }}>{dots.slice(start, end)}</ul></div>;
    },
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: Math.min(3, Math.max(1, alumni.length || 1)),
          slidesToScroll: 1,
          infinite: alumni.length > 3,
          arrows: true,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: slidesToShowMD,
          slidesToScroll: 1,
          infinite: alumni.length > slidesToShowMD,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: alumni.length > 1,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: alumni.length > 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  };

  const buildPhotoUrl = (photoPath) => {
    if (!photoPath) return 'https://via.placeholder.com/150';
    if (/^https?:\/\//i.test(photoPath)) return photoPath;
    if (photoPath.startsWith('/')) return `${API_BASE}${photoPath}`;
    return `${API_BASE}/${photoPath}`;
  };

  const getStatusColor = (status) => {
    if (status === 'Employed') return '#16a34a';
    if (status === 'Self-Employed') return 'var(--color-primary)';
    return '#0891b2';
  };

  return (
    <div className="home-page" style={{ background: '#f3f4f6' }}>

      {/* ── HERO SECTION ── */}
      <div style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #ddeaff 100%)', padding: 'clamp(40px, 8vw, 80px) 0 clamp(60px, 10vw, 110px)' }}>
        <div className="container">
          <div className="row align-items-center g-5">

            {/* Left */}
            <div className="col-lg-6">
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(25,127,230,0.08)', border: '1.5px solid rgba(25,127,230,0.2)',
                borderRadius: 24, padding: '6px 16px', marginBottom: 28,
                fontSize: 11.5, fontWeight: 700, color: 'var(--color-primary)', letterSpacing: '1.2px'
              }}>
                <i className="bi bi-shield-fill-check" style={{ fontSize: 13 }}></i>
                OFFICIAL UNIVERSITY NETWORK
              </div>

              {/* Heading */}
              <h1 style={{
                fontSize: 'clamp(2.6rem, 5vw, 4rem)', fontWeight: 500,
                lineHeight: 1.08, marginBottom: 20, color: '#111827'
              }}>
                Our<br />Distinguished<br />
                <span style={{ color: 'var(--color-primary)' }}>Alumni</span>
              </h1>

              {/* Description */}
              <p style={{
                fontSize: '1.05rem', color: '#4b5563', marginBottom: 38,
                lineHeight: 1.75, maxWidth: 460
              }}>
                Connecting excellence across generations. Join a global network of leaders,
                innovators, and mentors shaping the future.
              </p>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 9,
                  padding: '13px 28px', background: 'var(--color-primary)', color: '#fff',
                  borderRadius: 10, fontWeight: 700, fontSize: '0.95rem',
                  textDecoration: 'none', boxShadow: '0 4px 16px rgba(25,127,230,0.32)',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--color-primary-dark)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-primary)'; }}
                >
                  Join Alumni Network <i className="bi bi-arrow-right"></i>
                </a>
                <a href="/user/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 9,
                  padding: '13px 28px', background: '#fff', color: '#111827',
                  borderRadius: 10, fontWeight: 700, fontSize: '0.95rem',
                  textDecoration: 'none', border: '1.5px solid #d1d5db',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)', transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#111827'; }}
                >
                  View Directory
                </a>
              </div>
            </div>

            {/* Right – Graduation Image */}
            <div className="col-lg-6 d-flex justify-content-center">
              <div style={{ position: 'relative', maxWidth: 500, width: '100%' }}>
                <div style={{
                  borderRadius: 22, overflow: 'hidden',
                  border: '6px solid #fff',
                  boxShadow: '0 20px 56px rgba(25,127,230,0.16)',
                  transform: 'rotate(2deg)'
                }}>
                  <img
                    src={hero}
                    alt="Graduation ceremony"
                    style={{ width: '100%', height: 370, objectFit: 'cover', display: 'block' }}
                  />
                </div>
                {/* Social Proof */}
                <div style={{
                  position: 'absolute', bottom: -22, left: -8,
                  background: '#fff', borderRadius: 14,
                  padding: '12px 18px',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.11)',
                  display: 'flex', alignItems: 'center', gap: 12,
                  minWidth: 220
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {['var(--color-primary)', 'var(--color-primary-dark)', 'var(--color-primary-darker)'].map((bg, i) => (
                      <div key={i} style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: bg, border: '2.5px solid #fff',
                        marginLeft: i > 0 ? -9 : 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontSize: 11, fontWeight: 700, zIndex: 3 - i
                      }}>
                        {['A', 'B', 'C'][i]}
                      </div>
                    ))}
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--color-primary)', border: '2.5px solid #fff',
                      marginLeft: -9,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontSize: 8.5, fontWeight: 800, zIndex: 0
                    }}>
                      +5k
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>
                    {alumni.length > 0 ? `${alumni.length}+ Alumni joined` : '5,000+ Alumni joined this month'}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

        {/* ── FEATURED ALUMNI ── */}
      <div style={{ background: '#f3f4f6', padding: '60px 0 70px' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Featured Alumni
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: 'var(--color-primary)' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : alumni.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1" style={{ color: '#d1d5db' }}></i>
              <p style={{ color: '#9ca3af', marginTop: 16, fontSize: '1rem' }}>No alumni profiles available yet.</p>
            </div>
          ) : (
            <div className="alumni-carousel-container">
              <Slider {...carouselSettings}>
                {alumni.map((alumnus) => (
                  <div key={alumnus.id} className="carousel-item-wrapper">
                    <div
                      className="alumni-card-modern"
                      style={{
                        background: '#fff',
                        borderRadius: 20,
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        transition: 'all 0.25s ease',
                        // margin: '8px 4px 16px',
                        padding: '28px 20px 24px',
                        // height: 340,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        textAlign: 'left',
                        position: 'relative',
                      }}
                    >
                      {/* Status Badge */}
                      {alumnus.current_status && (
                        <span className="status-badge" style={{
                          position: 'absolute', top: 14, right: 14,
                          background: getStatusColor(alumnus.current_status),
                          color: '#fff', fontSize: '0.63rem', fontWeight: 700,
                          padding: '3px 9px', borderRadius: 20,
                          letterSpacing: '0.6px', textTransform: 'uppercase',
                          zIndex: 2
                        }}>
                          {alumnus.current_status}
                        </span>
                      )}

                      {/* Circular Photo */}
                      <div style={{
                        width: 88, height: 88,
                        borderRadius: '50%',
                        overflow: 'hidden',
                        alignSelf: 'center',
                        boxShadow: '0 4px 16px rgba(25,127,230,0.18)',
                        marginBottom: 16,
                        flexShrink: 0,
                      }}>
                        <img
                          src={buildPhotoUrl(alumnus.photo)}
                          alt={alumnus.name || 'Alumnus'}
                          className="alumni-photo"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      </div>

                      {/* Name */}
                      <h5 style={{ fontSize: '1.0rem', fontWeight: 800, color: '#111827', marginBottom: 14, textTransform: 'capitalize', alignSelf: 'center' }}>
                        {alumnus.name || '—'}
                      </h5>

                      {/* Designation */}
                      {/* {(alumnus.designation || alumnus.organization_name) && (
                        <p style={{ fontSize: '0.82rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: 14 }}>
                          {alumnus.designation}
                          {alumnus.designation && alumnus.organization_name && ' at '}
                          {alumnus.organization_name}
                        </p>
                      )} */}

                      {/* Divider */}
                      <div style={{ width: 40, height: 2, background: '#e5e7eb', borderRadius: 2, marginBottom: 14, alignSelf: 'center' }} />

                      {/* Details */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'flex-start', width: '100%', marginTop: 'auto' }}>
                        {alumnus.institution && (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, minHeight: 36 }}>
                            <i className="bi bi-mortarboard" style={{ color: '#9ca3af', fontSize: 13, flexShrink: 0, marginTop: 2 }}></i>
                            <span style={{
                              fontSize: '0.80rem', color: '#6b7280', lineHeight: '18px',
                              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                            }}>
                              {alumnus.institution}{alumnus.batch ? `, Class of ${alumnus.batch}` : ''}
                            </span>
                          </div>
                        )}
                        {alumnus.industry && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                            <i className="bi bi-briefcase" style={{ color: '#9ca3af', fontSize: 13, flexShrink: 0 }}></i>
                            <span style={{ fontSize: '0.80rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {alumnus.industry}
                            </span>
                          </div>
                        )}
                        {alumnus.work_location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                            <i className="bi bi-geo-alt" style={{ color: '#9ca3af', fontSize: 13, flexShrink: 0 }}></i>
                            <span style={{ fontSize: '0.80rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {alumnus.work_location}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
      </div>

      {/* ── NETWORK AT A GLANCE ── */}
      <div style={{ background: '#fff', padding: 'clamp(32px, 6vw, 60px) 0' }}>
        <div className="container">
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#111827', marginBottom: 6 }}>
              Network at a Glance
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Impacting the world through our collective reach.
            </p>
          </div>

          {stats.loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: 'var(--color-primary)' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              {[
                { icon: 'bi-people-fill', value: stats.totalAlumni, label: 'Active Members' },
                { icon: 'bi-graph-up-arrow', value: stats.totalCareers, label: 'Careers Launched' },
                { icon: 'bi-building', value: stats.totalCompanies, label: 'Global Companies' },
                { icon: 'bi-globe2', value: stats.totalCountries, label: 'Countries Represented' },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="stat-card" style={{
                    background: '#f3f4f6', borderRadius: 16,
                    padding: 'clamp(16px, 4vw, 28px) clamp(14px, 3vw, 24px)', border: '1px solid #e5e7eb',
                    transition: 'all 0.25s ease'
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: 'var(--color-primary-light)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 18
                    }}>
                      <i className={`bi ${item.icon}`} style={{ fontSize: 20, color: 'var(--color-primary)' }}></i>
                    </div>
                    <div style={{ fontSize: 'clamp(1.7rem, 4vw, 2.2rem)', fontWeight: 900, color: '#111827', lineHeight: 1, marginBottom: 6 }}>
                      <AnimatedCounter end={item.value} duration={2000} />
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', fontWeight: 500 }}>
                      {item.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    

      {/* ── EVENTS SECTION ── */}
      <div style={{ background: '#f3f4f6', padding: 'clamp(32px,6vw,60px) 0' }}>
        <div className="container">
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#111827', marginBottom: 6 }}>
              Events
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>
              Upcoming and past alumni events & conferences.
            </p>
          </div>

          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {EVENT_TABS.map(tab => (
              <button key={tab.value} onClick={() => setActiveEvtTab(tab.value)} style={{
                padding: '7px 18px', borderRadius: 24, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
                background: activeEvtTab === tab.value ? 'var(--color-primary)' : '#fff',
                color:      activeEvtTab === tab.value ? '#fff' : '#374151',
                boxShadow:  activeEvtTab === tab.value ? '0 2px 8px rgba(25,127,230,0.25)' : '0 1px 3px rgba(0,0,0,0.07)',
              }}>
                {tab.label}
              </button>
            ))}
          </div>

          {eventsLoading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="spinner-border" style={{ width: '2rem', height: '2rem', color: 'var(--color-primary)' }}></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
              <i className="bi bi-calendar-x" style={{ fontSize: 40 }}></i>
              <p style={{ marginTop: 12 }}>No events in this category yet.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
              {filteredEvents.map(ev => {
                const cc = evCatColor(ev.category);
                const isPast = ev.event_date && new Date(ev.event_date) < new Date();
                return (
                  <div key={ev.id} onClick={() => setSelectedEvent(ev)} style={{
                    background: '#fff', borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb',
                    transition: 'all 0.2s', display: 'flex', flexDirection: 'column', cursor: 'pointer'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)'; }}
                  >
                    {/* Image */}
                    {ev.image ? (
                      <div style={{ height: 160, overflow: 'hidden' }}>
                        <img src={`${API_BASE}${ev.image}`} alt={ev.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                    ) : (
                      <div style={{ height: 160, background: 'linear-gradient(135deg,#eef4ff,#ddeaff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-calendar-event-fill" style={{ fontSize: 48, color: 'rgba(25,127,230,0.25)' }}></i>
                      </div>
                    )}

                    <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Category + past badge */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                        <span style={{ background: cc.bg, color: cc.text, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>
                          {evCatLabel(ev.category)}
                        </span>
                        {isPast && (
                          <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                            Past Event
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#111827', marginBottom: 8, lineHeight: 1.35 }}>{ev.title}</h3>

                      {/* Description */}
                      {ev.description && (
                        <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6, marginBottom: 12,
                          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {ev.description}
                        </p>
                      )}

                      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {ev.event_date && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', color: '#6b7280' }}>
                            <i className="bi bi-calendar3" style={{ color: 'var(--color-primary)', flexShrink: 0 }}></i>
                            {new Date(ev.event_date).toLocaleString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                        {ev.location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '0.8rem', color: '#6b7280' }}>
                            <i className="bi bi-geo-alt-fill" style={{ color: 'var(--color-primary)', flexShrink: 0 }}></i>
                            {ev.location}
                          </div>
                        )}
                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontSize: 13, fontWeight: 700 }}>
                          View Details <i className="bi bi-arrow-right"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Event Detail Modal ── */}
      {selectedEvent && (
        <div onClick={() => setSelectedEvent(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 20, maxWidth: 720, width: '100%',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
          }}>
            {/* Hero image */}
            {selectedEvent.image ? (
              <img src={`${API_BASE}${selectedEvent.image}`} alt={selectedEvent.title}
                style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block', borderRadius: '20px 20px 0 0' }} />
            ) : (
              <div style={{ height: 180, background: 'linear-gradient(135deg,#eef4ff,#ddeaff)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px 20px 0 0' }}>
                <i className="bi bi-calendar-event-fill" style={{ fontSize: 64, color: 'rgba(25,127,230,0.2)' }}></i>
              </div>
            )}

            <div style={{ padding: '28px 36px 36px' }}>
              {/* Close + badges */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(() => {
                    const cc = evCatColor(selectedEvent.category);
                    const isPast = selectedEvent.event_date && new Date(selectedEvent.event_date) < new Date();
                    return (
                      <>
                        <span style={{ background: cc.bg, color: cc.text, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>
                          {evCatLabel(selectedEvent.category)}
                        </span>
                        {isPast && <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600 }}>Past Event</span>}
                      </>
                    );
                  })()}
                </div>
                <button onClick={() => setSelectedEvent(null)} style={{
                  background: '#f3f4f6', border: 'none', borderRadius: '50%',
                  width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 16, color: '#6b7280', flexShrink: 0
                }}>
                  <i className="bi bi-x"></i>
                </button>
              </div>

              {/* Title */}
              <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#111827', marginBottom: 20, lineHeight: 1.2 }}>
                {selectedEvent.title}
              </h2>

              {/* Meta panel */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 28, padding: '18px 22px', background: '#f9fafb', borderRadius: 14 }}>
                {selectedEvent.event_date && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="bi bi-calendar3" style={{ color: 'var(--color-primary)', fontSize: 16 }}></i>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Date & Time</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                        {new Date(selectedEvent.event_date).toLocaleString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>
                        {new Date(selectedEvent.event_date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )}
                {selectedEvent.location && (
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className="bi bi-geo-alt-fill" style={{ color: '#c2410c', fontSize: 16 }}></i>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 }}>Venue</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{selectedEvent.location}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedEvent.description && (
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 12 }}>About this Event</h3>
                  <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                    {selectedEvent.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CTA SECTION ── */}
      <div style={{ background: '#fff', padding: '70px 70px' }}>
        <div className="container">
          <div style={{
            background: 'var(--color-primary)',
            borderRadius: 20,
            padding: 'clamp(40px, 6vw, 64px)',
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 32, flexWrap: 'wrap'
          }}>
            {/* Background decoration */}
            <div style={{
              position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
              fontSize: 180, opacity: 0.08, color: '#fff', pointerEvents: 'none',
              lineHeight: 1
            }}>
              <i className="bi bi-mortarboard-fill"></i>
            </div>

            <div style={{ position: 'relative', maxWidth: 560 }}>
              <h2 style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', 
                color: '#fff', marginBottom: 14, lineHeight: 1.2
              }}>
                Ready to re-connect with<br />your community?
              </h2>
              <p style={{
                color: 'rgba(255,255,255,0.82)', fontSize: '0.95rem',
                marginBottom: 32, lineHeight: 1.65, maxWidth: 460
              }}>
                Don't miss out on exclusive alumni events, job opportunities, and a network of{' '}
                {stats.totalAlumni > 0 ? `${stats.totalAlumni.toLocaleString()}+` : '12,000+'} graduates globally.
              </p>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 26px', background: '#fff', color: 'var(--color-primary)',
                  borderRadius: 10, fontWeight: 700, fontSize: '0.93rem',
                  textDecoration: 'none', boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f0f7ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                >
                  Create Account
                </a>
                <a href="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '12px 26px', background: 'transparent', color: '#fff',
                  borderRadius: 10, fontWeight: 700, fontSize: '0.93rem',
                  textDecoration: 'none', border: '1.5px solid rgba(255,255,255,0.5)',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  Contact Office
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Home;
