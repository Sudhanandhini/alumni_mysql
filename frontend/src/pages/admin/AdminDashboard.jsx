import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL  = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

const EVT_CAT_COLORS = {
  reunion:      { bg: '#ede9fe', text: '#7c3aed' },
  webinar:      { bg: '#e0f2fe', text: '#0891b2' },
  hackathon:    { bg: '#dcfce7', text: '#16a34a' },
  campus_event: { bg: '#fff7ed', text: '#c2410c' },
  other:        { bg: '#f3f4f6', text: '#6b7280' },
};
const EVT_CAT_LABELS = { reunion: 'Reunion', webinar: 'Webinar', hackathon: 'Hackathon', campus_event: 'Campus Event', other: 'Other' };
const evtCatColor = v => EVT_CAT_COLORS[v] || EVT_CAT_COLORS.other;
const evtCatLabel = v => EVT_CAT_LABELS[v] || v;

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

const NAV = [
  { key: '/admin',             icon: 'bi-grid-fill',        label: 'Dashboard'          },
  { key: '/admin/add',         icon: 'bi-person-plus-fill', label: 'Add Alumni'         },
  { key: '/admin/manage',      icon: 'bi-people-fill',      label: 'Manage Alumni'      },
  { key: '/admin/pending',     icon: 'bi-hourglass-split',  label: 'Pending Approvals', badge: true },
  { key: '/admin/events',      icon: 'bi-calendar-event-fill', label: 'Events'           },
  { key: '/admin/broadcast',   icon: 'bi-megaphone-fill',   label: 'Broadcast'          },
];

function AdminDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [alumni, setAlumni]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [sidebarOpen, setSidebarOpen]   = useState(true);
  const [events, setEvents]             = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [embedLimit, setEmbedLimit]     = useState(12);
  const [embedCols,  setEmbedCols]      = useState(4);
  const [embedTheme, setEmbedTheme]     = useState('light');
  const [copiedIframe, setCopiedIframe] = useState(false);
  const [copiedApi,    setCopiedApi]    = useState(false);


  useEffect(() => {
    fetchAlumni();
    fetchPendingCount();
    axios.get(`${API_URL}/admin/events`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
    }).then(r => setEvents(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setEventsLoading(false));
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/alumni?all=true`);
      setAlumni(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchPendingCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/alumni/pending-count`);
      setPendingCount(res.data.count);
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const stats = [
    { icon: 'bi-people-fill',      color: '#2563eb', label: 'Total Alumni',  value: alumni.length },
    { icon: 'bi-briefcase-fill',   color: '#16a34a', label: 'Employed',      value: alumni.filter(a => a.current_status === 'Employed').length },
    { icon: 'bi-laptop-fill',      color: '#7c3aed', label: 'Self-Employed', value: alumni.filter(a => a.current_status === 'Self-Employed').length },
    { icon: 'bi-book-fill',        color: '#0891b2', label: 'Studying',      value: alumni.filter(a => a.current_status === 'Studying').length },
    { icon: 'bi-hourglass-split',  color: '#d97706', label: 'Pending',       value: pendingCount },
  ];

  const statusColor = s => {
    if (s === 'Employed')      return { bg: '#dcfce7', text: '#16a34a' };
    if (s === 'Self-Employed') return { bg: '#ede9fe', text: '#7c3aed' };
    if (s === 'Studying')      return { bg: '#e0f2fe', text: '#0891b2' };
    return { bg: '#f3f4f6', text: '#6b7280' };
  };

  const approvalColor = s => {
    if (s === 'approved') return { bg: '#dcfce7', text: '#16a34a' };
    if (s === 'rejected') return { bg: '#fee2e2', text: '#dc2626' };
    return { bg: '#fef9c3', text: '#854d0e' };
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Inter, sans-serif' }}>

      {/* â”€â”€ Left Sidebar â”€â”€ */}
      <aside style={{
        width: sidebarOpen ? 230 : 64, flexShrink: 0,
        background: 'var(--color-secondary)', display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s', overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh'
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 16px 20px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-mortarboard-fill" style={{ color: '#fff', fontSize: 17 }}></i>
          </div>
          {sidebarOpen && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', whiteSpace: 'nowrap' }}>Alumni Portal</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '16px 10px' }}>
          {NAV.map(n => {
            const active = location.pathname === n.key;
            return (
              <button key={n.key} onClick={() => navigate(n.key)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                marginBottom: 4,
                background: active ? 'rgba(25,127,230,0.18)' : 'transparent',
                color: active ? '#93c5fd' : 'rgba(255,255,255,0.65)',
                fontWeight: active ? 700 : 500, fontSize: 14,
                transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden',
                position: 'relative'
              }}>
                <i className={`bi ${n.icon}`} style={{ fontSize: 18, flexShrink: 0 }}></i>
                {sidebarOpen && n.label}
                {n.badge && pendingCount > 0 && sidebarOpen && (
                  <span style={{
                    marginLeft: 'auto', background: 'var(--color-primary)', color: '#fff',
                    borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700
                  }}>{pendingCount}</span>
                )}
                {n.badge && pendingCount > 0 && !sidebarOpen && (
                  <span style={{
                    position: 'absolute', top: 6, right: 6, width: 8, height: 8,
                    background: 'var(--color-primary)', borderRadius: '50%'
                  }}></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom logout */}
        <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
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

      {/* â”€â”€ Main Area â”€â”€ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          padding: '0 28px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#6b7280', fontSize: 20, padding: 4, borderRadius: 6
            }}>
              <i className="bi bi-list"></i>
            </button>
            <h1 style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-secondary)', margin: 0 }}>Dashboard</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-secondary)' }}>Admin</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Administrator</div>
            </div>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: 15
            }}>A</div>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px', overflow: 'auto' }}>

          {/* Welcome banner */}
          <div style={{
            background: 'linear-gradient(135deg,var(--color-primary-dark) 0%,var(--color-primary) 100%)',
            borderRadius: 16, padding: '24px 32px', marginBottom: 28,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 16
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 4 }}>
                Welcome back, Admin!
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>
                Manage alumni records, approve registrations, and monitor the network.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => navigate('/admin/add')} style={{
                background: 'var(--color-primary)', color: '#fff', border: 'none',
                borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer'
              }}>
                <i className="bi bi-person-plus-fill me-2"></i>Add Alumni
              </button>
              <button onClick={() => navigate('/admin/pending')} style={{
                background: 'rgba(255,255,255,0.12)', color: '#fff',
                border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10,
                padding: '10px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <i className="bi bi-hourglass-split"></i>
                Approvals
                {pendingCount > 0 && (
                  <span style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, marginBottom: 28 }}>
            {stats.map((s, i) => (
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

          {/* Quick actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
            {[
              { label: 'Add New Alumni',    desc: 'Create a new alumni profile', icon: 'bi-person-plus-fill', color: 'var(--color-primary)', path: '/admin/add' },
              { label: 'Manage Alumni',     desc: 'View, edit and delete records', icon: 'bi-people-fill',      color: '#2563eb', path: '/admin/manage' },
              { label: 'Pending Approvals', desc: 'Review self-registrations',    icon: 'bi-hourglass-split',  color: '#d97706', path: '/admin/pending', badge: pendingCount },
            ].map((c, i) => (
              <div key={i} onClick={() => navigate(c.path)} style={{
                background: '#fff', borderRadius: 14, padding: '22px 24px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.07)', cursor: 'pointer',
                border: `1.5px solid transparent`, transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 18, position: 'relative'
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.boxShadow = `0 4px 16px ${c.color}22`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; }}
              >
                {c.badge > 0 && (
                  <span style={{ position: 'absolute', top: 12, right: 14, background: 'var(--color-primary)', color: '#fff', borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>
                    {c.badge} new
                  </span>
                )}
                <div style={{ width: 48, height: 48, borderRadius: 12, background: c.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className={`bi ${c.icon}`} style={{ color: c.color, fontSize: 22 }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 3 }}>{c.label}</div>
                  <div style={{ fontSize: 13, color: '#9ca3af' }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Alumni table */}
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-clock-history" style={{ color: 'var(--color-primary)' }}></i> Recent Alumni
              </div>
              {alumni.length > 5 && (
                <button onClick={() => navigate('/admin/manage')} style={{
                  background: 'none', border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)',
                  borderRadius: 8, padding: '6px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                }}>View All</button>
              )}
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }}></div>
              </div>
            ) : alumni.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
                <i className="bi bi-inbox" style={{ fontSize: 40 }}></i>
                <p style={{ marginTop: 10 }}>No alumni records yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Alumni','Designation','Batch','Status','Approval','Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alumni.slice(0, 8).map((a, idx) => {
                      const sc = statusColor(a.current_status);
                      const ac = approvalColor(a.approval_status);
                      return (
                        <tr key={a.id} style={{ borderTop: '1px solid #f3f4f6', transition: 'background 0.1s' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {a.photo
                                ? <img src={`${API_BASE}${a.photo}`} alt={a.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
                                : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                    {a.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                                  </div>
                              }
                              <div>
                                <div style={{ fontWeight: 600, color: '#111827' }}>{a.name}</div>
                                <div style={{ fontSize: 12, color: '#9ca3af' }}>{a.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', color: '#374151' }}>{a.designation || 'â€”'}</td>
                          <td style={{ padding: '14px 18px' }}>
                            {a.batch && <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{a.batch}</span>}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            {a.current_status && <span style={{ background: sc.bg, color: sc.text, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{a.current_status}</span>}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{ background: ac.bg, color: ac.text, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
                              {a.approval_status || 'approved'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <button onClick={() => navigate(`/admin/edit/${a.id}`)} style={{
                              background: '#f3f4f6', border: 'none', borderRadius: 8,
                              padding: '6px 12px', cursor: 'pointer', color: '#374151', fontSize: 13, fontWeight: 600
                            }}>
                              <i className="bi bi-pencil me-1"></i>Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {/* ── Events Preview ── */}
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden', marginTop: 24 }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-calendar-event-fill" style={{ color: 'var(--color-primary)' }}></i> Events
                <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{events.length}</span>
              </div>
              <button onClick={() => navigate('/admin/events')} style={{
                background: 'none', border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)',
                borderRadius: 8, padding: '6px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer'
              }}>Manage Events</button>
            </div>

            {eventsLoading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <div className="spinner-border text-primary" style={{ width: '1.8rem', height: '1.8rem' }}></div>
              </div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 24px', color: '#9ca3af' }}>
                <i className="bi bi-calendar-x" style={{ fontSize: 36 }}></i>
                <p style={{ marginTop: 10, fontWeight: 500 }}>No events yet.</p>
                <button onClick={() => navigate('/admin/events')} style={{
                  marginTop: 12, background: 'var(--color-primary)', color: '#fff', border: 'none',
                  borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                }}>
                  <i className="bi bi-calendar-plus-fill me-2"></i>Create First Event
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Event', 'Category', 'Date', 'Location', 'Status'].map(h => (
                        <th key={h} style={{ padding: '11px 18px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 5).map(ev => {
                      const cc = evtCatColor(ev.category);
                      return (
                        <tr key={ev.id} style={{ borderTop: '1px solid #f3f4f6', transition: 'background 0.1s', cursor: 'pointer' }}
                          onClick={() => navigate('/admin/events')}
                          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                          onMouseLeave={e => e.currentTarget.style.background = ''}
                        >
                          <td style={{ padding: '13px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              {ev.image
                                ? <img src={`${API_BASE}${ev.image}`} alt={ev.title} style={{ width: 44, height: 34, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid #e5e7eb' }} />
                                : <div style={{ width: 44, height: 34, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <i className="bi bi-image" style={{ color: '#d1d5db', fontSize: 14 }}></i>
                                  </div>
                              }
                              <span style={{ fontWeight: 600, color: '#111827', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</span>
                            </div>
                          </td>
                          <td style={{ padding: '13px 18px' }}>
                            <span style={{ background: cc.bg, color: cc.text, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{evtCatLabel(ev.category)}</span>
                          </td>
                          <td style={{ padding: '13px 18px', color: '#374151', whiteSpace: 'nowrap' }}>
                            {ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </td>
                          <td style={{ padding: '13px 18px', color: '#374151', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.location || '—'}</td>
                          <td style={{ padding: '13px 18px' }}>
                            <span style={{
                              background: ev.is_published ? '#dcfce7' : '#fef9c3',
                              color:      ev.is_published ? '#16a34a' : '#92400e',
                              borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 700
                            }}>
                              {ev.is_published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {events.length > 5 && (
                  <div style={{ padding: '12px 18px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                    <button onClick={() => navigate('/admin/events')} style={{
                      background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                    }}>
                      View all {events.length} events →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* ── Featured Alumni Embed ── */}
          {(() => {
            const origin = window.location.origin;
            const basePath = import.meta.env.BASE_URL?.replace(/\/$/, '') || '/alumni_app';
            const embedUrl  = `${origin}${basePath}/embed/featured-alumni?limit=${embedLimit}&cols=${embedCols}&theme=${embedTheme}`;
            const apiBase   = API_URL.startsWith('http') ? API_URL : `${origin}${API_URL.startsWith('/') ? '' : '/'}${API_URL}`;
            const apiUrl    = `${apiBase}/featured-alumni?limit=${embedLimit}`;
            const iframeCode = `<iframe\n  src="${embedUrl}"\n  width="100%"\n  height="500"\n  frameborder="0"\n  style="border:none;border-radius:12px;"\n  title="Featured Alumni"\n></iframe>`;

            const copy = (text, setDone) => {
              navigator.clipboard.writeText(text).then(() => {
                setDone(true);
                setTimeout(() => setDone(false), 2000);
              });
            };

            return (
              <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden', marginTop: 24 }}>
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <i className="bi bi-code-slash" style={{ color: 'var(--color-primary)' }}></i> Featured Alumni — Embed & API Link
                  </div>
                  <a href={embedUrl} target="_blank" rel="noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'none', border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)',
                    borderRadius: 8, padding: '6px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer', textDecoration: 'none'
                  }}>
                    <i className="bi bi-box-arrow-up-right"></i> Preview
                  </a>
                </div>

                <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                  {/* Customise controls */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end' }}>
                    {[
                      { label: 'Limit', value: embedLimit, min: 1, max: 50, onChange: v => setEmbedLimit(Number(v)) },
                      { label: 'Columns', value: embedCols, min: 1, max: 6, onChange: v => setEmbedCols(Number(v)) },
                    ].map(f => (
                      <div key={f.label}>
                        <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>{f.label}</div>
                        <input type="number" min={f.min} max={f.max} value={f.value}
                          onChange={e => f.onChange(e.target.value)}
                          style={{ width: 70, padding: '6px 10px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#111827' }} />
                      </div>
                    ))}
                    <div>
                      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 4 }}>Theme</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {['light', 'dark'].map(t => (
                          <button key={t} onClick={() => setEmbedTheme(t)} style={{
                            padding: '6px 16px', borderRadius: 8, border: '1.5px solid',
                            borderColor: embedTheme === t ? 'var(--color-primary)' : '#e5e7eb',
                            background: embedTheme === t ? '#eff6ff' : '#fff',
                            color: embedTheme === t ? 'var(--color-primary)' : '#6b7280',
                            fontWeight: 600, fontSize: 13, cursor: 'pointer', textTransform: 'capitalize'
                          }}>{t}</button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* iFrame code */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="bi bi-file-code" style={{ color: 'var(--color-primary)' }}></i> iFrame Embed Code
                    </div>
                    <div style={{ position: 'relative' }}>
                      <pre style={{
                        background: '#f8fafc', border: '1.5px solid #e5e7eb', borderRadius: 10,
                        padding: '14px 16px', fontSize: 12, color: '#334155', margin: 0,
                        overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                        fontFamily: 'monospace', lineHeight: 1.7
                      }}>{iframeCode}</pre>
                      <button onClick={() => copy(iframeCode, setCopiedIframe)} style={{
                        position: 'absolute', top: 10, right: 10,
                        background: copiedIframe ? '#dcfce7' : '#fff',
                        border: `1.5px solid ${copiedIframe ? '#16a34a' : '#e5e7eb'}`,
                        color: copiedIframe ? '#16a34a' : '#6b7280',
                        borderRadius: 7, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s'
                      }}>
                        <i className={`bi ${copiedIframe ? 'bi-check2' : 'bi-clipboard'}`}></i>
                        {copiedIframe ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* API link */}
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="bi bi-link-45deg" style={{ color: 'var(--color-primary)' }}></i> Direct API URL
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        background: '#f8fafc', border: '1.5px solid #e5e7eb', borderRadius: 10,
                        padding: '12px 90px 12px 16px', fontSize: 12, color: '#334155',
                        fontFamily: 'monospace', wordBreak: 'break-all'
                      }}>{apiUrl}</div>
                      <button onClick={() => copy(apiUrl, setCopiedApi)} style={{
                        position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)',
                        background: copiedApi ? '#dcfce7' : '#fff',
                        border: `1.5px solid ${copiedApi ? '#16a34a' : '#e5e7eb'}`,
                        color: copiedApi ? '#16a34a' : '#6b7280',
                        borderRadius: 7, padding: '4px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.2s'
                      }}>
                        <i className={`bi ${copiedApi ? 'bi-check2' : 'bi-clipboard'}`}></i>
                        {copiedApi ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                      Returns JSON array of featured alumni. Open CORS — safe to call from any website.
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
