import React, { useState } from 'react';
import API from '../api';

import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';

const Profile = () => {
  const { user, fetchCart } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    street: user?.address?.street || '', city: user?.address?.city || '',
    state: user?.address?.state || '', pincode: user?.address?.pincode || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.put('/api/auth/profile', {
        name: form.name, phone: form.phone,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode },
      });
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    setSaving(false);
  };

  const F = e => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={{ background: '#fce4ec', minHeight: '100vh', padding: '30px 16px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', background: '#fff', borderRadius: 4, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#e91e63', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', fontWeight: 'bold' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{user?.name}</div>
            <div style={{ color: '#9e9e9e', fontSize: 14 }}>{user?.email}</div>
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div style={S.label}>Personal Information</div>
          <div style={S.grid}>
            <input name="name" placeholder="Full Name" value={form.name} onChange={F} style={S.input} />
            <input name="phone" placeholder="Phone Number" value={form.phone} onChange={F} style={S.input} />
          </div>
          <div style={{ ...S.label, marginTop: 20 }}>Delivery Address</div>
          <input name="street" placeholder="Street Address" value={form.street} onChange={F} style={{ ...S.input, width: '100%' }} />
          <div style={S.grid}>
            <input name="city" placeholder="City" value={form.city} onChange={F} style={S.input} />
            <input name="state" placeholder="State" value={form.state} onChange={F} style={S.input} />
          </div>
          <input name="pincode" placeholder="Pincode" value={form.pincode} onChange={F} style={{ ...S.input, width: '50%' }} />
          <button type="submit" style={S.saveBtn} disabled={saving}>{saving ? 'Saving...' : 'SAVE CHANGES'}</button>
        </form>
      </div>
    </div>
  );
};

const S = {
  label: { fontSize: 13, fontWeight: 'bold', color: '#878787', letterSpacing: 0.5, marginBottom: 12, textTransform: 'uppercase' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 },
  input: { padding: '12px 14px', border: '1px solid #e0e0e0', borderRadius: 2, fontSize: 14, marginBottom: 12, boxSizing: 'border-box', width: '100%' },
  saveBtn: { background: '#e91e63', color: '#fff', border: 'none', padding: '13px 40px', fontWeight: 'bold', fontSize: 14, borderRadius: 2, cursor: 'pointer', marginTop: 12 },
};

export default Profile;