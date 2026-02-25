import React from "react";

const Footer = () => {
  return (
    <footer style={{ background: '#1a2744', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        {/* <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="bi bi-mortarboard-fill" style={{ fontSize: 15 }}></i>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15 }}>Alumni Portal</span>
        </div> */}
        <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
          © 2025 Alumni Portal. All Rights Reserved.
        </p>
           <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
        Developed by Sunsys Technologies
        </p>
        {/* <div style={{ display: 'flex', gap: 16 }}>
          {['Home', 'Register', 'Login'].map(link => (
            <a key={link} href={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
              style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}>
              {link}
            </a>
          ))}
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;
