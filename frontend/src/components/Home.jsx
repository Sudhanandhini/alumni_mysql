// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './AlumniCards.css';

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

function Home() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Stats state
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
      console.log('[Home] Fetching alumni from:', url);
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
    return () => {
      mounted = false;
    };
  }, []);

  // Fetch statistics from 4 separate API endpoints
  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      try {
        const baseUrl = API_URL.replace(/\/$/, '');
        
        // Make 4 parallel API calls
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
        if (mounted) {
          setStats(prev => ({ ...prev, loading: false }));
        }
      }
    };

    fetchStats();
    return () => {
      mounted = false;
    };
  }, []);

  const slidesToShow = Math.min(4, Math.max(1, alumni.length || 1));
  const slidesToShowXL = Math.min(3, Math.max(1, alumni.length || 1));
  const slidesToShowMD = Math.min(2, Math.max(1, alumni.length || 1));
  const slidesToShowSM = 1;

  const carouselSettings = {
    dots: true,
    infinite: alumni.length > slidesToShow,
    speed: 500,
    slidesToShow,
    slidesToScroll: 1,
    autoplay: alumni.length > 1,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    centerMode: false,
    adaptiveHeight: true,
    appendDots: (dots) => (
      <div>
        <ul style={{ margin: "0px" }}> {dots.slice(0, 5)} </ul>
      </div>
    ),
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: slidesToShowXL,
          slidesToScroll: 1,
          infinite: alumni.length > slidesToShowXL,
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
          centerMode: true,
          centerPadding: '40px',
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: slidesToShowSM,
          slidesToScroll: 1,
          infinite: alumni.length > slidesToShowSM,
          centerMode: true,
          centerPadding: '30px',
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

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section bg-gradient-danger text-white py-5">
        <div className="container text-center">
          <h1 className="display-4 display-md-3 fw-bold mb-3 animate-fade-in">
            <i className="bi bi-stars me-2 me-md-3"></i>
            <span className="d-block d-md-inline">Our Distinguished Alumni</span>
            <i className="bi bi-stars ms-2 ms-md-3"></i>
          </h1>
          <p className="lead fs-5 fs-md-4 mb-4 px-3">Meet our successful alumni who are making a difference in the world</p>
          <div className="mt-4">
            <span className="badge bg-light text-danger fs-6 fs-md-5 px-3 px-md-4 py-2 py-md-3">
              <i className="bi bi-people-fill me-2"></i>
              {alumni.length} Alumni Network
            </span>
          </div>
        </div>
      </div>

      {/* Alumni Carousel */}
      <div className="carousel-section py-4 py-md-5">
        <div className="container-fluid px-2 px-md-3 px-lg-5">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : alumni.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-1 text-muted"></i>
              <p className="text-muted mt-3 fs-5">No alumni profiles available yet.</p>
            </div>
          ) : (
            <div className="alumni-carousel-container">
              <Slider {...carouselSettings}>
                {alumni.map((alumnus) => (
                  <div key={alumnus.id} className="carousel-item-wrapper px-1 px-md-2">
                    <div 
                      className="alumni-card-modern" 
                      style={{ 
                        position: 'relative', 
                        margin: '0 5px',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        border: '1px solid #e9ecef',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 8px 30px rgba(220, 53, 69, 0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                      }}
                    >
                      <div style={{
                        height: '5px',
                        background: 'linear-gradient(90deg, #dc3545 0%, #c82333 100%)',
                        width: '100%'
                      }} />

                      <div className="card-body p-4">
                        {alumnus.current_status && (
                          <span
                            className={`status-badge ${
                              alumnus.current_status === 'Employed'
                                ? 'bg-success'
                                : alumnus.current_status === 'Self-Employed'
                                ? 'bg-primary'
                                : 'bg-info'
                            }`}
                            style={{ 
                              position: 'absolute', 
                              right: 15, 
                              top: 20, 
                              padding: '6px 12px', 
                              borderRadius: '20px', 
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                              zIndex: 1
                            }}
                          >
                            {alumnus.current_status}
                          </span>
                        )}

                        <div className="alumni-photo-section d-flex justify-content-center mb-3" style={{ paddingTop: '10px' }}>
                          <div style={{
                            position: 'relative',
                            padding: '4px',
                            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                            borderRadius: '50%',
                            boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
                          }}>
                            <img
                              src={buildPhotoUrl(alumnus.photo)}
                              alt={alumnus.name || 'Alumnus'}
                              className="alumni-photo"
                              style={{ 
                                width: '120px', 
                                height: '120px', 
                                objectFit: 'cover',
                                borderRadius: '50%',
                                border: '4px solid white',
                                display: 'block'
                              }}
                            />
                          </div>
                        </div>

                        <div className="text-center mb-3" style={{ 
                          borderBottom: '2px solid #f8f9fa',
                          paddingBottom: '15px'
                        }}>
                          <h5 className="alumni-name mb-2" style={{
                            fontSize: '1.25rem',
                            fontWeight: '700',
                            color: '#212529',
                            marginBottom: '5px'
                          }}>
                            {alumnus.name || '—'}
                          </h5>
                          
                          {alumnus.designation && (
                            <p className="text-danger mb-0" style={{
                              fontSize: '0.95rem',
                              fontWeight: '600',
                              letterSpacing: '0.3px'
                            }}>
                              {alumnus.designation}
                            </p>
                          )}
                          
                          {alumnus.organization_name && (
                            <p className="text-muted mb-0" style={{
                              fontSize: '0.85rem',
                              marginTop: '3px'
                            }}>
                              {alumnus.organization_name}
                            </p>
                          )}
                        </div>

                        <div className="alumni-details mb-3" style={{
                          background: '#f8f9fa',
                          borderRadius: '12px',
                          padding: '15px',
                        }}>
                          {alumnus.institution && (
                            <div className="detail-row d-flex align-items-start mb-2">
                              <div style={{
                                width: '32px',
                                height: '32px',
                                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginRight: '10px'
                              }}>
                                <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: '0.9rem' }} />
                              </div>
                              <div className="flex-grow-1">
                                <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '2px' }}>Education</div>
                                <div style={{ fontSize: '0.85rem', color: '#495057', fontWeight: '500' }}>
                                  {alumnus.institution}
                                  {alumnus.batch && <span className="text-muted"> • {alumnus.batch}</span>}
                                </div>
                              </div>
                            </div>
                          )}

                          {alumnus.department && (
                            <div className="detail-row d-flex align-items-start mb-2">
                              <div style={{
                                width: '32px',
                                height: '32px',
                                background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginRight: '10px'
                              }}>
                                <i className="bi bi-book-fill text-white" style={{ fontSize: '0.9rem' }} />
                              </div>
                              <div className="flex-grow-1">
                                <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '2px' }}>Department</div>
                                <div style={{ fontSize: '0.85rem', color: '#495057', fontWeight: '500' }}>
                                  {alumnus.department}
                                </div>
                              </div>
                            </div>
                          )}

                          {alumnus.work_location && (
                            <div className="detail-row d-flex align-items-start mb-2">
                              <div style={{
                                width: '32px',
                                height: '32px',
                                background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginRight: '10px'
                              }}>
                                <i className="bi bi-geo-alt-fill text-white" style={{ fontSize: '0.9rem' }} />
                              </div>
                              <div className="flex-grow-1">
                                <div style={{ fontSize: '0.75rem', color: '#6c757d', marginBottom: '2px' }}>Location</div>
                                <div style={{ fontSize: '0.85rem', color: '#495057', fontWeight: '500' }}>
                                  {alumnus.work_location}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {alumnus.linkedin && (
                          <div className="d-flex justify-content-center">
                            <a 
                              href={alumnus.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="linkedin-btn"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '10px 24px',
                                background: '#0077b5',
                                color: 'white',
                                borderRadius: '25px',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 3px 10px rgba(0, 119, 181, 0.3)',
                                border: 'none'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#005885';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 119, 181, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#0077b5';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 3px 10px rgba(0, 119, 181, 0.3)';
                              }}
                            >
                              <i className="bi bi-linkedin me-2" style={{ fontSize: '1.1rem' }} />
                              Connect on LinkedIn
                            </a>
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

      {/* Profile of Members Section - KALS Alumni Network Stats */}
      <div className="py-5" style={{ background: 'linear-gradient(to bottom, #f8f5f5, #fff)' }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3" style={{ color: '#c82333', fontSize: 'clamp(1.5rem, 5vw, 2rem)' }}>
              Profile of Members in the Alumni Network
            </h2>
            <p className="text-secondary" style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.05rem)', maxWidth: '900px', margin: '0 auto', lineHeight: '1.6' }}>
              Alumni are in dominating positions across the world in different Careers, Companies and Universities.<br />
              Connect with them to grow Professionally & Personally.
            </p>
          </div>

          {stats.loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ width: '3rem', height: '3rem', color: '#c82333' }}>
                <span className="visually-hidden">Loading statistics...</span>
              </div>
            </div>
          ) : (
            <div className="row g-3 g-md-4">
              {/* Active Alumni Members */}
              <div className="col-6 col-lg-3">
                <div className="stat-card p-3 p-md-4 bg-white rounded-3 shadow-sm h-100 text-center transition-all" 
                     style={{ 
                       border: '1px solid #e8e8e8',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-5px)';
                       e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 71, 71, 0.15)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                     }}>
                  <div className="mb-2 mb-md-3">
                    <i className="bi bi-mortarboard-fill" style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: '#c82333' }}></i>
                  </div>
                  <h3 className="fw-bold mb-1 mb-md-2" style={{ color: '#c82333', fontSize: 'clamp(2rem, 8vw, 3rem)' }}>
                    <AnimatedCounter end={stats.totalAlumni} duration={2000} />
                  </h3>
                  <p className="text-secondary mb-0" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)', lineHeight: '1.4' }}>
                    Active<br />Alumni Members
                  </p>
                </div>
              </div>

              {/* Different Career Chosen */}
              <div className="col-6 col-lg-3">
                <div className="stat-card p-3 p-md-4 bg-white rounded-3 shadow-sm h-100 text-center transition-all" 
                     style={{ 
                       border: '1px solid #e8e8e8',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-5px)';
                       e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 71, 71, 0.15)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                     }}>
                  <div className="mb-2 mb-md-3">
                    <i className="bi bi-briefcase-fill" style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: '#c82333' }}></i>
                  </div>
                  <h3 className="fw-bold mb-1 mb-md-2" style={{ color: '#c82333', fontSize: 'clamp(2rem, 8vw, 3rem)' }}>
                    <AnimatedCounter end={stats.totalCareers} duration={2000} />
                  </h3>
                  <p className="text-secondary mb-0" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)', lineHeight: '1.4' }}>
                    Different<br />Career Chosen
                  </p>
                </div>
              </div>

              {/* Companies Represented */}
              <div className="col-6 col-lg-3">
                <div className="stat-card p-3 p-md-4 bg-white rounded-3 shadow-sm h-100 text-center transition-all" 
                     style={{ 
                       border: '1px solid #e8e8e8',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-5px)';
                       e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 71, 71, 0.15)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                     }}>
                  <div className="mb-2 mb-md-3">
                    <i className="bi bi-building" style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: '#c82333' }}></i>
                  </div>
                  <h3 className="fw-bold mb-1 mb-md-2" style={{ color: '#c82333', fontSize: 'clamp(2rem, 8vw, 3rem)' }}>
                    <AnimatedCounter end={stats.totalCompanies} duration={2000}  />
                  </h3>
                  <p className="text-secondary mb-0" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)', lineHeight: '1.4' }}>
                    Companies<br />Represented
                  </p>
                </div>
              </div>

              {/* Countries Represented */}
              <div className="col-6 col-lg-3">
                <div className="stat-card p-3 p-md-4 bg-white rounded-3 shadow-sm h-100 text-center transition-all" 
                     style={{ 
                       border: '1px solid #e8e8e8',
                       transition: 'all 0.3s ease'
                     }}
                     onMouseEnter={(e) => {
                       e.currentTarget.style.transform = 'translateY(-5px)';
                       e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 71, 71, 0.15)';
                     }}
                     onMouseLeave={(e) => {
                       e.currentTarget.style.transform = 'translateY(0)';
                       e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                     }}>
                  <div className="mb-2 mb-md-3">
                    <i className="bi bi-globe" style={{ fontSize: 'clamp(2.5rem, 8vw, 3.5rem)', color: '#c82333' }}></i>
                  </div>
                  <h3 className="fw-bold mb-1 mb-md-2" style={{ color: '#c82333', fontSize: 'clamp(2rem, 8vw, 3rem)' }}>
                    <AnimatedCounter end={stats.totalCountries} duration={2000} />
                  </h3>
                  <p className="text-secondary mb-0" style={{ fontSize: 'clamp(0.75rem, 2vw, 0.95rem)', lineHeight: '1.4' }}>
                    Countries<br />Represented
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;