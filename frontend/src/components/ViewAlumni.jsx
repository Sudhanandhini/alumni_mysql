import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

const NAV = [
  { key: 'dashboard', icon: 'bi-grid-fill',   label: 'Dashboard' },
  { key: 'connect',   icon: 'bi-people-fill', label: 'Connect'   },
];

function ViewAlumni() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState('dashboard');
  const [alumni, setAlumni]               = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showFilters, setShowFilters]     = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(true);

  const [filters, setFilters] = useState({
    searchTerm: '', batch: '', department: '', status: '', location: ''
  });

  const departments = [
    'Engineering & Technology','Economics & Commerce',
    'Journalism, Media, PR & Communication','Law','Medicine',
    'Arts & Humanities','Science','Business Administration'
  ];
  const locations = [
    'Mumbai','Delhi','Bangalore','Hyderabad','Chennai',
    'Kolkata','Pune','Ahmedabad','Remote','International'
  ];
  const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

  const alumniData = (() => {
    try { return JSON.parse(localStorage.getItem('alumniData')); } catch { return null; }
  })();
  const loggedInAlumniId = alumniData?.id   || null;
  const isAlumniLoggedIn = !!localStorage.getItem('alumniToken');
  const userName = alumniData?.name || localStorage.getItem('userName') || 'User';
  const userInitials = userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    const token = localStorage.getItem('userToken') || localStorage.getItem('alumniToken');
    if (!token) { navigate('/user/login'); return; }
    fetchAlumni();
  }, []);

  useEffect(() => { applyFilters(); }, [alumni, filters]);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/alumni`);
      setAlumni(res.data);
      setFilteredAlumni(res.data);
    } catch { alert('Failed to fetch alumni data'); }
    finally { setLoading(false); }
  };

  const applyFilters = () => {
    let f = [...alumni];
    if (filters.searchTerm) {
      const s = filters.searchTerm.toLowerCase();
      f = f.filter(a =>
        a.name?.toLowerCase().includes(s) ||
        a.email?.toLowerCase().includes(s) ||
        a.designation?.toLowerCase().includes(s) ||
        a.organization_name?.toLowerCase().includes(s)
      );
    }
    if (filters.batch)      f = f.filter(a => a.batch === filters.batch);
    if (filters.department) f = f.filter(a => a.department === filters.department);
    if (filters.status)     f = f.filter(a => a.current_status === filters.status);
    if (filters.location)   f = f.filter(a => a.work_location === filters.location);
    setFilteredAlumni(f);
  };

  const handleFilterChange = e => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const resetFilters = () => setFilters({ searchTerm: '', batch: '', department: '', status: '', location: '' });

  const handleLogout = () => {
    ['userToken','userName','alumniToken','alumniData'].forEach(k => localStorage.removeItem(k));
    navigate('/user/login');
  };

  const ownAlumnus = alumni.find(a => a.id === loggedInAlumniId);

  // ── colour helpers
  const statusBg = s => {
    if (!s) return '#6b7280';
    const v = s.toLowerCase();
    if (v.includes('employ') || v.includes('work')) return '#16a34a';
    if (v.includes('study') || v.includes('student')) return '#2563eb';
    if (v.includes('self')) return '#d97706';
    return '#6b7280';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Left Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 220 : 64, flexShrink: 0, background: '#1a2744',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s', overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh'
      }}>
        {/* Logo row */}
        <div style={{ padding: '22px 16px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: 'linear-gradient(135deg,#dc3545,#8b0000)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-mortarboard-fill" style={{ color: '#fff', fontSize: 17 }}></i>
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', whiteSpace: 'nowrap' }}>Alumni Connect</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>Network Portal</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 10px' }}>
          {NAV.map(n => {
            const active = activeTab === n.key;
            return (
              <button key={n.key} onClick={() => setActiveTab(n.key)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                marginBottom: 4, background: active ? 'rgba(220,53,69,0.18)' : 'transparent',
                color: active ? '#ff6b7a' : 'rgba(255,255,255,0.65)',
                fontWeight: active ? 700 : 500, fontSize: 14,
                transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden'
              }}>
                <i className={`bi ${n.icon}`} style={{ fontSize: 18, flexShrink: 0 }}></i>
                {sidebarOpen && n.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom: user + logout */}
        <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {isAlumniLoggedIn && (
            <button onClick={() => navigate('/alumni/edit-profile')} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              marginBottom: 4, background: 'transparent',
              color: 'rgba(255,255,255,0.65)', fontWeight: 500, fontSize: 14,
              whiteSpace: 'nowrap', overflow: 'hidden'
            }}>
              <i className="bi bi-person-gear" style={{ fontSize: 18, flexShrink: 0 }}></i>
              {sidebarOpen && 'Edit Profile'}
            </button>
          )}
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,255,255,0.55)',
            fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden'
          }}>
            <i className="bi bi-box-arrow-right" style={{ fontSize: 18, flexShrink: 0 }}></i>
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          padding: '0 24px', height: 60, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', fontSize: 20, padding: 4, borderRadius: 6
            }}>
              <i className="bi bi-list"></i>
            </button>
            <h1 style={{ fontWeight: 700, fontSize: 18, color: '#1a2744', margin: 0 }}>
              {activeTab === 'dashboard' ? 'My Dashboard' : 'Connect'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2744' }}>{userName}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{isAlumniLoggedIn ? 'Alumni' : 'User'}</div>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg,#dc3545,#8b0000)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0
            }}>{userInitials}</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 28px', overflow: 'auto' }}>

          {/* ══════ DASHBOARD TAB ══════ */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Welcome banner */}
              <div style={{
                background: 'linear-gradient(135deg,#1a2744 0%,#2d4a8a 100%)',
                borderRadius: 16, padding: '28px 32px', marginBottom: 28,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 20
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 22, color: '#fff', marginBottom: 6 }}>
                    Welcome back, {userName.split(' ')[0]}! 👋
                  </div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)' }}>
                    {isAlumniLoggedIn
                      ? 'Manage your profile, connect with batchmates, and explore opportunities.'
                      : 'Browse the alumni directory and connect with your network.'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setActiveTab('connect')} style={{
                    background: '#dc3545', color: '#fff', border: 'none', borderRadius: 10,
                    padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer'
                  }}>
                    <i className="bi bi-people-fill me-2"></i>Browse Alumni
                  </button>
                  {isAlumniLoggedIn && (
                    <button onClick={() => navigate('/alumni/edit-profile')} style={{
                      background: 'rgba(255,255,255,0.12)', color: '#fff',
                      border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10,
                      padding: '10px 22px', fontWeight: 600, fontSize: 14, cursor: 'pointer'
                    }}>
                      <i className="bi bi-pencil-square me-2"></i>Edit Profile
                    </button>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16, marginBottom: 28 }}>
                {[
                  { icon: 'bi-people-fill', label: 'Total Alumni', value: alumni.length, color: '#2563eb' },
                  { icon: 'bi-briefcase-fill', label: 'Working', value: alumni.filter(a => a.current_status?.toLowerCase().includes('employ') || a.current_status?.toLowerCase().includes('work')).length, color: '#16a34a' },
                  { icon: 'bi-book-fill', label: 'Studying', value: alumni.filter(a => a.current_status?.toLowerCase().includes('stud')).length, color: '#d97706' },
                  { icon: 'bi-person-check-fill', label: 'Self-Employed', value: alumni.filter(a => a.current_status?.toLowerCase().includes('self')).length, color: '#7c3aed' },
                ].map((s, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 18 }}></i>
                      </div>
                      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{s.label}</span>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 28, color: '#1a2744' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Own profile card (alumni only) */}
              {isAlumniLoggedIn && ownAlumnus && (
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 28 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#1a2744', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="bi bi-person-badge-fill" style={{ color: '#dc3545' }}></i> Your Profile
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    {ownAlumnus.photo
                      ? <img src={`${API_BASE}${ownAlumnus.photo}`} alt={ownAlumnus.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #dc3545' }} />
                      : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#dc3545,#8b0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22 }}>
                          {ownAlumnus.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: '#1a2744' }}>{ownAlumnus.name}</div>
                      <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 6 }}>
                        {ownAlumnus.designation}{ownAlumnus.organization_name ? ` @ ${ownAlumnus.organization_name}` : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {ownAlumnus.batch && <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>Batch {ownAlumnus.batch}</span>}
                        {ownAlumnus.department && <span style={{ background: '#f0fdf4', color: '#16a34a', borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>{ownAlumnus.department}</span>}
                        {ownAlumnus.current_status && <span style={{ background: statusBg(ownAlumnus.current_status) + '18', color: statusBg(ownAlumnus.current_status), borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 600 }}>{ownAlumnus.current_status}</span>}
                      </div>
                    </div>
                    <button onClick={() => navigate('/alumni/edit-profile')} style={{
                      background: '#1a2744', color: '#fff', border: 'none',
                      borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                    }}>
                      <i className="bi bi-pencil-square me-2"></i>Edit Profile
                    </button>
                  </div>
                </div>
              )}

              {/* CTA for user-only login */}
              {!isAlumniLoggedIn && (
                <div style={{
                  background: 'linear-gradient(135deg,#fff5f5,#fff)',
                  border: '1.5px solid #fecaca', borderRadius: 14, padding: '20px 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <i className="bi bi-person-badge-fill" style={{ color: '#dc3545', fontSize: 26 }}></i>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: '#1a2744' }}>Are you an alumni?</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>Log in with your alumni credentials to view and edit your profile.</div>
                    </div>
                  </div>
                  <button onClick={() => navigate('/user/login')} style={{
                    background: '#dc3545', color: '#fff', border: 'none',
                    borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                  }}>
                    <i className="bi bi-box-arrow-in-right me-2"></i>Alumni Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════ CONNECT TAB ══════ */}
          {activeTab === 'connect' && (
            <div>
              {/* Top bar */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#1a2744' }}>Alumni Directory</div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
                    Showing <strong>{filteredAlumni.length}</strong> of <strong>{alumni.length}</strong> alumni
                  </div>
                </div>
                <button onClick={() => setShowFilters(p => !p)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: showFilters ? '#1a2744' : '#fff',
                  color: showFilters ? '#fff' : '#1a2744',
                  border: '1.5px solid #1a2744', borderRadius: 10,
                  padding: '9px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}>
                  <i className="bi bi-funnel-fill"></i>
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>
              </div>

              {/* Filter panel */}
              {showFilters && (
                <div style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', marginBottom: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
                    {/* Search */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 6 }}>Search</label>
                      <div style={{ position: 'relative' }}>
                        <i className="bi bi-search" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}></i>
                        <input type="text" name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange}
                          placeholder="Name, email, designation, company…"
                          style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, boxSizing: 'border-box', outline: 'none' }}
                          onFocus={e => e.target.style.borderColor = '#1a2744'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                    </div>
                    {/* Batch */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 6 }}>Batch Year</label>
                      <select name="batch" value={filters.batch} onChange={handleFilterChange}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', background: '#fff' }}>
                        <option value="">All Batches</option>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    {/* Department */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 6 }}>Department</label>
                      <select name="department" value={filters.department} onChange={handleFilterChange}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', background: '#fff' }}>
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    {/* Status */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 6 }}>Status</label>
                      <select name="status" value={filters.status} onChange={handleFilterChange}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', background: '#fff' }}>
                        <option value="">All Status</option>
                        <option value="Employed">Employed</option>
                        <option value="Self-Employed">Self-Employed</option>
                        <option value="Studying">Studying</option>
                      </select>
                    </div>
                    {/* Location */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, fontSize: 12, color: '#374151', marginBottom: 6 }}>Location</label>
                      <select name="location" value={filters.location} onChange={handleFilterChange}
                        style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 14, outline: 'none', background: '#fff' }}>
                        <option value="">All Locations</option>
                        {locations.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    {/* Reset */}
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                      <button onClick={resetFilters} style={{
                        width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb',
                        borderRadius: 9, fontSize: 14, background: '#fff', cursor: 'pointer',
                        fontWeight: 600, color: '#6b7280'
                      }}>
                        <i className="bi bi-arrow-clockwise me-2"></i>Reset
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div style={{ textAlign: 'center', padding: 60 }}>
                  <div className="spinner-border text-danger" style={{ width: '2.5rem', height: '2.5rem' }}></div>
                </div>
              )}

              {/* Alumni Grid */}
              {!loading && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 18 }}>
                  {filteredAlumni.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, background: '#fff', borderRadius: 14 }}>
                      <i className="bi bi-inbox" style={{ fontSize: 48, color: '#d1d5db' }}></i>
                      <p style={{ color: '#9ca3af', marginTop: 12, fontSize: 15 }}>
                        {alumni.length === 0 ? 'No alumni data available.' : 'No alumni match your filters.'}
                      </p>
                    </div>
                  ) : (
                    filteredAlumni.map(a => {
                      const isOwn = loggedInAlumniId && a.id === loggedInAlumniId;
                      return (
                        <div key={a.id} onClick={() => setSelectedAlumni(a)}
                          style={{
                            background: '#fff', borderRadius: 14, overflow: 'hidden',
                            boxShadow: isOwn ? '0 0 0 2px #dc3545, 0 4px 16px rgba(220,53,69,0.15)' : '0 1px 4px rgba(0,0,0,0.07)',
                            cursor: 'pointer', transition: 'box-shadow 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = isOwn ? '0 0 0 2px #dc3545,0 8px 24px rgba(220,53,69,0.2)' : '0 4px 16px rgba(0,0,0,0.13)'}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = isOwn ? '0 0 0 2px #dc3545,0 4px 16px rgba(220,53,69,0.15)' : '0 1px 4px rgba(0,0,0,0.07)'}
                        >
                          {isOwn && (
                            <div style={{ background: '#dc3545', color: '#fff', textAlign: 'center', padding: '4px 0', fontSize: 12, fontWeight: 700 }}>
                              <i className="bi bi-person-check-fill me-1"></i>Your Profile
                            </div>
                          )}
                          {/* Cover strip */}
                          <div style={{ height: 56, background: 'linear-gradient(135deg,#1a2744,#2d4a8a)' }}></div>
                          {/* Photo */}
                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: -28 }}>
                            {a.photo
                              ? <img src={`${API_BASE}${a.photo}`} alt={a.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', background: '#fff' }} />
                              : <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid #fff', background: 'linear-gradient(135deg,#dc3545,#8b0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>
                                  {a.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                            }
                          </div>
                          {/* Info */}
                          <div style={{ padding: '10px 16px 16px', textAlign: 'center' }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a2744', marginBottom: 3 }}>{a.name}</div>
                            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, minHeight: 32 }}>
                              {a.designation && <span>{a.designation}</span>}
                              {a.designation && a.organization_name && <span style={{ color: '#d1d5db' }}> · </span>}
                              {a.organization_name && <span>{a.organization_name}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
                              {a.batch && <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{a.batch}</span>}
                              {a.current_status && <span style={{ background: statusBg(a.current_status) + '18', color: statusBg(a.current_status), borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 600 }}>{a.current_status}</span>}
                            </div>
                            {isOwn && (
                              <button onClick={e => { e.stopPropagation(); navigate('/alumni/edit-profile'); }} style={{
                                width: '100%', background: '#1a2744', color: '#fff', border: 'none',
                                borderRadius: 8, padding: '7px 0', fontWeight: 700, fontSize: 12, cursor: 'pointer'
                              }}>
                                <i className="bi bi-pencil-square me-1"></i>Edit My Profile
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ── Alumni Detail Modal ── */}
      {selectedAlumni && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={() => setSelectedAlumni(null)}>
          <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 640, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
            onClick={e => e.stopPropagation()}>
            {/* Header strip */}
            <div style={{ height: 90, background: 'linear-gradient(135deg,#1a2744,#2d4a8a)', borderRadius: '18px 18px 0 0', position: 'relative' }}>
              <button onClick={() => setSelectedAlumni(null)} style={{
                position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.15)',
                border: 'none', borderRadius: '50%', width: 34, height: 34,
                color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}><i className="bi bi-x"></i></button>
            </div>
            <div style={{ padding: '0 28px 28px' }}>
              {/* Photo */}
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
                {selectedAlumni.photo
                  ? <img src={`${API_BASE}${selectedAlumni.photo}`} alt={selectedAlumni.name} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }} />
                  : <div style={{ width: 88, height: 88, borderRadius: '50%', border: '4px solid #fff', background: 'linear-gradient(135deg,#dc3545,#8b0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 28, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                      {selectedAlumni.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                }
              </div>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#1a2744', marginBottom: 4 }}>{selectedAlumni.name}</div>
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 14 }}>
                {selectedAlumni.designation}{selectedAlumni.organization_name ? ` @ ${selectedAlumni.organization_name}` : ''}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
                {selectedAlumni.batch && <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 600 }}>Batch {selectedAlumni.batch}</span>}
                {selectedAlumni.current_status && <span style={{ background: statusBg(selectedAlumni.current_status) + '18', color: statusBg(selectedAlumni.current_status), borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 600 }}>{selectedAlumni.current_status}</span>}
                {selectedAlumni.department && <span style={{ background: '#f9fafb', color: '#374151', borderRadius: 20, padding: '4px 14px', fontSize: 13, fontWeight: 600, border: '1px solid #e5e7eb' }}>{selectedAlumni.department}</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {[
                  { label: 'Email', value: selectedAlumni.email, href: `mailto:${selectedAlumni.email}` },
                  { label: 'Phone', value: selectedAlumni.phone },
                  { label: 'Location', value: selectedAlumni.work_location || selectedAlumni.address },
                  { label: 'Experience', value: selectedAlumni.experience_years != null ? `${selectedAlumni.experience_years} yrs` : null },
                  { label: 'Skills', value: selectedAlumni.skills, full: true },
                  { label: 'Bio', value: selectedAlumni.bio, full: true },
                ].filter(r => r.value).map((r, i) => (
                  <div key={i} style={{ gridColumn: r.full ? '1/-1' : 'auto', background: '#f9fafb', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.label}</div>
                    {r.href
                      ? <a href={r.href} style={{ fontSize: 14, color: '#2563eb', fontWeight: 600 }}>{r.value}</a>
                      : <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{r.value}</div>
                    }
                  </div>
                ))}
                {selectedAlumni.linkedin && (
                  <div style={{ gridColumn: '1/-1', background: '#f9fafb', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>LinkedIn</div>
                    <a href={selectedAlumni.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#0a66c2', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="bi bi-linkedin"></i> View LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewAlumni;
