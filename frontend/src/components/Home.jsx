// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

/**
 * API URL detection:
 * - Vite: import.meta.env.VITE_API_URL
 * - CRA: process.env.REACT_APP_API_URL (only available if built with CRA)
 * - fallback: http://localhost:5000/api
 */
// const API_URL =
//   (typeof import !== 'undefined' &&
//     typeof import.meta !== 'undefined' &&
//     import.meta.env &&
//     import.meta.env.VITE_API_URL) ||
//   (typeof process !== 'undefined' && process.env && process.env.REACT_APP_API_URL) ||
//   'http://localhost:5000/api';

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Build API_BASE for static files. Ensure it has protocol and no trailing /api.
 * Examples:
 *  - API_URL = "http://localhost:5000/api" => API_BASE = "http://localhost:5000"
 *  - API_URL = "http://localhost:5000"     => API_BASE = "http://localhost:5000"
 */
const API_BASE = (() => {
  try {
    const tmp = API_URL.replace(/\/api\/?$/, '');
    // If the result doesn't contain http/https, assume same host as frontend (rare)
    return tmp.startsWith('http') ? tmp : `http://${tmp}`;
  } catch {
    return 'http://localhost:5000';
  }
})();

function Home() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // Show the most useful info for debugging
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

  // slidesToShow logic (never ask for more slides than available)
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
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: slidesToShowXL,
          slidesToScroll: 1,
          infinite: alumni.length > slidesToShowXL,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: slidesToShowMD,
          slidesToScroll: 1,
          infinite: alumni.length > slidesToShowMD,
        },
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: slidesToShowSM,
          slidesToScroll: 1,
          infinite: alumni.length > slidesToShowSM,
          centerMode: true,
          centerPadding: '20px',
        },
      },
    ],
  };

  const buildPhotoUrl = (photoPath) => {
    if (!photoPath) return 'https://via.placeholder.com/150';
    // photoPath may already start with http(s) or with a leading slash like "/uploads/..."
    if (/^https?:\/\//i.test(photoPath)) return photoPath;
    if (photoPath.startsWith('/')) return `${API_BASE}${photoPath}`;
    return `${API_BASE}/${photoPath}`;
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section bg-gradient-danger text-white py-5">
        <div className="container text-center">
          <h1 className="display-3 fw-bold mb-3 animate-fade-in">
            <i className="bi bi-stars me-3"></i>
            Our Distinguished Alumni
            <i className="bi bi-stars ms-3"></i>
          </h1>
          <p className="lead fs-4 mb-4">Meet our successful alumni who are making a difference in the world</p>
          <div className="mt-4">
            <span className="badge bg-light text-danger fs-5 px-4 py-3">
              <i className="bi bi-people-fill me-2"></i>
              {alumni.length} Alumni Network
            </span>
          </div>
        </div>
      </div>

      {/* Alumni Carousel */}
      <div className="carousel-section py-5">
        <div className="container-fluid px-lg-5">
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
                  <div key={alumnus.id} className="carousel-item-wrapper px-2">
                    <div className="alumni-card-uniform shadow-lg" style={{ position: 'relative' }}>
                      <div className="card-body-uniform p-4">
                        {/* Status Badge */}
                        {alumnus.current_status && (
                          <span
                            className={`status-badge-top ${
                              alumnus.current_status === 'Employed'
                                ? 'bg-success'
                                : alumnus.current_status === 'Self-Employed'
                                ? 'bg-primary'
                                : 'bg-info'
                            }`}
                            style={{ position: 'absolute', right: 12, top: 12, padding: '6px 10px', borderRadius: 6, color: '#fff' }}
                          >
                            {alumnus.current_status}
                          </span>
                        )}

                        {/* Alumni Photo */}
                        <div className="alumni-photo-wrapper d-flex justify-content-center mb-3">
                          <img
                            src={buildPhotoUrl(alumnus.photo)}
                            alt={alumnus.name || 'Alumnus'}
                            className="alumni-photo rounded-circle"
                            style={{ width: 140, height: 140, objectFit: 'cover' }}
                          />
                        </div>

                        {/* Alumni Name */}
                        <h5 className="alumni-name text-center mb-1">{alumnus.name || '—'}</h5>

                        {/* Alumni Details */}
                        <div className="alumni-info text-center small text-muted mb-3">
                          {alumnus.designation && (
                            <div className="info-item">
                              <i className="bi bi-briefcase-fill me-1" />
                              <span>{alumnus.designation}</span>
                            </div>
                          )}

                          {alumnus.organization_name && (
                            <div className="info-item">
                              <i className="bi bi-building-fill me-1" />
                              <span>{alumnus.organization_name}</span>
                            </div>
                          )}

                          {alumnus.institution && (
                            <div className="info-item">
                              <i className="bi bi-mortarboard-fill me-1" />
                              <span>
                                {alumnus.institution}
                                {alumnus.batch ? ` (${alumnus.batch})` : ''}
                              </span>
                            </div>
                          )}

                          {alumnus.department && (
                            <div className="info-item">
                              <i className="bi bi-book-fill me-1" />
                              <span>{alumnus.department}</span>
                            </div>
                          )}

                          {alumnus.work_location && (
                            <div className="info-item">
                              <i className="bi bi-geo-alt-fill me-1" />
                              <span>{alumnus.work_location}</span>
                            </div>
                          )}

                          {alumnus.experience_years && (
                            <div className="info-item">
                              <i className="bi bi-award-fill me-1" />
                              <span>{alumnus.experience_years} years</span>
                            </div>
                          )}
                        </div>

                        {/* LinkedIn Button */}
                        {alumnus.linkedin && (
                          <div className="d-flex justify-content-center">
                            <a href={alumnus.linkedin} target="_blank" rel="noopener noreferrer" className="linkedin-btn btn btn-outline-primary btn-sm">
                              <i className="bi bi-linkedin me-2" />
                              Connect
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

      {/* Stats Section */}
      {alumni.length > 0 && (
        <div className="bg-light py-5">
          <div className="container">
            <h2 className="text-center fw-bold mb-5">Alumni Statistics</h2>
            <div className="row text-center g-4">
              <div className="col-6 col-md-3">
                <div className="stat-card p-4 bg-white rounded shadow-sm h-100">
                  <i className="bi bi-people-fill text-danger display-4 mb-3" />
                  <h3 className="fw-bold">{alumni.length}</h3>
                  <p className="text-muted mb-0">Total Alumni</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card p-4 bg-white rounded shadow-sm h-100">
                  <i className="bi bi-briefcase-fill text-success display-4 mb-3" />
                  <h3 className="fw-bold">{alumni.filter((a) => a.current_status === 'Employed').length}</h3>
                  <p className="text-muted mb-0">Employed</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card p-4 bg-white rounded shadow-sm h-100">
                  <i className="bi bi-laptop-fill text-primary display-4 mb-3" />
                  <h3 className="fw-bold">{alumni.filter((a) => a.current_status === 'Self-Employed').length}</h3>
                  <p className="text-muted mb-0">Self-Employed</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card p-4 bg-white rounded shadow-sm h-100">
                  <i className="bi bi-book-fill text-info display-4 mb-3" />
                  <h3 className="fw-bold">{alumni.filter((a) => a.current_status === 'Studying').length}</h3>
                  <p className="text-muted mb-0">Studying</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
