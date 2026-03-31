import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/authContext';
import ProductCard from '../components/ProductCard';

const Wishlist = () => {
  const { wishlist, user } = useAuth();

  if (!user) return (
    <div style={S.center}>
      <div style={{ fontSize: 70 }}>🔒</div>
      <h2>Please login to view wishlist</h2>
      <Link to="/login" style={S.btn}>LOGIN</Link>
    </div>
  );

  if (!wishlist.length) return (
    <div style={S.center}>
      <div style={{ fontSize: 70 }}>🤍</div>
      <h2 style={{ marginBottom: 8 }}>Your wishlist is empty</h2>
      <p style={{ color: '#888', marginBottom: 20 }}>Save products you love here</p>
      <Link to="/" style={S.btn}>BROWSE PRODUCTS</Link>
    </div>
  );

  return (
    <div style={{ background: '#fce4ec', minHeight: '100vh', padding: '20px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
        <div style={S.header}>
          <h2 style={{ margin: 0 }}>❤️ My Wishlist ({wishlist.length})</h2>
        </div>
        <div style={S.grid}>
          {wishlist.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>
    </div>
  );
};

const S = {
  center: { minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, background: '#fff' },
  btn: { background: '#e91e63', color: '#fff', padding: '12px 32px', borderRadius: 2, textDecoration: 'none', fontWeight: 'bold' },
  header: { background: '#fff', borderRadius: 4, padding: '16px 20px', marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 },
};

export default Wishlist;