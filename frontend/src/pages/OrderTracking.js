import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../api';

const statusSteps = ['Processing', 'Confirmed', 'Shipped', 'Delivered'];

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/api/orders/${id}`)
      .then(r => { setOrder(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={S.center}><div style={S.spinner} /></div>;
  if (!order)  return <div style={S.center}><h3>Order not found</h3></div>;

  const currentStep = order.status === 'Cancelled'
    ? -1
    : statusSteps.indexOf(order.status);

  return (
    <div style={{ background: '#fce4ec', minHeight: '100vh', padding: '20px 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>

        {/* Header */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h2 style={{ margin: '0 0 6px', color: '#212121' }}>
                Order #{order._id.slice(-8).toUpperCase()}
              </h2>
              <div style={{ fontSize: 13, color: '#888' }}>
                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            {order.status !== 'Cancelled' && order.estimatedDelivery && (
              <div style={S.deliveryBox}>
                <div style={{ fontSize: 11, color: '#9e9e9e' }}>Estimated Delivery</div>
                <div style={{ fontWeight: 'bold', color: '#388e3c' }}>
                  {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Steps */}
        <div style={S.card}>
          <div style={S.cardTitle}>📦 Order Status</div>

          {order.status === 'Cancelled' ? (
            <div style={{ background: '#ffebee', color: '#d32f2f', padding: 20, borderRadius: 4, textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
              ❌ This order has been cancelled
            </div>
          ) : (
            <div style={S.stepsWrap}>
              {statusSteps.map((step, i) => {
                const done    = i < currentStep;
                const current = i === currentStep;
                const pending = i > currentStep;

                return (
                  <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        ...S.stepDot,
                        background: done || current ? '#e91e63' : '#e0e0e0',
                        border: current ? '3px solid #880e4f' : 'none',
                      }}>
                        {done ? '✓' : i + 1}
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div style={{ ...S.stepLine, background: done ? '#e91e63' : '#e0e0e0' }} />
                      )}
                    </div>
                    <div style={{ paddingBottom: 24 }}>
                      <div style={{ fontWeight: current ? 'bold' : 'normal', color: pending ? '#9e9e9e' : '#212121', fontSize: 14 }}>
                        {step}
                      </div>
                      {current && (
                        <div style={{ fontSize: 12, color: '#e91e63', marginTop: 2 }}>Current Status</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tracking History */}
        {order.tracking?.length > 0 && (
          <div style={S.card}>
            <div style={S.cardTitle}>🕐 Tracking History</div>
            {[...order.tracking].reverse().map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, padding: '10px 0', borderBottom: i < order.tracking.length - 1 ? '1px solid #f5f5f5' : 'none' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: i === 0 ? '#e91e63' : '#e0e0e0', marginTop: 4, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: i === 0 ? 'bold' : 'normal', color: '#212121' }}>{t.status}</div>
                  <div style={{ fontSize: 13, color: '#555' }}>{t.message}</div>
                  <div style={{ fontSize: 11, color: '#9e9e9e', marginTop: 2 }}>
                    {new Date(t.timestamp).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Items */}
        <div style={S.card}>
          <div style={S.cardTitle}>🛍️ Items Ordered</div>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid #f5f5f5', alignItems: 'center' }}>
              <img src={item.image || 'https://via.placeholder.com/70'} alt="" style={{ width: 70, height: 70, objectFit: 'contain', background: '#f5f5f5', borderRadius: 4 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: '500' }}>{item.name}</div>
                {(item.size || item.color) && (
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {item.size && `Size: ${item.size}`} {item.color && `| Color: ${item.color}`}
                  </div>
                )}
                <div style={{ fontSize: 13, color: '#555', marginTop: 2 }}>Qty: {item.quantity} × ₹{item.price?.toLocaleString()}</div>
              </div>
              <div style={{ fontWeight: 'bold' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}

          <div style={{ marginTop: 16, padding: '12px 0', borderTop: '1px dashed #e0e0e0' }}>
            {order.couponDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#388e3c', marginBottom: 6 }}>
                <span>Coupon ({order.couponCode})</span>
                <span>− ₹{order.couponDiscount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: 16 }}>
              <span>Total Paid</span>
              <span style={{ color: '#e91e63' }}>₹{order.totalPrice?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div style={S.card}>
          <div style={S.cardTitle}>📍 Delivery Address</div>
          <div style={{ fontSize: 14, color: '#333', lineHeight: 1.8 }}>
            <strong>{order.shippingAddress?.name}</strong> | {order.shippingAddress?.phone}<br />
            {order.shippingAddress?.street}<br />
            {order.shippingAddress?.city}, {order.shippingAddress?.state} — {order.shippingAddress?.pincode}
          </div>
        </div>

        <Link to="/orders" style={{ display: 'inline-block', marginTop: 8, color: '#e91e63', fontSize: 14 }}>
          ← Back to My Orders
        </Link>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const S = {
  center: { minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: 40, height: 40, border: '4px solid #fce4ec', borderTop: '4px solid #e91e63', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  card: { background: '#fff', borderRadius: 4, padding: 20, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid #f0f0f0' },
  deliveryBox: { background: '#e8f5e9', padding: '10px 16px', borderRadius: 4, textAlign: 'center' },
  stepsWrap: { display: 'flex', flexDirection: 'column' },
  stepDot: { width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 13, flexShrink: 0 },
  stepLine: { width: 2, height: 40, margin: '4px auto' },
};

export default OrderTracking;