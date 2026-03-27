import React, { useState, useEffect } from 'react';

const AdminTestimonials = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: '',
    event_type: '',
    review_text: '',
    rating: 5,
    is_visible: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/testimonials');
      const data = await response.json();
      if (data.success) setItems(data.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        customer_name: item.customer_name,
        event_type: item.event_type || '',
        review_text: item.review_text,
        rating: item.rating,
        is_visible: item.is_visible,
        sort_order: item.sort_order
      });
    } else {
      setEditingItem(null);
      setFormData({ customer_name: '', event_type: '', review_text: '', rating: 5, is_visible: true, sort_order: 0 });
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
        ? `http://localhost:5000/api/admin/testimonials/${editingItem.id}`
        : 'http://localhost:5000/api/admin/testimonials';
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
      console.error('Error saving testimonial:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/testimonials/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const toggleVisible = async (item) => {
    try {
      await fetch(`http://localhost:5000/api/admin/testimonials/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, is_visible: !item.is_visible })
      });
      fetchData();
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  const getStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <button className="admin-btn admin-btn-orange" onClick={() => openModal()}>+ Add Review</button>
      </div>

      <div className="admin-card">
        <div className="admin-card-hdr">
          <span className="admin-card-title">Customer Reviews</span>
        </div>
        <div className="admin-tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Event Type</th>
                <th>Review</th>
                <th>Rating</th>
                <th>Visible</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><div className="admin-item-name">{item.customer_name}</div></td>
                  <td>{item.event_type}</td>
                  <td style={{ maxWidth: '250px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--admin-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.review_text}
                    </div>
                  </td>
                  <td><span className="admin-stars">{getStars(item.rating)}</span></td>
                  <td>
                    <div
                      className="admin-toggle"
                      onClick={() => toggleVisible(item)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={`admin-toggle-track ${item.is_visible ? 'on' : ''}`}>
                        <div className="admin-toggle-thumb"></div>
                      </div>
                    </div>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="admin-btn admin-btn-sm" onClick={() => openModal(item)}>✏️</button>
                    <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(item.id)}>🗑️</button>
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
              <span className="admin-modal-title">{editingItem ? 'Edit Review' : 'Add Review'}</span>
              <button className="admin-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Customer Name *</label>
                    <input
                      className="admin-form-input"
                      placeholder="Priya Sharma"
                      value={formData.customer_name}
                      onChange={e => setFormData({ ...formData, customer_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Event Type</label>
                    <input
                      className="admin-form-input"
                      placeholder="Wedding, Corporate..."
                      value={formData.event_type}
                      onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Review Text *</label>
                  <textarea
                    className="admin-form-textarea"
                    style={{ minHeight: '100px' }}
                    placeholder="Customer review..."
                    value={formData.review_text}
                    onChange={e => setFormData({ ...formData, review_text: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Rating</label>
                    <select
                      className="admin-form-select"
                      value={formData.rating}
                      onChange={e => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                    >
                      <option value="5">5 ★★★★★</option>
                      <option value="4">4 ★★★★☆</option>
                      <option value="3">3 ★★★☆☆</option>
                      <option value="2">2 ★★☆☆☆</option>
                      <option value="1">1 ★☆☆☆☆</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Visible on Site</label>
                    <div style={{ paddingTop: '8px' }}>
                      <div
                        className="admin-toggle"
                        onClick={() => setFormData({ ...formData, is_visible: !formData.is_visible })}
                      >
                        <div className={`admin-toggle-track ${formData.is_visible ? 'on' : ''}`}>
                          <div className="admin-toggle-thumb"></div>
                        </div>
                        <span>{formData.is_visible ? 'Visible' : 'Hidden'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-orange">💾 Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTestimonials;
