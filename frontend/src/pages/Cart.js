import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const Cart = () => {
  const { cart, removeFromCart, updateCartItem, user } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <div style={S.centerPage}>
      <div style={{ fontSize: 70 }}>🔒</div>
      <h2>Please login to view cart</h2>
      <Link to="/login" style={S.pinkBtn}>LOGIN</Link>
    </div>
  );

  if (!cart.length) return (
    <div style={S.centerPage}>
      <div style={{ fontSize: 80 }}>🛒</div>
      <h2 style={{ marginBottom: 8 }}>Your cart is empty!</h2>
      <p style={{ color: '#888', marginBottom: 20 }}>Add items to get started</p>
      <Link to="/" style={S.pinkBtn}>SHOP NOW</Link>
    </div>
  );

  const subtotal = cart.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const saved = cart.reduce((s, i) => s + ((i.product?.originalPrice || i.product?.price || 0) - (i.product?.price || 0)) * i.quantity, 0);
  const delivery = subtotal > 500 ? 0 : 50;
  const total = subtotal + delivery;

  return (
    <div style={{ background: '#fce4ec', minHeight: '100vh', padding: '20px 0' }}>
      <div style={S.container}>
        <div style={S.left}>
          <div style={S.secTitle}>My Cart ({cart.length} item{cart.length > 1 ? 's' : ''})</div>
          {cart.map(item => !item.product ? null : (
            <div key={item._id} style={S.item}>
              <img src={item.product.images?.[0] || 'https://via.placeholder.com/100'} alt={item.product.name} style={S.itemImg} />
              <div style={{ flex: 1 }}>
                <Link to={`/product/${item.product._id}`} style={S.itemName}>{item.product.name}</Link>
                <div style={{ color: '#878787', fontSize: 13 }}>{item.product.category}</div>
                <div style={S.itemPriceRow}>
                  <span style={S.itemPrice}>₹{item.product.price?.toLocaleString()}</span>
                  {item.product.originalPrice > 0 && <>
                    <span style={S.itemOrig}>₹{item.product.originalPrice?.toLocaleString()}</span>
                    <span style={{ color: '#388e3c', fontSize: 13 }}>{Math.round((1 - item.product.price / item.product.originalPrice) * 100)}% off</span>
                  </>}
                </div>
                <div style={S.qtyRow}>
                  <button style={S.qBtn} onClick={() => updateCartItem(item.product._id, Math.max(1, item.quantity - 1))}>−</button>
                  <span style={{ padding: '5px 14px', fontSize: 14 }}>{item.quantity}</span>
                  <button style={S.qBtn} onClick={() => updateCartItem(item.product._id, item.quantity + 1)}>+</button>
                </div>
              </div>
              <button style={S.removeBtn} onClick={() => removeFromCart(item.product._id)}>✕ Remove</button>
            </div>
          ))}
          <div style={S.placeRow}>
            <button style={S.placeBtn} onClick={() => navigate('/checkout')}>PLACE ORDER →</button>
          </div>
        </div>

        <div style={S.summary}>
          <div style={S.secTitle}>PRICE DETAILS</div>
          <div style={S.sumRow}><span>Price ({cart.length} items)</span><span>₹{(subtotal + saved).toLocaleString()}</span></div>
          {saved > 0 && <div style={{ ...S.sumRow, color: '#388e3c' }}><span>Discount</span><span>− ₹{saved.toLocaleString()}</span></div>}
          <div style={S.sumRow}><span>Delivery</span><span style={{ color: '#388e3c' }}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span></div>
          <hr style={{ border: 'none', borderTop: '1px dashed #e0e0e0', margin: '12px 0' }} />
          <div style={{ ...S.sumRow, fontWeight: 'bold', fontSize: 16, marginBottom: 16 }}><span>Total</span><span>₹{total.toLocaleString()}</span></div>
          {saved > 0 && <div style={S.saveMsg}>You save ₹{saved.toLocaleString()} on this order 🎉</div>}
          <button style={S.checkBtn} onClick={() => navigate('/checkout')}>PROCEED TO CHECKOUT</button>
        </div>
      </div>
    </div>
  );
};

const S = {
  centerPage: { minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, background: '#fff' },
  pinkBtn: { background: '#e91e63', color: '#fff', padding: '12px 40px', borderRadius: 2, textDecoration: 'none', fontWeight: 'bold', fontSize: 15 },
  container: { maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 16, padding: '0 16px', alignItems: 'flex-start' },
  left: { flex: 1, background: '#fff', borderRadius: 4, padding: 20 },
  secTitle: { fontSize: 15, fontWeight: 'bold', color: '#212121', paddingBottom: 14, borderBottom: '1px solid #f0f0f0', marginBottom: 16 },
  item: { display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid #f9f9f9' },
  itemImg: { width: 100, height: 100, objectFit: 'contain', background: '#f5f5f5', borderRadius: 4 },
  itemName: { fontSize: 14, color: '#212121', fontWeight: '500', marginBottom: 4, display: 'block', textDecoration: 'none' },
  itemPriceRow: { display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' },
  itemPrice: { fontSize: 18, fontWeight: 'bold' },
  itemOrig: { fontSize: 13, color: '#9e9e9e', textDecoration: 'line-through' },
  qtyRow: { display: 'inline-flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 2, marginTop: 8 },
  qBtn: { background: '#f5f5f5', border: 'none', padding: '5px 14px', fontSize: 18, cursor: 'pointer' },
  removeBtn: { background: 'none', border: '1px solid #e0e0e0', padding: '6px 12px', cursor: 'pointer', fontSize: 12, color: '#878787', borderRadius: 2, alignSelf: 'flex-start' },
  placeRow: { display: 'flex', justifyContent: 'flex-end', paddingTop: 16 },
  placeBtn: { background: '#e91e63', color: '#fff', border: 'none', padding: '14px 40px', fontWeight: 'bold', fontSize: 15, borderRadius: 2 },
  summary: { width: 300, background: '#fff', borderRadius: 4, padding: 20, position: 'sticky', top: 80 },
  sumRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: '#333' },
  saveMsg: { background: '#e8f5e9', color: '#388e3c', padding: '10px 14px', borderRadius: 2, fontSize: 13, textAlign: 'center', marginBottom: 16 },
  checkBtn: { width: '100%', background: '#e91e63', color: '#fff', border: 'none', padding: 14, fontWeight: 'bold', fontSize: 15, borderRadius: 2, cursor: 'pointer' },
};

export default Cart;