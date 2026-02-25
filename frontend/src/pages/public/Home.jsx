// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../components/AlumniCards.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API_BASE = (() => {
  try {
    const tmp = API_URL.replace(/\/api\/?$/, '');
    return tmp.startsWith('http') ? tmp : `http://${tmp}`;
  } catch {
    return 'http://localhost:5000';
  }
})();

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
      onMouseEnter={e => { e.currentTarget.style.background = '#197fe6'; e.currentTarget.style.borderColor = '#197fe6'; e.currentTarget.querySelector('i').style.color = '#fff'; }}
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
      onMouseEnter={e => { e.currentTarget.style.background = '#197fe6'; e.currentTarget.style.borderColor = '#197fe6'; e.currentTarget.querySelector('i').style.color = '#fff'; }}
      onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.querySelector('i').style.color = '#374151'; }}
    >
      <i className="bi bi-chevron-right" style={{ fontSize: 14, color: '#374151' }}></i>
    </button>
  );
}

function Home() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

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
      const url = `${API_URL.replace(/\/$/, '')}/alumni`;
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

  const slidesToShow = Math.min(3, Math.max(1, alumni.length || 1));
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
    appendDots: dots => (
      <div><ul style={{ margin: '0px' }}>{dots}</ul></div>
    ),
    responsive: [
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
    if (status === 'Self-Employed') return '#197fe6';
    return '#0891b2';
  };

  return (
    <div className="home-page" style={{ background: '#f3f4f6' }}>

      {/* ── HERO SECTION ── */}
      <div style={{ background: 'linear-gradient(135deg, #eef4ff 0%, #ddeaff 100%)', padding: '80px 0 110px' }}>
        <div className="container">
          <div className="row align-items-center g-5">

            {/* Left */}
            <div className="col-lg-6">
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(25,127,230,0.08)', border: '1.5px solid rgba(25,127,230,0.2)',
                borderRadius: 24, padding: '6px 16px', marginBottom: 28,
                fontSize: 11.5, fontWeight: 700, color: '#197fe6', letterSpacing: '1.2px'
              }}>
                <i className="bi bi-shield-fill-check" style={{ fontSize: 13 }}></i>
                OFFICIAL UNIVERSITY NETWORK
              </div>

              {/* Heading */}
              <h1 style={{
                fontSize: 'clamp(2.6rem, 5vw, 4rem)', fontWeight: 900,
                lineHeight: 1.08, marginBottom: 20, color: '#111827'
              }}>
                Our<br />Distinguished<br />
                <span style={{ color: '#197fe6' }}>Alumni</span>
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
                  padding: '13px 28px', background: '#197fe6', color: '#fff',
                  borderRadius: 10, fontWeight: 700, fontSize: '0.95rem',
                  textDecoration: 'none', boxShadow: '0 4px 16px rgba(25,127,230,0.32)',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1368c4'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#197fe6'; }}
                >
                  Join Alumni Network <i className="bi bi-arrow-right"></i>
                </a>
                <a href="/" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 9,
                  padding: '13px 28px', background: '#fff', color: '#111827',
                  borderRadius: 10, fontWeight: 700, fontSize: '0.95rem',
                  textDecoration: 'none', border: '1.5px solid #d1d5db',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)', transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#197fe6'; e.currentTarget.style.color = '#197fe6'; }}
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
                    src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&auto=format&fit=crop&q=80"
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
                    {['#197fe6', '#1368c4', '#0d52a0'].map((bg, i) => (
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
                      background: '#197fe6', border: '2.5px solid #fff',
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

      {/* ── NETWORK AT A GLANCE ── */}
      <div style={{ background: '#fff', padding: '60px 0' }}>
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
              <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: '#197fe6' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-3 g-md-4">
              {[
                { icon: 'bi-people-fill', value: stats.totalAlumni, label: 'Active Members' },
                { icon: 'bi-graph-up-arrow', value: stats.totalCareers, label: 'Careers Launched' },
                { icon: 'bi-building', value: stats.totalCompanies, label: 'Global Companies' },
                { icon: 'bi-globe2', value: stats.totalCountries, label: 'Countries Represented' },
              ].map((item, idx) => (
                <div key={idx} className="col-6 col-lg-3">
                  <div className="stat-card" style={{
                    background: '#f3f4f6', borderRadius: 16,
                    padding: '28px 24px', border: '1px solid #e5e7eb',
                    transition: 'all 0.25s ease'
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: '#e8f2fd',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 18
                    }}>
                      <i className={`bi ${item.icon}`} style={{ fontSize: 20, color: '#197fe6' }}></i>
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
              <div className="spinner-border" style={{ width: '2.5rem', height: '2.5rem', color: '#197fe6' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : alumni.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1" style={{ color: '#d1d5db' }}></i>
              <p style={{ color: '#9ca3af', marginTop: 16, fontSize: '1rem' }}>No alumni profiles available yet.</p>
            </div>
          ) : (
            <div className="alumni-carousel-container" style={{ padding: '0 60px', position: 'relative' }}>
              <Slider {...carouselSettings}>
                {alumni.map((alumnus) => (
                  <div key={alumnus.id} style={{ padding: '0 10px' }}>
                    <div
                      className="alumni-card-modern"
                      style={{
                        background: '#fff',
                        borderRadius: 18,
                        overflow: 'hidden',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        transition: 'all 0.25s ease',
                        margin: '8px 4px 16px',
                      }}
                    >
                      {/* Photo area */}
                      <div style={{ position: 'relative', background: '#f3f4f6', padding: '24px 24px 0' }}>
                        {alumnus.current_status && (
                          <span style={{
                            position: 'absolute', top: 14, right: 14,
                            background: getStatusColor(alumnus.current_status),
                            color: '#fff', fontSize: '0.68rem', fontWeight: 700,
                            padding: '4px 10px', borderRadius: 20,
                            letterSpacing: '0.6px', textTransform: 'uppercase',
                            zIndex: 2
                          }}>
                            {alumnus.current_status}
                          </span>
                        )}
                        <img
                          src={buildPhotoUrl(alumnus.photo)}
                          alt={alumnus.name || 'Alumnus'}
                          style={{
                            width: '100%', height: 220,
                            objectFit: 'cover',
                            borderRadius: 12,
                            display: 'block'
                          }}
                        />
                      </div>

                      {/* Info area */}
                      <div style={{ padding: '20px 22px 24px' }}>
                        <h5 style={{
                          fontSize: '1.05rem', fontWeight: 800,
                          color: '#111827', marginBottom: 4
                        }}>
                          {alumnus.name || '—'}
                        </h5>

                        {(alumnus.designation || alumnus.organization_name) && (
                          <p style={{
                            fontSize: '0.875rem', color: '#197fe6',
                            fontWeight: 600, marginBottom: 14
                          }}>
                            {alumnus.designation}
                            {alumnus.designation && alumnus.organization_name && ' at '}
                            {alumnus.organization_name}
                          </p>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {alumnus.institution && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <i className="bi bi-mortarboard" style={{ color: '#9ca3af', fontSize: 14, flexShrink: 0 }}></i>
                              <span style={{ fontSize: '0.84rem', color: '#6b7280' }}>
                                {alumnus.institution}{alumnus.batch ? `, Class of ${alumnus.batch}` : ''}
                              </span>
                            </div>
                          )}
                          {alumnus.work_location && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <i className="bi bi-geo-alt" style={{ color: '#9ca3af', fontSize: 14, flexShrink: 0 }}></i>
                              <span style={{ fontSize: '0.84rem', color: '#6b7280' }}>
                                {alumnus.work_location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          )}
        </div>
      </div>

      {/* ── CTA SECTION ── */}
      <div style={{ background: '#f3f4f6', padding: '0 0 70px' }}>
        <div className="container">
          <div style={{
            background: '#197fe6',
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
                fontSize: 'clamp(1.5rem, 3.5vw, 2.1rem)', fontWeight: 900,
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
                  padding: '12px 26px', background: '#fff', color: '#197fe6',
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
