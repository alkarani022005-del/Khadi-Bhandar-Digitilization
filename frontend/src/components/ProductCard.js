import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';

const ProductCard = ({ product }) => {
  const { addToCart, user } = useAuth();
  const navigate = useNavigate();

  const discount = product.originalPrice > 0
    ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    const res = await addToCart(product._id);
    if (res.success) toast.success('Added to cart!');
    else toast.error('Failed to add');
  };

  return (
    <div style={S.card}>
      <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={S.imgBox}>
          <img src={product.images?.[0] || 'https://via.placeholder.com/220x220?text=Khadi'} alt={product.name} style={S.img} />
          {discount > 0 && <div style={S.badge}>{discount}% off</div>}
        </div>
        <div style={S.info}>
          <div style={S.name}>{product.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={S.price}>₹{product.price.toLocaleString()}</span>
            {product.originalPrice > 0 && <span style={S.original}>₹{product.originalPrice.toLocaleString()}</span>}
          </div>
          <span style={S.rating}>⭐ {product.rating?.toFixed(1) || '4.0'} ({product.numReviews || 0})</span>
        </div>
      </Link>
      <button style={S.cartBtn} onClick={handleAdd}>ADD TO CART</button>
    </div>
  );
};

const S = {
  card: { background: '#fff', borderRadius: 4, overflow: 'hidden', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s' },
  imgBox: { position: 'relative', background: '#f5f5f5', height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  img: { maxHeight: 200, maxWidth: '100%', objectFit: 'contain' },
  badge: { position: 'absolute', top: 8, left: 8, background: '#388e3c', color: '#fff', fontSize: 11, fontWeight: 'bold', padding: '3px 8px', borderRadius: 2 },
  info: { padding: '12px 14px', flex: 1 },
  name: { fontSize: 13, color: '#212121', marginBottom: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#212121' },
  original: { fontSize: 13, color: '#9e9e9e', textDecoration: 'line-through' },
  rating: { background: '#388e3c', color: '#fff', fontSize: 11, padding: '2px 7px', borderRadius: 2 },
  cartBtn: { background: '#e91e63', color: '#fff', border: 'none', padding: 12, fontWeight: 'bold', fontSize: 13, letterSpacing: 0.5 },
};

export default ProductCard;