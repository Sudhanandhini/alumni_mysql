import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function FeaturedAlumniEmbed() {
  const [alumni, setAlumni]   = useState([]);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(window.location.search);
  const limit  = params.get('limit') || 12;
  const cols   = params.get('cols')  || 4;
  const theme  = params.get('theme') || 'light';

  const isDark = theme === 'dark';

  const bg       = isDark ? '#1e293b' : '#ffffff';
  const cardBg   = isDark ? '#0f172a' : '#ffffff';
  const cardBorder = isDark ? '#334155' : '#e5e7eb';
  const namColor = isDark ? '#f1f5f9' : '#111827';
  const subColor = isDark ? '#94a3b8' : '#6b7280';

  useEffect(() => {
    fetch(`${API_URL}/featured-alumni?limit=${limit}`)
      .then(r => r.json())
      .then(d => setAlumni(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [limit]);

  const statusColor = s => {
    if (!s) return { bg: '#f3f4f6', text: '#6b7280' };
    const v = s.toLowerCase();
    if (v.includes('employ') || v.includes('work')) return { bg: '#dcfce7', text: '#16a34a' };
    if (v.includes('self'))   return { bg: '#ede9fe', text: '#7c3aed' };
    if (v.includes('stud'))   return { bg: '#e0f2fe', text: '#0891b2' };
    return { bg: '#f3f4f6', text: '#6b7280' };
  };

  return (
    <div style={{ background: bg, padding: '24px 16px 20px', fontFamily: 'Inter,sans-serif', minHeight: '100%', boxSizing: 'border-box' }}>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h2 style={{ fontWeight: 900, fontSize: '1.5rem', color: namColor, margin: 0, marginBottom: 4 }}>
          Featured Alumni
        </h2>
        <p style={{ color: subColor, fontSize: 13, margin: 0 }}>Our distinguished graduates making an impact worldwide</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{ width: 36, height: 36, border: `3px solid #197fe6`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}></div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : alumni.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: subColor, fontSize: 14 }}>No featured alumni available.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(Number(cols), alumni.length)}, 1fr)`, gap: 16, maxWidth: 1200, margin: '0 auto' }}>
          {alumni.map(a => {
            const sc = statusColor(a.current_status);
            const initials = a.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
            return (
              <div key={a.id} style={{
                background: cardBg, border: `1px solid ${cardBorder}`,
                borderRadius: 16, padding: '22px 16px 18px',
                textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s', position: 'relative'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}
              >
                {/* Status badge */}
                {a.current_status && (
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    background: sc.bg, color: sc.text,
                    fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 20,
                    textTransform: 'uppercase', letterSpacing: '0.5px'
                  }}>{a.current_status}</span>
                )}

                {/* Photo */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                  {a.photo ? (
                    <img src={a.photo} alt={a.name}
                      style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid #197fe6', boxShadow: '0 4px 14px rgba(25,127,230,0.2)' }} />
                  ) : (
                    <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#197fe6,#1251a3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24, border: '3px solid #197fe6', boxShadow: '0 4px 14px rgba(25,127,230,0.2)' }}>
                      {initials}
                    </div>
                  )}
                </div>

                {/* Name */}
                <div style={{ fontWeight: 800, fontSize: 14, color: namColor, marginBottom: 4, textTransform: 'capitalize' }}>{a.name}</div>

                {/* Designation */}
                {(a.designation || a.organization_name) && (
                  <div style={{ fontSize: 11, color: '#197fe6', fontWeight: 600, marginBottom: 10 }}>
                    {a.designation}{a.designation && a.organization_name ? ' · ' : ''}{a.organization_name}
                  </div>
                )}

                {/* Divider */}
                <div style={{ width: 32, height: 2, background: isDark ? '#334155' : '#e5e7eb', borderRadius: 2, margin: '0 auto 10px' }}></div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {a.institution && (
                    <div style={{ fontSize: 11, color: subColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <svg width="11" height="11" fill="currentColor" viewBox="0 0 16 16"><path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917l-7.5-3.5Z"/><path d="M4.176 9.032a.5.5 0 0 0-.656.327l-.5 1.7a.5.5 0 0 0 .294.605l4.5 1.8a.5.5 0 0 0 .372 0l4.5-1.8a.5.5 0 0 0 .294-.605l-.5-1.7a.5.5 0 0 0-.656-.327L8 10.466 4.176 9.032Z"/></svg>
                      {a.institution}{a.batch ? `, ${a.batch}` : ''}
                    </div>
                  )}
                  {a.work_location && (
                    <div style={{ fontSize: 11, color: subColor, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                      <svg width="11" height="11" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>
                      {a.work_location}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Powered by */}
      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: isDark ? '#475569' : '#d1d5db' }}>
        Powered by <span style={{ color: '#197fe6', fontWeight: 700 }}>Alumni Connect</span>
      </div>
    </div>
  );
}

export default FeaturedAlumniEmbed;
