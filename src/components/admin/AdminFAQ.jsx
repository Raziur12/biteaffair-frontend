import React, { useState, useEffect } from 'react';

const AdminFAQ = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [openItems, setOpenItems] = useState({});
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    sort_order: 0,
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/faq');
      const data = await response.json();
      if (data.success) setItems(data.data);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        question: item.question,
        answer: item.answer,
        sort_order: item.sort_order,
        is_active: item.is_active
      });
    } else {
      setEditingItem(null);
      setFormData({ question: '', answer: '', sort_order: 0, is_active: true });
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
        ? `http://localhost:5000/api/admin/faq/${editingItem.id}`
        : 'http://localhost:5000/api/admin/faq';
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
      console.error('Error saving FAQ:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await fetch(`http://localhost:5000/api/admin/faq/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const toggleFaq = (id) => {
    setOpenItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
        <button className="admin-btn admin-btn-orange" onClick={() => openModal()}>+ Add FAQ</button>
      </div>

      <div>
        {items.map(item => (
          <div key={item.id} className="admin-faq-item">
            <div className="admin-faq-q" onClick={() => toggleFaq(item.id)}>
              {item.question}
              <span style={{ color: 'var(--admin-muted)', fontSize: '16px' }}>
                {openItems[item.id] ? '⌃' : '⌄'}
              </span>
            </div>
            <div className={`admin-faq-a ${openItems[item.id] ? 'open' : ''}`}>
              {item.answer}
              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                <button className="admin-btn admin-btn-sm" onClick={() => openModal(item)}>✏️ Edit</button>
                <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(item.id)}>🗑️ Delete</button>
                <span className={item.is_active ? 'admin-badge admin-badge-green' : 'admin-badge admin-badge-gray'}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-hdr">
              <span className="admin-modal-title">{editingItem ? 'Edit FAQ' : 'Add FAQ'}</span>
              <button className="admin-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Question *</label>
                  <input
                    className="admin-form-input"
                    placeholder="Enter the question..."
                    value={formData.question}
                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Answer *</label>
                  <textarea
                    className="admin-form-textarea"
                    style={{ minHeight: '120px' }}
                    placeholder="Enter the detailed answer..."
                    value={formData.answer}
                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                    required
                  />
                </div>
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Sort Order</label>
                    <input
                      className="admin-form-input"
                      type="number"
                      value={formData.sort_order}
                      onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
                    />
                  </div>
                  {/* <div className="admin-form-group">
                    <label className="admin-form-label">Status</label>
                    <select
                      className="admin-form-select"
                      value={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div> */}
                  {/* Status Toggle */}
                  <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                    <label className="admin-form-label">Status</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        className="admin-toggle"
                        onClick={() => setFormData({ ...formData, status: formData.status === 'active' ? 'draft' : 'active' })}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={`admin-toggle-track ${formData.status === 'active' ? 'on' : ''}`}>
                          <div className="admin-toggle-thumb"></div>
                        </div>
                      </div>
                      <span style={{ fontSize: '14px', color: formData.status === 'active' ? 'var(--admin-success)' : 'var(--admin-muted)' }}>
                        {formData.status === 'active' ? 'Active on website' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-orange">💾 Save FAQ</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFAQ;
