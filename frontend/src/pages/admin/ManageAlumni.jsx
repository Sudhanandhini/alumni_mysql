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
          <h2 style={{ fontWeight: 800, fontSize: 22, color: '#1a2744', margin: 0, marginBottom: 4 }}>Manage Alumni</h2>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: 0 }}>View, filter, edit and manage alumni profiles</p>
        </div>
        <button onClick={() => navigate('/admin/add')} style={{ background: '#197fe6', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
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
            color: activeTab === t.key ? '#1a2744' : '#888',
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
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2744', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-funnel-fill" style={{ color: '#197fe6' }}></i>
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
                    onFocus={e => e.target.style.borderColor = '#1a2744'}
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
          <i className={`bi ${activeTab === 'deleted' ? 'bi-trash3-fill' : 'bi-list-ul'}`} style={{ color: activeTab === 'deleted' ? '#6b7280' : '#197fe6' }}></i>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#1a2744' }}>
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
                            : <div style={{ width: 40, height: 40, borderRadius: '50%', background: isDeleted ? '#9ca3af' : 'linear-gradient(135deg,#197fe6,#1368c4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                                {a.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                              </div>
                          }
                          <div>
                            <div style={{ fontWeight: 600, color: isDeleted ? '#9ca3af' : '#1a2744', textDecoration: isDeleted ? 'line-through' : 'none' }}>{a.name}</div>
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
    </AdminLayout>
  );
}

export default ManageAlumni;
