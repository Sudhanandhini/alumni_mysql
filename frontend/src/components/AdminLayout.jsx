import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NAV = [
  { key: '/admin',              icon: 'bi-grid-fill',         label: 'Dashboard'          },
  { key: '/admin/add',          icon: 'bi-person-plus-fill',  label: 'Add Alumni'         },
  { key: '/admin/manage',       icon: 'bi-people-fill',       label: 'Manage Alumni'      },
  { key: '/admin/pending',      icon: 'bi-hourglass-split',   label: 'Pending Approvals', badge: true },
  { key: '/admin/manage-users', icon: 'bi-person-badge-fill', label: 'Manage Users'       },
];

export default function AdminLayout({ children, title }) {
  const navigate          = useNavigate();
  const location          = useLocation();
  const [open, setOpen]   = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    axios.get(`${API_URL}/admin/alumni/pending-count`)
      .then(r => setCount(r.data.count))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: open ? 230 : 64, flexShrink: 0, background: '#1a2744',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s', overflow: 'hidden',
        position: 'sticky', top: 0, height: '100vh', zIndex: 200
      }}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 border-b border-white/10" style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 10, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-mortarboard-fill text-white" style={{ fontSize: 17 }}></i>
          </div>
          {open && (
            <div style={{ overflow: 'hidden' }}>
              <div className="text-white font-bold text-sm whitespace-nowrap">Alumni Portal</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>Admin Panel</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {NAV.map(n => {
            const active = location.pathname === n.key;
            return (
              <button key={n.key} onClick={() => navigate(n.key)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                marginBottom: 4,
                background: active ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                fontWeight: active ? 700 : 500, fontSize: 14,
                transition: 'all 0.15s', whiteSpace: 'nowrap', overflow: 'hidden',
                position: 'relative'
              }}>
                <i className={`bi ${n.icon}`} style={{ fontSize: 18, flexShrink: 0 }}></i>
                {open && <span>{n.label}</span>}
                {n.badge && count > 0 && open && (
                  <span style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700 }}>{count}</span>
                )}
                {n.badge && count > 0 && !open && (
                  <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }}></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'transparent', color: 'rgba(255,255,255,0.45)',
            fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', transition: 'all 0.15s'
          }}>
            <i className="bi bi-box-arrow-right" style={{ fontSize: 18, flexShrink: 0 }}></i>
            {open && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-40" style={{ height: 60, padding: '0 28px' }}>
          <div className="flex items-center gap-4">
            <button onClick={() => setOpen(p => !p)} className="bg-transparent border-0 cursor-pointer text-gray-400 hover:text-primary-700 rounded-lg p-1 transition-colors text-xl">
              <i className="bi bi-list"></i>
            </button>
            <h1 className="text-primary-700 font-bold text-lg m-0">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <div className="text-primary-700 font-bold text-sm">Admin</div>
              <div className="text-gray-400 text-xs">Administrator</div>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#1a2744' }}>A</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto" style={{ padding: 28 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
