import React, { useState, useEffect } from 'react';

const AdminMenu = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState({ category: '', meal_type: '', status: '', search: '' });
  const [activeTab, setActiveTab] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    meal_type: 'veg',
    price_per_pax: '',
    min_pax: '',
    serves: '',
    location_id: '',
    image_url: '',
    emoji_icon: '🍽️',
    status: 'active',
    sort_order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, catRes, locRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/menu'),
        fetch('http://localhost:5000/api/admin/locations/categories'),
        fetch('http://localhost:5000/api/admin/locations')
      ]);

      const [menuData, catData, locData] = await Promise.all([
        menuRes.json(),
        catRes.json(),
        locRes.json()
      ]);

      if (menuData.success) setItems(menuData.data);
      if (catData.success) setCategories(catData.data);
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
        name: item.name,
        description: item.description || '',
        category_id: item.category_id || '',
        meal_type: item.meal_type,
        price_per_pax: item.price_per_pax,
        min_pax: item.min_pax,
        serves: item.serves,
        location_id: item.location_id || '',
        image_url: item.image_url || '',
        emoji_icon: item.emoji_icon,
        status: item.status,
        sort_order: item.sort_order
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category_id: '',
        meal_type: 'veg',
        price_per_pax: '',
        min_pax: '',
        serves: '',
        location_id: '',
        image_url: '',
        emoji_icon: '🍽️',
        status: 'active',
        sort_order: 0
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
        ? `http://localhost:5000/api/admin/menu/${editingItem.id}`
        : 'http://localhost:5000/api/admin/menu';
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
      console.error('Error saving item:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/menu/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleImageUpload = async (file) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    // Create form data for upload
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);
    
    try {
      // Upload to Cloudinary or your backend
      const response = await fetch('http://localhost:5000/api/admin/upload', {
        method: 'POST',
        body: formDataUpload
      });
      
      const data = await response.json();
      if (data.success) {
        setFormData({ ...formData, image_url: data.url });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      // For now, just show preview without actual upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, image_url: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getMealBadge = (type) => {
    switch (type) {
      case 'veg': return <span className="admin-badge admin-meal-veg">Veg</span>;
      case 'nonveg': return <span className="admin-badge admin-meal-nonveg">Non-Veg</span>;
      case 'jain': return <span className="admin-badge admin-meal-jain">Jain</span>;
      default: return <span className="admin-badge">{type}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active': return <span className="admin-badge admin-badge-green">Active</span>;
      case 'draft': return <span className="admin-badge admin-badge-amber">Draft</span>;
      case 'archived': return <span className="admin-badge admin-badge-gray">Archived</span>;
      default: return <span className="admin-badge">{status}</span>;
    }
  };

  const filteredItems = items.filter(item => {
    if (activeTab === 'active' && item.status !== 'active') return false;
    if (activeTab === 'draft' && item.status !== 'draft') return false;
    if (filters.category && item.category_name !== filters.category) return false;
    if (filters.meal_type && item.meal_type !== filters.meal_type) return false;
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const tabs = [
    { id: 'all', label: `All (${items.length})` },
    { id: 'active', label: `Active (${items.filter(i => i.status === 'active').length})` },
    { id: 'draft', label: `Draft (${items.filter(i => i.status === 'draft').length})` }
  ];

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      {/* Filters Card */}
      <div className="admin-card" style={{ marginBottom: '16px' }}>
        <div className="admin-card-hdr">
          <span className="admin-card-title">Menu Items</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div className="admin-search-wrap">
              <input
                className="admin-form-input"
                style={{ width: '200px' }}
                placeholder="Search dishes..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <select
              className="admin-form-select"
              style={{ width: '140px' }}
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <select
              className="admin-form-select"
              style={{ width: '120px' }}
              value={filters.meal_type}
              onChange={(e) => setFilters({ ...filters, meal_type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="veg">Veg</option>
              <option value="nonveg">Non-Veg</option>
              <option value="jain">Jain</option>
            </select>
            <button className="admin-btn admin-btn-orange" onClick={() => openModal()}>+ Add Item</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tab-bar">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="admin-tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Meal Type</th>
                <th>Price/Pax</th>
                <th>Min Pax</th>
                <th>Rating</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <div className="admin-item-cell">
                      <div className="admin-item-img">{item.emoji_icon}</div>
                      <div>
                        <div className="admin-item-name">{item.name}</div>
                        <div className="admin-item-sub">{item.description?.substring(0, 40)}...</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="admin-badge admin-badge-blue">{item.category_name}</span></td>
                  <td>{getMealBadge(item.meal_type)}</td>
                  <td className="admin-price-cell">₹{item.price_per_pax}</td>
                  <td>{item.min_pax}</td>
                  <td>
                    <span className="admin-stars">★</span> {item.rating}
                    <span style={{ fontSize: '11px', color: 'var(--admin-muted)' }}> ({item.review_count})</span>
                  </td>
                  <td>{item.location_name || 'All'}</td>
                  <td>{getStatusBadge(item.status)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="admin-btn admin-btn-sm" onClick={() => openModal(item)}>✏️ Edit</button>
                    <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => handleDelete(item.id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="admin-pg">
          <span>Showing {filteredItems.length} of {items.length} items</span>
          <div className="admin-pg-btns">
            <button className="admin-pg-btn cur">1</button>
            <button className="admin-pg-btn">2</button>
            <button className="admin-pg-btn">3</button>
            <button className="admin-pg-btn">›</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-hdr">
              <span className="admin-modal-title">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</span>
              <button className="admin-modal-close" onClick={closeModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Item Name *</label>
                    <input
                      className="admin-form-input"
                      placeholder="e.g. Paneer Tikka"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Category *</label>
                    <select
                      className="admin-form-select"
                      value={formData.category_id}
                      onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Description</label>
                  <textarea
                    className="admin-form-textarea"
                    placeholder="Brief description of the dish..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Meal Type</label>
                    <select
                      className="admin-form-select"
                      value={formData.meal_type}
                      onChange={e => setFormData({ ...formData, meal_type: e.target.value })}
                    >
                      <option value="veg">🥦 Veg</option>
                      <option value="nonveg">🍗 Non-Veg</option>
                      <option value="jain">🥗 Jain</option>
                    </select>
                  </div>
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
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Price per Pax (₹) *</label>
                    <input
                      className="admin-form-input"
                      type="number"
                      placeholder="320"
                      value={formData.price_per_pax}
                      onChange={e => setFormData({ ...formData, price_per_pax: e.target.value })}
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Minimum Pax *</label>
                    <input
                      className="admin-form-input"
                      type="number"
                      placeholder="50"
                      value={formData.min_pax}
                      onChange={e => setFormData({ ...formData, min_pax: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Serves</label>
                    <input
                      className="admin-form-input"
                      type="number"
                      placeholder="10"
                      value={formData.serves}
                      onChange={e => setFormData({ ...formData, serves: e.target.value })}
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Sort Order</label>
                    <input
                      className="admin-form-input"
                      type="number"
                      placeholder="0"
                      value={formData.sort_order}
                      onChange={e => setFormData({ ...formData, sort_order: e.target.value })}
                    />
                  </div>
                </div>
                 {/* Dish Image Upload - Top Section */}
                <div className="admin-form-group" style={{ marginBottom: '20px' }}>
                  <label className="admin-form-label">Dish Image</label>
                  <div 
                    style={{
                      border: '2px dashed var(--admin-border)',
                      borderRadius: '12px',
                      padding: '32px 24px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#FAFBFC',
                      transition: 'all 0.2s ease'
                    }}
                    onClick={() => document.getElementById('dish-image-input').click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--admin-blue)'; }}
                    onDragLeave={(e) => { e.currentTarget.style.borderColor = 'var(--admin-border)'; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.borderColor = 'var(--admin-border)';
                      const file = e.dataTransfer.files[0];
                      if (file) handleImageUpload(file);
                    }}
                  >
                    <div style={{ fontSize: '40px', marginBottom: '12px' }}>📷</div>
                    <div style={{ fontSize: '14px', color: 'var(--admin-muted)', marginBottom: '4px' }}>
                      Click to upload or drag & drop
                    </div>
                    <div style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      JPG, PNG or WebP • Max 5MB
                    </div>
                    <input
                      id="dish-image-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </div>
                </div>

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
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-orange">💾 Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMenu;
