import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';


const API_URL = 'http://localhost:5000/api';

function Home() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(false);

  const carouselSettings = {
    dots: true,
    infinite: alumni.length > 4,
    speed: 500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
    centerMode: false,
    responsive: [
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: alumni.length > 3,
        }
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          infinite: alumni.length > 2,
        }
      },
      {
        breakpoint: 576,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: alumni.length > 1,
          centerMode: true,
          centerPadding: '20px',
        }
      }
    ]
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/alumni`);
      setAlumni(response.data);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
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
          <p className="lead fs-4 mb-4">
            Meet our successful alumni who are making a difference in the world
          </p>
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
                  <div key={alumnus.id} className="carousel-item-wrapper">
                    <div className="alumni-card-uniform shadow-lg">
                      <div className="card-body-uniform">
                        {/* Status Badge */}
                        {alumnus.current_status && (
                          <span className={`status-badge-top ${
                            alumnus.current_status === 'Employed' ? 'bg-success' :
                            alumnus.current_status === 'Self-Employed' ? 'bg-primary' : 'bg-info'
                          }`}>
                            {alumnus.current_status}
                          </span>
                        )}

                        {/* Alumni Photo */}
                        <div className="alumni-photo-wrapper">
                          <img
                            src={alumnus.photo ? `http://localhost:5000${alumnus.photo}` : 'https://via.placeholder.com/150'}
                            alt={alumnus.name}
                            className="alumni-photo"
                          />
                        </div>

                        {/* Alumni Name */}
                        <h5 className="alumni-name">{alumnus.name}</h5>
                        
                        {/* Alumni Details */}
                        <div className="alumni-info">
                          {alumnus.designation && (
                            <div className="info-item">
                              <i className="bi bi-briefcase-fill"></i>
                              <span>{alumnus.designation}</span>
                            </div>
                          )}
                          
                          {alumnus.organization_name && (
                            <div className="info-item">
                              <i className="bi bi-building-fill"></i>
                              <span>{alumnus.organization_name}</span>
                            </div>
                          )}

                          {alumnus.institution && (
                            <div className="info-item">
                              <i className="bi bi-mortarboard-fill"></i>
                              <span>{alumnus.institution} ({alumnus.batch})</span>
                            </div>
                          )}
                          
                          {alumnus.department && (
                            <div className="info-item">
                              <i className="bi bi-book-fill"></i>
                              <span>{alumnus.department}</span>
                            </div>
                          )}
                          
                          {alumnus.work_location && (
                            <div className="info-item">
                              <i className="bi bi-geo-alt-fill"></i>
                              <span>{alumnus.work_location}</span>
                            </div>
                          )}
                          
                          {alumnus.experience_years && (
                            <div className="info-item">
                              <i className="bi bi-award-fill"></i>
                              <span>{alumnus.experience_years} years experience</span>
                            </div>
                          )}
                        </div>

                        {/* LinkedIn Button */}
                        {alumnus.linkedin && (
                          <a 
                            href={alumnus.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="linkedin-btn"
                          >
                            <i className="bi bi-linkedin me-2"></i>
                            Connect on LinkedIn
                          </a>
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
                  <i className="bi bi-people-fill text-danger display-4 mb-3"></i>
                  <h3 className="fw-bold">{alumni.length}</h3>
                  <p className="text-muted mb-0">Total Alumni</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card p-4 bg-white rounded shadow-sm h-100">
                  <i className="bi bi-briefcase-fill text-success display-4 mb-3"></i>
                  <h3 className="fw-bold">
                    {alumni.filter(a => a.current_status === 'Employed').length}
                  </h3>
                  <p className="text-muted mb-0">Employed</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card p-4 bg-white rounded shadow-sm h-100">
                  <i className="bi bi-laptop-fill text-primary display-4 mb-3"></i>
                  <h3 className="fw-bold">
                    {alumni.filter(a => a.current_status === 'Self-Employed').length}
                  </h3>
                  <p className="text-muted mb-0">Self-Employed</p>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="stat-card p-4 bg-white rounded shadow-sm h-100">
                  <i className="bi bi-book-fill text-info display-4 mb-3"></i>
                  <h3 className="fw-bold">
                    {alumni.filter(a => a.current_status === 'Studying').length}
                  </h3>
                  <p className="text-muted mb-0">Studying</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {/* <footer className="bg-dark text-white py-4 mt-5">
        <div className="container text-center">
          <p className="mb-0">
            <i className="bi bi-mortarboard-fill me-2"></i>
            © 2025 Alumni Portal. All Rights Reserved.
          </p>
        </div>
      </footer> */}
    </div>
  );
}

export default Home;