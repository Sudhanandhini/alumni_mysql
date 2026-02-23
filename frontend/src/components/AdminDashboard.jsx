import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from './AdminLayout';

const API_URL  = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

function AdminDashboard() {
  const navigate  = useNavigate();
  const [alumni, setAlumni]             = useState([]);
  const [loading, setLoading]           = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetchAlumni();
    fetchPendingCount();
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

  const stats = [
    { icon: 'bi-people-fill',     color: '#2563eb', label: 'Total Alumni',  value: alumni.length },
    { icon: 'bi-briefcase-fill',  color: '#16a34a', label: 'Employed',      value: alumni.filter(a => a.current_status === 'Employed').length },
    { icon: 'bi-laptop-fill',     color: '#7c3aed', label: 'Self-Employed', value: alumni.filter(a => a.current_status === 'Self-Employed').length },
    { icon: 'bi-book-fill',       color: '#0891b2', label: 'Studying',      value: alumni.filter(a => a.current_status === 'Studying').length },
    { icon: 'bi-hourglass-split', color: '#d97706', label: 'Pending',       value: pendingCount },
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
    <AdminLayout title="Dashboard">
      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg,#1a2744 0%,#2d4a8a 100%)', borderRadius: 16, padding: '24px 32px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 20, color: '#fff', marginBottom: 4 }}>Welcome back, Admin!</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>Manage alumni records, approve registrations, and monitor the network.</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/admin/add')} style={{ background: '#dc3545', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            <i className="bi bi-person-plus-fill me-2"></i>Add Alumni
          </button>
          <button onClick={() => navigate('/admin/pending')} style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 10, padding: '10px 20px', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-hourglass-split"></i>Approvals
            {pendingCount > 0 && <span style={{ background: '#dc3545', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{pendingCount}</span>}
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
            <div style={{ fontWeight: 800, fontSize: 28, color: '#1a2744' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Add New Alumni',    desc: 'Create a new alumni profile',  icon: 'bi-person-plus-fill', color: '#dc3545', path: '/admin/add' },
          { label: 'Manage Alumni',     desc: 'View, edit and delete records', icon: 'bi-people-fill',      color: '#2563eb', path: '/admin/manage' },
          { label: 'Pending Approvals', desc: 'Review self-registrations',     icon: 'bi-hourglass-split',  color: '#d97706', path: '/admin/pending', badge: pendingCount },
        ].map((c, i) => (
          <div key={i} onClick={() => navigate(c.path)} style={{ background: '#fff', borderRadius: 14, padding: '22px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', cursor: 'pointer', border: '1.5px solid transparent', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: 18, position: 'relative' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = c.color; e.currentTarget.style.boxShadow = `0 4px 16px ${c.color}22`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; }}
          >
            {c.badge > 0 && <span style={{ position: 'absolute', top: 12, right: 14, background: '#dc3545', color: '#fff', borderRadius: 20, padding: '2px 9px', fontSize: 11, fontWeight: 700 }}>{c.badge} new</span>}
            <div style={{ width: 48, height: 48, borderRadius: 12, background: c.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className={`bi ${c.icon}`} style={{ color: c.color, fontSize: 22 }}></i>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1a2744', marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontSize: 13, color: '#9ca3af' }}>{c.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Alumni table */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-clock-history" style={{ color: '#dc3545' }}></i> Recent Alumni
          </div>
          {alumni.length > 8 && (
            <button onClick={() => navigate('/admin/manage')} style={{ background: 'none', border: '1.5px solid #1a2744', color: '#1a2744', borderRadius: 8, padding: '6px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>View All</button>
          )}
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}><div className="spinner-border text-danger" style={{ width: '2rem', height: '2rem' }}></div></div>
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
                {alumni.slice(0, 8).map(a => {
                  const sc = statusColor(a.current_status);
                  const ac = approvalColor(a.approval_status);
                  return (
                    <tr key={a.id} style={{ borderTop: '1px solid #f3f4f6' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {a.photo
                            ? <img src={`${API_BASE}${a.photo}`} alt={a.name} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb' }} />
                            : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#dc3545,#8b0000)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                {a.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, color: '#1a2744' }}>{a.name}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 18px', color: '#374151' }}>{a.designation || '—'}</td>
                      <td style={{ padding: '14px 18px' }}>
                        {a.batch && <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{a.batch}</span>}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        {a.current_status && <span style={{ background: sc.bg, color: sc.text, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{a.current_status}</span>}
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <span style={{ background: ac.bg, color: ac.text, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{a.approval_status || 'approved'}</span>
                      </td>
                      <td style={{ padding: '14px 18px' }}>
                        <button onClick={() => navigate(`/admin/edit/${a.id}`)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#374151', fontSize: 13, fontWeight: 600 }}>
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
    </AdminLayout>
  );
}

export default AdminDashboard;
