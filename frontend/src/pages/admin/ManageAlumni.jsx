import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const API_URL  = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

const departments = [
  'Engineering & Technology','Economics & Commerce',
  'Journalism, Media, PR & Communication','Law','Medicine',
  'Arts & Humanities','Science','Business Administration',
];
const locations = [
  'Mumbai','Delhi','Bangalore','Hyderabad','Chennai',
  'Kolkata','Pune','Ahmedabad','Remote','International',
];
const years = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

const statusStyle = s => {
  if (s === 'Employed')      return { bg: '#dcfce7', text: '#16a34a' };
  if (s === 'Self-Employed') return { bg: '#ede9fe', text: '#7c3aed' };
  if (s === 'Studying')      return { bg: '#e0f2fe', text: '#0891b2' };
  return { bg: '#f3f4f6', text: '#6b7280' };
};

function ManageAlumni() {
  const navigate = useNavigate();
  const [alumni, setAlumni]               = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [activeTab, setActiveTab]         = useState('active');
  const [toast, setToast]                 = useState(null);
  const [showFilters, setShowFilters]     = useState(true);
  const [filters, setFilters]             = useState({ searchTerm: '', batch: '', department: '', status: '', location: '' });
  const [viewAlumni, setViewAlumni]       = useState(null);

  const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4000); };

  useEffect(() => { fetchAlumni(); }, [activeTab]);
  useEffect(() => { applyFilters(); }, [alumni, filters]);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const url = activeTab === 'deleted' ? `${API_URL}/alumni?show_deleted=true` : `${API_URL}/alumni?all=true`;
      const res = await axios.get(url);
      setAlumni(res.data);
    } catch { showToast('danger', 'Failed to fetch alumni data.'); }
    finally { setLoading(false); }
  };

  const applyFilters = () => {
    let f = [...alumni];
    if (filters.searchTerm) {
      const q = filters.searchTerm.toLowerCase();
      f = f.filter(a => a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q) || a.designation?.toLowerCase().includes(q) || a.organization_name?.toLowerCase().includes(q));
    }
    if (filters.batch)      f = f.filter(a => a.batch === filters.batch);
    if (filters.department) f = f.filter(a => a.department === filters.department);
    if (filters.status)     f = f.filter(a => a.current_status === filters.status);
    if (filters.location)   f = f.filter(a => a.work_location === filters.location);
    setFiltered(f);
  };

  const handleFilterChange = e => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const resetFilters = () => setFilters({ searchTerm: '', batch: '', department: '', status: '', location: '' });
  const switchTab = tab => { setActiveTab(tab); resetFilters(); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Move "${name}" to Deleted? They can be restored later.`)) return;
    try { await axios.delete(`${API_URL}/alumni/${id}`); setAlumni(prev => prev.filter(a => a.id !== id)); showToast('warning', `"${name}" moved to Deleted.`); }
    catch { showToast('danger', 'Failed to delete alumni.'); }
  };

  const handleRestore = async (id, name) => {
    try { await axios.put(`${API_URL}/alumni/${id}/restore`); setAlumni(prev => prev.filter(a => a.id !== id)); showToast('success', `"${name}" restored successfully.`); }
    catch { showToast('danger', 'Failed to restore alumni.'); }
  };

  const handlePermanentDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete "${name}"? This CANNOT be undone.`)) return;
    try { await axios.delete(`${API_URL}/alumni/${id}/permanent`); setAlumni(prev => prev.filter(a => a.id !== id)); showToast('danger', `"${name}" permanently deleted.`); }
    catch { showToast('danger', 'Failed to permanently delete alumni.'); }
  };

  const sel = { padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: 9, fontSize: 13, outline: 'none', background: '#fff', width: '100%', color: '#374151' };

  return (
    <AdminLayout title="Manage Alumni">

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          background: toast.type === 'success' ? '#dcfce7' : toast.type === 'warning' ? '#fef9c3' : '#fee2e2',
          color: toast.type === 'success' ? '#15803d' : toast.type === 'warning' ? '#92400e' : '#b91c1c',
          border: `1px solid ${toast.type === 'success' ? '#86efac' : toast.type === 'warning' ? '#fde68a' : '#fca5a5'}`,
          borderRadius: 12, padding: '14px 20px', fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, minWidth: 300
        }}>
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : toast.type === 'warning' ? 'bi-trash3-fill' : 'bi-exclamation-circle-fill'}`}></i>
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontWeight: 800, fontSize: 22, color: 'var(--color-secondary)', margin: 0, marginBottom: 4 }}>Manage Alumni</h2>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>View, filter, edit and manage alumni profiles</p>
        </div>
        <button onClick={() => navigate('/admin/add')} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-plus-circle-fill"></i>Add New Alumni
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f0f0f0', padding: 4, borderRadius: 12, width: 'fit-content', marginBottom: 20 }}>
        {[
          { key: 'active',  icon: 'bi-people-fill',  label: 'Active Alumni'  },
          { key: 'deleted', icon: 'bi-trash3-fill',  label: 'Deleted Alumni' },
        ].map(t => (
          <button key={t.key} onClick={() => switchTab(t.key)} style={{
            padding: '9px 22px', borderRadius: 10, border: 'none', fontWeight: 600, fontSize: 13, cursor: 'pointer',
            background: activeTab === t.key ? '#fff' : 'transparent',
            color: activeTab === t.key ? 'var(--color-secondary)' : '#888',
            boxShadow: activeTab === t.key ? '0 1px 6px rgba(0,0,0,0.1)' : 'none',
            display: 'flex', alignItems: 'center', gap: 7, transition: 'all 0.2s'
          }}>
            <i className={`bi ${t.icon}`}></i>{t.label}
          </button>
        ))}
      </div>

      {activeTab === 'deleted' && (
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: 13, color: '#92400e', display: 'flex', alignItems: 'center', gap: 8 }}>
          <i className="bi bi-info-circle-fill"></i>
          Deleted alumni are hidden from the public directory. You can restore or permanently delete them.
        </div>
      )}

      {/* Filter panel */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', marginBottom: 20, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: showFilters ? '1px solid #f3f4f6' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          onClick={() => setShowFilters(p => !p)}>
          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-funnel-fill" style={{ color: 'var(--color-primary)' }}></i>
            Filters
            <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 20, padding: '1px 10px', fontSize: 12, fontWeight: 600 }}>
              {filtered.length} / {alumni.length}
            </span>
          </div>
          <i className={`bi bi-chevron-${showFilters ? 'up' : 'down'}`} style={{ color: '#9ca3af', fontSize: 13 }}></i>
        </div>

        {showFilters && (
          <div style={{ padding: '16px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
              {/* Search */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Search</label>
                <div style={{ position: 'relative' }}>
                  <i className="bi bi-search" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}></i>
                  <input type="text" name="searchTerm" value={filters.searchTerm} onChange={handleFilterChange}
                    placeholder="Name, email, designation, company…"
                    style={{ ...sel, paddingLeft: 34 }}
                    onFocus={e => e.target.style.borderColor = 'var(--color-secondary)'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Batch</label>
                <select name="batch" value={filters.batch} onChange={handleFilterChange} style={sel}>
                  <option value="">All Batches</option>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Department</label>
                <select name="department" value={filters.department} onChange={handleFilterChange} style={sel}>
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status</label>
                <select name="status" value={filters.status} onChange={handleFilterChange} style={sel}>
                  <option value="">All Status</option>
                  <option value="Employed">Employed</option>
                  <option value="Self-Employed">Self-Employed</option>
                  <option value="Studying">Studying</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Location</label>
                <select name="location" value={filters.location} onChange={handleFilterChange} style={sel}>
                  <option value="">All Locations</option>
                  {locations.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button onClick={resetFilters} style={{ ...sel, cursor: 'pointer', fontWeight: 600, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <i className="bi bi-arrow-clockwise"></i>Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table card */}
      <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className={`bi ${activeTab === 'deleted' ? 'bi-trash3-fill' : 'bi-list-ul'}`} style={{ color: activeTab === 'deleted' ? '#6b7280' : 'var(--color-primary)' }}></i>
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-secondary)' }}>
            {activeTab === 'deleted' ? 'Deleted Alumni' : 'Alumni List'}
          </span>
          <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{filtered.length}</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <div className="spinner-border text-primary" style={{ width: '2.5rem', height: '2.5rem' }}></div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#9ca3af' }}>
            <i className={`bi ${activeTab === 'deleted' ? 'bi-trash3' : 'bi-inbox'}`} style={{ fontSize: 44 }}></i>
            <p style={{ marginTop: 12, fontSize: 15 }}>
              {alumni.length === 0
                ? (activeTab === 'deleted' ? 'No deleted alumni.' : 'No alumni records yet.')
                : 'No alumni match the current filters.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Alumni','Designation','Organization','Batch','Dept','Status','Location', activeTab === 'active' ? 'Approval' : '', 'Actions'].filter(Boolean).map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => {
                  const sc = statusStyle(a.current_status);
                  const isDeleted = activeTab === 'deleted';
                  return (
                    <tr key={a.id} style={{ borderTop: '1px solid #f3f4f6', opacity: isDeleted ? 0.7 : 1 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      {/* Alumni */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {a.photo
                            ? <img src={`${API_BASE}${a.photo}`} alt={a.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e5e7eb', filter: isDeleted ? 'grayscale(70%)' : 'none', flexShrink: 0 }} />
                            : <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDeleted ? '#9ca3af' : 'linear-gradient(135deg,var(--color-primary),var(--color-primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                {a.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, color: isDeleted ? '#9ca3af' : 'var(--color-secondary)', textDecoration: isDeleted ? 'line-through' : 'none' }}>{a.name}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af' }}>{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', color: '#374151', fontSize: 13 }}>{a.designation || '—'}</td>
                      <td style={{ padding: '13px 16px', color: '#374151', fontSize: 13 }}>{a.organization_name || '—'}</td>
                      <td style={{ padding: '13px 16px' }}>
                        {a.batch && <span style={{ background: '#eff6ff', color: '#2563eb', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>{a.batch}</span>}
                      </td>
                      <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: 12, maxWidth: 160 }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{a.department || '—'}</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        {a.current_status && <span style={{ background: sc.bg, color: sc.text, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{a.current_status}</span>}
                      </td>
                      <td style={{ padding: '13px 16px', color: '#6b7280', fontSize: 13 }}>{a.work_location || '—'}</td>
                      {activeTab === 'active' && (
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{
                            background: a.approval_status === 'approved' ? '#dcfce7' : a.approval_status === 'rejected' ? '#fee2e2' : '#fef9c3',
                            color: a.approval_status === 'approved' ? '#16a34a' : a.approval_status === 'rejected' ? '#dc2626' : '#92400e',
                            borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize'
                          }}>{a.approval_status || 'approved'}</span>
                        </td>
                      )}
                      <td style={{ padding: '13px 16px' }}>
                        {activeTab === 'active' ? (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => setViewAlumni(a)} style={{ background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <i className="bi bi-eye"></i>View
                            </button>
                            <button onClick={() => navigate(`/admin/edit/${a.id}`)} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <i className="bi bi-pencil"></i>Edit
                            </button>
                            <button onClick={() => handleDelete(a.id, a.name)} style={{ background: '#fef9c3', color: '#92400e', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handleRestore(a.id, a.name)} style={{ background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <i className="bi bi-arrow-counterclockwise"></i>Restore
                            </button>
                            <button onClick={() => handlePermanentDelete(a.id, a.name)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* ── View Profile Drawer ── */}
      {viewAlumni && (() => {
        const a = viewAlumni;
        const sc = statusStyle(a.current_status);
        const Row = ({ icon, label, value }) => value ? (
          <div style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid #f3f4f6', alignItems: 'flex-start' }}>
            <i className={`bi ${icon}`} style={{ color: 'var(--color-primary)', fontSize: 15, marginTop: 2, flexShrink: 0, width: 18 }}></i>
            <div style={{ minWidth: 110, fontSize: 12, color: '#9ca3af', fontWeight: 600, paddingTop: 1 }}>{label}</div>
            <div style={{ fontSize: 13, color: '#111827', fontWeight: 500, flex: 1 }}>{value}</div>
          </div>
        ) : null;

        return (
          <>
            {/* Backdrop */}
            <div onClick={() => setViewAlumni(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, backdropFilter: 'blur(2px)' }} />

            {/* Drawer */}
            <div style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 480, maxWidth: '95vw',
              background: '#fff', zIndex: 1001, display: 'flex', flexDirection: 'column',
              boxShadow: '-4px 0 32px rgba(0,0,0,0.18)', fontFamily: 'Inter, sans-serif',
              animation: 'slideIn 0.25s ease'
            }}>
              <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--color-secondary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="bi bi-person-badge-fill" style={{ color: 'var(--color-primary)' }}></i> Alumni Profile
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => { setViewAlumni(null); navigate(`/admin/edit/${a.id}`); }} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 8, padding: '7px 14px', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <i className="bi bi-pencil"></i>Edit
                  </button>
                  <button onClick={() => setViewAlumni(null)} style={{ background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: 8, padding: '7px 10px', cursor: 'pointer', fontSize: 16 }}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 24px' }}>

                {/* Hero banner */}
                <div style={{ background: 'linear-gradient(135deg,var(--color-primary-dark),var(--color-primary))', padding: '28px 24px 50px', position: 'relative' }}>
                  <div style={{ position: 'absolute', bottom: -44, left: 24, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
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
                    <span style={{
                      background: a.approval_status === 'approved' ? '#dcfce7' : a.approval_status === 'rejected' ? '#fee2e2' : '#fef9c3',
                      color: a.approval_status === 'approved' ? '#16a34a' : a.approval_status === 'rejected' ? '#dc2626' : '#92400e',
                      borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize'
                    }}>{a.approval_status || 'approved'}</span>
                  </div>
                </div>

                {/* Sections */}
                {[
                  {
                    title: 'Contact', icon: 'bi-envelope-fill',
                    rows: [
                      { icon: 'bi-envelope',     label: 'Email',   value: a.email },
                      { icon: 'bi-telephone',    label: 'Phone',   value: a.phone },
                      { icon: 'bi-geo-alt-fill', label: 'Address', value: a.address },
                      { icon: 'bi-globe',        label: 'Country', value: a.country },
                      { icon: 'bi-building',     label: 'City',    value: a.city },
                    ]
                  },
                  {
                    title: 'Personal', icon: 'bi-person-fill',
                    rows: [
                      { icon: 'bi-gender-ambiguous', label: 'Gender',      value: a.gender },
                      { icon: 'bi-calendar3',        label: 'Date of Birth', value: a.dob ? new Date(a.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null },
                      { icon: 'bi-person',           label: 'Parent Name', value: a.parent_name },
                    ]
                  },
                  {
                    title: 'Education', icon: 'bi-mortarboard-fill',
                    rows: [
                      { icon: 'bi-bank',          label: 'Institution',      value: a.institution },
                      { icon: 'bi-journal-text',  label: 'Department',       value: a.department },
                      { icon: 'bi-award',         label: 'Education Level',  value: a.education_level },
                      { icon: 'bi-mortarboard',   label: 'Program',          value: a.attended_program },
                      { icon: 'bi-hash',          label: 'Enroll No.',       value: a.enrollment_number },
                      { icon: 'bi-calendar-check','label': 'Completion Year', value: a.completion_year },
                      { icon: 'bi-building2',     label: 'UG College',       value: a.ug_college },
                      { icon: 'bi-building2',     label: 'PG College',       value: a.pg_college },
                      { icon: 'bi-patch-check',   label: 'Doctorate',        value: a.doctorate_name },
                    ]
                  },
                  {
                    title: 'Employment', icon: 'bi-briefcase-fill',
                    rows: [
                      { icon: 'bi-building',        label: 'Organization',     value: a.organization_name },
                      { icon: 'bi-person-badge',    label: 'Designation',      value: a.designation },
                      { icon: 'bi-diagram-3',       label: 'Industry',         value: a.industry },
                      { icon: 'bi-geo',             label: 'Work Location',    value: a.work_location },
                      { icon: 'bi-geo-alt',         label: 'Work City',        value: a.work_city },
                      { icon: 'bi-clock-history',   label: 'Experience',       value: a.experience_years ? `${a.experience_years} year(s)` : null },
                      { icon: 'bi-briefcase',       label: 'Employment Type',  value: a.employment_type },
                      { icon: 'bi-bar-chart',       label: 'Seniority',        value: a.seniority_level },
                      { icon: 'bi-tools',           label: 'Functional Area',  value: a.functional_area },
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
                      { icon: 'bi-linkedin',  label: 'LinkedIn', value: a.linkedin },
                      { icon: 'bi-facebook',  label: 'Facebook', value: a.facebook },
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
                      {visibleRows.map(r => (
                        <Row key={r.label} icon={r.icon} label={r.label} value={r.value} />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        );
      })()}
    </AdminLayout>
  );
}

export default ManageAlumni;
