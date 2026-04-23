import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';

const API_URL  = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = API_URL.replace(/\/api\/?$/, '');

const CATEGORIES = [
  { value: 'reunion',      label: 'Reunion'       },
  { value: 'webinar',      label: 'Webinar'       },
  { value: 'hackathon',    label: 'Hackathon'     },
  { value: 'campus_event', label: 'Campus Event'  },
  { value: 'other',        label: 'Other'         },
];

const CATEGORY_COLORS = {
  reunion:      { bg: '#ede9fe', text: '#7c3aed' },
  webinar:      { bg: '#e0f2fe', text: '#0891b2' },
  hackathon:    { bg: '#dcfce7', text: '#16a34a' },
  campus_event: { bg: '#fff7ed', text: '#c2410c' },
  other:        { bg: '#f3f4f6', text: '#6b7280' },
};

const catLabel = v => CATEGORIES.find(c => c.value === v)?.label || v;
const catColor = v => CATEGORY_COLORS[v] || CATEGORY_COLORS.other;

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

const emptyForm = { title: '', category: 'reunion', description: '', event_date: '', location: '', is_published: false };

export default function Events() {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(false);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState(null);
  const [imageFile, setImageFile]   = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImage, setRemoveImage]   = useState(false);
  const [status, setStatus]         = useState({ type: '', msg: '' });
  const [saving, setSaving]         = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const fileRef                     = useRef();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/events`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setEvents(res.data);
    } catch { setStatus({ type: 'error', msg: 'Failed to load events' }); }
    finally { setLoading(false); }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setImageFile(f);
    setRemoveImage(false);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleEdit = ev => {
    setEditId(ev.id);
    setForm({
      title:        ev.title || '',
      category:     ev.category || 'other',
      description:  ev.description || '',
      event_date:   ev.event_date ? ev.event_date.slice(0, 16) : '',
      location:     ev.location || '',
      is_published: !!ev.is_published,
    });
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setStatus({ type: '', msg: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setEditId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
    setStatus({ type: '', msg: '' });
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title.trim()) { setStatus({ type: 'error', msg: 'Title is required' }); return; }
    setSaving(true);
    setStatus({ type: '', msg: '' });
    try {
      const fd = new FormData();
      fd.append('title',        form.title);
      fd.append('category',     form.category);
      fd.append('description',  form.description);
      fd.append('event_date',   form.event_date);
      fd.append('location',     form.location);
      fd.append('is_published', form.is_published ? 'true' : 'false');
      if (imageFile)    fd.append('image', imageFile);
      if (removeImage)  fd.append('remove_image', 'true');

      const headers = {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'multipart/form-data',
      };

      if (editId) {
        await axios.put(`${API_URL}/admin/events/${editId}`, fd, { headers });
        setStatus({ type: 'success', msg: 'Event updated successfully!' });
      } else {
        await axios.post(`${API_URL}/admin/events`, fd, { headers });
        setStatus({ type: 'success', msg: 'Event created successfully!' });
      }
      handleCancel();
      fetchEvents();
    } catch (err) {
      setStatus({ type: 'error', msg: err.response?.data?.message || 'Failed to save event' });
    } finally { setSaving(false); }
  };

  const handleTogglePublish = async ev => {
    try {
      const res = await axios.put(`${API_URL}/admin/events/${ev.id}/toggle-publish`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setEvents(prev => prev.map(e => e.id === ev.id ? { ...e, is_published: res.data.is_published } : e));
    } catch { alert('Failed to update publish status'); }
  };

  const handleDelete = async ev => {
    if (!window.confirm(`Delete event "${ev.title}"?`)) return;
    try {
      await axios.delete(`${API_URL}/admin/events/${ev.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setEvents(prev => prev.filter(e => e.id !== ev.id));
    } catch { alert('Failed to delete event'); }
  };

  const formatDate = dt => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const existingImage = editId ? events.find(e => e.id === editId)?.image : null;

  return (
    <AdminLayout title="Events">
      {/* ── Form ── */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', padding: '28px 32px', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className={`bi ${editId ? 'bi-pencil-square' : 'bi-calendar-plus-fill'}`} style={{ color: 'var(--color-primary)' }}></i>
            {editId ? 'Edit Event' : 'Create New Event'}
          </div>
          {editId && (
            <button onClick={handleCancel} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 600 }}>
              Cancel
            </button>
          )}
        </div>

        {status.msg && (
          <div style={{
            padding: '10px 16px', borderRadius: 8, marginBottom: 18, fontSize: 13, fontWeight: 600,
            background: status.type === 'success' ? '#dcfce7' : '#fee2e2',
            color:      status.type === 'success' ? '#16a34a' : '#dc2626',
          }}>
            <i className={`bi ${status.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            {/* Title */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                Event Title <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                name="title" value={form.title} onChange={handleChange}
                placeholder="e.g. Silver Jubilee Alumni Meet 2025"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Category */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Category</label>
              <select
                name="category" value={form.category} onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', background: '#fff' }}
              >
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Event Date */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Event Date & Time</label>
              <input
                type="datetime-local" name="event_date" value={form.event_date} onChange={handleChange}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none' }}
              />
            </div>

            {/* Location */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Location / Venue</label>
              <input
                name="location" value={form.location} onChange={handleChange}
                placeholder="e.g. Main Auditorium, Campus"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* Description */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>Event Details</label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                rows={5} placeholder="Describe the event — agenda, speakers, schedule, etc."
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: 8, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            {/* Image */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: 13, color: '#374151', marginBottom: 6 }}>
                Event Image <span style={{ fontWeight: 400, color: '#9ca3af' }}>(optional · jpg/png/gif · max 5MB)</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '9px 18px', border: '1.5px dashed #d1d5db', borderRadius: 8,
                  cursor: 'pointer', fontSize: 13, color: '#6b7280', fontWeight: 600, background: '#fafafa'
                }}>
                  <i className="bi bi-image" style={{ fontSize: 16 }}></i> Choose Image
                  <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/gif" onChange={handleFile} style={{ display: 'none' }} />
                </label>

                {/* New file preview */}
                {imagePreview && (
                  <div style={{ position: 'relative' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e5e7eb' }} />
                    <button type="button" onClick={handleRemoveImage} style={{
                      position: 'absolute', top: -8, right: -8, background: '#dc2626', border: 'none',
                      borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 11
                    }}>
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                )}

                {/* Existing image when editing */}
                {!imagePreview && existingImage && !removeImage && (
                  <div style={{ position: 'relative' }}>
                    <img src={`${API_BASE}${existingImage}`} alt="Current" style={{ width: 90, height: 68, objectFit: 'cover', borderRadius: 8, border: '1.5px solid #e5e7eb' }} />
                    <button type="button" onClick={handleRemoveImage} style={{
                      position: 'absolute', top: -8, right: -8, background: '#dc2626', border: 'none',
                      borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 11
                    }}>
                      <i className="bi bi-x"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Publish toggle */}
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                <div
                  onClick={() => setForm(p => ({ ...p, is_published: !p.is_published }))}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: form.is_published ? 'var(--color-primary)' : '#d1d5db',
                    position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3, left: form.is_published ? 22 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
                  }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                  {form.is_published ? 'Published (visible to alumni)' : 'Draft (not visible)'}
                </span>
              </label>
            </div>
          </div>

          <button
            type="submit" disabled={saving || !form.title.trim()}
            style={{
              background: saving || !form.title.trim() ? '#9ca3af' : 'var(--color-primary)',
              color: '#fff', border: 'none', borderRadius: 10,
              padding: '11px 28px', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 8
            }}
          >
            <i className={`bi ${editId ? 'bi-check-lg' : 'bi-calendar-plus-fill'}`}></i>
            {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Event'}
          </button>
        </form>
      </div>

      {/* ── Events List ── */}
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{ padding: '18px 28px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="bi bi-calendar3" style={{ color: 'var(--color-primary)', fontSize: 16 }}></i>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>All Events</span>
          <span style={{ background: '#f3f4f6', color: '#6b7280', borderRadius: 20, padding: '2px 10px', fontSize: 12, fontWeight: 600 }}>{events.length}</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }}></div>
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 56, color: '#9ca3af' }}>
            <i className="bi bi-calendar-x" style={{ fontSize: 42 }}></i>
            <p style={{ marginTop: 12, fontWeight: 500 }}>No events yet. Create one above.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['Event', 'Category', 'Date', 'Location', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '12px 20px', textAlign: 'left', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortEvents(events).map(ev => {
                  const cc = catColor(ev.category);
                  const isEditing = editId === ev.id;
                  return (
                    <tr key={ev.id}
                      style={{ borderTop: '1px solid #f3f4f6', background: isEditing ? '#fffbeb' : '', transition: 'background 0.1s' }}
                      onMouseEnter={e => { if (!isEditing) e.currentTarget.style.background = '#f9fafb'; }}
                      onMouseLeave={e => { if (!isEditing) e.currentTarget.style.background = ''; }}
                    >
                      {/* Event col */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {ev.image ? (
                            <img src={`${API_BASE}${ev.image}`} alt={ev.title}
                              style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0, border: '1px solid #e5e7eb' }} />
                          ) : (
                            <div style={{ width: 52, height: 40, borderRadius: 6, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <i className="bi bi-image" style={{ color: '#d1d5db', fontSize: 18 }}></i>
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 600, color: '#111827', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</div>
                            {ev.description && <div style={{ fontSize: 12, color: '#9ca3af', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.description}</div>}
                          </div>
                        </div>
                      </td>
                      {/* Category */}
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ background: cc.bg, color: cc.text, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>{catLabel(ev.category)}</span>
                      </td>
                      {/* Date */}
                      <td style={{ padding: '14px 20px', color: '#374151', whiteSpace: 'nowrap' }}>{formatDate(ev.event_date)}</td>
                      {/* Location */}
                      <td style={{ padding: '14px 20px', color: '#374151', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.location || '—'}</td>
                      {/* Status */}
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          onClick={() => handleTogglePublish(ev)}
                          title={ev.is_published ? 'Click to unpublish' : 'Click to publish'}
                          style={{
                            background: ev.is_published ? '#dcfce7' : '#fef9c3',
                            color:      ev.is_published ? '#16a34a' : '#92400e',
                            border: `1.5px solid ${ev.is_published ? '#86efac' : '#fde68a'}`,
                            borderRadius: 20, padding: '4px 12px',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
                          }}
                        >
                          <i className={`bi ${ev.is_published ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                          {ev.is_published ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setSelectedEvent(ev)} title="View details" style={{ background: '#f0fdf4', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: '#16a34a', fontSize: 13 }}>
                            <i className="bi bi-eye-fill"></i>
                          </button>
                          <button onClick={() => { handleEdit(ev); setSelectedEvent(null); }} title="Edit" style={{ background: '#eff6ff', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: '#2563eb', fontSize: 13 }}>
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button onClick={() => handleDelete(ev)} title="Delete" style={{ background: '#fee2e2', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: '#dc2626', fontSize: 13 }}>
                            <i className="bi bi-trash-fill"></i>
                          </button>
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

      {/* ── Event Detail Modal ── */}
      {selectedEvent && (
        <div onClick={() => setSelectedEvent(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#fff', borderRadius: 20, maxWidth: 740, width: '100%',
            maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)'
          }}>
            {/* Hero image */}
            {selectedEvent.image ? (
              <img src={`${API_BASE}${selectedEvent.image}`} alt={selectedEvent.title}
                style={{ width: '100%', height: 280, objectFit: 'cover', display: 'block', borderRadius: '20px 20px 0 0' }} />
            ) : (
              <div style={{ height: 180, background: 'linear-gradient(135deg,#eef4ff,#ddeaff)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px 20px 0 0' }}>
                <i className="bi bi-calendar-event-fill" style={{ fontSize: 64, color: 'rgba(25,127,230,0.2)' }}></i>
              </div>
            )}

            <div style={{ padding: '28px 36px 36px' }}>
              {/* Header row: badges + close */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 12 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                  {(() => {
                    const cc = catColor(selectedEvent.category);
                    return (
                      <span style={{ background: cc.bg, color: cc.text, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>
                        {catLabel(selectedEvent.category)}
                      </span>
                    );
                  })()}
                  <span style={{
                    background: selectedEvent.is_published ? '#dcfce7' : '#fef9c3',
                    color:      selectedEvent.is_published ? '#16a34a' : '#92400e',
                    border: `1.5px solid ${selectedEvent.is_published ? '#86efac' : '#fde68a'}`,
                    borderRadius: 20, padding: '3px 12px', fontSize: 12, fontWeight: 700,
                    display: 'inline-flex', alignItems: 'center', gap: 5
                  }}>
                    <i className={`bi ${selectedEvent.is_published ? 'bi-eye-fill' : 'bi-eye-slash-fill'}`}></i>
                    {selectedEvent.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => { handleEdit(selectedEvent); setSelectedEvent(null); }} style={{
                    background: 'var(--color-primary)', color: '#fff', border: 'none',
                    borderRadius: 8, padding: '7px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6
                  }}>
                    <i className="bi bi-pencil-fill"></i> Edit
                  </button>
                  <button onClick={() => setSelectedEvent(null)} style={{
                    background: '#f3f4f6', border: 'none', borderRadius: '50%',
                    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 16, color: '#6b7280'
                  }}>
                    <i className="bi bi-x"></i>
                  </button>
                </div>
              </div>

              {/* Title */}
              <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: '#111827', marginBottom: 20, lineHeight: 1.2 }}>
                {selectedEvent.title}
              </h2>

              {/* Meta panel */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 28, padding: '18px 22px', background: '#f9fafb', borderRadius: 14 }}>
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
              {selectedEvent.description ? (
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 15, color: '#111827', marginBottom: 12 }}>About this Event</h3>
                  <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                    {selectedEvent.description}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#9ca3af' }}>
                  <i className="bi bi-file-text" style={{ fontSize: 28 }}></i>
                  <p style={{ marginTop: 8, fontSize: 13 }}>No description added yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
