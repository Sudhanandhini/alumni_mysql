import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NAV = [
  { key: '/admin',            icon: 'bi-grid-fill',        label: 'Dashboard'         },
  { key: '/admin/add',        icon: 'bi-person-plus-fill', label: 'Add Alumni'        },
  { key: '/admin/manage',     icon: 'bi-people-fill',      label: 'Manage Alumni'     },
  { key: '/admin/pending',    icon: 'bi-hourglass-split',  label: 'Pending Approvals', badge: true },
  { key: '/admin/broadcast',  icon: 'bi-megaphone-fill',   label: 'Broadcast'         },
];

const EMPTY = { subject: '', message: '' };

function Broadcast() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  const [broadcasts, setBroadcasts] = useState([]);
  const [form, setForm]             = useState(EMPTY);
  const [editId, setEditId]         = useState(null);
  const [status, setStatus]         = useState(null); // null | 'sending' | { ok, text }
  const [deleting, setDeleting]     = useState(null);
  const [resending, setResending]   = useState(null);
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    fetchBroadcasts();
    fetchPendingCount();
  }, []);

  const authHeader = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchBroadcasts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/broadcasts`, authHeader());
      setBroadcasts(res.data);
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

  const handleSend = async () => {
    if (!form.subject.trim() || !form.message.trim()) return;
    setStatus('sending');
    try {
      if (editId) {
        await axios.put(`${API_URL}/admin/broadcasts/${editId}`, form, authHeader());
        setStatus({ ok: true, text: 'Broadcast updated successfully.' });
      } else {
        const res = await axios.post(`${API_URL}/admin/broadcast`, form, authHeader());
        setStatus({ ok: true, text: res.data.message });
      }
      setForm(EMPTY);
      setEditId(null);
      fetchBroadcasts();
    } catch (e) {
      setStatus({ ok: false, text: e.response?.data?.message || 'Failed to send email' });
    }
  };

  const handleEdit = (b) => {
    setEditId(b.id);
    setForm({ subject: b.subject, message: b.message });
    setStatus(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setForm(EMPTY);
    setStatus(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this broadcast record?')) return;
    setDeleting(id);
    try {
      await axios.delete(`${API_URL}/admin/broadcasts/${id}`, authHeader());
      setBroadcasts(p => p.filter(b => b.id !== id));
    } catch (e) { alert('Failed to delete'); }
    finally { setDeleting(null); }
  };

  const handleResend = async (b) => {
    if (!window.confirm(`Resend "${b.subject}" to all approved alumni?`)) return;
    setResending(b.id);
    try {
      const res = await axios.post(`${API_URL}/admin/broadcasts/${b.id}/resend`, {}, authHeader());
      setStatus({ ok: true, text: res.data.message });
      fetchBroadcasts();
    } catch (e) {
      setStatus({ ok: false, text: e.response?.data?.message || 'Failed to resend' });
    } finally { setResending(null); }
  };

  const fmtDate = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Inter, sans-serif' }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 230 : 64, flexShrink: 0,
        background: 'var(--color-secondary)', display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s', overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh'
      }}>
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
                  <span style={{ marginLeft: 'auto', background: 'var(--color-primary)', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{pendingCount}</span>
                )}
                {n.badge && pendingCount > 0 && !sidebarOpen && (
                  <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, background: 'var(--color-primary)', borderRadius: '50%' }}></span>
                )}
              </button>
            );
          })}
        </nav>

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

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top bar */}
        <header style={{
          background: '#fff', borderBottom: '1px solid #e5e7eb',
          padding: '0 28px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 20, padding: 4, borderRadius: 6 }}>
              <i className="bi bi-list"></i>
            </button>
            <h1 style={{ fontWeight: 700, fontSize: 18, color: 'var(--color-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-megaphone-fill" style={{ color: '#d97706' }}></i> Broadcast
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right', lineHeight: 1.3 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-secondary)' }}>Admin</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>Administrator</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 15 }}>A</div>
          </div>
        </header>

        <main style={{ flex: 1, padding: '28px', overflow: 'auto' }}>

          {/* Compose Card */}
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 28, overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <i className="bi bi-send-fill" style={{ color: 'var(--color-primary)', fontSize: 16 }}></i>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>
                  {editId ? 'Edit Broadcast' : 'New Broadcast Message'}
                </span>
                {editId && (
                  <span style={{ background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 600, borderRadius: 20, padding: '2px 10px' }}>Editing</span>
                )}
              </div>
              {editId && (
                <button onClick={handleCancelEdit} style={{ background: 'none', border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '5px 14px', fontSize: 13, color: '#6b7280', cursor: 'pointer', fontWeight: 600 }}>
                  Cancel
                </button>
              )}
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Happy Independence Day!"
                  value={form.subject}
                  onChange={e => { setForm(p => ({ ...p, subject: e.target.value })); setStatus(null); }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14, border: '1.5px solid #e5e7eb', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Message</label>
                <textarea
                  rows={5}
                  placeholder="Type your message here. It will be emailed to all approved alumni."
                  value={form.message}
                  onChange={e => { setForm(p => ({ ...p, message: e.target.value })); setStatus(null); }}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 14, border: '1.5px solid #e5e7eb', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              {status && status !== 'sending' && (
                <div style={{
                  marginBottom: 14, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: status.ok ? '#dcfce7' : '#fee2e2',
                  color: status.ok ? '#16a34a' : '#dc2626',
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <i className={`bi ${status.ok ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  {status.text}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={handleSend}
                  disabled={status === 'sending' || !form.subject.trim() || !form.message.trim()}
                  style={{
                    background: status === 'sending' ? '#93c5fd' : 'var(--color-primary)',
                    color: '#fff', border: 'none', borderRadius: 10,
                    padding: '11px 28px', fontWeight: 700, fontSize: 14,
                    cursor: (status === 'sending' || !form.subject.trim() || !form.message.trim()) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8,
                    opacity: (!form.subject.trim() || !form.message.trim()) ? 0.5 : 1
                  }}
                >
                  {status === 'sending'
                    ? <><i className="bi bi-hourglass-split"></i> {editId ? 'Saving...' : 'Sending...'}</>
                    : editId
                      ? <><i className="bi bi-check-lg"></i> Save Changes</>
                      : <><i className="bi bi-send-fill"></i> Send to All Alumni</>
                  }
                </button>
              </div>
            </div>
          </div>

          {/* History Table */}
          <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 8 }}>
              <i className="bi bi-clock-history" style={{ color: 'var(--color-primary)' }}></i>
              <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Broadcast History</span>
              <span style={{ marginLeft: 6, background: '#eff6ff', color: '#2563eb', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{broadcasts.length}</span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 48 }}>
                <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }}></div>
              </div>
            ) : broadcasts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af' }}>
                <i className="bi bi-megaphone" style={{ fontSize: 40 }}></i>
                <p style={{ marginTop: 10 }}>No broadcasts sent yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb' }}>
                      {['Subject', 'Message', 'Sent', 'Failed', 'Date', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {broadcasts.map(b => (
                      <tr key={b.id} style={{ borderTop: '1px solid #f3f4f6', background: editId === b.id ? '#fffbeb' : '' }}
                        onMouseEnter={e => { if (editId !== b.id) e.currentTarget.style.background = '#f9fafb'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = editId === b.id ? '#fffbeb' : ''; }}
                      >
                        <td style={{ padding: '14px 18px', fontWeight: 600, color: '#111827', maxWidth: 200 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.subject}</div>
                        </td>
                        <td style={{ padding: '14px 18px', color: '#374151', maxWidth: 280 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#6b7280' }}>{b.message}</div>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          <span style={{ background: '#dcfce7', color: '#16a34a', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                            {b.sent_count}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px' }}>
                          {b.failed_count > 0
                            ? <span style={{ background: '#fee2e2', color: '#dc2626', borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{b.failed_count}</span>
                            : <span style={{ color: '#9ca3af', fontSize: 13 }}>—</span>
                          }
                        </td>
                        <td style={{ padding: '14px 18px', color: '#6b7280', whiteSpace: 'nowrap', fontSize: 13 }}>{fmtDate(b.created_at)}</td>
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleEdit(b)} title="Edit" style={{ background: '#eff6ff', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: '#2563eb', fontSize: 13 }}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => handleResend(b)}
                              disabled={resending === b.id}
                              title="Resend"
                              style={{ background: '#f0fdf4', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: resending === b.id ? 'not-allowed' : 'pointer', color: '#16a34a', fontSize: 13 }}
                            >
                              {resending === b.id ? <i className="bi bi-hourglass-split"></i> : <i className="bi bi-arrow-repeat"></i>}
                            </button>
                            <button
                              onClick={() => handleDelete(b.id)}
                              disabled={deleting === b.id}
                              title="Delete"
                              style={{ background: '#fff1f2', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: deleting === b.id ? 'not-allowed' : 'pointer', color: '#dc2626', fontSize: 13 }}
                            >
                              {deleting === b.id ? <i className="bi bi-hourglass-split"></i> : <i className="bi bi-trash"></i>}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Broadcast;
