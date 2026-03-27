import React, { useState, useEffect } from 'react';

const AdminLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '📍',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/locations');
      const data = await response.json();
      if (data.success) setLocations(data.data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        slug: item.slug,
        icon: item.icon,
        sort_order: item.sort_order,
        is_active: item.is_active
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', slug: '', icon: '📍', sort_order: 0, is_active: true });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingItem
        ? `http://localhost:5000/api/admin/locations/${editingItem.id}`
        : 'http://localhost:5000/api/admin/locations';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        fetchData();
        closeModal();
      }
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This may affect menu items and enquiries linked to this location.')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/locations/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const toggleActive = async (item) => {
    try {
      await fetch(`http://localhost:5000/api/admin/locations/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, is_active: !item.is_active })
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling:', error);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <button className="admin-btn admin-btn-orange" onClick={() => openModal()}>+ Add Location</button>
      </div>

      <div className="admin-card">
        <div className="admin-tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Slug</th>
                <th>Menu Items</th>
                <th>Active</th>
                <th>Sort</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{item.icon}</span>
                      <span className="admin-item-name">{item.name}</span>
                    </div>
                  </td>
                  <td>
                    <code style={{ fontSize: '12px', background: '#F3F4F6', padding: '2px 6px', borderRadius: '4px' }}>
                      {item.slug}
                    </code>
                  </td>
                  <td>{item.menu_count || 0}</td>
                  <td>
                    <div
                      className="admin-toggle"
                      onClick={() => toggleActive(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={`admin-toggle-track ${item.is_active ? 'on' : ''}`}>
                        <div className="admin-toggle-thumb"></div>
                      </div>
                    </div>
                  </td>
                  <td>{item.sort_order}</td>
                  <td>
                    <button className="admin-btn admin-btn-sm" onClick={() => openModal(item)}>✏️ Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-hdr">
              <span className="admin-modal-title">{editingItem ? 'Edit Location' : 'Add Location'}</span>
              <button className="admin-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Name *</label>
                    <input
                      className="admin-form-input"
                      placeholder="e.g. Delhi"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Slug *</label>
                    <input
                      className="admin-form-input"
                      placeholder="e.g. delhi"
                      value={formData.slug}
                      onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      required
                    />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Icon (Emoji)</label>
                    <input
                      className="admin-form-input"
                      placeholder="📍"
                      value={formData.icon}
                      onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Sort Order</label>
                    <input
                      className="admin-form-input"
                      type="number"
                      value={formData.sort_order}
                      onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Active</label>
                  <div
                    className="admin-toggle"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                  >
                    <div className={`admin-toggle-track ${formData.is_active ? 'on' : ''}`}>
                      <div className="admin-toggle-thumb"></div>
                    </div>
                    <span>{formData.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-orange">💾 Save Location</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLocations;
