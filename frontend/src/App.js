import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './context/authContext';
import Header from './components/Header';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import BannerCarousel from './components/BannerCarousel';
import ProductCard from './components/ProductCard';
import ProductDetails from './components/ProductDetails';
import Wishlist from './pages/Wishlist';
import OrderTracking from './pages/OrderTracking';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Profile from './pages/Profile';
import SearchResults from './pages/SearchResults';
import ForgotPassword from './pages/ForgotPassword';
import SellerSetup from './pages/seller/SellerSetup';
import SellerDashboard from './pages/seller/SellerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import API from './api';
import About from './pages/About';



// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  return children;
};



const Home = () => {
  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    API.get('/api/products').then(r => {
      setProducts(r.data);
      setFeatured(r.data.filter(p => p.isFeatured).slice(0, 8));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = [
    { name: 'Kurtas', emoji: '👘' }, { name: 'Sarees', emoji: '🥻' },
    { name: 'Fabrics', emoji: '🧵' }, { name: 'Men', emoji: '👔' },
    { name: 'Women', emoji: '👗' }, { name: 'Kids', emoji: '🧒' },
    { name: 'Home Decor', emoji: '🏠' }, { name: 'Accessories', emoji: '👜' },
  ];

  return (
    <div style={{ background: '#fce4ec', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px' }}>
        <BannerCarousel />
        <div style={HS.section}>
          <div style={HS.sectionTitle}>Shop by Category</div>
          <div style={HS.categoryGrid}>
            {categories.map(c => (
              <a key={c.name} href={`/search?category=${c.name}`} style={HS.categoryChip} className="category-chip">
                <div style={{ fontSize: 30 }}>{c.emoji}</div>
                <div style={{ fontSize: 12, color: '#333', fontWeight: '500', textAlign: 'center' }}>{c.name}</div>
              </a>
            ))}
          </div>
        </div>
        {featured.length > 0 && (
          <div style={HS.section}>
            <div style={HS.sectionTitle}>⭐ Featured Products</div>
            <div style={HS.grid}>{featured.map(p => <ProductCard key={p._id} product={p} />)}</div>
          </div>
        )}
        <div style={HS.section}>
          <div style={HS.sectionTitle}>🛍️ All Products</div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#e91e63' }}>Loading...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 60 }}>😟</div>
              <h3>No products yet</h3>
              <p style={{ color: '#888', marginTop: 8 }}>Sellers can add products from their dashboard</p>
            </div>
          ) : (
            <div style={HS.grid}>{products.map(p => <ProductCard key={p._id} product={p} />)}</div>
          )}
        </div>
      </div>
      <footer style={HS.footer}>
  <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
    <div style={HS.footerGrid}>
      <div>
        <div style={HS.footerTitle}>BANASTHALI KHADI BHANDAR</div>
        <p style={HS.footerText}>
          Authentic handwoven Khadi products made by rural women of Rajasthan.
          Empowering lives, one thread at a time.
        </p>
      </div>
      <div>
        <div style={HS.footerHeading}>Quick Links</div>
        <a href="/" style={HS.footerLink} className="footer-link">Home</a>
        <a href="/about" style={HS.footerLink} className="footer-link">About Us</a>
        <a href="/search" style={HS.footerLink} className="footer-link">All Products</a>
        <a href="/cart" style={HS.footerLink} className="footer-link">Cart</a>
      </div>
      <div>
        <div style={HS.footerHeading}>Sell With Us</div>
        <a href="/register?role=seller" style={{ ...HS.footerLink, color: '#e91e63' }} className="footer-link">
          Register as Seller →
        </a>
        <a href="/login" style={HS.footerLink} className="footer-link">Seller Login</a>
      </div>
      <div>
        <div style={HS.footerHeading}>Contact Us</div>
        <div style={HS.footerText}>📍 Banasthali, Newai, Rajasthan — 304022</div>
        <a href="mailto:banasthalikhadibhandar@gmail.com" style={{ ...HS.footerText, color: '#e91e63', textDecoration: 'none' }}>
          📧 banasthalikhadibhandar@gmail.com
        </a>
        <div style={HS.footerText}>📞 +91 98765 43210</div>
      </div>
    </div>
    <div style={HS.footerBottom}>
      © 2024 Banasthali Khadi Bhandar. All rights reserved. &nbsp;|&nbsp;
      <a href="/about" style={{ color: '#e91e63', textDecoration: 'none' }}>About Us</a>
    </div>
  </div>
</footer>
    </div>
  );
};

const HS = {
  section:       { background: '#fff', borderRadius: 4, padding: '16px', marginBottom: 12 },
  sectionTitle:  { fontSize: 18, fontWeight: 'bold', color: '#212121', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #f0f0f0' },
  grid:          { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 },
  categoryGrid:  { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 10 },
  categoryChip:  { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 6px', background: '#fce4ec', borderRadius: 8, textDecoration: 'none', transition: 'transform 0.2s' },
  footer:        { background: '#212121', marginTop: 16 },
  footerGrid:    { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 },
  footerTitle:   { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 10 },
  footerHeading: { color: '#e91e63', fontWeight: 'bold', fontSize: 13, marginBottom: 10 },
  footerText:    { color: '#9e9e9e', fontSize: 12, marginBottom: 5 },
  footerLink:    { color: '#9e9e9e', fontSize: 12, marginBottom: 5, display: 'block', textDecoration: 'none' },
  footerBottom:  { borderTop: '1px solid #424242', marginTop: 24, paddingTop: 16, textAlign: 'center', color: '#757575', fontSize: 12 },
};

const AppRoutes = () => (
  <>
    <Routes>
      {/* ── PUBLIC — anyone can access ── */}
      <Route path="/"              element={<><Header /><Home /></>} />
      <Route path="/product/:id"   element={<><Header /><ProductDetails /></>} />
      <Route path="/search"        element={<><Header /><SearchResults /></>} />
      <Route path="/login"         element={<Login />} />
      <Route path="/register"      element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/cart"          element={<><Header /><Cart /></>} />
      <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
      {/* ── CUSTOMER + SELLER + ADMIN ── */}
      <Route path="/checkout" element={
        <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
          <><Header /><Checkout /></>
        </ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
          <><Header /><Orders /></>
        </ProtectedRoute>
      } />
      <Route path="/order/:id" element={
        <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
          <><Header /><OrderTracking /></>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
          <><Header /><Profile /></>
        </ProtectedRoute>
      } />
      <Route path="/wishlist" element={
        <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
          <><Header /><Wishlist /></>
        </ProtectedRoute>
      } />

      {/* ── SELLER + ADMIN ── */}
      <Route path="/seller/setup" element={
        <ProtectedRoute allowedRoles={['seller', 'admin']}>
          <SellerSetup />
        </ProtectedRoute>
      } />
      <Route path="/seller/dashboard" element={
        <ProtectedRoute allowedRoles={['seller', 'admin']}>
          <SellerDashboard />
        </ProtectedRoute>
      } />

      
<Route path="/about" element={<><Header /><About /></>} />

      {/* ── ADMIN ONLY ── */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* ── FALLBACK ── */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    <ToastContainer position="bottom-right" autoClose={2500} />
  </>
);
const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;