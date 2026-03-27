import React, { useState, useEffect } from 'react';

const AdminEnquiries = () => {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, inProgress: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const url = statusFilter
        ? `http://localhost:5000/api/admin/enquiries?status=${statusFilter}`
        : 'http://localhost:5000/api/admin/enquiries';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setItems(data.data);
        // Calculate stats
        const total = data.data.length;
        const newCount = data.data.filter(i => i.status === 'new').length;
        const inProgress = data.data.filter(i => ['contacted', 'quoted'].includes(i.status)).length;
        const closed = data.data.filter(i => i.status === 'closed').length;
        setStats({ total, new: newCount, inProgress, closed });
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setDetailModalOpen(true);
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedItem(null);
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const item = items.find(i => i.id === id);
      await fetch(`http://localhost:5000/api/admin/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, status: newStatus })
      });
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'new': return <span className="admin-badge admin-enq-new">New</span>;
      case 'contacted': return <span className="admin-badge admin-enq-contacted">Contacted</span>;
      case 'quoted': return <span className="admin-badge admin-enq-quoted">Quoted</span>;
      case 'closed': return <span className="admin-badge admin-enq-closed">Closed</span>;
      default: return <span className="admin-badge">{status}</span>;
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      {/* Stats */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '16px' }}>
        <div className="admin-stat-card">
          <div style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>Total Enquiries</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--admin-blue)' }}>{stats.total}</div>
        </div>
        <div className="admin-stat-card">
          <div style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>New</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#1E40AF' }}>{stats.new}</div>
        </div>
        <div className="admin-stat-card">
          <div style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>In Progress</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--admin-warn)' }}>{stats.inProgress}</div>
        </div>
        <div className="admin-stat-card">
          <div style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>Closed</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--admin-success)' }}>{stats.closed}</div>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="admin-card">
        <div className="admin-card-hdr">
          <span className="admin-card-title">All Enquiries</span>
          <select
            className="admin-form-select"
            style={{ width: '130px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="admin-tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Event</th>
                <th>Date</th>
                <th>Pax</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="admin-item-name">{item.full_name}</div>
                    <div className="admin-item-sub">{item.email}</div>
                  </td>
                  <td>{item.phone}</td>
                  <td>{item.event_type}</td>
                  <td>{item.event_date ? new Date(item.event_date).toLocaleDateString() : '-'}</td>
                  <td>{item.guest_count}</td>
                  <td>{item.location_name || '-'}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="admin-btn admin-btn-sm" onClick={() => openDetailModal(item)}>👁️ View</button>
                    <select
                      className="admin-form-select"
                      style={{ width: '110px', padding: '4px 6px', fontSize: '11px', display: 'inline-block' }}
                      value={item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value)}
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="quoted">quoted</option>
                      <option value="closed">closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-pg">
          <span>Showing {items.length} enquiries</span>
          <div className="admin-pg-btns">
            <button className="admin-pg-btn cur">1</button>
            <button className="admin-pg-btn">2</button>
            <button className="admin-pg-btn">›</button>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailModalOpen && selectedItem && (
        <div className="admin-modal-overlay" onClick={closeDetailModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-hdr">
              <span className="admin-modal-title">Enquiry Details</span>
              <button className="admin-modal-close" onClick={closeDetailModal}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginBottom: '3px' }}>Full Name</div>
                  <div style={{ fontWeight: 500 }}>{selectedItem.full_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginBottom: '3px' }}>Phone</div>
                  <div style={{ fontWeight: 500 }}>{selectedItem.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginBottom: '3px' }}>Email</div>
                  <div style={{ fontWeight: 500 }}>{selectedItem.email || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginBottom: '3px' }}>Event Type</div>
                  <div style={{ fontWeight: 500 }}>{selectedItem.event_type}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginBottom: '3px' }}>Event Date</div>
                  <div style={{ fontWeight: 500 }}>{selectedItem.event_date ? new Date(selectedItem.event_date).toLocaleDateString() : '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginBottom: '3px' }}>Guest Count</div>
                  <div style={{ fontWeight: 500 }}>{selectedItem.guest_count} persons</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginBottom: '3px' }}>Location</div>
                  <div style={{ fontWeight: 500 }}>{selectedItem.location_name || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginBottom: '3px' }}>Status</div>
                  {getStatusBadge(selectedItem.status)}
                </div>
              </div>

              <div className="admin-form-group">
                <div style={{ fontSize: '11px', color: 'var(--admin-muted)', marginBottom: '3px' }}>Message</div>
                <div style={{ background: '#F9FAFB', border: '1px solid var(--admin-border)', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--admin-text)', lineHeight: 1.6 }}>
                  {selectedItem.message || 'No message provided'}
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label className="admin-form-label">Update Status</label>
                  <select
                    className="admin-form-select"
                    value={selectedItem.status}
                    onChange={(e) => updateStatus(selectedItem.id, e.target.value)}
                  >
                    <option value="new">new</option>
                    <option value="contacted">contacted</option>
                    <option value="quoted">quoted</option>
                    <option value="closed">closed</option>
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Admin Notes</label>
                  <input
                    className="admin-form-input"
                    placeholder="Add internal notes..."
                    defaultValue={selectedItem.admin_notes || ''}
                  />
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn" onClick={closeDetailModal}>Close</button>
              <button className="admin-btn admin-btn-primary" onClick={() => { updateStatus(selectedItem.id, selectedItem.status); closeDetailModal(); }}>
                💾 Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEnquiries;
