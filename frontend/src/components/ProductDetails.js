import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../api';
import { useAuth } from '../context/authContext';

const StarRating = ({ value, onChange, readonly = false }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {[1, 2, 3, 4, 5].map(n => (
      <span
        key={n}
        onClick={() => !readonly && onChange && onChange(n)}
        style={{ fontSize: readonly ? 14 : 24, cursor: readonly ? 'default' : 'pointer', color: n <= value ? '#f59e0b' : '#e0e0e0', transition: 'color 0.15s' }}
      >★</span>
    ))}
  </div>
);

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct]     = useState(null);
  const [img, setImg]             = useState(0);
  const [qty, setQty]             = useState(1);
  const [reviews, setReviews]     = useState([]);
  const [myRating, setMyRating]   = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedSize, setSelectedSize]   = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const { addToCart, user }       = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    API.get(`/api/products/${id}`).then(r => setProduct(r.data));
    API.get(`/api/reviews/${id}`).then(r => setReviews(r.data)).catch(() => {});
  }, [id]);

  if (!product) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 40, height: 40, border: '4px solid #fce4ec', borderTop: '4px solid #e91e63', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const discount = product.originalPrice > 0
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const images = product.images?.length ? product.images : ['https://via.placeholder.com/400?text=Khadi'];

  const handleAdd = async () => {
    if (!user) { navigate('/login'); return; }
    const res = await addToCart(product._id, qty);
    if (res.success) toast.success('Added to cart!');
  };

    const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (myRating === 0) { toast.error('Please select a rating'); return; }
    // comment is now optional
    setSubmitting(true);
    try {
      await API.post('/api/reviews', {
        productId: id,
        rating: myRating,
        comment: myComment.trim() || `Rated ${myRating} star${myRating > 1 ? 's' : ''}`,
      });
      toast.success('Review submitted! Thank you 🌟');
      setMyRating(0);
      setMyComment('');
      const [rRes, pRes] = await Promise.all([
        API.get(`/api/reviews/${id}`),
        API.get(`/api/products/${id}`),
      ]);
      setReviews(rRes.data);
      setProduct(pRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    }
    setSubmitting(false);
  };

  // Rating breakdown
  const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: reviews.length ? Math.round((reviews.filter(r => r.rating === star).length / reviews.length) * 100) : 0,
  }));

  const alreadyReviewed = reviews.some(r => r.user === user?._id);

  return (
    <div style={{ background: '#fce4ec', minHeight: '100vh', padding: '20px 0' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Product Section */}
      <div style={S.page}>
        {/* Images */}
        <div style={S.imgSec}>
          <div style={S.thumbCol}>
            {images.map((im, i) => (
              <img key={i} src={im} alt="" onClick={() => setImg(i)}
                style={{ ...S.thumb, border: i === img ? '2px solid #e91e63' : '2px solid #eee' }} />
            ))}
          </div>
          <div style={S.mainImgBox}>
            <img src={images[img]} alt={product.name} style={S.mainImg} />
            {discount > 0 && <div style={S.discBadge}>{discount}% OFF</div>}
          </div>
        </div>

        {/* Info */}
        <div style={S.info}>
          <div style={{ fontSize: 12, color: '#e91e63', fontWeight: 'bold', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
            {product.categories?.join(' • ') || 'Uncategorized' }
          </div>
          <h1 style={S.name}>{product.name}</h1>
          <div style={{ fontSize: 12, color: '#9e9e9e', marginBottom: 10 }}>by {product.sellerName || 'Banasthali Khadi Bhandar'}</div>

          {/* Rating summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={S.ratingBadge}>⭐ {product.rating?.toFixed(1) || '0.0'}</div>
            <span style={{ fontSize: 13, color: '#555' }}>{product.numReviews || 0} reviews</span>
            {product.numReviews > 0 && <span style={{ fontSize: 12, color: '#9e9e9e' }}>|</span>}
            {product.numReviews > 0 && <span style={{ fontSize: 13, color: '#388e3c' }}>✅ {reviews.filter(r => r.isVerifiedPurchase).length} verified purchases</span>}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #f0f0f0', margin: '0 0 16px' }} />

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 30, fontWeight: 'bold', color: '#212121' }}>₹{product.price.toLocaleString()}</span>
            {product.originalPrice > 0 && <>
              <span style={{ fontSize: 16, color: '#9e9e9e', textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString()}</span>
              <span style={{ color: '#388e3c', fontWeight: 'bold', fontSize: 16 }}>{discount}% off</span>
            </>}
          </div>

          

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={S.varLabel}>Select Size</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.sizes.map(s => (
                  <div key={s} onClick={() => setSelectedSize(s)} style={{
                    padding: '7px 16px', border: selectedSize === s ? '2px solid #e91e63' : '1px solid #e0e0e0',
                    borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: selectedSize === s ? 'bold' : 'normal',
                    background: selectedSize === s ? '#fce4ec' : '#fff', color: selectedSize === s ? '#e91e63' : '#333',
                  }}>{s}</div>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={S.varLabel}>Select Color</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.colors.map(c => (
                  <div key={c} onClick={() => setSelectedColor(c)} style={{
                    padding: '7px 16px', border: selectedColor === c ? '2px solid #e91e63' : '1px solid #e0e0e0',
                    borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: selectedColor === c ? 'bold' : 'normal',
                    background: selectedColor === c ? '#fce4ec' : '#fff', color: selectedColor === c ? '#e91e63' : '#333',
                  }}>{c}</div>
                ))}
              </div>
            </div>
          )}

          {/* Qty */}
          <div style={{ marginBottom: 20 }}>
            <div style={S.varLabel}>Quantity</div>
            <div style={S.qtyWrap}>
              <button style={S.qtyBtn} onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span style={{ padding: '6px 20px', fontSize: 16, fontWeight: 'bold' }}>{qty}</span>
              <button style={S.qtyBtn} onClick={() => setQty(q => Math.min(product.stock, q + 1))}>+</button>
            </div>
          </div>

          {/* Stock */}
          <div style={{ marginBottom: 20, fontSize: 13 }}>
            {product.stock > 0
              ? <span style={{ color: '#388e3c' }}>✅ In Stock ({product.stock} available)</span>
              : <span style={{ color: '#d32f2f' }}>❌ Out of Stock</span>}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button style={S.addBtn} onClick={handleAdd} disabled={product.stock === 0}>🛒 ADD TO CART</button>
            <button style={S.buyBtn} onClick={() => { handleAdd(); navigate('/cart'); }} disabled={product.stock === 0}>⚡ BUY NOW</button>
          </div>

          {/* Description */}
          <div style={S.descBox}>
            <div style={S.descTitle}>Product Description</div>
            <p style={{ color: '#555', lineHeight: 1.7, fontSize: 14 }}>{product.description}</p>
          </div>

          {/* Delivery */}
          <div style={S.deliveryBox}>
            <div>🚚 <strong>Free Delivery</strong> on orders above ₹500</div>
            <div>↩️ <strong>7 Day Easy Returns</strong></div>
            <div>✅ <strong>100% Authentic</strong> Khadi products</div>
            <div>🔒 <strong>Secure Payments</strong></div>
          </div>
        </div>
      </div>

      {/* ── REVIEWS SECTION ── */}
      <div style={{ maxWidth: 1100, margin: '20px auto 0', padding: '0 16px' }}>
        <div style={S.reviewsWrap}>

          {/* Rating Overview */}
          {reviews.length > 0 && (
            <div style={S.ratingOverview}>
              <div style={{ textAlign: 'center', padding: '20px 24px', borderRight: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: 56, fontWeight: 'bold', color: '#212121', lineHeight: 1 }}>
                  {product.rating?.toFixed(1) || '0.0'}
                </div>
                <StarRating value={Math.round(product.rating || 0)} readonly />
                <div style={{ fontSize: 13, color: '#9e9e9e', marginTop: 6 }}>{reviews.length} reviews</div>
              </div>
              <div style={{ flex: 1, padding: '20px 24px' }}>
                {ratingCounts.map(r => (
                  <div key={r.star} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: '#555', width: 20 }}>{r.star}</span>
                    <span style={{ color: '#f59e0b', fontSize: 13 }}>★</span>
                    <div style={{ flex: 1, height: 8, background: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${r.pct}%`, height: '100%', background: r.star >= 4 ? '#388e3c' : r.star === 3 ? '#f59e0b' : '#d32f2f', borderRadius: 4, transition: 'width 0.6s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#9e9e9e', width: 30 }}>{r.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write Review */}
          <div style={S.writeReview}>
            <div style={S.reviewTitle}>
              {reviews.length === 0 ? '⭐ Be the first to review!' : '✍️ Write a Review'}
            </div>
            {!user ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ color: '#888', marginBottom: 12 }}>Please login to write a review</p>
                <button style={S.loginReviewBtn} onClick={() => navigate('/login')}>Login to Review</button>
              </div>
            ) : alreadyReviewed ? (
              <div style={{ background: '#e8f5e9', color: '#388e3c', padding: '14px 18px', borderRadius: 8, fontSize: 14, fontWeight: '500' }}>
                ✅ You have already reviewed this product. Thank you!
              </div>
            ) : (
              <form onSubmit={handleSubmitReview}>
                {/* Star selector */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 8 }}>Your Rating *</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <span
                        key={n}
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setMyRating(n)}
                        style={{ fontSize: 32, cursor: 'pointer', color: n <= (hoverRating || myRating) ? '#f59e0b' : '#e0e0e0', transition: 'color 0.15s, transform 0.1s', transform: n <= (hoverRating || myRating) ? 'scale(1.2)' : 'scale(1)', display: 'inline-block' }}
                      >★</span>
                    ))}
                    {myRating > 0 && (
                      <span style={{ marginLeft: 8, fontSize: 13, color: '#555' }}>
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][myRating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment — optional */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 4 }}>
                    Your Review
                    <span style={{ color: '#9e9e9e', fontWeight: 'normal', fontSize: 12, marginLeft: 6 }}>(optional)</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#9e9e9e', marginBottom: 8 }}>
                    Share details about quality, fit, delivery experience, or anything helpful for other buyers
                  </div>
                  <textarea
                    value={myComment}
                    onChange={e => setMyComment(e.target.value)}
                    placeholder={`Tell others about this product...

                - How is the quality and fabric feel?
                - Does it match the description?
                - How was the delivery experience?
                - Would you recommend it?`}
                    style={S.reviewTextarea}
                    rows={5}
                    maxLength={500}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: '#9e9e9e' }}>Writing a detailed review helps other customers</span>
                    <span style={{ fontSize: 11, color: myComment.length > 400 ? '#e91e63' : '#9e9e9e' }}>{myComment.length}/500</span>
                  </div>
                </div>

                <button
                type="submit"
                style={{ ...S.submitReviewBtn, opacity: myRating === 0 ? 0.6 : 1 }}
                disabled={submitting || myRating === 0}
              >
                {submitting ? '⏳ Submitting...' : myRating === 0 ? 'Select a rating first' : '🌟 Submit Review'}
              </button>
              </form>
            )}
          </div>

          {/* Reviews List */}
          {reviews.length > 0 && (
            <div style={S.reviewsList}>
              <div style={S.reviewTitle}>Customer Reviews ({reviews.length})</div>
              {reviews.map((r, i) => (
                <div key={r._id} style={{ ...S.reviewCard, animation: `fadeIn 0.3s ease ${i * 0.05}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Avatar */}
                      <div style={{ width: 42, height: 42, borderRadius: '50%', background: `hsl(${r.name?.charCodeAt(0) * 10 || 0},60%,65%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 16, color: '#fff', flexShrink: 0 }}>
                        {r.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', fontSize: 14, color: '#212121' }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: '#9e9e9e' }}>
                          {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[1,2,3,4,5].map(n => (
                          <span key={n} style={{ color: n <= r.rating ? '#f59e0b' : '#e0e0e0', fontSize: 14 }}>★</span>
                        ))}
                      </div>
                      {r.isVerifiedPurchase && (
                        <span style={{ background: '#e8f5e9', color: '#388e3c', fontSize: 10, fontWeight: 'bold', padding: '2px 8px', borderRadius: 10 }}>
                          ✅ Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, margin: 0 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const S = {
  page: { maxWidth: 1100, margin: '0 auto', background: '#fff', borderRadius: 4, display: 'flex', gap: 32, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  imgSec: { width: 420, flexShrink: 0, display: 'flex', gap: 12 },
  thumbCol: { display: 'flex', flexDirection: 'column', gap: 8 },
  thumb: { width: 68, height: 68, objectFit: 'cover', cursor: 'pointer', borderRadius: 4 },
  mainImgBox: { flex: 1, background: '#f5f5f5', borderRadius: 8, height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' },
  mainImg: { maxWidth: '100%', maxHeight: 400, objectFit: 'contain' },
  discBadge: { position: 'absolute', top: 12, right: 12, background: '#e91e63', color: '#fff', fontSize: 12, fontWeight: 'bold', padding: '4px 10px', borderRadius: 4 },
  info: { flex: 1 },
  name: { fontSize: 22, fontWeight: '400', color: '#212121', marginBottom: 4, lineHeight: 1.3 },
  ratingBadge: { background: '#388e3c', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 13, fontWeight: 'bold' },
  offerBox: { background: '#fff3e0', padding: '10px 14px', borderRadius: 4, fontSize: 13, color: '#e65100', marginBottom: 16 },
  varLabel: { fontSize: 13, fontWeight: 'bold', color: '#555', marginBottom: 8 },
  qtyWrap: { display: 'inline-flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 4 },
  qtyBtn: { background: '#f5f5f5', border: 'none', padding: '8px 18px', fontSize: 20, cursor: 'pointer' },
  addBtn: { flex: 1, background: '#ff9f00', color: '#fff', border: 'none', padding: 14, fontWeight: 'bold', fontSize: 14, borderRadius: 4, cursor: 'pointer' },
  buyBtn: { flex: 1, background: '#e91e63', color: '#fff', border: 'none', padding: 14, fontWeight: 'bold', fontSize: 14, borderRadius: 4, cursor: 'pointer' },
  descBox: { background: '#f9f9f9', borderRadius: 8, padding: 16, marginBottom: 14 },
  descTitle: { fontSize: 14, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  deliveryBox: { background: '#f9f9f9', padding: 16, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#555' },

  // Reviews
  reviewsWrap: { background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: 20 },
  ratingOverview: { display: 'flex', borderBottom: '1px solid #f0f0f0' },
  writeReview: { padding: '24px 28px', borderBottom: '1px solid #f0f0f0' },
  reviewTitle: { fontSize: 17, fontWeight: 'bold', color: '#212121', marginBottom: 18 },
  reviewTextarea: { width: '100%', padding: '12px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 14, resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.2s', outline: 'none' },
  submitReviewBtn: { background: '#e91e63', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: 8, fontSize: 15, fontWeight: 'bold', cursor: 'pointer' },
  loginReviewBtn: { background: '#e91e63', color: '#fff', border: 'none', padding: '10px 28px', borderRadius: 8, fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  reviewsList: { padding: '24px 28px' },
  reviewCard: { padding: '18px 0', borderBottom: '1px solid #f5f5f5' },
};

export default ProductDetails;