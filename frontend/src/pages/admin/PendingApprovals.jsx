import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const API_URL  = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

const departments = [
  'Engineering & Technology','Economics & Commerce',
  'Journalism, Media, PR & Communication','Law','Medicine',
  'Arts & Humanities','Science','Business Administration',
];
const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

const approvalStyle = s => {
  if (s === 'approved') return { bg: '#dcfce7', text: '#16a34a', icon: 'bi-check-circle-fill' };
  if (s === 'rejected') return { bg: '#fee2e2', text: '#dc2626', icon: 'bi-x-circle-fill' };
  return { bg: '#fef9c3', text: '#d97706', icon: 'bi-hourglass-split' };
};

const statusStyle = s => {
  if (s === 'Employed')      return { bg: '#dcfce7', text: '#16a34a' };
  if (s === 'Self-Employed') return { bg: '#ede9fe', text: '#7c3aed' };
  if (s === 'Studying')      return { bg: '#e0f2fe', text: '#0891b2' };
  return { bg: '#f3f4f6', text: '#6b7280' };
};

function PendingApprovals() {
  const [allAlumni, setAllAlumni]         = useState([]);
  const [loading, setLoading]             = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [toast, setToast]                 = useState(null);
  const [activeTab, setActiveTab]         = useState('pending');
  const [filters, setFilters]             = useState({ search: '', batch: '', department: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/alumni?all=true`);
      setAllAlumni(res.data);
    } catch { showToast('danger', 'Failed to load registrations.'); }
    finally { setLoading(false); }
  };

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 3500); };

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      await axios.put(`${API_URL}/admin/alumni/${id}/approve`);
      showToast('success', 'Alumni approved and visible in the directory.');
      setAllAlumni(prev => prev.map(a => a.id === id ? { ...a, approval_status: 'approved' } : a));
      if (selectedAlumni?.id === id) setSelectedAlumni(prev => ({ ...prev, approval_status: 'approved' }));
    } catch { showToast('danger', 'Failed to approve alumni.'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this registration?')) return;
    setActionLoading(id);
    try {
      await axios.put(`${API_URL}/admin/alumni/${id}/reject`);
      showToast('success', 'Alumni registration rejected.');
      setAllAlumni(prev => prev.map(a => a.id === id ? { ...a, approval_status: 'rejected' } : a));
      if (selectedAlumni?.id === id) setSelectedAlumni(prev => ({ ...prev, approval_status: 'rejected' }));
    } catch { showToast('danger', 'Failed to reject alumni.'); }
    finally { setActionLoading(null); }
  };

  const counts = {
    all:      allAlumni.length,
    pending:  allAlumni.filter(a => a.approval_status === 'pending').length,
    approved: allAlumni.filter(a => a.approval_status === 'approved').length,
    rejected: allAlumni.filter(a => a.approval_status === 'rejected').length,
  };

  const filtered = allAlumni
    .filter(a => activeTab === 'all' || a.approval_status === activeTab)
    .filter(a => {
      if (!filters.search) return true;
      const s = filters.search.toLowerCase();
      return a.name?.toLowerCase().includes(s) || a.email?.toLowerCase().includes(s) || a.designation?.toLowerCase().includes(s);
    })
    .filter(a => !filters.batch || a.batch === filters.batch)
    .filter(a => !filters.department || a.department === filters.department);

  const inp = { padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13, outline: 'none', background: '#fff', width: '100%' };

  const TABS = [
    { key: 'pending',  label: 'Pending',  color: '#d97706', bgOn: '#fef9c3' },
    { key: 'approved', label: 'Approved', color: '#16a34a', bgOn: '#dcfce7' },
    { key: 'rejected', label: 'Rejected', color: '#dc2626', bgOn: '#fee2e2' },
    { key: 'all',      label: 'All',      color: '#1a2744', bgOn: '#eff6ff' },
  ];

  return (
    <AdminLayout title="Pending Approvals">

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: toast.type === 'success' ? '#15803d' : '#b91c1c',
          border: `1px solid ${toast.type === 'success' ? '#86efac' : '#fca5a5'}`,
          borderRadius: 12, padding: '14px 20px', fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, minWidth: 300
        }}>
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontWeight: 800, fontSize: 22, color: '#1a2744', margin: 0, marginBottom: 4 }}>Registration Approvals</h2>
        <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>Review and manage alumni self-registrations</p>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total',    value: counts.all,      color: '#1a2744', icon: 'bi-people-fill'     },
          { label: 'Pending',  value: counts.pending,  color: '#d97706', icon: 'bi-hourglass-split' },
          { label: 'Approved', value: counts.approved, color: '#16a34a', icon: 'bi-check-circle-fill'},
          { label: 'Rejected', value: counts.rejected, color: '#dc2626', icon: 'bi-x-circle-fill'  },
        ].map((s, i) => (
          <div key={i} onClick={() => setActiveTab(i === 0 ? 'all' : s.label.toLowerCase())}
            style={{ background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', cursor: 'pointer', borderLeft: `4px solid ${s.color}`, transition: 'box-shadow 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = `0 4px 16px ${s.color}22`}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <i className={`bi ${s.icon}`} style={{ color: s.color, fontSize: 18 }}></i>
              <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.label}</span>
            </div>
            <div style={{ fontWeight: 800, fontSize: 28, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters + Tabs combined card */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 20, overflow: 'hidden' }}>
        {/* Filter row */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: 12, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Search</label>
              <div style={{ position: 'relative' }}>
                <i className="bi bi-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 13 }}></i>
                <input type="text" placeholder="Name, email, designation…" value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  style={{ ...inp, paddingLeft: 32 }}
                  onFocus={e => e.target.style.borderColor = '#1a2744'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Batch</label>
              <select value={filters.batch} onChange={e => setFilters(f => ({ ...f, batch: e.target.value }))} style={inp}>
                <option value="">All Batches</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 5 }}>Department</label>
              <select value={filters.department} onChange={e => setFilters(f => ({ ...f, department: e.target.value }))} style={inp}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <button onClick={() => setFilters({ search: '', batch: '', department: '' })}
                style={{ ...inp, cursor: 'pointer', fontWeight: 600, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, width: 'auto', padding: '10px 16px' }}>
                <i className="bi bi-arrow-clockwise"></i>Reset
              </button>
            </div>
          </div>
        </div>

        {/* Tab row */}
        <div style={{ display: 'flex', padding: '0 20px', borderBottom: '1px solid #f3f4f6', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              padding: '13px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: activeTab === t.key ? 700 : 500, fontSize: 14,
              color: activeTab === t.key ? t.color : '#6b7280',
              borderBottom: activeTab === t.key ? `2.5px solid ${t.color}` : '2.5px solid transparent',
              display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', transition: 'all 0.15s'
            }}>
              {t.label}
              <span style={{ background: activeTab === t.key ? t.bgOn : '#f3f4f6', color: activeTab === t.key ? t.color : '#9ca3af', borderRadius: 20, padding: '1px 9px', fontSize: 11, fontWeight: 700 }}>
                {counts[t.key]}
              </span>
            </button>
          ))}
          <div style={{ marginLeft: 'auto', padding: '13px 0', fontSize: 12, color: '#9ca3af', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
            Showing {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="spinner-border text-primary" style={{ width: '2.5rem', height: '2.5rem' }}></div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
            <i className="bi bi-inbox" style={{ fontSize: 44 }}></i>
            <p style={{ marginTop: 12, fontSize: 15 }}>No {activeTab === 'all' ? '' : activeTab} registrations found.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Applicant','Batch','Department','Career Status','Approval','Registered','Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const as_ = approvalStyle(a.approval_status);
                  const ss  = statusStyle(a.current_status);
                  return (
                    <tr key={a.id} style={{ borderTop: '1px solid #f3f4f6' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      {/* Applicant */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                          {a.photo
                            ? <img src={`${API_BASE}${a.photo}`} alt={a.name} onClick={() => setSelectedAlumni(a)} style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb', cursor: 'pointer', flexShrink: 0 }} />
                            : <div onClick={() => setSelectedAlumni(a)} style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#197fe6,#1368c4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0, cursor: 'pointer' }}>
                                {a.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                          }
                          <div>
                            <div onClick={() => setSelectedAlumni(a)} style={{ fontWeight: 600, color: '#1a2744', cursor: 'pointer', marginBottom: 2 }}>{a.name}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{a.email}</div>
                            {a.designation && <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{a.designation}{a.organization_name ? ` · ${a.organization_name}` : ''}</div>}
                          </div>
                        </div>
                      </td>
                      {/* Batch */}
                      <td style={{ padding: '13px 16px' }}>
                        {a.batch && <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{a.batch}</span>}
                      </td>
                      {/* Department */}
                      <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: 12, maxWidth: 160 }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.department || '—'}</span>
                      </td>
                      {/* Status */}
                      <td style={{ padding: '13px 16px' }}>
                        {a.current_status && <span style={{ background: ss.bg, color: ss.text, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{a.current_status}</span>}
                      </td>
                      {/* Approval */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ background: as_.bg, color: as_.text, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'capitalize' }}>
                          <i className={`bi ${as_.icon}`}></i>{a.approval_status}
                        </span>
                      </td>
                      {/* Date */}
                      <td style={{ padding: '13px 16px', color: '#9ca3af', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {a.created_at ? new Date(a.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button onClick={() => setSelectedAlumni(a)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }} title="View">
                            <i className="bi bi-eye-fill"></i>
                          </button>
                          {a.approval_status !== 'approved' && (
                            <button onClick={() => handleApprove(a.id)} disabled={actionLoading === a.id}
                              style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, opacity: actionLoading === a.id ? 0.7 : 1 }}>
                              {actionLoading === a.id ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-check-lg"></i>Approve</>}
                            </button>
                          )}
                          {a.approval_status !== 'rejected' && (
                            <button onClick={() => handleReject(a.id)} disabled={actionLoading === a.id}
                              style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <i className="bi bi-x-lg"></i>Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedAlumni && (() => {
        const as_ = approvalStyle(selectedAlumni.approval_status);
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={() => setSelectedAlumni(null)}>
            <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}
              onClick={e => e.stopPropagation()}>
              {/* Header strip */}
              <div style={{ height: 80, background: 'linear-gradient(135deg,#197fe6,#1368c4)', borderRadius: '18px 18px 0 0', position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 28px 16px' }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: '#fff' }}>Registration Details</span>
                <button onClick={() => setSelectedAlumni(null)} style={{ position: 'absolute', top: 14, right: 14, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 34, height: 34, color: '#fff', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <div style={{ padding: '0 28px 28px' }}>
                {/* Photo + name */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, marginTop: -28, marginBottom: 20 }}>
                  {selectedAlumni.photo
                    ? <img src={`${API_BASE}${selectedAlumni.photo}`} alt={selectedAlumni.name} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }} />
                    : <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid #fff', background: 'linear-gradient(135deg,#197fe6,#1368c4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
                        {selectedAlumni.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                      </div>
                  }
                  <div style={{ paddingBottom: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 20, color: '#1a2744' }}>{selectedAlumni.name}</div>
                    <span style={{ background: as_.bg, color: as_.text, borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4, textTransform: 'capitalize', marginTop: 4 }}>
                      <i className={`bi ${as_.icon}`}></i>{selectedAlumni.approval_status}
                    </span>
                  </div>
                </div>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Email',       value: selectedAlumni.email },
                    { label: 'Phone',       value: selectedAlumni.phone },
                    { label: 'Batch',       value: selectedAlumni.batch },
                    { label: 'Department',  value: selectedAlumni.department, full: true },
                    { label: 'Gender',      value: selectedAlumni.gender },
                    { label: 'Date of Birth', value: selectedAlumni.dob ? new Date(selectedAlumni.dob).toLocaleDateString() : null },
                    { label: 'Current Status', value: selectedAlumni.current_status },
                    { label: 'Organisation', value: selectedAlumni.organization_name },
                    { label: 'Designation', value: selectedAlumni.designation },
                    { label: 'Industry',    value: selectedAlumni.industry },
                    { label: 'Work Location', value: selectedAlumni.work_location },
                    { label: 'Experience',  value: selectedAlumni.experience_years ? `${selectedAlumni.experience_years} yrs` : null },
                    { label: 'Skills',      value: selectedAlumni.skills, full: true },
                    { label: 'Bio',         value: selectedAlumni.bio, full: true },
                  ].filter(r => r.value).map((r, i) => (
                    <div key={i} style={{ gridColumn: r.full ? '1/-1' : 'auto', background: '#f9fafb', borderRadius: 10, padding: '11px 14px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{r.label}</div>
                      <div style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{r.value}</div>
                    </div>
                  ))}
                  {selectedAlumni.linkedin && (
                    <div style={{ gridColumn: '1/-1', background: '#f9fafb', borderRadius: 10, padding: '11px 14px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>LinkedIn</div>
                      <a href={selectedAlumni.linkedin} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, color: '#0a66c2', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <i className="bi bi-linkedin"></i>View Profile
                      </a>
                    </div>
                  )}
                </div>

                {/* Modal footer actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
                  <button onClick={() => setSelectedAlumni(null)} style={{ background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                    Close
                  </button>
                  {selectedAlumni.approval_status !== 'rejected' && (
                    <button onClick={() => handleReject(selectedAlumni.id)} disabled={actionLoading === selectedAlumni.id}
                      style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <i className="bi bi-x-lg"></i>Reject
                    </button>
                  )}
                  {selectedAlumni.approval_status !== 'approved' && (
                    <button onClick={() => handleApprove(selectedAlumni.id)} disabled={actionLoading === selectedAlumni.id}
                      style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {actionLoading === selectedAlumni.id ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-check-lg"></i>}
                      Approve
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </AdminLayout>
  );
}

export default PendingApprovals;
