import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';
import API from '../api';

const Checkout = () => {
  const { cart, user, fetchCart } = useAuth();
  const navigate = useNavigate();

  const [upiId, setUpiId]               = useState('');
const [cardDetails, setCardDetails]   = useState({ number: '', name: '', expiry: '', cvv: '' });
const [selectedBank, setSelectedBank] = useState('');
const [selectedWallet, setSelectedWallet] = useState('');

  const [step, setStep] = useState(1);
  const [addr, setAddr] = useState({
    name: user?.name || '', phone: user?.phone || '',
    street: user?.address?.street || '', city: user?.address?.city || '',
    state: user?.address?.state || '', pincode: user?.address?.pincode || '',
  });
  const [payment, setPayment]           = useState('razorpay');
  const [couponInput, setCouponInput]   = useState('');
  const [coupon, setCoupon]             = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading]   = useState(false);
  const [loading, setLoading]           = useState(false);

  const subtotal = cart.reduce((s, i) => s + (i.product?.price || 0) * i.quantity, 0);
  const saved    = cart.reduce((s, i) => s + ((i.product?.originalPrice || i.product?.price || 0) - (i.product?.price || 0)) * i.quantity, 0);
  const delivery = subtotal > 500 ? 0 : 50;
  const total    = subtotal + delivery - couponDiscount;

  const F = e => setAddr({ ...addr, [e.target.name]: e.target.value });

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await API.post('/api/coupons/apply', { code: couponInput, orderAmount: subtotal });
      setCoupon(data.code);
      setCouponDiscount(data.discount);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCoupon(''); setCouponDiscount(0);
    }
    setCouponLoading(false);
  };

  const handleAddrSubmit = (e) => {
    e.preventDefault();
    if (!addr.name || !addr.phone || !addr.street || !addr.city || !addr.state || !addr.pincode) {
      toast.error('Please fill all address fields'); return;
    }
    setStep(2); window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    setStep(3); window.scrollTo(0, 0);
  };

  const createDbOrder = async () => {
    const { data } = await API.post('/api/orders', {
      shippingAddress: addr, paymentMethod: payment, couponCode: coupon,
    });
    return data;
  };

  const handleCodOrder = async () => {
    setLoading(true);
    try {
      await createDbOrder();
      await fetchCart();
      toast.success('🎉 Order placed successfully!');
      navigate('/orders');
    } catch (err) { toast.error(err.response?.data?.message || 'Order failed'); }
    setLoading(false);
  };

  const handleRazorpayOrder = async () => {
    setLoading(true);
    try {
      const { data: rpOrder } = await API.post('/api/payment/create-order', { amount: total });
      const dbOrder = await createDbOrder();
      const options = {
        key: rpOrder.keyId,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        name: 'Banasthali Khadi Bhandar',
        description: 'Khadi Products Order',
        order_id: rpOrder.orderId,
        prefill: { name: user?.name, email: user?.email, contact: addr.phone },
        theme: { color: '#e91e63' },
        handler: async (response) => {
          try {
            await API.post('/api/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: dbOrder._id,
            });
            await fetchCart();
            toast.success('🎉 Payment successful! Order confirmed!');
            navigate('/orders');
          } catch { toast.error('Payment verification failed. Contact support.'); }
        },
        modal: { ondismiss: () => { toast.warning('Payment cancelled'); setLoading(false); } },
      };
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (r) => { toast.error(`Payment failed: ${r.error.description}`); setLoading(false); });
      rzp.open();
      setLoading(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Payment failed'); setLoading(false); }
  };

  const handlePlaceOrder = () => {
    if (payment === 'cod') handleCodOrder();
    else handleRazorpayOrder();
  };

  const steps = [
    { n: 1, label: 'Delivery Address', icon: '📍' },
    { n: 2, label: 'Payment',          icon: '💳' },
    { n: 3, label: 'Review & Confirm', icon: '📋' },
  ];

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');
        * { box-sizing: border-box; }
        .co-input { width:100%; padding:11px 14px; border:1.5px solid #e8d5d8; border-radius:8px; font-size:14px; font-family:'DM Sans',sans-serif; background:#fff; transition:border-color 0.2s, box-shadow 0.2s; outline:none; }
        .co-input:focus { border-color:#e91e63; box-shadow:0 0 0 3px rgba(233,30,99,0.08); }
        .pay-opt:hover { border-color:#e91e63 !important; }
        .step-bar-line { transition: background 0.4s; }
        .co-btn-main { background:linear-gradient(135deg,#e91e63,#c2185b); color:#fff; border:none; padding:14px 28px; border-radius:10px; font-size:15px; font-weight:600; cursor:pointer; width:100%; font-family:'DM Sans',sans-serif; letter-spacing:0.3px; transition:transform 0.15s, box-shadow 0.15s; }
        .co-btn-main:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(233,30,99,0.3); }
        .co-btn-main:disabled { background:#ccc; cursor:not-allowed; transform:none; box-shadow:none; }
        .co-btn-back { background:#fff; color:#666; border:1.5px solid #e0e0e0; padding:14px 24px; border-radius:10px; font-size:14px; font-weight:500; cursor:pointer; font-family:'DM Sans',sans-serif; transition:border-color 0.2s; }
        .co-btn-back:hover { border-color:#e91e63; color:#e91e63; }
      `}</style>

      {/* Step Indicator */}
      <div style={S.stepWrap}>
        <div style={S.stepCard}>
          {steps.map((s, i) => (
            <React.Fragment key={s.n}>
              <div style={S.stepItem}>
                <div style={{
                  ...S.stepCircle,
                  background: step > s.n ? '#22c55e' : step === s.n ? '#e91e63' : '#f0f0f0',
                  color: step >= s.n ? '#fff' : '#999',
                  boxShadow: step === s.n ? '0 4px 16px rgba(233,30,99,0.35)' : 'none',
                }}>
                  {step > s.n ? '✓' : s.icon}
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: step === s.n ? '600' : '400', color: step === s.n ? '#e91e63' : step > s.n ? '#22c55e' : '#999', fontFamily: "'DM Sans',sans-serif" }}>
                    {step > s.n ? 'Done' : `Step ${s.n}`}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: '500', color: step >= s.n ? '#212121' : '#bbb', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' }}>
                    {s.label}
                  </div>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="step-bar-line" style={{ flex: 1, height: 2, background: step > s.n ? '#22c55e' : '#f0f0f0', margin: '0 8px', marginBottom: 28 }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={S.body}>
        <div style={S.mainCol}>

          {/* ── STEP 1: ADDRESS ── */}
          {step === 1 && (
            <div style={S.card}>
              <div style={S.cardHeader}>
                <span style={S.cardIcon}>📍</span>
                <div>
                  <div style={S.cardTitle}>Delivery Address</div>
                  <div style={S.cardSub}>Where should we deliver your order?</div>
                </div>
              </div>
              <form onSubmit={handleAddrSubmit}>
                <div style={S.grid2}>
                  <div>
                    <label style={S.label}>Full Name *</label>
                    <input className="co-input" name="name" value={addr.name} onChange={F} placeholder="Your full name" required />
                  </div>
                  <div>
                    <label style={S.label}>Phone Number *</label>
                    <input className="co-input" name="phone" value={addr.phone} onChange={F} placeholder="10-digit mobile" maxLength={10} required />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={S.label}>Street Address *</label>
                  <input className="co-input" name="street" value={addr.street} onChange={F} placeholder="House no, Building, Street, Area" required />
                </div>
                <div style={S.grid2}>
                  <div>
                    <label style={S.label}>City *</label>
                    <input className="co-input" name="city" value={addr.city} onChange={F} placeholder="City" required />
                  </div>
                  <div>
                    <label style={S.label}>State *</label>
                    <input className="co-input" name="state" value={addr.state} onChange={F} placeholder="State" required />
                  </div>
                </div>
                <div style={{ marginBottom: 24, maxWidth: 180 }}>
                  <label style={S.label}>Pincode *</label>
                  <input className="co-input" name="pincode" value={addr.pincode} onChange={F} placeholder="6-digit pincode" maxLength={6} required />
                </div>
                <button type="submit" className="co-btn-main">Continue to Payment →</button>
              </form>
            </div>
          )}

          {/* ── STEP 2: PAYMENT ── */}
          {step === 2 && (
            <div style={S.card}>
              <div style={S.cardHeader}>
                <span style={S.cardIcon}>💳</span>
                <div>
                  <div style={S.cardTitle}>Payment Method</div>
                  <div style={S.cardSub}>Choose how you'd like to pay</div>
                </div>
              </div>
              <form onSubmit={handlePaymentSubmit}>

                {/* UPI */}
                <div
                  className="pay-opt"
                  onClick={() => setPayment('upi')}
                  style={{ ...S.payOption, border: payment === 'upi' ? '2px solid #e91e63' : '1.5px solid #eee', background: payment === 'upi' ? '#fff5f8' : '#fff' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ ...S.radioCircle, borderColor: payment === 'upi' ? '#e91e63' : '#ddd' }}>
                      {payment === 'upi' && <div style={S.radioDot} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={S.payTitle}>📱 UPI</span>
                        {payment === 'upi' && <span style={S.selectedTag}>Selected ✓</span>}
                      </div>
                      <div style={S.paySubtitle}>Google Pay, PhonePe, Paytm, BHIM & more</div>
                      {payment === 'upi' && (
                        <div style={{ marginTop: 14 }}>
                          <label style={S.label}>Enter UPI ID</label>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input
                              className="co-input"
                              placeholder="yourname@upi / yourname@okaxis"
                              value={upiId}
                              onChange={e => setUpiId(e.target.value)}
                              onClick={e => e.stopPropagation()}
                              style={{ flex: 1 }}
                            />
                            {upiId.includes('@') && (
                              <div style={{ background: '#e8f5e9', color: '#16a34a', padding: '10px 14px', borderRadius: 8, fontSize: 12, fontWeight: '600', display: 'flex', alignItems: 'center' }}>✓ Valid</div>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: '#9e9e9e', marginTop: 6 }}>
                            Format: yourname@upi, yourname@okaxis, yourname@paytm
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cards */}
                <div
                  className="pay-opt"
                  onClick={() => setPayment('card')}
                  style={{ ...S.payOption, border: payment === 'card' ? '2px solid #e91e63' : '1.5px solid #eee', background: payment === 'card' ? '#fff5f8' : '#fff' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ ...S.radioCircle, borderColor: payment === 'card' ? '#e91e63' : '#ddd' }}>
                      {payment === 'card' && <div style={S.radioDot} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={S.payTitle}>💳 Credit / Debit Card</span>
                        {payment === 'card' && <span style={S.selectedTag}>Selected ✓</span>}
                      </div>
                      <div style={S.paySubtitle}>Visa, Mastercard, RuPay, Amex</div>
                      {payment === 'card' && (
                        <div style={{ marginTop: 14 }} onClick={e => e.stopPropagation()}>
                          <div style={{ marginBottom: 12 }}>
                            <label style={S.label}>Card Number *</label>
                            <input
                              className="co-input"
                              placeholder="1234 5678 9012 3456"
                              value={cardDetails.number}
                              onChange={e => setCardDetails({ ...cardDetails, number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                              maxLength={16}
                            />
                          </div>
                          <div style={{ marginBottom: 12 }}>
                            <label style={S.label}>Cardholder Name *</label>
                            <input
                              className="co-input"
                              placeholder="Name as on card"
                              value={cardDetails.name}
                              onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                            />
                          </div>
                          <div style={S.grid2}>
                            <div>
                              <label style={S.label}>Expiry Date *</label>
                              <input
                                className="co-input"
                                placeholder="MM/YY"
                                value={cardDetails.expiry}
                                onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                maxLength={5}
                              />
                            </div>
                            <div>
                              <label style={S.label}>CVV *</label>
                              <input
                                className="co-input"
                                placeholder="•••"
                                type="password"
                                value={cardDetails.cvv}
                                onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                                maxLength={3}
                              />
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: '#9e9e9e', display: 'flex', alignItems: 'center', gap: 4 }}>
                            🔒 Your card details are encrypted and secure
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Net Banking */}
                <div
                  className="pay-opt"
                  onClick={() => setPayment('netbanking')}
                  style={{ ...S.payOption, border: payment === 'netbanking' ? '2px solid #e91e63' : '1.5px solid #eee', background: payment === 'netbanking' ? '#fff5f8' : '#fff' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ ...S.radioCircle, borderColor: payment === 'netbanking' ? '#e91e63' : '#ddd' }}>
                      {payment === 'netbanking' && <div style={S.radioDot} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={S.payTitle}>🏦 Net Banking</span>
                        {payment === 'netbanking' && <span style={S.selectedTag}>Selected ✓</span>}
                      </div>
                      <div style={S.paySubtitle}>All major banks supported</div>
                      {payment === 'netbanking' && (
                        <div style={{ marginTop: 14 }} onClick={e => e.stopPropagation()}>
                          <label style={S.label}>Select Bank</label>
                          <select
                            className="co-input"
                            value={selectedBank}
                            onChange={e => setSelectedBank(e.target.value)}
                            style={{ cursor: 'pointer' }}
                          >
                            <option value="">-- Choose your bank --</option>
                            {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda', 'Canara Bank', 'Union Bank of India', 'IndusInd Bank', 'Yes Bank', 'IDFC First Bank', 'Federal Bank', 'South Indian Bank', 'Other'].map(b => (
                              <option key={b} value={b}>{b}</option>
                            ))}
                          </select>
                          <div style={{ fontSize: 11, color: '#9e9e9e', marginTop: 6 }}>
                            You'll be redirected to your bank's secure portal
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Wallets */}
                <div
                  className="pay-opt"
                  onClick={() => setPayment('wallet')}
                  style={{ ...S.payOption, border: payment === 'wallet' ? '2px solid #e91e63' : '1.5px solid #eee', background: payment === 'wallet' ? '#fff5f8' : '#fff' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ ...S.radioCircle, borderColor: payment === 'wallet' ? '#e91e63' : '#ddd' }}>
                      {payment === 'wallet' && <div style={S.radioDot} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={S.payTitle}>👛 Wallets</span>
                        {payment === 'wallet' && <span style={S.selectedTag}>Selected ✓</span>}
                      </div>
                      <div style={S.paySubtitle}>Paytm, Amazon Pay, Mobikwik & more</div>
                      {payment === 'wallet' && (
                        <div style={{ marginTop: 14 }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                            {[
                              { id: 'paytm',      name: 'Paytm',       emoji: '💙' },
                              { id: 'amazonpay',  name: 'Amazon Pay',  emoji: '🟠' },
                              { id: 'mobikwik',   name: 'Mobikwik',    emoji: '💜' },
                              { id: 'freecharge', name: 'Freecharge',  emoji: '🔵' },
                              { id: 'jiopay',     name: 'JioPay',      emoji: '🔴' },
                              { id: 'airtel',     name: 'Airtel Money', emoji: '❤️' },
                            ].map(w => (
                              <div
                                key={w.id}
                                onClick={e => { e.stopPropagation(); setSelectedWallet(w.id); }}
                                style={{
                                  padding: '12px 8px', borderRadius: 10, textAlign: 'center', cursor: 'pointer',
                                  border: selectedWallet === w.id ? '2px solid #e91e63' : '1.5px solid #eee',
                                  background: selectedWallet === w.id ? '#fff5f8' : '#fff',
                                  transition: 'all 0.2s',
                                }}
                              >
                                <div style={{ fontSize: 24, marginBottom: 4 }}>{w.emoji}</div>
                                <div style={{ fontSize: 11, fontWeight: '500', color: '#333' }}>{w.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* COD */}
                <div
                  className="pay-opt"
                  onClick={() => setPayment('cod')}
                  style={{ ...S.payOption, border: payment === 'cod' ? '2px solid #e91e63' : '1.5px solid #eee', background: payment === 'cod' ? '#fff5f8' : '#fff' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    <div style={{ ...S.radioCircle, borderColor: payment === 'cod' ? '#e91e63' : '#ddd' }}>
                      {payment === 'cod' && <div style={S.radioDot} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={S.payTitle}>💵 Cash on Delivery</span>
                        {payment === 'cod' && <span style={S.selectedTag}>Selected ✓</span>}
                      </div>
                      <div style={S.paySubtitle}>Pay when your order arrives at your door</div>
                      {payment === 'cod' && (
                        <div style={{ fontSize: 12, color: '#ff9f00', marginTop: 8, background: '#fff3e0', padding: '6px 10px', borderRadius: 6 }}>
                          ⚠️ Extra ₹20 COD handling charge may apply
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button type="button" className="co-btn-back" onClick={() => setStep(1)}>← Back</button>
                  <button type="submit" className="co-btn-main">Review Order →</button>
                </div>
              </form>
            </div>
          )}
              
          {/* ── STEP 3: REVIEW ── */}
          {step === 3 && (
            <div style={S.card}>
              <div style={S.cardHeader}>
                <span style={S.cardIcon}>📋</span>
                <div>
                  <div style={S.cardTitle}>Review Your Order</div>
                  <div style={S.cardSub}>Check everything before placing</div>
                </div>
              </div>

              {/* Address review */}
              <div style={S.reviewBlock}>
                <div style={S.reviewBlockHeader}>
                  <span>📍 Delivery Address</span>
                  <span style={S.editLink} onClick={() => setStep(1)}>Edit</span>
                </div>
                <div style={S.reviewBlockBody}>
                  <strong>{addr.name}</strong> &nbsp;|&nbsp; {addr.phone}<br />
                  {addr.street}, {addr.city},<br />
                  {addr.state} — {addr.pincode}
                </div>
              </div>

              {/* Payment review */}
              <div style={S.reviewBlock}>
                <div style={S.reviewBlockHeader}>
                  <span>💳 Payment Method</span>
                  <span style={S.editLink} onClick={() => setStep(2)}>Edit</span>
                </div>
                <div style={S.reviewBlockBody}>
                 {payment === 'upi'        && `📱 UPI — ${upiId || 'UPI Payment'}`}
                  {payment === 'card'       && `💳 Card ending in ****${cardDetails.number.slice(-4) || '----'}`}
                  {payment === 'netbanking' && `🏦 Net Banking — ${selectedBank || 'Bank Transfer'}`}
                  {payment === 'wallet'     && `👛 ${selectedWallet ? selectedWallet.charAt(0).toUpperCase() + selectedWallet.slice(1) : 'Wallet'}`}
                  {payment === 'cod'        && '💵 Cash on Delivery'}
</div>
              </div>

              {/* Items review */}
              <div style={S.reviewBlock}>
                <div style={S.reviewBlockHeader}><span>🛍️ Items ({cart.length})</span></div>
                {cart.map(item => item.product && (
                  <div key={item._id} style={S.reviewItem}>
                    <img src={item.product.images?.[0] || 'https://via.placeholder.com/64'} alt=""
                      style={{ width: 64, height: 64, objectFit: 'contain', background: '#f9f9f9', borderRadius: 8 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: '500', color: '#212121' }}>{item.product.name}</div>
                      <div style={{ fontSize: 13, color: '#888', marginTop: 3 }}>Qty: {item.quantity}</div>
                    </div>
                    <div style={{ fontWeight: '600', fontSize: 15, color: '#212121' }}>
                      ₹{(item.product.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Total box */}
              <div style={S.totalBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 16, fontWeight: '600', color: '#212121' }}>Total Payable</span>
                  <span style={{ fontSize: 22, fontWeight: '700', color: '#e91e63' }}>₹{total.toLocaleString()}</span>
                </div>
                {delivery === 0 && <div style={{ fontSize: 12, color: '#22c55e', marginTop: 4 }}>🚚 FREE Delivery included</div>}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button className="co-btn-back" onClick={() => setStep(2)}>← Back</button>
                <button
                  className="co-btn-main"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  style={{ flex: 1, fontSize: 16, padding: 16 }}
                >
                  {loading ? '⏳ Processing...' : payment === 'razorpay' ? `💳 PAY ₹${total.toLocaleString()} NOW` : '🎉 PLACE ORDER (COD)'}
                </button>
              </div>

              <div style={S.trustBar}>
                <span>🔒 Secure Payments</span>
                <span>✅ Razorpay Certified</span>
                <span>🛡️ Data Protected</span>
              </div>
            </div>
          )}
        </div>

        {/* ── SIDEBAR ── */}
        <div style={S.sidebar}>

          {/* Coupon */}
          <div style={S.sideCard}>
            <div style={S.sideCardTitle}>🏷️ Have a Coupon?</div>
            {coupon ? (
              <div style={S.couponApplied}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '600', color: '#16a34a', fontSize: 14 }}>✅ {coupon} applied!</div>
                    <div style={{ fontSize: 12, color: '#555', marginTop: 2 }}>You save ₹{couponDiscount} extra</div>
                  </div>
                  <button
                    onClick={() => { setCoupon(''); setCouponDiscount(0); setCouponInput(''); }}
                    style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: 18, fontWeight: 'bold' }}
                  >✕</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  className="co-input"
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  style={{ flex: 1, fontSize: 13 }}
                  onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                />
                <button
                  onClick={applyCoupon}
                  disabled={couponLoading}
                  style={{ background: '#e91e63', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontWeight: '600', fontSize: 13, whiteSpace: 'nowrap' }}
                >
                  {couponLoading ? '...' : 'APPLY'}
                </button>
              </div>
            )}
          </div>

          {/* Price Summary */}
          <div style={S.sideCard}>
            <div style={S.sideCardTitle}>PRICE DETAILS</div>

            <div style={S.priceRow}>
              <span style={S.priceLabel}>Price ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
              <span style={S.priceVal}>₹{(subtotal + saved).toLocaleString()}</span>
            </div>

            {saved > 0 && (
              <div style={S.priceRow}>
                <span style={{ ...S.priceLabel, color: '#16a34a' }}>Discount</span>
                <span style={{ ...S.priceVal, color: '#16a34a' }}>− ₹{saved.toLocaleString()}</span>
              </div>
            )}

            {couponDiscount > 0 && (
              <div style={S.priceRow}>
                <span style={{ ...S.priceLabel, color: '#16a34a' }}>Coupon ({coupon})</span>
                <span style={{ ...S.priceVal, color: '#16a34a' }}>− ₹{couponDiscount}</span>
              </div>
            )}

            <div style={S.priceRow}>
              <span style={S.priceLabel}>Delivery</span>
              <span style={{ ...S.priceVal, color: '#16a34a' }}>{delivery === 0 ? 'FREE' : `₹${delivery}`}</span>
            </div>

            <div style={S.priceDivider} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontWeight: '700', fontSize: 16, color: '#212121' }}>Total</span>
              <span style={{ fontWeight: '700', fontSize: 20, color: '#212121' }}>₹{total.toLocaleString()}</span>
            </div>

            {(saved + couponDiscount) > 0 && (
              <div style={S.saveBadge}>
                🎉 You save ₹{(saved + couponDiscount).toLocaleString()} on this order!
              </div>
            )}
          </div>

          {/* Trust */}
          <div style={S.trustCard}>
            {[
              { icon: '🔒', text: 'Safe & Secure Payments' },
              { icon: '↩️', text: '7 Day Easy Returns' },
              { icon: '✅', text: '100% Authentic Khadi' },
              { icon: '🚚', text: 'Free delivery above ₹500' },
            ].map(t => (
              <div key={t.text} style={S.trustItem}>
                <span>{t.icon}</span>
                <span style={{ fontSize: 12, color: '#555' }}>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const S = {
  page: { background: '#f8f0f2', minHeight: '100vh', padding: '24px 0 48px', fontFamily: "'DM Sans', sans-serif" },

  // Step bar
  stepWrap: { maxWidth: 860, margin: '0 auto 24px', padding: '0 16px' },
  stepCard: { background: '#fff', borderRadius: 16, padding: '20px 32px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 },
  stepCircle: { width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: '700', transition: 'all 0.3s' },

  // Layout
  body: { maxWidth: 1000, margin: '0 auto', padding: '0 16px', display: 'flex', gap: 20, alignItems: 'flex-start' },
  mainCol: { flex: 1 },
  sidebar: { width: 300, display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 90 },

  // Main card
  card: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: 16 },
  cardHeader: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24, paddingBottom: 18, borderBottom: '1px solid #f5e8eb' },
  cardIcon: { fontSize: 28, width: 52, height: 52, background: '#fff0f4', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', fontFamily: "'DM Sans',sans-serif" },
  cardSub: { fontSize: 13, color: '#9e9e9e', marginTop: 2 },

  // Form
  label: { fontSize: 12, fontWeight: '600', color: '#666', display: 'block', marginBottom: 6, letterSpacing: 0.3 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 },

  // Payment options
  payOption: { borderRadius: 12, padding: '18px 20px', marginBottom: 14, cursor: 'pointer', transition: 'all 0.2s' },
  radioCircle: { width: 20, height: 20, borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  radioDot: { width: 10, height: 10, borderRadius: '50%', background: '#e91e63' },
  payTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  paySubtitle: { fontSize: 13, color: '#9e9e9e', marginTop: 2 },
  selectedTag: { background: '#e8f5e9', color: '#16a34a', fontSize: 11, fontWeight: '600', padding: '3px 10px', borderRadius: 20 },
  methodChip: { background: '#f5f5f5', color: '#555', fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1px solid #eee' },
  razorNote: { background: '#f0fdf4', color: '#16a34a', fontSize: 12, padding: '8px 12px', borderRadius: 8, marginTop: 10 },

  // Review
  reviewBlock: { background: '#fafafa', borderRadius: 10, padding: 16, marginBottom: 12, border: '1px solid #f0e8eb' },
  reviewBlockHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 10 },
  reviewBlockBody: { fontSize: 14, color: '#212121', lineHeight: 1.7 },
  reviewItem: { display: 'flex', gap: 14, padding: '10px 0', borderBottom: '1px solid #f5f5f5', alignItems: 'center' },
  editLink: { color: '#e91e63', cursor: 'pointer', fontSize: 13, fontWeight: '500' },
  totalBox: { background: 'linear-gradient(135deg,#fff5f8,#fce4ec)', padding: '16px 20px', borderRadius: 12, marginTop: 16, border: '1px solid #f8d7da' },
  trustBar: { display: 'flex', justifyContent: 'center', gap: 20, marginTop: 16, fontSize: 12, color: '#9e9e9e' },

  // Sidebar
  sideCard: { background: '#fff', borderRadius: 14, padding: '18px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  sideCardTitle: { fontSize: 12, fontWeight: '700', color: '#9e9e9e', letterSpacing: 1, marginBottom: 14, textTransform: 'uppercase' },
  couponApplied: { background: '#f0fdf4', borderRadius: 8, padding: '12px 14px', border: '1px solid #bbf7d0' },
  priceRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 11 },
  priceLabel: { fontSize: 14, color: '#555' },
  priceVal: { fontSize: 14, fontWeight: '500', color: '#212121' },
  priceDivider: { height: 1, background: 'linear-gradient(to right,transparent,#f0e0e5,transparent)', margin: '14px 0' },
  saveBadge: { background: 'linear-gradient(135deg,#e8f5e9,#f0fdf4)', color: '#16a34a', padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: '500', textAlign: 'center', border: '1px solid #bbf7d0' },
  trustCard: { background: '#fff', borderRadius: 14, padding: '14px 18px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 10 },
  trustItem: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 },
};

export default Checkout;