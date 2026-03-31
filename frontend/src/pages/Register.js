import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';
import API from '../api';

const Register = () => {
  const [searchParams]    = useSearchParams();
  const defaultRole       = searchParams.get('role') === 'seller' ? 'seller' : 'customer';
  const [form, setForm]   = useState({ name: '', email: '', phone: '' });
  const [role, setRole]   = useState(defaultRole);
  const [otp, setOtp]     = useState('');
  const [step, setStep]   = useState(1);
  const [resending, setResending] = useState(false);
  const { register, verifyOtp, loading } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await register(form.name, form.email, form.phone, role);
    if (res.success) { toast.success('OTP sent to your email!'); setStep(2); }
    else toast.error(res.message || 'Registration failed');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const res = await verifyOtp(form.email, otp);
    if (res.success) {
      toast.success('Account created! Welcome 🎉');
      if (res.role === 'seller') navigate('/seller/setup');
      else navigate('/');
    } else toast.error(res.message || 'Invalid OTP');
  };

  const handleResend = async () => {
    setResending(true);
    setOtp('');
    try {
      await API.post('/api/auth/send-otp', { email: form.email });
      toast.success('New OTP sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
    setResending(false);
  };

  const handleGoogleSignup = () => {
    // Pass role in state so backend knows what role to assign
    const redirectUrl = role === 'seller'
      ? 'http://localhost:5000/api/auth/google?role=seller'
      : 'http://localhost:5000/api/auth/google';
    window.location.href = redirectUrl;
  };

  const F = e => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* Left */}
        <div style={S.left}>
          <div>
            <h2 style={S.leftH}>
              {role === 'seller' ? '🏪 Become a Seller' : '👋 Create Account'}
            </h2>
            <p style={S.leftP}>
              {role === 'seller'
                ? 'Sell your Khadi products to thousands of customers across India'
                : 'Sign up to shop authentic handwoven Khadi products'}
            </p>
          </div>
          <div style={{ marginTop: 40 }}>
            <div style={S.divider}>Already have an account?</div>
            <Link to="/login" style={S.loginBtn}>LOGIN</Link>
          </div>
        </div>

        {/* Right */}
        <div style={S.right}>
          {step === 1 ? (
            <form onSubmit={handleRegister}>
              <h3 style={S.formH}>I want to</h3>

              {/* Role Toggle */}
              <div style={S.roleWrap}>
                <div
                  onClick={() => setRole('customer')}
                  style={{
                    ...S.roleBtn,
                    background: role === 'customer' ? '#e91e63' : '#f5f5f5',
                    color: role === 'customer' ? '#fff' : '#555',
                    border: role === 'customer' ? '2px solid #e91e63' : '2px solid #e0e0e0',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🛍️</div>
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>Shop</div>
                  <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>Buy products</div>
                </div>
                <div
                  onClick={() => setRole('seller')}
                  style={{
                    ...S.roleBtn,
                    background: role === 'seller' ? '#e91e63' : '#f5f5f5',
                    color: role === 'seller' ? '#fff' : '#555',
                    border: role === 'seller' ? '2px solid #e91e63' : '2px solid #e0e0e0',
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 6 }}>🏪</div>
                  <div style={{ fontWeight: 'bold', fontSize: 14 }}>Sell</div>
                  <div style={{ fontSize: 11, marginTop: 2, opacity: 0.8 }}>List products</div>
                </div>
              </div>

              {role === 'seller' && (
                <div style={S.sellerNote}>
                  ℹ️ After registration you'll set up your shop. Admin approval required before selling.
                </div>
              )}

              <input name="name" placeholder="Full Name *" value={form.name} onChange={F} style={S.input} required />
              <input name="email" type="email" placeholder="Email ID *" value={form.email} onChange={F} style={S.input} required />
              <input name="phone" placeholder="Mobile Number (optional)" value={form.phone} onChange={F} style={S.input} />

              <button type="submit" style={S.btn} disabled={loading}>
                {loading ? 'Sending OTP...' : 'CONTINUE'}
              </button>

              {/* Google signup — for both customer and seller */}
              <div style={S.orRow}>
                <div style={S.orLine} />
                <span style={S.orText}>OR</span>
                <div style={S.orLine} />
              </div>

              <button type="button" onClick={handleGoogleSignup} style={S.googleBtn}>
                <GoogleIcon />
                {role === 'seller' ? 'Sign up as Seller with Google' : 'Sign up with Google'}
              </button>

              {role === 'seller' && (
                <div style={{ fontSize: 11, color: '#9e9e9e', textAlign: 'center', marginTop: 8 }}>
                  Google signup for sellers skips OTP — you'll fill shop details next
                </div>
              )}

              <div style={S.switch}>
                Already registered? <Link to="/login" style={S.link}>Login</Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <h3 style={S.formH}>Verify Your Email</h3>
              <div style={S.emailInfo}>
                <span style={{ fontSize: 13, color: '#555' }}>📧 OTP sent to <strong>{form.email}</strong></span>
              </div>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                style={S.otpInput}
                maxLength={6}
                required
              />
              <button type="submit" style={S.btn} disabled={loading || otp.length < 6}>
                {loading ? 'Verifying...' : 'VERIFY & CREATE ACCOUNT'}
              </button>
              <div style={S.bottomLinks}>
                <span style={S.linkBtn} onClick={() => { setStep(1); setOtp(''); }}>← Edit Details</span>
                <span
                  style={{ ...S.linkBtn, color: resending ? '#aaa' : '#e91e63' }}
                  onClick={!resending ? handleResend : undefined}
                >
                  {resending ? 'Sending...' : '🔄 Resend OTP'}
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" style={{ marginRight: 10, flexShrink: 0 }}>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

const S = {
  page: { background: '#fce4ec', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { background: '#fff', borderRadius: 4, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', display: 'flex', overflow: 'hidden', width: '100%', maxWidth: 740 },
  left: { background: 'linear-gradient(160deg, #e91e63 0%, #880e4f 100%)', padding: 40, flex: '0 0 280px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  leftH: { color: '#fff', fontSize: 24, fontWeight: 'bold', margin: '0 0 12px' },
  leftP: { color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 1.6 },
  divider: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginBottom: 14 },
  loginBtn: { display: 'block', textAlign: 'center', border: '1px solid #fff', color: '#fff', padding: '10px', borderRadius: 2, fontWeight: 'bold', fontSize: 14, textDecoration: 'none' },
  right: { flex: 1, padding: 40 },
  formH: { fontSize: 18, color: '#212121', marginBottom: 16 },
  roleWrap: { display: 'flex', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, padding: '16px 12px', textAlign: 'center', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' },
  sellerNote: { background: '#fff3e0', color: '#e65100', fontSize: 12, padding: '10px 14px', borderRadius: 4, marginBottom: 14, lineHeight: 1.5 },
  input: { width: '100%', padding: '12px 14px', border: '1px solid #e0e0e0', borderRadius: 2, fontSize: 14, marginBottom: 14, boxSizing: 'border-box' },
  emailInfo: { background: '#f9f9f9', padding: '10px 14px', borderRadius: 4, marginBottom: 16 },
  otpInput: { width: '100%', padding: '14px', border: '2px solid #e0e0e0', borderRadius: 4, fontSize: 24, textAlign: 'center', letterSpacing: 12, fontWeight: 'bold', boxSizing: 'border-box', color: '#e91e63', marginBottom: 16 },
  btn: { width: '100%', background: '#e91e63', color: '#fff', border: 'none', padding: 14, fontSize: 15, fontWeight: 'bold', borderRadius: 2, cursor: 'pointer' },
  orRow: { display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' },
  orLine: { flex: 1, height: 1, background: '#e0e0e0' },
  orText: { fontSize: 12, color: '#9e9e9e' },
  googleBtn: { width: '100%', background: '#fff', color: '#333', border: '1.5px solid #e0e0e0', padding: '11px 14px', fontSize: 14, fontWeight: '500', borderRadius: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  bottomLinks: { display: 'flex', justifyContent: 'space-between', marginTop: 16 },
  linkBtn: { color: '#e91e63', cursor: 'pointer', fontSize: 13, fontWeight: 'bold' },
  switch: { textAlign: 'center', marginTop: 16, fontSize: 13, color: '#9e9e9e' },
  link: { color: '#e91e63', fontWeight: 'bold', textDecoration: 'none' },
};

export default Register;