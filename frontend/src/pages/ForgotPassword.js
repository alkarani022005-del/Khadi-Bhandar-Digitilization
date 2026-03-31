import React from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => (
  <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fce4ec' }}>
    <div style={{ background: '#fff', padding: 48, borderRadius: 8, textAlign: 'center', maxWidth: 420, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize: 70, marginBottom: 16 }}>🔑</div>
      <h2 style={{ marginBottom: 12 }}>No Password Needed!</h2>
      <p style={{ color: '#555', lineHeight: 1.6, marginBottom: 24 }}>
        Banasthali Khadi Bhandar uses <strong>OTP-based login</strong>.<br />
        Just enter your email and we'll send you a secure one-time code.
      </p>
      <Link to="/login" style={{ display: 'inline-block', background: '#e91e63', color: '#fff', padding: '13px 40px', borderRadius: 2, fontWeight: 'bold', fontSize: 15, textDecoration: 'none' }}>
        GO TO LOGIN →
      </Link>
    </div>
  </div>
);

export default ForgotPassword;