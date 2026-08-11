import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

const NAV = [
  { key: 'dashboard', icon: 'bi-grid-fill',           label: 'Dashboard' },
  { key: 'events',    icon: 'bi-calendar-event-fill', label: 'Events'    },
  { key: 'connect',   icon: 'bi-people-fill',         label: 'Connect'   },
];

const EVT_CAT_COLORS = {
  reunion:      { bg: '#ede9fe', text: '#7c3aed' },
  webinar:      { bg: '#e0f2fe', text: '#0891b2' },
  hackathon:    { bg: '#dcfce7', text: '#16a34a' },
  campus_event: { bg: '#fff7ed', text: '#c2410c' },
  other:        { bg: '#f3f4f6', text: '#6b7280' },
};
const EVT_TABS = [
  { value: 'all', label: 'All' },
  { value: 'reunion', label: 'Reunions' },
  { value: 'webinar', label: 'Webinars' },
  { value: 'hackathon', label: 'Hackathons' },
  { value: 'campus_event', label: 'Campus Events' },
  { value: 'other', label: 'Other' },
];
const evtCatLabel = v => EVT_TABS.find(t => t.value === v)?.label || v;
const evtCatColor = v => EVT_CAT_COLORS[v] || EVT_CAT_COLORS.other;

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

function ViewAlumni() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState('dashboard');
  const [alumni, setAlumni]               = useState([]);
  const [filteredAlumni, setFilteredAlumni] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showFilters, setShowFilters]     = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [events, setEvents]               = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [activeEvtTab, setActiveEvtTab]   = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [referralLink, setReferralLink]     = useState('');
  const [referralLoading, setReferralLoading] = useState(false);
  const [myReferrals, setMyReferrals]       = useState([]);
  const [referralsLoading, setReferralsLoading] = useState(false);
  const [referralActionId, setReferralActionId] = useState(null);
  const [copied, setCopied]                 = useState(false);

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
    axios.get(`${API_URL}/events`)
      .then(r => setEvents(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setEventsLoading(false));
    if (localStorage.getItem('alumniToken')) {
      fetchReferralLink();
      fetchMyReferrals();
    }
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

  const fetchReferralLink = async () => {
    const token = localStorage.getItem('alumniToken');
    if (!token) return;
    try {
      setReferralLoading(true);
      const res = await axios.get(`${API_URL}/alumni/me/referral-link`, { headers: { Authorization: `Bearer ${token}` } });
      setReferralLink(res.data.link || '');
    } catch { /* silently ignore */ }
    finally { setReferralLoading(false); }
  };

  const fetchMyReferrals = async () => {
    const token = localStorage.getItem('alumniToken');
    if (!token) return;
    try {
      setReferralsLoading(true);
      const res = await axios.get(`${API_URL}/alumni/me/referrals`, { headers: { Authorization: `Bearer ${token}` } });
      setMyReferrals(Array.isArray(res.data) ? res.data : []);
    } catch { /* silently ignore */ }
    finally { setReferralsLoading(false); }
  };

  const copyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleReferralApprove = async (id) => {
    const token = localStorage.getItem('alumniToken');
    setReferralActionId(id);
    try {
      await axios.put(`${API_URL}/alumni/me/referrals/${id}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMyReferrals(prev => prev.map(r => r.id === id ? { ...r, approval_status: 'approved' } : r));
    } catch { alert('Failed to approve this referral.'); }
    finally { setReferralActionId(null); }
  };

  const handleReferralReject = async (id) => {
    if (!window.confirm('Reject this referral?')) return;
    const token = localStorage.getItem('alumniToken');
    setReferralActionId(id);
    try {
      await axios.put(`${API_URL}/alumni/me/referrals/${id}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setMyReferrals(prev => prev.map(r => r.id === id ? { ...r, approval_status: 'rejected' } : r));
    } catch { alert('Failed to reject this referral.'); }
    finally { setReferralActionId(null); }
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

  const statusBg = s => {
    if (!s) return '#6b7280';
    const v = s.toLowerCase();
    if (v.includes('employ') || v.includes('work')) return '#16a34a';
    if (v.includes('study') || v.includes('student')) return '#2563eb';
    if (v.includes('self')) return '#d97706';
    return '#6b7280';
  };

  const statusStyle = s => {
    if (s === 'Employed')      return { bg: '#dcfce7', text: '#16a34a' };
    if (s === 'Self-Employed') return { bg: '#ede9fe', text: '#7c3aed' };
    if (s === 'Studying')      return { bg: '#e0f2fe', text: '#0891b2' };
    return { bg: '#f3f4f6', text: '#6b7280' };
  };

  const maskEmail = e => {
    if (!e) return '';
    const [local, domain] = e.split('@');
    if (!domain) return e;
    return `${local.slice(0, 3)}***@${domain}`;
  };

  const maskPhone = p => {
    if (!p) return '';
    const digits = p.replace(/\D/g, '');
    if (digits.length < 5) return p;
    return `${digits.slice(0, 2)}${'*'.repeat(digits.length - 4)}${digits.slice(-2)}`;
  };

  const toggleContactPrivacy = async (newVal) => {
    const token = localStorage.getItem('alumniToken');
    if (!token) return;
    try {
      await axios.put(`${API_URL}/alumni/me/privacy`, { show_contact: newVal }, { headers: { Authorization: `Bearer ${token}` } });
      setAlumni(prev => prev.map(a => a.id === loggedInAlumniId ? { ...a, show_contact: newVal ? 1 : 0 } : a));
    } catch { alert('Failed to update privacy setting'); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Poppins, sans-serif' }}>

      {/* ── Left Sidebar ── */}
      <aside style={{
        width: sidebarOpen ? 220 : 64, flexShrink: 0, background: 'var(--color-secondary)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s', overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh'
      }}>
        {/* Logo row */}
        <div style={{ padding: '22px 16px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              <button key={n.key} onClick={() => { setActiveTab(n.key); setSelectedEvent(null); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                marginBottom: 4, background: active ? 'rgba(25,127,230,0.18)' : 'transparent',
                color: active ? '#93c5fd' : 'rgba(255,255,255,0.65)',
                fontWeight: active ? 700 : 500, fontSize: 14,
                transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden'
              }}>
                <i className={`bi ${n.icon}`} style={{ fontSize: 18, flexShrink: 0 }}></i>
                {sidebarOpen && n.label}
              </button>
            );
          })}
          {isAlumniLoggedIn && (() => {
            const active = activeTab === 'refer';
            const pendingCount = myReferrals.filter(r => r.approval_status === 'pending').length;
            return (
              <button onClick={() => { setActiveTab('refer'); setSelectedEvent(null); }} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                marginBottom: 4, background: active ? 'rgba(25,127,230,0.18)' : 'transparent',
                color: active ? '#93c5fd' : 'rgba(255,255,255,0.65)',
                fontWeight: active ? 700 : 500, fontSize: 14,
                transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden'
              }}>
                <i className="bi bi-share-fill" style={{ fontSize: 18, flexShrink: 0 }}></i>
                {sidebarOpen && <span style={{ flex: 1, textAlign: 'left' }}>Refer Friend</span>}
                {sidebarOpen && pendingCount > 0 && (
                  <span style={{ background: '#d97706', color: '#fff', borderRadius: 20, padding: '1px 7px', fontSize: 10, fontWeight: 700 }}>{pendingCount}</span>
                )}
              </button>
            );
          })()}
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
            <h1 style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-secondary)', margin: 0 }}>
              {activeTab === 'dashboard' ? 'My Dashboard' : activeTab === 'events' ? 'Events' : activeTab === 'refer' ? 'Refer Friend' : 'Connect'}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-secondary)' }}>{userName}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{isAlumniLoggedIn ? 'Alumni' : 'User'}</div>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))',
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
                background: 'linear-gradient(135deg,var(--color-primary) 0%,var(--color-primary-dark) 100%)',
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
                    background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10,
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
                    <div style={{ fontWeight: 800, fontSize: 28, color: 'var(--color-secondary)' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Own profile card (alumni only) */}
              {isAlumniLoggedIn && ownAlumnus && (
                <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 28 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-secondary)', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="bi bi-person-badge-fill" style={{ color: 'var(--color-primary)' }}></i> Your Profile
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
                    {ownAlumnus.photo
                      ? <img src={`${API_BASE}${ownAlumnus.photo}`} alt={ownAlumnus.name} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-primary)' }} />
                      : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 22 }}>
                          {ownAlumnus.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-secondary)' }}>{ownAlumnus.name}</div>
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
                      background: 'var(--color-primary)', color: '#fff', border: 'none',
                      borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                    }}>
                      <i className="bi bi-pencil-square me-2"></i>Edit Profile
                    </button>
                  </div>

                  {/* Privacy toggle */}
                  <div style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-secondary)', marginBottom: 3 }}>
                        <i className="bi bi-shield-lock-fill" style={{ color: 'var(--color-primary)', marginRight: 6 }}></i>
                        Contact Visibility
                      </div>
                      <div style={{ fontSize: 12, color: '#9ca3af' }}>
                        {ownAlumnus.show_contact ? 'Others can see your full email & phone.' : 'Your email & phone are hidden from others.'}
                      </div>
                    </div>
                    <div onClick={() => toggleContactPrivacy(!ownAlumnus.show_contact)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none'
                    }}>
                      <div style={{
                        width: 46, height: 26, borderRadius: 13,
                        background: ownAlumnus.show_contact ? 'var(--color-primary)' : '#d1d5db',
                        position: 'relative', transition: 'background 0.2s', flexShrink: 0
                      }}>
                        <div style={{
                          position: 'absolute', top: 3, left: ownAlumnus.show_contact ? 23 : 3,
                          width: 20, height: 20, borderRadius: '50%', background: '#fff',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s'
                        }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: ownAlumnus.show_contact ? 'var(--color-primary)' : '#6b7280' }}>
                        {ownAlumnus.show_contact ? 'Visible' : 'Hidden'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA for user-only login */}
              {!isAlumniLoggedIn && (
                <div style={{
                  background: 'linear-gradient(135deg,#eff6ff,#fff)',
                  border: '1.5px solid #bfdbfe', borderRadius: 14, padding: '20px 24px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14,
                  marginBottom: 28
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <i className="bi bi-person-badge-fill" style={{ color: 'var(--color-primary)', fontSize: 26 }}></i>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-secondary)' }}>Are you an alumni?</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>Log in with your alumni credentials to view and edit your profile.</div>
                    </div>
                  </div>
                  <button onClick={() => navigate('/user/login')} style={{
                    background: 'var(--color-primary)', color: '#fff', border: 'none',
                    borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                  }}>
                    <i className="bi bi-box-arrow-in-right me-2"></i>Alumni Sign In
                  </button>
                </div>
              )}

              {/* Events — compact preview on dashboard */}
              <div style={{ background: '#fff', borderRadius: 16, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="bi bi-calendar-event-fill" style={{ color: 'var(--color-primary)' }}></i> Upcoming Events
                  </div>
                  {events.length > 0 && (
                    <button onClick={() => setActiveTab('events')} style={{ background: 'none', border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      View All
                    </button>
                  )}
                </div>
                {eventsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div className="spinner-border" style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary)' }}></div>
                  </div>
                ) : events.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af' }}>
                    <i className="bi bi-calendar-x" style={{ fontSize: 30 }}></i>
                    <p style={{ marginTop: 8, fontSize: 13 }}>No events published yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {sortEvents(events).slice(0, 3).map(ev => {
                      const cc = evtCatColor(ev.category);
                      return (
                        <div key={ev.id} onClick={() => { setSelectedEvent(ev); setActiveTab('events'); }}
                          style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '10px 12px', borderRadius: 10, border: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                          {ev.image
                            ? <img src={`${API_BASE}${ev.image}`} alt={ev.title} style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                            : <div style={{ width: 52, height: 40, borderRadius: 8, background: 'linear-gradient(135deg,#eef4ff,#ddeaff)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className="bi bi-calendar-event-fill" style={{ fontSize: 18, color: 'rgba(25,127,230,0.35)' }}></i>
                              </div>
                          }
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                            <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ background: cc.bg, color: cc.text, borderRadius: 20, padding: '1px 8px', fontSize: 10, fontWeight: 700 }}>{evtCatLabel(ev.category)}</span>
                              {ev.event_date && <span style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                            </div>
                          </div>
                          <i className="bi bi-chevron-right" style={{ color: '#d1d5db', fontSize: 13, flexShrink: 0 }}></i>
                        </div>
                      );
                    })}
                    {events.length > 3 && (
                      <button onClick={() => setActiveTab('events')} style={{ background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: 10, padding: '9px', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>
                        +{events.length - 3} more events →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════ EVENTS TAB ══════ */}
          {activeTab === 'events' && (
            <div>
              {selectedEvent ? (
                /* ── Event Detail View ── */
                <div>
                  {/* Back button */}
                  <button onClick={() => setSelectedEvent(null)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-primary)', fontWeight: 700, fontSize: 14, marginBottom: 24, padding: 0
                  }}>
                    <i className="bi bi-arrow-left"></i> All Events
                  </button>

                  <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    {/* Hero image */}
                    {selectedEvent.image ? (
                      <img src={`${API_BASE}${selectedEvent.image}`} alt={selectedEvent.title}
                        style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <div style={{ height: 200, background: 'linear-gradient(135deg,#eef4ff,#ddeaff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="bi bi-calendar-event-fill" style={{ fontSize: 72, color: 'rgba(25,127,230,0.18)' }}></i>
                      </div>
                    )}

                    <div style={{ padding: '32px 40px' }}>
                      {/* Category + past badge */}
                      {(() => {
                        const cc = evtCatColor(selectedEvent.category);
                        const isPast = selectedEvent.event_date && new Date(selectedEvent.event_date) < new Date();
                        return (
                          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                            <span style={{ background: cc.bg, color: cc.text, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>
                              {evtCatLabel(selectedEvent.category)}
                            </span>
                            {isPast && <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600 }}>Past Event</span>}
                          </div>
                        );
                      })()}

                      {/* Title */}
                      <h1 style={{ fontWeight: 900, fontSize: '1.7rem', color: '#111827', marginBottom: 24, lineHeight: 1.2 }}>
                        {selectedEvent.title}
                      </h1>

                      {/* Meta row */}
                      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 32, padding: '20px 24px', background: '#f9fafb', borderRadius: 14 }}>
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
                          <h3 style={{ fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 14 }}>About this Event</h3>
                          <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                            {selectedEvent.description}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── Events List View ── */
                <div>
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontWeight: 800, fontSize: '1.3rem', color: '#111827', marginBottom: 4 }}>All Events</h2>
                    <p style={{ color: '#6b7280', fontSize: 13 }}>{events.length} event{events.length !== 1 ? 's' : ''} published</p>
                  </div>

                  {/* Category filter tabs */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                    {EVT_TABS.map(t => (
                      <button key={t.value} onClick={() => setActiveEvtTab(t.value)} style={{
                        padding: '7px 18px', borderRadius: 24, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                        background: activeEvtTab === t.value ? 'var(--color-primary)' : '#fff',
                        color:      activeEvtTab === t.value ? '#fff' : '#374151',
                        boxShadow:  activeEvtTab === t.value ? '0 2px 8px rgba(25,127,230,0.25)' : '0 1px 3px rgba(0,0,0,0.07)',
                        transition: 'all 0.15s'
                      }}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {eventsLoading ? (
                    <div style={{ textAlign: 'center', padding: 60 }}>
                      <div className="spinner-border" style={{ width: '2rem', height: '2rem', color: 'var(--color-primary)' }}></div>
                    </div>
                  ) : (() => {
                    const filtered = sortEvents(activeEvtTab === 'all' ? events : events.filter(e => e.category === activeEvtTab));
                    if (filtered.length === 0) return (
                      <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                        <i className="bi bi-calendar-x" style={{ fontSize: 48 }}></i>
                        <p style={{ marginTop: 14, fontWeight: 500 }}>No events in this category.</p>
                      </div>
                    );
                    return (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
                        {filtered.map(ev => {
                          const cc = evtCatColor(ev.category);
                          const isPast = ev.event_date && new Date(ev.event_date) < new Date();
                          return (
                            <div key={ev.id} onClick={() => setSelectedEvent(ev)} style={{
                              background: '#fff', borderRadius: 16, overflow: 'hidden',
                              boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #e5e7eb',
                              cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column'
                            }}
                              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.13)'; }}
                              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.07)'; }}
                            >
                              {ev.image ? (
                                <div style={{ height: 160, overflow: 'hidden' }}>
                                  <img src={`${API_BASE}${ev.image}`} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                </div>
                              ) : (
                                <div style={{ height: 160, background: 'linear-gradient(135deg,#eef4ff,#ddeaff)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <i className="bi bi-calendar-event-fill" style={{ fontSize: 52, color: 'rgba(25,127,230,0.2)' }}></i>
                                </div>
                              )}
                              <div style={{ padding: '18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                                  <span style={{ background: cc.bg, color: cc.text, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700 }}>{evtCatLabel(ev.category)}</span>
                                  {isPast && <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>Past Event</span>}
                                </div>
                                <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#111827', marginBottom: 8, lineHeight: 1.35 }}>{ev.title}</h3>
                                {ev.description && (
                                  <p style={{ fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.6, marginBottom: 12, flex: 1,
                                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {ev.description}
                                  </p>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 'auto' }}>
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
                                </div>
                                <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-primary)', fontSize: 13, fontWeight: 700 }}>
                                  View Details <i className="bi bi-arrow-right"></i>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
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
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-secondary)' }}>Alumni Directory</div>
                  <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
                    Showing <strong>{filteredAlumni.length}</strong> of <strong>{alumni.length}</strong> alumni
                  </div>
                </div>
                <button onClick={() => setShowFilters(p => !p)} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: showFilters ? 'var(--color-primary)' : '#fff',
                  color: showFilters ? '#fff' : 'var(--color-primary)',
                  border: '1.5px solid var(--color-primary)', borderRadius: 10,
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
                          onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
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
                  <div className="spinner-border text-primary" style={{ width: '2.5rem', height: '2.5rem' }}></div>
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
                            boxShadow: isOwn ? '0 0 0 2px var(--color-primary), 0 4px 16px rgba(25,127,230,0.15)' : '0 1px 4px rgba(0,0,0,0.07)',
                            cursor: 'pointer', transition: 'box-shadow 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = isOwn ? '0 0 0 2px var(--color-primary),0 8px 24px rgba(25,127,230,0.2)' : '0 4px 16px rgba(0,0,0,0.13)'}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = isOwn ? '0 0 0 2px var(--color-primary),0 4px 16px rgba(25,127,230,0.15)' : '0 1px 4px rgba(0,0,0,0.07)'}
                        >
                          {isOwn && (
                            <div style={{ background: 'var(--color-primary)', color: '#fff', textAlign: 'center', padding: '4px 0', fontSize: 12, fontWeight: 700 }}>
                              <i className="bi bi-person-check-fill me-1"></i>Your Profile
                            </div>
                          )}
                          {/* Cover strip */}
                          <div style={{ height: 56, background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))' }}></div>
                          {/* Photo */}
                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: -28 }}>
                            {a.photo
                              ? <img src={`${API_BASE}${a.photo}`} alt={a.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', background: '#fff' }} />
                              : <div style={{ width: 56, height: 56, borderRadius: '50%', border: '3px solid #fff', background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18 }}>
                                  {a.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                            }
                          </div>
                          {/* Info */}
                          <div style={{ padding: '10px 16px 16px', textAlign: 'center' }}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-secondary)', marginBottom: 3 }}>{a.name}</div>
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
                                width: '100%', background: 'var(--color-primary)', color: '#fff', border: 'none',
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

          {/* ══════ REFER FRIEND TAB ══════ */}
          {activeTab === 'refer' && isAlumniLoggedIn && (
            <div>
              {/* Referral link card */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-secondary)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-share-fill" style={{ color: 'var(--color-primary)' }}></i> Your Referral Link
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                  Share this link with a friend. When they register, it goes to admin for approval — you'll see it here too and can approve or reject it yourself.
                </div>
                {referralLoading ? (
                  <div style={{ padding: '10px 0' }}>
                    <div className="spinner-border" style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary)' }}></div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <input readOnly value={referralLink} onClick={e => e.target.select()}
                      style={{ flex: '1 1 260px', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#374151', background: '#f9fafb', outline: 'none' }} />
                    <button onClick={copyReferralLink} style={{
                      background: copied ? '#16a34a' : 'var(--color-primary)', color: '#fff', border: 'none',
                      borderRadius: 10, padding: '11px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap'
                    }}>
                      <i className={`bi ${copied ? 'bi-check-lg' : 'bi-clipboard-fill'}`}></i>
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                    <a href={`https://wa.me/?text=${encodeURIComponent('Join our alumni network! ' + referralLink)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{
                        background: '#16a34a18', color: '#16a34a', border: '1.5px solid #16a34a40',
                        borderRadius: 10, padding: '11px 18px', fontWeight: 700, fontSize: 13, textDecoration: 'none',
                        display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap'
                      }}>
                      <i className="bi bi-whatsapp"></i> Share
                    </a>
                  </div>
                )}
              </div>

              {/* My Referrals */}
              <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-secondary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-people-fill" style={{ color: 'var(--color-primary)' }}></i> My Referrals
                  <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 20, padding: '1px 10px', fontSize: 12, fontWeight: 700 }}>{myReferrals.length}</span>
                </div>

                {referralsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div className="spinner-border" style={{ width: '1.5rem', height: '1.5rem', color: 'var(--color-primary)' }}></div>
                  </div>
                ) : myReferrals.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af' }}>
                    <i className="bi bi-person-plus" style={{ fontSize: 36 }}></i>
                    <p style={{ marginTop: 10, fontSize: 13 }}>No one has registered with your link yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {myReferrals.map(r => {
                      const as_ = r.approval_status === 'approved'
                        ? { bg: '#dcfce7', text: '#16a34a', icon: 'bi-check-circle-fill' }
                        : r.approval_status === 'rejected'
                        ? { bg: '#fee2e2', text: '#dc2626', icon: 'bi-x-circle-fill' }
                        : { bg: '#fef9c3', text: '#d97706', icon: 'bi-hourglass-split' };
                      return (
                        <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 12, border: '1px solid #f3f4f6' }}>
                          {r.photo
                            ? <img src={`${API_BASE}${r.photo}`} alt={r.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                            : <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                                {r.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                              </div>
                          }
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{r.name}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.email}</div>
                          </div>
                          <span style={{ background: as_.bg, color: as_.text, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'capitalize', flexShrink: 0 }}>
                            <i className={`bi ${as_.icon}`}></i>{r.approval_status}
                          </span>
                          {r.approval_status === 'pending' && (
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <button onClick={() => handleReferralApprove(r.id)} disabled={referralActionId === r.id}
                                style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                                {referralActionId === r.id ? <span className="spinner-border spinner-border-sm"></span> : 'Approve'}
                              </button>
                              <button onClick={() => handleReferralReject(r.id)} disabled={referralActionId === r.id}
                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── Alumni Profile Drawer ── */}
      {selectedAlumni && (() => {
        const a = selectedAlumni;
        const sc = statusStyle(a.current_status);
        const isOwn = loggedInAlumniId && a.id === loggedInAlumniId;
        const Row = ({ icon, label, value }) => value ? (
          <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'flex-start' }}>
            <i className={`bi ${icon}`} style={{ color: 'var(--color-primary)', fontSize: 15, marginTop: 2, flexShrink: 0, width: 18 }}></i>
            <div style={{ minWidth: 110, fontSize: 12, color: '#9ca3af', fontWeight: 600, paddingTop: 1 }}>{label}</div>
            <div style={{ fontSize: 13, color: '#111827', fontWeight: 500, flex: 1 }}>{value}</div>
          </div>
        ) : null;
        return (
          <>
            <div onClick={() => setSelectedAlumni(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, backdropFilter: 'blur(2px)' }} />
            <div style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '95vw',
              background: '#fff', zIndex: 1001, display: 'flex', flexDirection: 'column',
              boxShadow: '-4px 0 32px rgba(0,0,0,0.18)', fontFamily: 'Poppins, sans-serif',
              animation: 'slideIn 0.25s ease'
            }}>
              <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-person-badge-fill" style={{ color: 'var(--color-primary)' }}></i> Alumni Profile
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {isOwn && (
                    <button onClick={() => { setSelectedAlumni(null); navigate('/alumni/edit-profile'); }} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <i className="bi bi-pencil"></i>Edit
                    </button>
                  )}
                  <button onClick={() => setSelectedAlumni(null)} style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontSize: 16 }}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 24px' }}>

                {/* Hero banner */}
                <div style={{ background: 'linear-gradient(135deg,var(--color-primary-dark),var(--color-primary))', padding: '28px 24px 50px', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: -44, left: 24 }}>
                    {a.photo
                      ? <img src={`${API_BASE}${a.photo}`} alt={a.name} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }} />
                      : <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg,#1e3a5f,#2563eb)', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}>
                          {a.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                        </div>
                    }
                  </div>
                </div>

                {/* Name block */}
                <div style={{ padding: '56px 24px 16px' }}>
                  <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--color-secondary)', marginBottom: 4 }}>{a.name}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>{a.designation}{a.designation && a.organization_name ? ' · ' : ''}{a.organization_name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {a.current_status && <span style={{ background: sc.bg, color: sc.text, borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 700 }}>{a.current_status}</span>}
                    {a.batch && <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>{a.batch}</span>}
                  </div>
                  {!isOwn && !a.show_contact && (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 7, background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#92400e' }}>
                      <i className="bi bi-shield-lock-fill"></i>
                      Contact details are partially hidden by this member's privacy settings.
                    </div>
                  )}
                </div>

                {/* Sections */}
                {[
                  {
                    title: 'Contact', icon: 'bi-envelope-fill',
                    rows: [
                      { icon: 'bi-envelope',     label: 'Email',   value: isOwn || a.show_contact ? a.email  : (a.email  ? maskEmail(a.email)  : null) },
                      { icon: 'bi-telephone',    label: 'Phone',   value: isOwn || a.show_contact ? a.phone  : (a.phone  ? maskPhone(a.phone)  : null) },
                      { icon: 'bi-geo-alt-fill', label: 'Address', value: a.address },
                      { icon: 'bi-globe',        label: 'Country', value: a.country },
                      { icon: 'bi-building',     label: 'City',    value: a.city },
                    ]
                  },
                  {
                    title: 'Personal', icon: 'bi-person-fill',
                    rows: [
                      { icon: 'bi-gender-ambiguous', label: 'Gender',        value: a.gender },
                      { icon: 'bi-calendar3',        label: 'Date of Birth', value: a.dob ? new Date(a.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null },
                      { icon: 'bi-person',           label: 'Parent Name',   value: a.parent_name },
                    ]
                  },
                  {
                    title: 'Education', icon: 'bi-mortarboard-fill',
                    rows: [
                      { icon: 'bi-bank',           label: 'Institution',      value: a.institution },
                      { icon: 'bi-journal-text',   label: 'Department',       value: a.department },
                      { icon: 'bi-award',          label: 'Education Level',  value: a.education_level },
                      { icon: 'bi-mortarboard',    label: 'Program',          value: a.attended_program },
                      { icon: 'bi-hash',           label: 'Enroll No.',       value: a.enrollment_number },
                      { icon: 'bi-calendar-check', label: 'Completion Year',  value: a.completion_year },
                      { icon: 'bi-building2',      label: 'UG College',       value: a.ug_college },
                      { icon: 'bi-building2',      label: 'PG College',       value: a.pg_college },
                      { icon: 'bi-patch-check',    label: 'Doctorate',        value: a.doctorate_name },
                    ]
                  },
                  {
                    title: 'Employment', icon: 'bi-briefcase-fill',
                    rows: [
                      { icon: 'bi-building',      label: 'Organization',    value: a.organization_name },
                      { icon: 'bi-person-badge',  label: 'Designation',     value: a.designation },
                      { icon: 'bi-diagram-3',     label: 'Industry',        value: a.industry },
                      { icon: 'bi-geo',           label: 'Work Location',   value: a.work_location },
                      { icon: 'bi-geo-alt',       label: 'Work City',       value: a.work_city },
                      { icon: 'bi-clock-history', label: 'Experience',      value: a.experience_years ? `${a.experience_years} year(s)` : null },
                      { icon: 'bi-briefcase',     label: 'Employment Type', value: a.employment_type },
                      { icon: 'bi-bar-chart',     label: 'Seniority',       value: a.seniority_level },
                      { icon: 'bi-tools',         label: 'Functional Area', value: a.functional_area },
                    ]
                  },
                  {
                    title: 'Skills & Bio', icon: 'bi-star-fill',
                    rows: [
                      { icon: 'bi-tools',      label: 'Skills',       value: a.skills },
                      { icon: 'bi-trophy',     label: 'Achievements', value: a.achievements },
                      { icon: 'bi-chat-quote', label: 'Bio',          value: a.bio },
                    ]
                  },
                  {
                    title: 'Social Links', icon: 'bi-share-fill',
                    rows: [
                      { icon: 'bi-linkedin', label: 'LinkedIn', value: a.linkedin },
                      { icon: 'bi-facebook', label: 'Facebook', value: a.facebook },
                    ]
                  },
                ].map(section => {
                  const visibleRows = section.rows.filter(r => r.value);
                  if (visibleRows.length === 0) return null;
                  return (
                    <div key={section.title} style={{ padding: '0 24px', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2, paddingTop: 16 }}>
                        <i className={`bi ${section.icon}`} style={{ color: 'var(--color-primary)', fontSize: 13 }}></i>
                        <span style={{ fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6b7280' }}>{section.title}</span>
                      </div>
                      {visibleRows.map(r => <Row key={r.label} icon={r.icon} label={r.label} value={r.value} />)}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}

export default ViewAlumni;
