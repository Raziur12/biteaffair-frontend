import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    menuItems: 0,
    newEnquiries: 0,
    avgRating: '0.0',
    galleryCount: 0,
    totalEnquiries: 0,
    activeMenuItems: 0,
    ratingBreakdown: {},
    recentEnquiries: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <span className="admin-badge admin-enq-new">New</span>;
      case 'contacted': return <span className="admin-badge admin-enq-contacted">Contacted</span>;
      case 'quoted': return <span className="admin-badge admin-enq-quoted">Quoted</span>;
      case 'closed': return <span className="admin-badge admin-enq-closed">Closed</span>;
      default: return <span className="admin-badge admin-badge-gray">{status}</span>;
    }
  };

  const getRatingPercentage = (star) => {
    const total = stats.ratingBreakdown.total || 1;
    const count = stats.ratingBreakdown[`${star}_star`] || 0;
    return Math.round((count / total) * 100);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div>
      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">🍛</div>
          <div className="admin-stat-num">{stats.activeMenuItems}</div>
          <div className="admin-stat-lbl">Active Menu Items</div>
          <div className="admin-stat-sub admin-up">↑ +3 this month</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon orange">📋</div>
          <div className="admin-stat-num">{stats.newEnquiries}</div>
          <div className="admin-stat-lbl">New Enquiries</div>
          <div className="admin-stat-sub admin-down">Needs response</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">⭐</div>
          <div className="admin-stat-num">{stats.avgRating}</div>
          <div className="admin-stat-lbl">Average Rating</div>
          <div className="admin-stat-sub admin-up">{stats.ratingBreakdown?.total || 0} reviews</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon red">🖼️</div>
          <div className="admin-stat-num">{stats.galleryCount}</div>
          <div className="admin-stat-lbl">Gallery Images</div>
          <div className="admin-stat-sub admin-up">All active</div>
        </div>
      </div>

      <div className="admin-two-col">
        {/* Recent Enquiries */}
        <div className="admin-card">
          <div className="admin-card-hdr">
            <span className="admin-card-title">Recent Enquiries</span>
            <button className="admin-btn admin-btn-sm" onClick={() => navigate('/admin/enquiries')}>View All</button>
          </div>
          <div className="admin-tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentEnquiries.map((enquiry) => (
                  <tr key={enquiry.id}>
                    <td>
                      <div className="admin-item-name">{enquiry.full_name}</div>
                      <div className="admin-item-sub">📞 {enquiry.phone}</div>
                    </td>
                    <td>{enquiry.event_type}</td>
                    <td>{new Date(enquiry.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td>{getStatusBadge(enquiry.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Rating Breakdown */}
          <div className="admin-card">
            <div className="admin-card-hdr">
              <span className="admin-card-title">Rating Breakdown</span>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '14px' }}>
                <div style={{ fontSize: '42px', fontWeight: 700, color: 'var(--admin-blue)' }}>{stats.avgRating}</div>
                <div>
                  <div className="admin-stars">★★★★★</div>
                  <div style={{ fontSize: '12px', color: 'var(--admin-muted)', marginTop: '3px' }}>
                    Based on {stats.ratingBreakdown?.total || 0} reviews
                  </div>
                </div>
              </div>
              {[5, 4, 3, 2, 1].map((star) => (
                <div className="admin-rating-bar-row" key={star}>
                  <span>{star}★</span>
                  <div className="admin-rating-bar">
                    <div
                      className="admin-rating-bar-fill"
                      style={{ width: `${getRatingPercentage(star)}%` }}
                    />
                  </div>
                  <span>{getRatingPercentage(star)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="admin-card">
            <div className="admin-card-hdr">
              <span className="admin-card-title">Quick Stats</span>
            </div>
            <div style={{ padding: 0 }}>
              <div className="admin-setting-row" style={{ padding: '12px 16px' }}>
                <span className="admin-setting-key" style={{ width: 'auto', flex: 1, fontSize: '12px', color: 'var(--admin-muted)' }}>
                  Happy Customers
                </span>
                <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--admin-blue)' }}>500+</span>
              </div>
              <div className="admin-setting-row" style={{ padding: '12px 16px' }}>
                <span className="admin-setting-key" style={{ width: 'auto', flex: 1, fontSize: '12px', color: 'var(--admin-muted)' }}>
                  Events Catered
                </span>
                <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--admin-blue)' }}>1000+</span>
              </div>
              <div className="admin-setting-row" style={{ padding: '12px 16px' }}>
                <span className="admin-setting-key" style={{ width: 'auto', flex: 1, fontSize: '12px', color: 'var(--admin-muted)' }}>
                  Years Experience
                </span>
                <span style={{ fontWeight: 700, fontSize: '16px', color: 'var(--admin-blue)' }}>3+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
