import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api';
import { useAuth } from '../../context/authContext';

const CATEGORIES = ['Men', 'Women', 'Kids', 'Kurtas', 'Sarees', 'Fabrics', 'Home Decor', 'Accessories'];

const SellerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  

  const [tab, setTab]           = useState('dashboard');
  const [stats, setStats]       = useState({});
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [imgInput, setImgInput]       = useState('');
  const [videoInput, setVideoInput]   = useState('');
  const [uploadingImg, setUploadingImg]     = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const imgFileRef   = useRef();
  const videoFileRef = useRef();

  const emptyForm = {
    name: '', description: '', price: '', originalPrice: '',
    category: '', categories: [],
    stock: '', images: [], videos: [],
    sizes: '', colors: '', isFeatured: false,
  };
  const [form, setForm] = useState(emptyForm);

  // Admin is always treated as approved seller
  const isAdmin    = user?.role === 'admin';
  const isApproved = isAdmin || user?.sellerInfo?.isApproved;
  const isRejected = !isAdmin && user?.sellerInfo?.isRejected;
  const isPending  = !isAdmin && !user?.sellerInfo?.isApproved && !user?.sellerInfo?.isRejected;

  useEffect(() => {
    if (isApproved) {
      API.get('/api/seller/dashboard').then(r => setStats(r.data)).catch(() => {});
      API.get('/api/seller/products').then(r => setProducts(r.data)).catch(() => {});
      API.get('/api/seller/orders').then(r => setOrders(r.data)).catch(() => {});
    }
  }, [isApproved]);

  const resetForm = () => {
    setForm(emptyForm);
    setImgInput('');
    setVideoInput('');
    setEditProduct(null);
    setShowForm(false);
  };

  const handleEdit = (p) => {
    setEditProduct(p);
    setForm({
      name:          p.name        || '',
      description:   p.description || '',
      price:         p.price       || '',
      originalPrice: p.originalPrice || '',
      category:      p.category    || '',
      categories:    p.categories  || [],
      stock:         p.stock       || '',
      images:        p.images      || [],
      videos:        p.videos      || [],
      sizes:         p.sizes?.join(', ')  || '',
      colors:        p.colors?.join(', ') || '',
      isFeatured:    p.isFeatured  || false,
    });
    setImgInput('');
    setVideoInput('');
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  // Toggle category selection
  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  // Add image via URL
  const addImageUrl = () => {
    const url = imgInput.trim();
    if (!url) return;
    if (!url.startsWith('http')) { toast.error('Enter a valid URL starting with http'); return; }
    if (form.images.includes(url)) { toast.error('Already added'); return; }
    setForm(prev => ({ ...prev, images: [...prev.images, url] }));
    setImgInput('');
  };

  // Upload image file
  const handleImageFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    for (const f of files) {
      if (!allowed.includes(f.type)) { toast.error(`${f.name}: Only JPG, PNG, WEBP allowed`); return; }
      if (f.size > 5 * 1024 * 1024)  { toast.error(`${f.name}: Max 5MB`); return; }
    }
    setUploadingImg(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        const { data } = await API.post('/api/upload/image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        uploaded.push(data.url);
      }
      setForm(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
      toast.success(`${uploaded.length} image(s) uploaded!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploadingImg(false);
    e.target.value = '';
  };

  // Add video via URL
  const addVideoUrl = () => {
    const url = videoInput.trim();
    if (!url) return;
    if (!url.startsWith('http')) { toast.error('Enter a valid URL starting with http'); return; }
    if (form.videos.includes(url)) { toast.error('Already added'); return; }
    setForm(prev => ({ ...prev, videos: [...prev.videos, url] }));
    setVideoInput('');
  };

  // Upload video file
  const handleVideoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowed.includes(file.type)) { toast.error('Only MP4, WebM, MOV allowed'); return; }
    if (file.size > 100 * 1024 * 1024) { toast.error('Max 100MB'); return; }
    setUploadingVideo(true);
    try {
      const fd = new FormData();
      fd.append('video', file);
      const { data } = await API.post('/api/upload/video', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm(prev => ({ ...prev, videos: [...prev.videos, data.url] }));
      toast.success('Video uploaded!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Video upload failed');
    }
    setUploadingVideo(false);
    e.target.value = '';
  };

  const removeImage = (idx) => setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  const removeVideo = (idx) => setForm(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== idx) }));

  const getYoutubeThumbnail = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : null;
  };

  const isVideoUrl = (url) =>
    /\.(mp4|webm|mov|avi)(\?.*)?$/i.test(url) || url.includes('cloudinary.com/video');

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (form.images.length === 0) { toast.error('Add at least one product image'); return; }
    if (form.categories.length === 0) { toast.error('Select at least one category'); return; }
    try {
      const payload = {
        ...form,
        price:         Number(form.price)         || 0,
        originalPrice: Number(form.originalPrice) || 0,
        stock:         Number(form.stock)         || 0,
        category:      form.categories[0] || form.category || 'General',
        categories:    form.categories,
        sizes:  form.sizes  ? form.sizes.split(',').map(s => s.trim()).filter(Boolean)  : [],
        colors: form.colors ? form.colors.split(',').map(c => c.trim()).filter(Boolean) : [],
      };
      if (editProduct) {
        await API.put(`/api/seller/products/${editProduct._id}`, payload);
        toast.success('Product updated!');
      } else {
        await API.post('/api/seller/products', payload);
        toast.success('Product added!');
      }
      const { data } = await API.get('/api/seller/products');
      setProducts(data);
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await API.delete(`/api/seller/products/${id}`);
      setProducts(products.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Failed'); }
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await API.put(`/api/seller/orders/${orderId}/status`, { status });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status } : o));
      toast.success('Status updated');
    } catch { toast.error('Failed'); }
  };

  const F = e => setForm(prev => ({
    ...prev,
    [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  // Lightbox modal
const Lightbox = () => lightbox ? (
  <div
    onClick={() => setLightbox(null)}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}
  >
    <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
      <img
        src={lightbox}
        alt="preview"
        style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain', borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
      />
      <button
        onClick={() => setLightbox(null)}
        style={{ position: 'absolute', top: -16, right: -16, background: '#e91e63', color: '#fff', border: 'none', borderRadius: '50%', width: 36, height: 36, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
      >✕</button>
      <div style={{ textAlign: 'center', marginTop: 10, color: '#fff', fontSize: 12, opacity: 0.7 }}>
        Click anywhere or ✕ to close
      </div>
    </div>
  </div>
) : null;

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh' }}>

      {/* Header */}
      <div style={S.header}>
        <div style={{ fontWeight: 'bold', fontSize: 18, color: '#fff' }}>
          🏪 {user?.sellerInfo?.shopName || user?.name} — Seller Panel
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link to="/" style={{ color: '#fce4ec', fontSize: 13, textDecoration: 'none' }}>View Store</Link>
          <button onClick={() => { logout(); navigate('/login'); }} style={S.logoutBtn}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20 }}>

        {/* Pending — applied but not approved yet */}
        {isPending && user?.sellerInfo?.appliedAt && (
          <div style={S.pendingBox}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            <h2>Application Under Review</h2>
            <p style={{ color: '#555', marginTop: 8 }}>Admin is reviewing your application. You'll be notified once approved.</p>
          </div>
        )}

        {/* Not applied yet */}
        {isPending && !user?.sellerInfo?.appliedAt && (
          <div style={S.pendingBox}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏪</div>
            <h2>Complete Your Seller Setup</h2>
            <p style={{ color: '#555', marginTop: 8, marginBottom: 16 }}>Set up your shop to start selling.</p>
            <a href="/seller/setup" style={{ background: '#e91e63', color: '#fff', padding: '10px 24px', borderRadius: 4, textDecoration: 'none', fontWeight: 'bold' }}>
              Complete Setup →
            </a>
          </div>
        )}

        {/* Rejected */}
        {isRejected && (
          <div style={S.rejectedBox}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>❌</div>
            <h2>Application Rejected</h2>
            <p style={{ color: '#555', marginTop: 8 }}>Contact admin for more details.</p>
          </div>
        )}

        {/* Approved dashboard */}
        {isApproved && (
          <>
            {/* Tabs */}
            <div style={S.tabs}>
              {[
                { id: 'dashboard', label: '📊 Dashboard' },
                { id: 'products',  label: '📦 Products'  },
                { id: 'orders',    label: '🛍️ Orders'    },
              ].map(t => (
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
                  <div style={S.statCard}>
                    <div style={S.statNum}>{stats.totalProducts || 0}</div>
                    <div style={S.statLabel}>Products</div>
                  </div>
                  <div style={S.statCard}>
                    <div style={S.statNum}>{stats.totalOrders || 0}</div>
                    <div style={S.statLabel}>Orders</div>
                  </div>
                  <div style={S.statCard}>
                    <div style={{ ...S.statNum, color: '#388e3c' }}>₹{(stats.revenue || 0).toLocaleString()}</div>
                    <div style={S.statLabel}>Revenue</div>
                  </div>
                </div>
                <div style={S.card}>
                  <div style={S.cardTitle}>Recent Orders</div>
                  {orders.length === 0 && (
                    <div style={{ color: '#9e9e9e', textAlign: 'center', padding: 24 }}>No orders yet</div>
                  )}
                  {orders.slice(0, 5).map(o => (
                    <div key={o._id} style={S.orderRow}>
                      <div style={{ fontSize: 14 }}>#{o._id.slice(-6).toUpperCase()} — {o.user?.name || 'Customer'}</div>
                      <div style={{ fontSize: 13, color: '#888' }}>₹{o.totalPrice?.toLocaleString()}</div>
                      <div style={{ fontSize: 12, background: '#fce4ec', color: '#e91e63', padding: '3px 10px', borderRadius: 10 }}>{o.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PRODUCTS ── */}
            {tab === 'products' && (
              <div style={S.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div style={S.cardTitle}>My Products ({products.length})</div>
                  {!showForm && (
                    <button style={S.addBtn} onClick={() => { resetForm(); setShowForm(true); }}>+ Add Product</button>
                  )}
                </div>

                {/* Product Form */}
                {showForm && (
                  <div style={S.formBox}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ fontWeight: 'bold', fontSize: 16, color: '#212121' }}>
                        {editProduct ? '✏️ Edit Product' : '➕ Add New Product'}
                      </div>
                      <button onClick={resetForm} style={S.cancelBtn}>✕ Cancel</button>
                    </div>

                    <form onSubmit={handleProductSubmit}>

                      {/* Basic Info */}
                      <div style={S.sectionLabel}>📋 Basic Information</div>
                      <div style={S.row2}>
                        <div>
                          <label style={S.label}>Product Name *</label>
                          <input name="name" value={form.name} onChange={F} style={S.input} placeholder="Product name" required />
                        </div>
                        <div>
                          <label style={S.label}>Description *</label>
                          <textarea name="description" value={form.description} onChange={F} style={{ ...S.input, height: 60, resize: 'vertical' }} placeholder="Describe your product" required />
                        </div>
                      </div>

                      {/* Categories */}
                      <div style={S.sectionLabel}>📂 Categories * (select multiple)</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '10px', border: '1px solid #e0e0e0', borderRadius: 4, background: '#fff', marginBottom: 12 }}>
                        {CATEGORIES.map(cat => {
                          const selected = form.categories.includes(cat);
                          return (
                            <div
                              key={cat}
                              onClick={() => toggleCategory(cat)}
                              style={{
                                padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                                fontSize: 13, userSelect: 'none', transition: 'all 0.15s',
                                fontWeight: selected ? 'bold' : 'normal',
                                background: selected ? '#e91e63' : '#f5f5f5',
                                color: selected ? '#fff' : '#555',
                                border: selected ? '1px solid #e91e63' : '1px solid #e0e0e0',
                              }}
                            >
                              {selected ? '✓ ' : ''}{cat}
                            </div>
                          );
                        })}
                      </div>
                      {form.categories.length === 0 && (
                        <div style={{ fontSize: 11, color: '#d32f2f', marginBottom: 8 }}>Select at least one category</div>
                      )}
                      {form.categories.length > 0 && (
                        <div style={{ fontSize: 11, color: '#388e3c', marginBottom: 12 }}>
                          Selected: {form.categories.join(', ')} — First is primary
                        </div>
                      )}

                      {/* Pricing */}
                      <div style={S.sectionLabel}>💰 Pricing & Stock</div>
                      <div style={S.row3}>
                        <div>
                          <label style={S.label}>Selling Price (₹) *</label>
                          <input name="price" type="number" value={form.price} onChange={F} style={S.input} placeholder="899" required />
                        </div>
                        <div>
                          <label style={S.label}>Original Price (₹)</label>
                          <input name="originalPrice" type="number" value={form.originalPrice} onChange={F} style={S.input} placeholder="1499" />
                        </div>
                        <div>
                          <label style={S.label}>Stock *</label>
                          <input name="stock" type="number" value={form.stock} onChange={F} style={S.input} placeholder="50" required />
                        </div>
                      </div>

                      {/* Variants */}
                      <div style={S.sectionLabel}>👕 Variants (optional)</div>
                      <div style={S.row2}>
                        <div>
                          <label style={S.label}>Sizes (comma separated)</label>
                          <input name="sizes" value={form.sizes} onChange={F} style={S.input} placeholder="S, M, L, XL" />
                        </div>
                        <div>
                          <label style={S.label}>Colors (comma separated)</label>
                          <input name="colors" value={form.colors} onChange={F} style={S.input} placeholder="Red, Blue, Green" />
                        </div>
                      </div>

                      {/* Images */}
                      <div style={S.sectionLabel}>🖼️ Product Images *</div>
                      <div style={S.mediaBox}>
                        <div style={S.uploadOption}>
                          <div style={S.uploadLabel}>📁 Upload from device</div>
                          <div style={S.uploadSub}>JPG, PNG — max 5MB each</div>
                          <input type="file" ref={imgFileRef} accept=".jpg,.jpeg,.png,.webp" multiple style={{ display: 'none' }} onChange={handleImageFileUpload} />
                          <button type="button" style={S.uploadBtn} onClick={() => imgFileRef.current?.click()} disabled={uploadingImg}>
                            {uploadingImg ? '⏳ Uploading...' : '📂 Choose Images'}
                          </button>
                        </div>
                        <div style={S.orDivider}>— OR —</div>
                        <div style={S.uploadOption}>
                          <div style={S.uploadLabel}>🔗 Add image URL</div>
                          <div style={S.uploadSub}>Paste any image link</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input
                              placeholder="https://example.com/image.jpg"
                              value={imgInput}
                              onChange={e => setImgInput(e.target.value)}
                              style={{ ...S.input, marginBottom: 0, flex: 1 }}
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                            />
                            <button type="button" style={S.addMediaBtn} onClick={addImageUrl}>+ Add</button>
                          </div>
                        </div>
                      </div>

                      {form.images.length > 0 && (
                        <div style={{ marginBottom: 12 }}>
                          <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>{form.images.length} image(s) — first is primary</div>
                          <div style={S.mediaGrid}>
                            {form.images.map((url, i) => (
                              <div key={i} style={S.mediaItem}>
                                {i === 0 && <div style={S.primaryBadge}>Primary</div>}
                                <img src={url} alt="" style={S.mediaThumb} onError={e => { e.target.src = 'https://via.placeholder.com/100?text=Error'; }} />
                                <div style={S.mediaUrl}>{url.length > 28 ? url.slice(0, 28) + '...' : url}</div>
                                <button type="button" style={S.removeBtn} onClick={() => removeImage(i)}>✕ Remove</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Videos */}
                      <div style={{ ...S.sectionLabel, marginTop: 8 }}>🎥 Product Videos (optional)</div>
                      <div style={S.mediaBox}>
                        <div style={S.uploadOption}>
                          <div style={S.uploadLabel}>📁 Upload video</div>
                          <div style={S.uploadSub}>MP4, WebM, MOV — max 100MB</div>
                          <input type="file" ref={videoFileRef} accept=".mp4,.webm,.mov" style={{ display: 'none' }} onChange={handleVideoFileUpload} />
                          <button type="button" style={S.uploadBtn} onClick={() => videoFileRef.current?.click()} disabled={uploadingVideo}>
                            {uploadingVideo ? '⏳ Uploading...' : '📂 Choose Video'}
                          </button>
                        </div>
                        <div style={S.orDivider}>— OR —</div>
                        <div style={S.uploadOption}>
                          <div style={S.uploadLabel}>🔗 Video URL</div>
                          <div style={S.uploadSub}>YouTube or direct video URL</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input
                              placeholder="https://youtube.com/watch?v=..."
                              value={videoInput}
                              onChange={e => setVideoInput(e.target.value)}
                              style={{ ...S.input, marginBottom: 0, flex: 1 }}
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addVideoUrl())}
                            />
                            <button type="button" style={S.addMediaBtn} onClick={addVideoUrl}>+ Add</button>
                          </div>
                        </div>
                      </div>

                      {form.videos.length > 0 && (
                        <div style={{ ...S.mediaGrid, marginBottom: 12 }}>
                          {form.videos.map((url, i) => {
                            const ytThumb = getYoutubeThumbnail(url);
                            return (
                              <div key={i} style={S.mediaItem}>
                                {ytThumb ? (
                                  <div style={{ position: 'relative' }}>
                                    <img src={ytThumb} alt="yt" style={S.mediaThumb} />
                                    <div style={S.playIcon}>▶</div>
                                  </div>
                                ) : isVideoUrl(url) ? (
                                  <video src={url} style={{ ...S.mediaThumb, objectFit: 'cover' }} muted />
                                ) : (
                                  <div style={S.videoPlaceholder}>🎥</div>
                                )}
                                <div style={S.mediaUrl}>{url.length > 28 ? url.slice(0, 28) + '...' : url}</div>
                                <button type="button" style={S.removeBtn} onClick={() => removeVideo(i)}>✕ Remove</button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Featured */}
                      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, marginTop: 8, cursor: 'pointer', marginBottom: 20 }}>
                        <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={F} />
                        ⭐ Mark as Featured Product (shown on homepage)
                      </label>

                      <div style={{ display: 'flex', gap: 12 }}>
                        <button type="submit" style={S.addBtn}>
                          {editProduct ? '✅ UPDATE PRODUCT' : '✅ ADD PRODUCT'}
                        </button>
                        <button type="button" style={S.cancelBtn} onClick={resetForm}>Cancel</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products List */}
                {!showForm && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {products.length === 0 && (
                      <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>
                        <div style={{ fontSize: 50, marginBottom: 12 }}>📦</div>
                        <p>No products yet. Click "+ Add Product" to start.</p>
                      </div>
                    )}
                    {products.map(p => (
                      <div key={p._id} style={S.productCard}>
                        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                          {(p.images || []).slice(0, 3).map((img, i) => (
                            <img key={i} src={img} alt="" style={{ width: i === 0 ? 80 : 50, height: i === 0 ? 80 : 50, objectFit: 'cover', borderRadius: 4, background: '#f5f5f5' }}
                              onError={e => { e.target.src = 'https://via.placeholder.com/80'; }} />
                          ))}
                          {(p.videos || []).length > 0 && (
                            <div style={{ width: 50, height: 50, background: '#212121', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>▶</div>
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 15, fontWeight: '500', marginBottom: 4 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>
                            {p.categories?.length > 0 ? p.categories.join(', ') : p.category}
                          </div>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', color: '#e91e63', fontSize: 15 }}>₹{p.price?.toLocaleString()}</span>
                            {p.originalPrice > 0 && (
                              <span style={{ color: '#9e9e9e', textDecoration: 'line-through', fontSize: 12 }}>₹{p.originalPrice?.toLocaleString()}</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                            <span style={S.chip}>Stock: {p.stock}</span>
                            {p.sizes?.length > 0   && <span style={S.chip}>{p.sizes.join(', ')}</span>}
                            {p.colors?.length > 0  && <span style={S.chip}>{p.colors.join(', ')}</span>}
                            {p.isFeatured && <span style={{ ...S.chip, background: '#fff3e0', color: '#e65100' }}>⭐ Featured</span>}
                            {(p.images || []).length > 0 && <span style={S.chip}>🖼️ {p.images.length}</span>}
                            {(p.videos || []).length > 0 && <span style={S.chip}>🎥 {p.videos.length}</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                          <button style={S.editBtn} onClick={() => handleEdit(p)}>✏️ Edit</button>
                          <button style={S.deleteBtn} onClick={() => handleDelete(p._id)}>🗑️ Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ORDERS ── */}
            {tab === 'orders' && (
              <div style={S.card}>
                <div style={S.cardTitle}>My Orders ({orders.length})</div>
                {orders.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>No orders yet</div>
                )}
                {orders.map(o => (
                  <div key={o._id} style={S.orderCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: 14 }}>#{o._id.slice(-8).toUpperCase()}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{o.user?.name} | {o.user?.email}</div>
                        <div style={{ fontSize: 12, color: '#888' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', fontSize: 16 }}>₹{o.totalPrice?.toLocaleString()}</div>
                        <select
                          value={o.status}
                          onChange={e => handleStatusUpdate(o._id, e.target.value)}
                          style={{ marginTop: 6, padding: '5px 10px', borderRadius: 4, border: '1px solid #e0e0e0', fontSize: 12, cursor: 'pointer' }}
                        >
                          {['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                      {o.items?.map((item, i) => (
                        <div key={i} style={{ background: '#f9f9f9', padding: '5px 10px', borderRadius: 4, fontSize: 12 }}>
                          {item.name} × {item.quantity} — ₹{(item.price * item.quantity).toLocaleString()}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const S = {
  header:       { background: '#000', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 },
  logoutBtn:    { background: '#e91e63', color: '#fff', border: 'none', padding: '7px 16px', borderRadius: 2, cursor: 'pointer', fontSize: 13 },
  pendingBox:   { background: '#fff3e0', border: '1px solid #ffcc02', borderRadius: 4, padding: 40, textAlign: 'center', marginBottom: 20 },
  rejectedBox:  { background: '#ffebee', border: '1px solid #ef9a9a', borderRadius: 4, padding: 40, textAlign: 'center', marginBottom: 20 },
  tabs:         { display: 'flex', gap: 8, marginBottom: 20 },
  tab:          { padding: '10px 24px', borderRadius: 4, cursor: 'pointer', fontWeight: 'bold', fontSize: 14, border: '1px solid #e0e0e0', transition: 'all 0.2s' },
  statsGrid:    { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 },
  statCard:     { background: '#fff', borderRadius: 4, padding: 20, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  statNum:      { fontSize: 32, fontWeight: 'bold', color: '#e91e63' },
  statLabel:    { fontSize: 13, color: '#878787', marginTop: 4 },
  card:         { background: '#fff', borderRadius: 4, padding: 20, marginBottom: 16 },
  cardTitle:    { fontSize: 16, fontWeight: 'bold', color: '#212121', paddingBottom: 12, borderBottom: '1px solid #f0f0f0', marginBottom: 0 },
  orderRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9f9f9' },
  formBox:      { background: '#f9f9f9', borderRadius: 4, padding: 20, marginBottom: 20, border: '1px solid #f0f0f0' },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: '#e91e63', marginBottom: 10, marginTop: 16, paddingBottom: 6, borderBottom: '1px solid #fce4ec' },
  row2:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 4 },
  row3:         { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 4 },
  label:        { fontSize: 12, fontWeight: 'bold', color: '#878787', display: 'block', marginBottom: 6 },
  input:        { width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 2, fontSize: 14, marginBottom: 12, boxSizing: 'border-box' },
  mediaBox:     { background: '#fff', border: '1px solid #e0e0e0', borderRadius: 4, padding: 16, marginBottom: 12, display: 'flex', gap: 16, alignItems: 'stretch', flexWrap: 'wrap' },
  uploadOption: { flex: 1, minWidth: 200 },
  uploadLabel:  { fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  uploadSub:    { fontSize: 11, color: '#9e9e9e', marginBottom: 10 },
  uploadBtn:    { background: '#212121', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 'bold' },
  orDivider:    { display: 'flex', alignItems: 'center', color: '#ccc', fontSize: 12, padding: '0 8px' },
  addMediaBtn:  { background: '#e91e63', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 2, cursor: 'pointer', fontWeight: 'bold', fontSize: 13, whiteSpace: 'nowrap' },
  mediaGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10 },
  mediaItem:    { position: 'relative', background: '#fff', border: '1px solid #e0e0e0', borderRadius: 4, padding: 8, textAlign: 'center' },
  mediaThumb:   { width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, marginBottom: 4 },
  videoPlaceholder: { width: '100%', height: 80, background: '#212121', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 4 },
  playIcon:     { position: 'absolute', top: '28%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 20, color: '#fff', background: 'rgba(0,0,0,0.65)', borderRadius: '50%', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  mediaUrl:     { fontSize: 9, color: '#aaa', wordBreak: 'break-all', marginBottom: 4 },
  removeBtn:    { background: '#ffebee', color: '#d32f2f', border: 'none', padding: '3px 8px', borderRadius: 2, cursor: 'pointer', fontSize: 11, fontWeight: 'bold', width: '100%' },
  primaryBadge: { position: 'absolute', top: 4, left: 4, background: '#e91e63', color: '#fff', fontSize: 9, padding: '2px 6px', borderRadius: 2, fontWeight: 'bold', zIndex: 1 },
  addBtn:       { background: '#e91e63', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 2, cursor: 'pointer', fontWeight: 'bold', fontSize: 13 },
  cancelBtn:    { background: '#f5f5f5', color: '#555', border: '1px solid #e0e0e0', padding: '10px 20px', borderRadius: 2, cursor: 'pointer', fontWeight: 'bold', fontSize: 13 },
  productCard:  { display: 'flex', gap: 14, padding: 14, border: '1px solid #f0f0f0', borderRadius: 4, alignItems: 'flex-start' },
  editBtn:      { background: '#e3f2fd', color: '#1565c0', border: 'none', padding: '7px 14px', borderRadius: 2, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' },
  deleteBtn:    { background: '#ffebee', color: '#d32f2f', border: 'none', padding: '7px 14px', borderRadius: 2, cursor: 'pointer', fontSize: 12, fontWeight: 'bold' },
  chip:         { background: '#f5f5f5', color: '#555', fontSize: 11, padding: '3px 8px', borderRadius: 10, border: '1px solid #e0e0e0' },
  orderCard:    { border: '1px solid #f0f0f0', borderRadius: 4, padding: 16, marginBottom: 12 },
};

export default SellerDashboard;