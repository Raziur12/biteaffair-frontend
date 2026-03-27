import React, { useState, useEffect } from 'react';

const AdminGallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    section: 'general',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, [section]);

  const fetchData = async () => {
    try {
      const url = section
        ? `http://localhost:5000/api/admin/gallery?section=${section}`
        : 'http://localhost:5000/api/admin/gallery';
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) setItems(data.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        image_url: item.image_url || '',
        section: item.section,
        sort_order: item.sort_order,
        is_active: item.is_active
      });
    } else {
      setEditingItem(null);
      setFormData({ title: '', image_url: '', section: 'general', sort_order: 0, is_active: true });
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
        ? `http://localhost:5000/api/admin/gallery/${editingItem.id}`
        : 'http://localhost:5000/api/admin/gallery';
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
      console.error('Error saving gallery item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/gallery/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const getEmoji = (section) => {
    const emojis = { food: '🍛', events: '🎉', team: '👥', general: '📷' };
    return emojis[section] || '📷';
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <div className="admin-card">
        <div className="admin-card-hdr">
          <span className="admin-card-title">Gallery Images</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="admin-form-select"
              style={{ width: '140px' }}
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              <option value="">All Sections</option>
              <option value="food">Food</option>
              <option value="events">Events</option>
              <option value="team">Team</option>
              <option value="general">General</option>
            </select>
            <button className="admin-btn admin-btn-orange" onClick={() => openModal()}>+ Upload Images</button>
          </div>
        </div>

        <div className="admin-gallery-grid">
          {items.map(item => (
            <div key={item.id} className="admin-gallery-thumb">
              <div className="admin-img-emoji">{getEmoji(item.section)}</div>
              <div className="admin-g-overlay">
                <button className="admin-btn admin-btn-sm" onClick={() => openModal(item)}>✏️</button>
                <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(item.id)}>🗑️</button>
              </div>
            </div>
          ))}
          <div className="admin-gallery-thumb admin-gallery-upload" onClick={() => openModal()}>
            <div style={{ fontSize: '28px', color: '#9CA3AF' }}>+</div>
            <div style={{ fontSize: '12px', color: 'var(--admin-muted)' }}>Upload Image</div>
            <div style={{ fontSize: '11px', color: '#D1D5DB' }}>JPG, PNG, WebP</div>
          </div>
        </div>

        <div className="admin-pg">
          <span>Showing {items.length} of {items.length} images</span>
          <div className="admin-pg-btns">
            <button className="admin-pg-btn cur">1</button>
            <button className="admin-pg-btn">2</button>
            <button className="admin-pg-btn">3</button>
            <button className="admin-pg-btn">›</button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-hdr">
              <span className="admin-modal-title">{editingItem ? 'Edit Image' : 'Add Image'}</span>
              <button className="admin-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Title</label>
                  <input
                    className="admin-form-input"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Image URL</label>
                  <input
                    className="admin-form-input"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Section</label>
                    <select
                      className="admin-form-select"
                      value={formData.section}
                      onChange={e => setFormData({ ...formData, section: e.target.value })}
                    >
                      <option value="food">Food</option>
                      <option value="events">Events</option>
                      <option value="team">Team</option>
                      <option value="general">General</option>
                    </select>
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
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-orange">💾 Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
