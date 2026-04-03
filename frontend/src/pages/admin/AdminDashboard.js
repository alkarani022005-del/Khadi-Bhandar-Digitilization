import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api';
import { useAuth } from '../../context/authContext';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate   = useNavigate();

  const [tab, setTab]               = useState('dashboard');
  const [stats, setStats]           = useState({});
  const [sellers, setSellers]       = useState([]);
  const [users, setUsers]           = useState([]);
  const [orders, setOrders]         = useState([]);
  const [products, setProducts]     = useState([]);
  const [banners, setBanners]       = useState([]);
  const [categories, setCategories] = useState([]);
  const [coupons, setCoupons]       = useState([]);

  const [bannerForm, setBannerForm] = useState({
    title: '', subtitle: '', bgColor: '#fce4ec',
    textColor: '#d32f2f', buttonText: 'Shop Now',
    buttonLink: '/search', image: '',
  });
  const [catForm, setCatForm]       = useState({ name: '', emoji: '🛍️', description: '' });
  const [couponForm, setCouponForm] = useState({
    code: '', discountType: 'percent', discountValue: '',
    minOrderAmount: '', maxDiscount: '', usageLimit: 100, expiresAt: '',
  });
  const [bannerUploading, setBannerUploading] = useState(false);

  useEffect(() => {
    API.get('/api/admin/dashboard').then(r => setStats(r.data)).catch(() => {});
    API.get('/api/admin/sellers').then(r => setSellers(r.data)).catch(() => {});
    API.get('/api/admin/users').then(r => setUsers(r.data)).catch(() => {});
    API.get('/api/admin/orders').then(r => setOrders(r.data)).catch(() => {});
    API.get('/api/admin/products').then(r => setProducts(r.data)).catch(() => {});
    API.get('/api/site/banners/all').then(r => setBanners(r.data)).catch(() => {});
    API.get('/api/site/categories/all').then(r => setCategories(r.data)).catch(() => {});
    API.get('/api/coupons').then(r => setCoupons(r.data)).catch(() => {});
  }, []);

  const approveSeller = async (id) => {
    try {
      await API.put(`/api/admin/sellers/${id}/approve`);
      setSellers(sellers.map(s => s._id === id
        ? { ...s, sellerInfo: { ...s.sellerInfo, isApproved: true, isRejected: false } }
        : s));
      toast.success('Seller approved!');
    } catch { toast.error('Failed'); }
  };

  const rejectSeller = async (id) => {
    try {
      await API.put(`/api/admin/sellers/${id}/reject`);
      setSellers(sellers.map(s => s._id === id
        ? { ...s, sellerInfo: { ...s.sellerInfo, isRejected: true, isApproved: false } }
        : s));
      toast.error('Seller rejected');
    } catch { toast.error('Failed'); }
  };

  const toggleUser = async (id) => {
    try {
      await API.put(`/api/admin/users/${id}/toggle`);
      setUsers(users.map(u => u._id === id ? { ...u, isActive: !u.isActive } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed'); }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/api/admin/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Failed'); }
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await API.put(`/api/admin/orders/${id}/status`, { status });
      setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  const handleBannerImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) { toast.error('Only JPG, PNG, WEBP allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }
    setBannerUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await API.post('/api/admin/upload/banner', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setBannerForm(prev => ({ ...prev, image: data.url }));
      toast.success('Image uploaded!');
    } catch { toast.error('Upload failed'); }
    setBannerUploading(false);
    e.target.value = '';
  };

  const pendingSellers = sellers.filter(
    s => !s.sellerInfo?.isApproved && !s.sellerInfo?.isRejected && s.sellerInfo?.appliedAt
  );

  const TABS = [
    { id: 'dashboard',  label: '📊 Dashboard'  },
    { id: 'sellers',    label: `🏪 Sellers${pendingSellers.length > 0 ? ` (${pendingSellers.length})` : ''}` },
    { id: 'users',      label: '👥 Users'       },
    { id: 'orders',     label: '📦 Orders'      },
    { id: 'products',   label: '🛍️ Products'   },
    { id: 'banners',    label: '🖼️ Banners'    },
    { id: 'categories', label: '📂 Categories'  },
    { id: 'coupons',    label: '🏷️ Coupons'    },
  ];

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>

      {/* Header */}
      <div style={S.header}>
        <div style={{ fontWeight: 'bold', fontSize: 18, color: '#fff' }}>
          ⚙️ Admin Panel — Banasthali Khadi Bhandar
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="/" style={{ color: '#fce4ec', fontSize: 13, textDecoration: 'none' }}>View Store</a>
          <button onClick={() => { logout(); navigate('/login'); }} style={S.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>

        {/* Tabs */}
        <div style={S.tabs}>
          {TABS.map(t => (
            <div key={t.id} onClick={() => setTab(t.id)}
              style={{ ...S.tab, background: tab === t.id ? '#e91e63' : '#fff', color: tab === t.id ? '#fff' : '#333' }}>
              {t.label}
            </div>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'dashboard' && (
          <div>
            <div style={S.statsGrid}>
              {[
                { label: 'Customers',       value: stats.totalUsers     || 0, icon: '👥', color: '#1565c0' },
                { label: 'Sellers',         value: stats.totalSellers   || 0, icon: '🏪', color: '#6a1b9a' },
                { label: 'Pending Sellers', value: stats.pendingSellers || 0, icon: '⏳', color: '#ff9f00' },
                { label: 'Products',        value: stats.totalProducts  || 0, icon: '📦', color: '#388e3c' },
                { label: 'Orders',          value: stats.totalOrders    || 0, icon: '🛍️', color: '#e91e63' },
                { label: 'Revenue',         value: `₹${(stats.revenue || 0).toLocaleString()}`, icon: '💰', color: '#388e3c' },
              ].map(s => (
                <div key={s.label} style={S.statCard}>
                  <div style={{ fontSize: 30, marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ ...S.statNum, color: s.color }}>{s.value}</div>
                  <div style={S.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={S.cardTitle}>Recent Orders</div>
              {(stats.recentOrders || []).length === 0 && (
                <div style={{ color: '#9e9e9e', padding: '20px 0', textAlign: 'center' }}>No orders yet</div>
              )}
              {(stats.recentOrders || []).map(o => (
                <div key={o._id} style={S.row}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: '500' }}>#{o._id.slice(-8).toUpperCase()} — {o.user?.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{o.user?.email}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 'bold' }}>₹{o.totalPrice?.toLocaleString()}</div>
                  <div style={{ fontSize: 12, background: '#fce4ec', color: '#e91e63', padding: '3px 10px', borderRadius: 10 }}>{o.status}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SELLERS ── */}
        {tab === 'sellers' && (
          <div style={S.card}>
            <div style={S.cardTitle}>All Sellers ({sellers.length})</div>
            {pendingSellers.length > 0 && (
              <div style={{ background: '#fff3e0', padding: 12, borderRadius: 4, marginBottom: 16, fontSize: 13, color: '#e65100' }}>
                ⚠️ {pendingSellers.length} seller(s) waiting for approval
              </div>
            )}
            {sellers.length === 0 && (
              <div style={{ color: '#9e9e9e', textAlign: 'center', padding: 32 }}>No sellers yet</div>
            )}
            {sellers.map(s => (
              <div key={s._id} style={S.sellerCard}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 15 }}>{s.sellerInfo?.shopName || s.name}</div>
                  <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>{s.email} | {s.phone || 'N/A'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10, background: '#f9f9f9', padding: 10, borderRadius: 4 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#9e9e9e' }}>Aadhaar</div>
                      <div style={{ fontSize: 13 }}>
                        {s.sellerInfo?.aadhaarNumber ? `XXXX XXXX ${s.sellerInfo.aadhaarNumber.slice(-4)}` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#9e9e9e' }}>PAN</div>
                      <div style={{ fontSize: 13 }}>{s.sellerInfo?.panNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#9e9e9e' }}>GSTIN</div>
                      <div style={{ fontSize: 13 }}>{s.sellerInfo?.gstin || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#9e9e9e' }}>Applied</div>
                      <div style={{ fontSize: 13 }}>
                        {s.sellerInfo?.appliedAt ? new Date(s.sellerInfo.appliedAt).toLocaleDateString('en-IN') : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#9e9e9e' }}>Shop Description</div>
                      <div style={{ fontSize: 13 }}>{s.sellerInfo?.shopDescription || 'N/A'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#9e9e9e' }}>IFSC</div>
                      <div style={{ fontSize: 13 }}>{s.sellerInfo?.ifsc || 'N/A'}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
                  {s.sellerInfo?.isApproved  && <span style={S.approvedBadge}>✅ Approved</span>}
                  {s.sellerInfo?.isRejected  && <span style={S.rejectedBadge}>❌ Rejected</span>}
                  {!s.sellerInfo?.isApproved && !s.sellerInfo?.isRejected && s.sellerInfo?.appliedAt && (
                    <span style={S.pendingBadge}>⏳ Pending</span>
                  )}
                  {!s.sellerInfo?.isApproved && !s.sellerInfo?.isRejected && s.sellerInfo?.appliedAt && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={S.approveBtn} onClick={() => approveSeller(s._id)}>✅ Approve</button>
                      <button style={S.rejectBtn}  onClick={() => rejectSeller(s._id)}>❌ Reject</button>
                    </div>
                  )}
                  {s.sellerInfo?.isRejected && (
                    <button style={S.approveBtn} onClick={() => approveSeller(s._id)}>Re-approve</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── USERS ── */}
        {tab === 'users' && (
          <div style={S.card}>
            <div style={S.cardTitle}>All Customers ({users.length})</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr style={{ background: '#f9f9f9' }}>
                    {['Name', 'Email', 'Phone', 'Joined', 'Status', 'Action'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#9e9e9e' }}>No customers yet</td></tr>
                  )}
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={S.td}>{u.name}</td>
                      <td style={S.td}>{u.email}</td>
                      <td style={S.td}>{u.phone || '—'}</td>
                      <td style={S.td}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={S.td}>
                        <span style={{ color: u.isActive ? '#388e3c' : '#d32f2f', fontWeight: 'bold', fontSize: 12 }}>
                          {u.isActive ? '✅ Active' : '❌ Blocked'}
                        </span>
                      </td>
                      <td style={S.td}>
                        <button
                          onClick={() => toggleUser(u._id)}
                          style={{ background: u.isActive ? '#ffebee' : '#e8f5e9', color: u.isActive ? '#d32f2f' : '#388e3c', border: 'none', padding: '5px 12px', borderRadius: 2, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' }}
                        >
                          {u.isActive ? 'Block' : 'Unblock'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === 'orders' && (
          <div style={S.card}>
            <div style={S.cardTitle}>All Orders ({orders.length})</div>
            {orders.length === 0 && (
              <div style={{ color: '#9e9e9e', textAlign: 'center', padding: 32 }}>No orders yet</div>
            )}
            {orders.map(o => (
              <div key={o._id} style={{ ...S.row, flexWrap: 'wrap', gap: 8, padding: '14px 0', borderBottom: '1px solid #f5f5f5' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>#{o._id.slice(-8).toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{o.user?.name} | {o.user?.email}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 'bold' }}>₹{o.totalPrice?.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: o.paymentStatus === 'Paid' ? '#388e3c' : '#ff9f00', fontWeight: 'bold' }}>
                  {o.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                </div>
                <select
                  value={o.status}
                  onChange={e => updateOrderStatus(o._id, e.target.value)}
                  style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #e0e0e0', fontSize: 13, cursor: 'pointer' }}
                >
                  {['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* ── PRODUCTS ── */}
        {tab === 'products' && (
          <div style={S.card}>
            <div style={S.cardTitle}>All Products ({products.length})</div>
            {products.length === 0 && (
              <div style={{ color: '#9e9e9e', textAlign: 'center', padding: 32 }}>No products yet</div>
            )}
            {products.map(p => (
              <div key={p._id} style={S.productRow}>
                <img
                  src={p.images?.[0] || 'https://via.placeholder.com/60'}
                  alt=""
                  onClick={() => window.open(`/product/${p._id}`, '_blank')}
                  style={{ width: 60, height: 60, objectFit: 'contain', background: '#f5f5f5', borderRadius: 4, cursor: 'pointer', flexShrink: 0 }}
                  onError={e => { e.target.src = 'https://via.placeholder.com/60'; }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: '500', color: '#e91e63', cursor: 'pointer' }}
                    onClick={() => window.open(`/product/${p._id}`, '_blank')}
                  >
                    {p.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {p.category} | Seller: {p.seller?.sellerInfo?.shopName || p.seller?.name || 'N/A'}
                  </div>
                  <div style={{ fontSize: 13, color: '#e91e63', fontWeight: 'bold', marginTop: 2 }}>
                    ₹{p.price?.toLocaleString()} | Stock: {p.stock}
                  </div>
                </div>
                <a
                  href={`/product/${p._id}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...S.editBtn, textDecoration: 'none', marginRight: 8 }}
                > 
                  👁️ View
                </a>
                <button style={S.deleteBtn} onClick={() => deleteProduct(p._id)}>🗑️ Delete</button>
              </div>
            ))}
          </div>
        )}

        {/* ── BANNERS ── */}
        {tab === 'banners' && (
          <div style={S.card}>
            <div style={S.cardTitle}>🖼️ Manage Banners</div>

            <div style={S.formBox}>
              <div style={{ fontWeight: 'bold', marginBottom: 14 }}>Add New Banner</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <input placeholder="Title *" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} style={S.input} />
                <input placeholder="Subtitle" value={bannerForm.subtitle} onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })} style={S.input} />
                <input placeholder="Button Text" value={bannerForm.buttonText} onChange={e => setBannerForm({ ...bannerForm, buttonText: e.target.value })} style={S.input} />
                <input placeholder="Button Link (e.g. /search)" value={bannerForm.buttonLink} onChange={e => setBannerForm({ ...bannerForm, buttonLink: e.target.value })} style={S.input} />
                <div>
                  <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Background Color</label>
                  <input type="color" value={bannerForm.bgColor} onChange={e => setBannerForm({ ...bannerForm, bgColor: e.target.value })} style={{ ...S.input, padding: 4, height: 40, cursor: 'pointer' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>Text Color</label>
                  <input type="color" value={bannerForm.textColor} onChange={e => setBannerForm({ ...bannerForm, textColor: e.target.value })} style={{ ...S.input, padding: 4, height: 40, cursor: 'pointer' }} />
                </div>
              </div>

              {/* Image upload */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 'bold', color: '#555', display: 'block', marginBottom: 8 }}>
                  Banner Image (JPG, PNG, WEBP — max 5MB)
                </label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <label style={{ background: '#212121', color: '#fff', padding: '9px 18px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {bannerUploading ? '⏳ Uploading...' : '📂 Upload Image'}
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      style={{ display: 'none' }}
                      onChange={handleBannerImageUpload}
                      disabled={bannerUploading}
                    />
                  </label>
                  <span style={{ color: '#9e9e9e', fontSize: 13 }}>— OR —</span>
                  <input
                    placeholder="Paste image URL"
                    value={bannerForm.image}
                    onChange={e => setBannerForm({ ...bannerForm, image: e.target.value })}
                    style={{ ...S.input, flex: 1, marginBottom: 0, minWidth: 200 }}
                  />
                </div>
                {bannerForm.image && (
                  <div style={{ marginTop: 10, position: 'relative', display: 'inline-block' }}>
                    <img
                      src={bannerForm.image}
                      alt="preview"
                      style={{ height: 80, borderRadius: 4, border: '1px solid #e0e0e0', objectFit: 'cover' }}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    <button
                      onClick={() => setBannerForm({ ...bannerForm, image: '' })}
                      style={{ position: 'absolute', top: -6, right: -6, background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 11, fontWeight: 'bold' }}
                    >✕</button>
                  </div>
                )}
              </div>

              <button
                style={S.addBtn}
                onClick={async () => {
                  if (!bannerForm.title.trim()) { toast.error('Title is required'); return; }
                  try {
                    const { data } = await API.post('/api/site/banners', bannerForm);
                    setBanners([...banners, data]);
                    setBannerForm({ title: '', subtitle: '', bgColor: '#fce4ec', textColor: '#d32f2f', buttonText: 'Shop Now', buttonLink: '/search', image: '' });
                    toast.success('Banner added!');
                  } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
                }}
              >
                + Add Banner
              </button>
            </div>

            {banners.length === 0 && (
              <div style={{ color: '#9e9e9e', textAlign: 'center', padding: 32 }}>No banners yet</div>
            )}
            {banners.map(b => (
              <div key={b._id} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
                <div style={{ width: 100, height: 60, background: b.bgColor, borderRadius: 4, flexShrink: 0, border: '1px solid #e0e0e0', overflow: 'hidden', position: 'relative' }}>
                  {b.image && <img src={b.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} onError={() => {}} />}
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 'bold', color: b.textColor, textAlign: 'center', padding: 4 }}>
                    {b.title}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>{b.title}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{b.subtitle}</div>
                  {b.image && <div style={{ fontSize: 11, color: '#9e9e9e', marginTop: 2 }}>📸 Has image</div>}
                </div>
                <span style={{ fontSize: 12, color: b.isActive ? '#388e3c' : '#d32f2f', fontWeight: 'bold', flexShrink: 0 }}>
                  {b.isActive ? '✅ Active' : '❌ Hidden'}
                </span>
                <button style={S.editBtn} onClick={async () => {
                  try {
                    await API.put(`/api/site/banners/${b._id}`, { isActive: !b.isActive });
                    setBanners(banners.map(x => x._id === b._id ? { ...x, isActive: !x.isActive } : x));
                    toast.success('Updated!');
                  } catch { toast.error('Failed'); }
                }}>Toggle</button>
                <button style={S.deleteBtn} onClick={async () => {
                  try {
                    await API.delete(`/api/site/banners/${b._id}`);
                    setBanners(banners.filter(x => x._id !== b._id));
                    toast.success('Deleted');
                  } catch { toast.error('Failed'); }
                }}>🗑️</button>
              </div>
            ))}
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {tab === 'categories' && (
          <div style={S.card}>
            <div style={S.cardTitle}>📂 Manage Categories</div>

            <div style={S.formBox}>
              <div style={{ fontWeight: 'bold', marginBottom: 12 }}>Add New Category</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <input placeholder="Name *" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} style={S.input} />
                <input placeholder="Emoji (e.g. 👗)" value={catForm.emoji} onChange={e => setCatForm({ ...catForm, emoji: e.target.value })} style={S.input} />
                <input placeholder="Description" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} style={S.input} />
              </div>
              <button style={S.addBtn} onClick={async () => {
                if (!catForm.name.trim()) { toast.error('Name is required'); return; }
                try {
                  const { data } = await API.post('/api/site/categories', catForm);
                  setCategories([...categories, data]);
                  setCatForm({ name: '', emoji: '🛍️', description: '' });
                  toast.success('Category added!');
                } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
              }}>+ Add Category</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
              {categories.length === 0 && (
                <div style={{ color: '#9e9e9e', gridColumn: '1/-1', textAlign: 'center', padding: 32 }}>No categories yet</div>
              )}
              {categories.map(c => (
                <div key={c._id} style={{ background: '#f9f9f9', borderRadius: 8, padding: 16, textAlign: 'center', border: '1px solid #f0f0f0' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{c.emoji}</div>
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: c.isActive ? '#388e3c' : '#d32f2f', marginTop: 4 }}>
                    {c.isActive ? 'Active' : 'Hidden'}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'center' }}>
                    <button style={S.editBtn} onClick={async () => {
                      try {
                        await API.put(`/api/site/categories/${c._id}`, { isActive: !c.isActive });
                        setCategories(categories.map(x => x._id === c._id ? { ...x, isActive: !x.isActive } : x));
                        toast.success('Updated!');
                      } catch { toast.error('Failed'); }
                    }}>Toggle</button>
                    <button style={S.deleteBtn} onClick={async () => {
                      try {
                        await API.delete(`/api/site/categories/${c._id}`);
                        setCategories(categories.filter(x => x._id !== c._id));
                        toast.success('Deleted');
                      } catch { toast.error('Failed'); }
                    }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── COUPONS ── */}
        {tab === 'coupons' && (
          <div style={S.card}>
            <div style={S.cardTitle}>🏷️ Manage Coupons</div>

            <div style={S.formBox}>
              <div style={{ fontWeight: 'bold', marginBottom: 12 }}>Create New Coupon</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <input
                  placeholder="Coupon Code *"
                  value={couponForm.code}
                  onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  style={S.input}
                />
                <select
                  value={couponForm.discountType}
                  onChange={e => setCouponForm({ ...couponForm, discountType: e.target.value })}
                  style={S.input}
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
                <input
                  type="number"
                  placeholder={couponForm.discountType === 'percent' ? 'Discount % *' : 'Discount ₹ *'}
                  value={couponForm.discountValue}
                  onChange={e => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                  style={S.input}
                />
                <input
                  type="number"
                  placeholder="Min Order Amount (₹)"
                  value={couponForm.minOrderAmount}
                  onChange={e => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                  style={S.input}
                />
                <input
                  type="number"
                  placeholder="Max Discount ₹ (0 = no limit)"
                  value={couponForm.maxDiscount}
                  onChange={e => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                  style={S.input}
                />
                <input
                  type="number"
                  placeholder="Usage Limit"
                  value={couponForm.usageLimit}
                  onChange={e => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                  style={S.input}
                />
                <input
                  type="date"
                  value={couponForm.expiresAt}
                  onChange={e => setCouponForm({ ...couponForm, expiresAt: e.target.value })}
                  style={S.input}
                />
              </div>
              <button style={S.addBtn} onClick={async () => {
                if (!couponForm.code.trim())    { toast.error('Code is required'); return; }
                if (!couponForm.discountValue)  { toast.error('Discount value is required'); return; }
                try {
                  const { data } = await API.post('/api/coupons', couponForm);
                  setCoupons([data, ...coupons]);
                  setCouponForm({ code: '', discountType: 'percent', discountValue: '', minOrderAmount: '', maxDiscount: '', usageLimit: 100, expiresAt: '' });
                  toast.success('Coupon created!');
                } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
              }}>+ Create Coupon</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr style={{ background: '#f9f9f9' }}>
                    {['Code', 'Type', 'Discount', 'Min Order', 'Used/Limit', 'Expires', 'Status', 'Action'].map(h => (
                      <th key={h} style={S.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {coupons.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#9e9e9e' }}>No coupons yet</td></tr>
                  )}
                  {coupons.map(c => (
                    <tr key={c._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ ...S.td, fontWeight: 'bold', color: '#e91e63' }}>{c.code}</td>
                      <td style={S.td}>{c.discountType === 'percent' ? 'Percent' : 'Flat'}</td>
                      <td style={S.td}>{c.discountType === 'percent' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                      <td style={S.td}>₹{c.minOrderAmount || 0}</td>
                      <td style={S.td}>{c.usedCount || 0}/{c.usageLimit}</td>
                      <td style={S.td}>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'No expiry'}</td>
                      <td style={S.td}>
                        <span style={{ color: c.isActive ? '#388e3c' : '#d32f2f', fontWeight: 'bold', fontSize: 12 }}>
                          {c.isActive ? '✅ Active' : '❌ Off'}
                        </span>
                      </td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={S.editBtn} onClick={async () => {
                            try {
                              await API.put(`/api/coupons/${c._id}`, { isActive: !c.isActive });
                              setCoupons(coupons.map(x => x._id === c._id ? { ...x, isActive: !x.isActive } : x));
                              toast.success('Updated!');
                            } catch { toast.error('Failed'); }
                          }}>Toggle</button>
                          <button style={S.deleteBtn} onClick={async () => {
                            try {
                              await API.delete(`/api/coupons/${c._id}`);
                              setCoupons(coupons.filter(x => x._id !== c._id));
                              toast.success('Deleted');
                            } catch { toast.error('Failed'); }
                          }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const S = {
  header:       { background: '#000', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 },
  logoutBtn:    { background: '#e91e63', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 2, cursor: 'pointer', fontSize: 13 },
  tabs:         { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tab:          { padding: '10px 16px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold', fontSize: 13, transition: 'all 0.2s', border: '1px solid #e0e0e0' },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 },
  statCard:     { background: '#fff', borderRadius: 4, padding: 20, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  statNum:      { fontSize: 28, fontWeight: 'bold' },
  statLabel:    { fontSize: 12, color: '#878787', marginTop: 4 },
  card:         { background: '#fff', borderRadius: 4, padding: 20, marginBottom: 16 },
  cardTitle:    { fontSize: 16, fontWeight: 'bold', color: '#212121', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' },
  row:          { display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid #f5f5f5' },
  sellerCard:   { display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #f5f5f5', alignItems: 'flex-start' },
  approvedBadge:{ background: '#e8f5e9', color: '#388e3c', padding: '3px 12px', borderRadius: 10, fontSize: 12, fontWeight: 'bold' },
  rejectedBadge:{ background: '#ffebee', color: '#d32f2f', padding: '3px 12px', borderRadius: 10, fontSize: 12, fontWeight: 'bold' },
  pendingBadge: { background: '#fff3e0', color: '#ff9f00', padding: '3px 12px', borderRadius: 10, fontSize: 12, fontWeight: 'bold' },
  approveBtn:   { background: '#e8f5e9', color: '#388e3c', border: 'none', padding: '7px 14px', borderRadius: 2, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 },
  rejectBtn:    { background: '#ffebee', color: '#d32f2f', border: 'none', padding: '7px 14px', borderRadius: 2, cursor: 'pointer', fontWeight: 'bold', fontSize: 12 },
  table:        { width: '100%', borderCollapse: 'collapse' },
  th:           { padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 'bold', color: '#878787' },
  td:           { padding: '10px 12px', fontSize: 13, color: '#333' },
  productRow:   { display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid #f5f5f5', alignItems: 'center' },
  editBtn:      { background: '#e3f2fd', color: '#1565c0', border: 'none', padding: '6px 12px', borderRadius: 2, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' },
  deleteBtn:    { background: '#ffebee', color: '#d32f2f', border: 'none', padding: '6px 12px', borderRadius: 2, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' },
  formBox:      { background: '#f9f9f9', padding: 16, borderRadius: 4, marginBottom: 20, border: '1px solid #f0f0f0' },
  input:        { padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 2, fontSize: 14, boxSizing: 'border-box', width: '100%', marginBottom: 0 },
  addBtn:       { background: '#e91e63', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 2, cursor: 'pointer', fontWeight: 'bold', fontSize: 13, marginTop: 12 },
};

export default AdminDashboard;