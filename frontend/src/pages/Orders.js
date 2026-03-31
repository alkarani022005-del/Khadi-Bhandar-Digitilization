import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { useAuth } from '../context/authContext';

const statusColors = {
  Processing: { bg: '#fff3e0', color: '#ff9f00' },
  Confirmed:  { bg: '#e3f2fd', color: '#1565c0' },
  Shipped:    { bg: '#f3e5f5', color: '#6a1b9a' },
  Delivered:  { bg: '#e8f5e9', color: '#388e3c' },
  Cancelled:  { bg: '#ffebee', color: '#d32f2f' },
};

const paymentInfo = {
  cod:      { label: 'Cash on Delivery', icon: '💵' },
  razorpay: { label: 'Online Payment',   icon: '💳' },
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      API.get('/api/orders/my')
        .then(r => { setOrders(r.data); setLoading(false); })
        .catch(() => setLoading(false));
    } else setLoading(false);
  }, [user]);

  if (!user) return (
    <div style={S.center}>
      <div style={{ fontSize: 70 }}>🔒</div>
      <h2>Please login to view orders</h2>
      <Link to="/login" style={S.pinkBtn}>LOGIN</Link>
    </div>
  );

  if (loading) return <div style={S.center}><div style={S.spinner} /></div>;

  if (!orders.length) return (
    <div style={S.center}>
      <div style={{ fontSize: 70 }}>📦</div>
      <h2 style={{ marginBottom: 8 }}>No orders yet</h2>
      <Link to="/" style={S.pinkBtn}>START SHOPPING</Link>
    </div>
  );

  return (
    <div style={{ background: '#fce4ec', minHeight: '100vh', padding: '20px 0' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
        <h2 style={{ marginBottom: 16, color: '#212121' }}>My Orders ({orders.length})</h2>

        {orders.map(order => {
          const pay  = paymentInfo[order.paymentMethod] || paymentInfo.cod;
          const stat = statusColors[order.status] || { bg: '#f5f5f5', color: '#555' };

          return (
            <div key={order._id} style={S.orderCard}>
              <div style={S.orderHeader}>
                <div>
                  <div style={S.orderId}>Order #{order._id.slice(-8).toUpperCase()}</div>
                  <div style={S.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ ...S.badge, background: stat.bg, color: stat.color }}>{order.status}</div>
                  <div style={{ ...S.badge, background: order.paymentStatus === 'Paid' ? '#e8f5e9' : '#fff3e0', color: order.paymentStatus === 'Paid' ? '#388e3c' : '#ff9f00' }}>
                    {order.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pay on Delivery'}
                  </div>
                </div>
              </div>

              <div style={S.items}>
                {order.items.map((item, i) => (
                  <div key={i} style={S.orderItem}>
                    <img src={item.image || 'https://via.placeholder.com/70'} alt="" style={S.itemImg} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: '500' }}>{item.name}</div>
                      {(item.size || item.color) && (
                        <div style={{ fontSize: 12, color: '#888' }}>
                          {item.size && `Size: ${item.size}`}{item.color && ` | Color: ${item.color}`}
                        </div>
                      )}
                      <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: 'bold' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div style={S.orderFooter}>
                <div style={S.payBox}>
                  <span style={{ fontSize: 18 }}>{pay.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: '#9e9e9e' }}>Payment</div>
                    <div style={{ fontSize: 13, fontWeight: '500' }}>{pay.label}</div>
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 12, color: '#9e9e9e' }}>Total</div>
                  <div style={{ fontSize: 18, fontWeight: 'bold' }}>₹{order.totalPrice?.toLocaleString()}</div>
                  {order.couponDiscount > 0 && (
                    <div style={{ fontSize: 11, color: '#388e3c' }}>Saved ₹{order.couponDiscount}</div>
                  )}
                </div>

                <Link to={`/order/${order._id}`} style={S.trackBtn}>
                  📍 Track Order
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const S = {
  center: { minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#fff' },
  pinkBtn: { background: '#e91e63', color: '#fff', padding: '12px 32px', borderRadius: 2, textDecoration: 'none', fontWeight: 'bold', fontSize: 15 },
  spinner: { width: 40, height: 40, border: '4px solid #fce4ec', borderTop: '4px solid #e91e63', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  orderCard: { background: '#fff', borderRadius: 4, marginBottom: 12, overflow: 'hidden', border: '1px solid #f0f0f0' },
  orderHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#f9f9f9', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: 8 },
  orderId: { fontWeight: 'bold', fontSize: 14 },
  orderDate: { fontSize: 12, color: '#9e9e9e', marginTop: 3 },
  badge: { padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 'bold' },
  items: { padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 },
  orderItem: { display: 'flex', gap: 12, alignItems: 'center' },
  itemImg: { width: 64, height: 64, objectFit: 'contain', background: '#f5f5f5', borderRadius: 4 },
  orderFooter: { padding: '14px 20px', background: '#fafafa', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  payBox: { display: 'flex', alignItems: 'center', gap: 10 },
  trackBtn: { background: '#e91e63', color: '#fff', padding: '8px 20px', borderRadius: 2, textDecoration: 'none', fontWeight: 'bold', fontSize: 13 },
};

export default Orders;