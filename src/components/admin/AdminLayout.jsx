import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import './AdminLayout.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [adminUser] = useState({ name: 'Super Admin', email: 'admin@biteaffair.in', initials: 'SA' });

  const navItems = [
    { section: 'Overview', items: [{ id: 'dashboard', icon: '📊', label: 'Dashboard', path: '/admin' }] },
    {
      section: 'Content Management',
      items: [
        { id: 'menu', icon: '🍛', label: 'Menu Items', path: '/admin/menu', badge: '24' },
        { id: 'gallery', icon: '🖼️', label: 'Gallery', path: '/admin/gallery', badge: '38' },
        { id: 'hero', icon: '🎨', label: 'Hero Banners', path: '/admin/hero' },
        { id: 'faq', icon: '❓', label: 'FAQ', path: '/admin/faq' },
        { id: 'testimonials', icon: '⭐', label: 'Testimonials', path: '/admin/testimonials' },
      ]
    },
    {
      section: 'Business',
      items: [
        { id: 'enquiries', icon: '📋', label: 'Enquiries', path: '/admin/enquiries', badge: '3', badgeClass: 'green' },
        { id: 'locations', icon: '📍', label: 'Locations', path: '/admin/locations' },
      ]
    },
    {
      section: 'Config',
      items: [{ id: 'settings', icon: '⚙️', label: 'Site Settings', path: '/admin/settings' }]
    }
  ];

  const handleLogout = () => {
    if (window.confirm('Logout karna chahte hain?')) {
      navigate('/');
    }
  };

  const getPageTitle = () => {
    const path = window.location.pathname;
    if (path === '/admin' || path === '/admin/') return { bc: 'Overview', title: 'Dashboard' };
    if (path.includes('/menu')) return { bc: 'Content', title: 'Menu Items' };
    if (path.includes('/gallery')) return { bc: 'Content', title: 'Gallery' };
    if (path.includes('/hero')) return { bc: 'Content', title: 'Hero Banners' };
    if (path.includes('/faq')) return { bc: 'Content', title: 'FAQ' };
    if (path.includes('/testimonials')) return { bc: 'Content', title: 'Testimonials' };
    if (path.includes('/enquiries')) return { bc: 'Business', title: 'Enquiries' };
    if (path.includes('/locations')) return { bc: 'Business', title: 'Locations' };
    if (path.includes('/settings')) return { bc: 'Config', title: 'Site Settings' };
    return { bc: 'Overview', title: 'Dashboard' };
  };

  const { bc, title } = getPageTitle();

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-row">
            <div className="admin-brand-icon">🍽️</div>
            <div>
              <div className="admin-brand-name">BiteAffair</div>
              <div className="admin-brand-sub">Admin Panel</div>
            </div>
          </div>
        </div>
        <nav className="admin-nav">
          {navItems.map((group, idx) => (
            <div key={idx}>
              <div className="admin-nav-sec">{group.section}</div>
              {group.items.map((item) => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                  end={item.path === '/admin'}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`admin-nav-badge ${item.badgeClass || ''}`}>{item.badge}</span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="admin-sb-footer">
          <div className="admin-sb-avatar">{adminUser.initials}</div>
          <div>
            <div className="admin-sb-name">{adminUser.name}</div>
            <div className="admin-sb-role">{adminUser.email}</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="admin-main">
        <div className="admin-topbar">
          <span className="admin-topbar-bc">{bc}</span>
          <span className="admin-topbar-sep">›</span>
          <span className="admin-topbar-title">{title}</span>
          <button className="admin-btn admin-btn-sm" style={{ fontSize: '12px' }}>🔔</button>
          <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={handleLogout}>Logout</button>
        </div>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
