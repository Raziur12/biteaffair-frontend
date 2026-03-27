import React, { useState, useEffect } from 'react';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    phone: '+91 92115 70030',
    whatsapp: '+91 92115 70030',
    email: 'info@biteaffair.com',
    happy_customers: '500+',
    events_catered: '1000+',
    avg_rating: '4.8/5',
    years_experience: '3+',
    about_description: 'Your trusted partner for premium catering services in Delhi, Gurugram, Noida, Faridabad, and Ghaziabad, specializing in delicious party platters and event catering solutions.'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/settings');
      const data = await response.json();
      if (data.success && data.raw) {
        const settingsObj = {};
        data.raw.forEach(item => {
          settingsObj[item.setting_key] = item.setting_value;
        });
        setSettings(prev => ({ ...prev, ...settingsObj }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const settingsToSave = {
        phone: { value: settings.phone, group: 'contact' },
        whatsapp: { value: settings.whatsapp, group: 'contact' },
        email: { value: settings.email, group: 'contact' },
        happy_customers: { value: settings.happy_customers, group: 'stats' },
        events_catered: { value: settings.events_catered, group: 'stats' },
        avg_rating: { value: settings.avg_rating, group: 'stats' },
        years_experience: { value: settings.years_experience, group: 'stats' },
        about_description: { value: settings.about_description, group: 'about' }
      };

      const response = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsToSave)
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div>
      <div className="admin-card" style={{ maxWidth: '680px' }}>
        <div className="admin-card-hdr">
          <span className="admin-card-title">Site Settings</span>
          <button
            className="admin-btn admin-btn-orange"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : '💾 Save All'}
          </button>
        </div>

        {message && (
          <div style={{
            padding: '12px 18px',
            background: message.includes('Error') ? '#FEE2E2' : '#DCFCE7',
            color: message.includes('Error') ? '#991B1B' : '#15803D',
            fontSize: '13px',
            borderBottom: '1px solid var(--admin-border)'
          }}>
            {message}
          </div>
        )}

        <div>
          <div className="admin-setting-row">
            <div className="admin-setting-key">📞 Phone Number</div>
            <div className="admin-setting-val">
              <input
                className="admin-form-input"
                value={settings.phone}
                onChange={e => handleChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-setting-row">
            <div className="admin-setting-key">💬 WhatsApp</div>
            <div className="admin-setting-val">
              <input
                className="admin-form-input"
                value={settings.whatsapp}
                onChange={e => handleChange('whatsapp', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-setting-row">
            <div className="admin-setting-key">✉️ Email</div>
            <div className="admin-setting-val">
              <input
                className="admin-form-input"
                value={settings.email}
                onChange={e => handleChange('email', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-setting-row">
            <div className="admin-setting-key">😊 Happy Customers</div>
            <div className="admin-setting-val">
              <input
                className="admin-form-input"
                value={settings.happy_customers}
                onChange={e => handleChange('happy_customers', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-setting-row">
            <div className="admin-setting-key">🎉 Events Catered</div>
            <div className="admin-setting-val">
              <input
                className="admin-form-input"
                value={settings.events_catered}
                onChange={e => handleChange('events_catered', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-setting-row">
            <div className="admin-setting-key">⭐ Avg Rating</div>
            <div className="admin-setting-val">
              <input
                className="admin-form-input"
                value={settings.avg_rating}
                onChange={e => handleChange('avg_rating', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-setting-row">
            <div className="admin-setting-key">📅 Years Experience</div>
            <div className="admin-setting-val">
              <input
                className="admin-form-input"
                value={settings.years_experience}
                onChange={e => handleChange('years_experience', e.target.value)}
              />
            </div>
          </div>

          <div className="admin-setting-row">
            <div className="admin-setting-key">📝 About Description</div>
            <div className="admin-setting-val">
              <textarea
                className="admin-form-textarea"
                value={settings.about_description}
                onChange={e => handleChange('about_description', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
