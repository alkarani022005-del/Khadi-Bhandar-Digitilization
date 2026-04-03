import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const SensitiveField = ({ name, value, onChange, placeholder, maxLength, extraStyle }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: 4 }}>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        style={{ ...S.input, paddingRight: 42, marginBottom: 0, ...extraStyle }}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        title={visible ? 'Hide' : 'Show'}
        style={S.eyeBtn}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
};

const SellerSetup = () => {
  const [form, setForm] = useState({
    shopName: '', shopDescription: '',
    gstin: '', aadhaarNumber: '', panNumber: '',
    bankAccount: '', ifsc: '',
    agreedToTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const F = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.shopName)      e.shopName = 'Shop name is required';
    if (!form.aadhaarNumber) e.aadhaarNumber = 'Aadhaar number is required';
    else if (!/^\d{12}$/.test(form.aadhaarNumber)) e.aadhaarNumber = 'Must be exactly 12 digits';
    if (!form.panNumber) e.panNumber = 'PAN number is required';
    else if (!/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/.test(form.panNumber)) e.panNumber = 'Invalid PAN (e.g. ABCDE1234F)';
    if (!form.bankAccount) e.bankAccount = 'Bank account is required';
    if (!form.ifsc)        e.ifsc = 'IFSC code is required';
    if (!form.agreedToTerms) e.agreedToTerms = 'You must agree to the Terms & Conditions to proceed.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await API.post('/api/auth/apply-seller', {
        ...form,
        panNumber: form.panNumber.toUpperCase(),
        ifsc: form.ifsc.toUpperCase(),
      });
      toast.success('Application submitted! Awaiting admin approval.');
      navigate('/seller/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    }
    setLoading(false);
  };

  return (
    <div style={{ background: '#fce4ec', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 4, padding: 40, maxWidth: 620, width: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48 }}>🏪</div>
          <h2 style={{ color: '#e91e63', marginTop: 8 }}>Set Up Your Seller Account</h2>
          <p style={{ color: '#888', fontSize: 14, marginTop: 6 }}>Fill in your details. Admin will review and approve your application.</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Shop Details */}
          <div style={S.sectionTitle}>📦 Shop Details</div>

          <label style={S.label}>Shop Name *</label>
          <input name="shopName" value={form.shopName} onChange={F} style={S.input} placeholder="Your shop name" />
          {errors.shopName && <div style={S.error}>{errors.shopName}</div>}

          <label style={S.label}>Shop Description</label>
          <textarea name="shopDescription" value={form.shopDescription} onChange={F}
            style={{ ...S.input, height: 80, resize: 'vertical' }}
            placeholder="Tell customers about your shop and products" />

          <label style={S.label}>GSTIN (optional)</label>
          <input name="gstin" value={form.gstin} onChange={F} style={S.input}
            placeholder="e.g. 22ABCDE1234F1Z5" />

          {/* Identity */}
          <div style={{ ...S.sectionTitle, marginTop: 20 }}>🪪 Identity Verification</div>

          <div style={S.infoBox}>
            🔒 Your Aadhaar and PAN details are encrypted and used only for seller verification. They will not be shared with anyone.
          </div>

          <label style={S.label}>Aadhaar Card Number *</label>
          <SensitiveField
            name="aadhaarNumber"
            value={form.aadhaarNumber}
            onChange={F}
            placeholder="12-digit Aadhaar number"
            maxLength={12}
          />
          {errors.aadhaarNumber && <div style={S.error}>{errors.aadhaarNumber}</div>}
          <div style={S.hint}>Enter 12-digit number on your Aadhaar card</div>

          <label style={S.label}>PAN Card Number *</label>
          <SensitiveField
            name="panNumber"
            value={form.panNumber}
            onChange={F}
            placeholder="e.g. ABCDE1234F"
            maxLength={10}
            extraStyle={{ textTransform: 'uppercase' }}
          />
          {errors.panNumber && <div style={S.error}>{errors.panNumber}</div>}
          <div style={S.hint}>10-character PAN (5 letters + 4 digits + 1 letter)</div>

          {/* Bank Details */}
          <div style={{ ...S.sectionTitle, marginTop: 20 }}>🏦 Bank Details</div>

          <label style={S.label}>Bank Account Number *</label>
          <SensitiveField
            name="bankAccount"
            value={form.bankAccount}
            onChange={F}
            placeholder="Account number for receiving payments"
          />
          {errors.bankAccount && <div style={S.error}>{errors.bankAccount}</div>}

          <label style={S.label}>IFSC Code *</label>
          <input
            name="ifsc"
            value={form.ifsc}
            onChange={F}
            style={{ ...S.input, textTransform: 'uppercase' }}
            placeholder="e.g. SBIN0001234"
            maxLength={11}
          />
          {errors.ifsc && <div style={S.error}>{errors.ifsc}</div>}

          {/* Terms Checkbox */}
          <div
            onClick={() => {
              setForm(f => ({ ...f, agreedToTerms: !f.agreedToTerms }));
              setErrors(e => ({ ...e, agreedToTerms: '' }));
            }}
            style={{
              ...S.termsBox,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              border: errors.agreedToTerms
                ? '1.5px solid #d32f2f'
                : form.agreedToTerms
                  ? '1.5px solid #388e3c'
                  : '1.5px solid transparent',
            }}
          >
            <div style={{
              width: 18, height: 18, minWidth: 18,
              border: '2px solid #388e3c', borderRadius: 3,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 1, flexShrink: 0,
            }}>
              {form.agreedToTerms && (
                <svg width="11" height="11" viewBox="0 0 12 12">
                  <polyline points="2,6 5,9 10,3" fill="none" stroke="#388e3c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span>
              By submitting this application, you confirm that all information provided is accurate and you agree to our Seller Terms &amp; Conditions.
            </span>
          </div>
          {errors.agreedToTerms && <div style={{ ...S.error, marginBottom: 12 }}>{errors.agreedToTerms}</div>}

          <button type="submit" style={S.btn} disabled={loading}>
            {loading ? '⏳ Submitting...' : '🚀 SUBMIT APPLICATION'}
          </button>
        </form>
      </div>
    </div>
  );
};

const S = {
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#e91e63', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #fce4ec' },
  label:        { fontSize: 12, fontWeight: 'bold', color: '#878787', display: 'block', marginBottom: 6 },
  input:        { width: '100%', padding: '11px 14px', border: '1px solid #e0e0e0', borderRadius: 2, fontSize: 14, marginBottom: 4, boxSizing: 'border-box' },
  error:        { color: '#d32f2f', fontSize: 12, marginBottom: 8, marginTop: 2 },
  hint:         { fontSize: 11, color: '#9e9e9e', marginBottom: 14 },
  infoBox:      { background: '#e3f2fd', color: '#1565c0', padding: '10px 14px', borderRadius: 4, fontSize: 12, marginBottom: 16, lineHeight: 1.5 },
  termsBox:     { background: '#e8f5e9', color: '#388e3c', padding: '10px 14px', borderRadius: 4, fontSize: 12, marginBottom: 8, lineHeight: 1.5 },
  btn:          { width: '100%', background: '#e91e63', color: '#fff', border: 'none', padding: 14, fontWeight: 'bold', fontSize: 15, borderRadius: 2, cursor: 'pointer' },
  eyeBtn:       { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex', alignItems: 'center', padding: 4 },
};

export default SellerSetup;