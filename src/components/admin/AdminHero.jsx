import React, { useState, useEffect } from 'react';

const AdminHero = () => {
  const [items, setItems] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    heading: '',
    subheading: '',
    cta_text: 'Book Now',
    cta_link: '/contact',
    background_image: '',
    location_id: '',
    gradient_from: '#1B2C6B',
    gradient_to: '#2540A0',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [heroRes, locRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/hero'),
        fetch('http://localhost:5000/api/admin/locations')
      ]);

      const [heroData, locData] = await Promise.all([
        heroRes.json(),
        locRes.json()
      ]);

      if (heroData.success) setItems(heroData.data);
      if (locData.success) setLocations(locData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        heading: item.heading,
        subheading: item.subheading || '',
        cta_text: item.cta_text,
        cta_link: item.cta_link,
        background_image: item.background_image || '',
        location_id: item.location_id || '',
        gradient_from: item.gradient_from,
        gradient_to: item.gradient_to,
        sort_order: item.sort_order,
        is_active: item.is_active
      });
    } else {
      setEditingItem(null);
      setFormData({
        heading: '',
        subheading: '',
        cta_text: 'Book Now',
        cta_link: '/contact',
        background_image: '',
        location_id: '',
        gradient_from: '#1B2C6B',
        gradient_to: '#2540A0',
        sort_order: 0,
        is_active: true
      });
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
        ? `http://localhost:5000/api/admin/hero/${editingItem.id}`
        : 'http://localhost:5000/api/admin/hero';
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
      console.error('Error saving hero banner:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/hero/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <button className="admin-btn admin-btn-orange" onClick={() => openModal()}>+ Add Banner</button>
      </div>

      <div className="admin-three-col">
        {items.map(item => (
          <div key={item.id} className="admin-card">
            <div style={{
              height: '140px',
              background: `linear-gradient(135deg, ${item.gradient_from}, ${item.gradient_to})`,
              borderRadius: '12px 12px 0 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexDirection: 'column',
              gap: '6px',
              textAlign: 'center',
              padding: '16px'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{item.heading}</div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>{item.subheading}</div>
              <div style={{
                background: item.gradient_from.includes('E8590C') ? '#fff' : 'var(--admin-orange)',
                color: item.gradient_from.includes('E8590C') ? 'var(--admin-blue)' : '#fff',
                fontSize: '11px',
                padding: '4px 14px',
                borderRadius: '20px',
                marginTop: '4px',
                fontWeight: 600
              }}>
                {item.cta_text}
              </div>
            </div>
            <div style={{ padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className={item.is_active ? 'admin-badge admin-badge-green' : 'admin-badge admin-badge-gray'}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--admin-muted)' }}>
                  {item.location_name || 'All Locations'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button className="admin-btn admin-btn-sm" style={{ flex: 1 }} onClick={() => openModal(item)}>✏️ Edit</button>
                <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(item.id)}>🗑️</button>
              </div>
            </div>
          </div>
        ))}

        <div
          className="admin-card"
          style={{
            border: '2px dashed var(--admin-border)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '220px',
            gap: '8px'
          }}
          onClick={() => openModal()}
        >
          <div style={{ fontSize: '36px' }}>🎨</div>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--admin-muted)' }}>Add New Banner</div>
          <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Click to create</div>
        </div>
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-hdr">
              <span className="admin-modal-title">{editingItem ? 'Edit Banner' : 'Add Banner'}</span>
              <button className="admin-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Heading *</label>
                  <input
                    className="admin-form-input"
                    placeholder="e.g. Premium Catering Services"
                    value={formData.heading}
                    onChange={e => setFormData({ ...formData, heading: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Subheading</label>
                  <input
                    className="admin-form-input"
                    placeholder="Your trusted catering partner..."
                    value={formData.subheading}
                    onChange={e => setFormData({ ...formData, subheading: e.target.value })}
                  />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">CTA Button Text</label>
                    <input
                      className="admin-form-input"
                      value={formData.cta_text}
                      onChange={e => setFormData({ ...formData, cta_text: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">CTA Link</label>
                    <input
                      className="admin-form-input"
                      value={formData.cta_link}
                      onChange={e => setFormData({ ...formData, cta_link: e.target.value })}
                    />
                  </div>
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Location</label>
                    <select
                      className="admin-form-select"
                      value={formData.location_id}
                      onChange={e => setFormData({ ...formData, location_id: e.target.value })}
                    >
                      <option value="">All Locations</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
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
                <div className="admin-form-group">
                  <label className="admin-form-label">Background Image URL</label>
                  <input
                    className="admin-form-input"
                    placeholder="https://..."
                    value={formData.background_image}
                    onChange={e => setFormData({ ...formData, background_image: e.target.value })}
                  />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Gradient From</label>
                    <input
                      className="admin-form-input"
                      value={formData.gradient_from}
                      onChange={e => setFormData({ ...formData, gradient_from: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Gradient To</label>
                    <input
                      className="admin-form-input"
                      value={formData.gradient_to}
                      onChange={e => setFormData({ ...formData, gradient_to: e.target.value })}
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Status</label>
                  <select
                    className="admin-form-select"
                    value={formData.is_active}
                    onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-orange">💾 Save Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHero;
