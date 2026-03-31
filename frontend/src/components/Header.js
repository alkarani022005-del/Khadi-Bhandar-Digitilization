import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import API from '../api';

const Header = () => {
  const { user, cart, wishlist, logout } = useAuth();
  const [search, setSearch]         = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop, setShowDrop]     = useState(false);
  const [showSugg, setShowSugg]     = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([
    'Men', 'Women', 'Kids', 'Kurtas', 'Sarees', 'Fabrics', 'Home Decor', 'Accessories'
  ]);
  const navigate   = useNavigate();
  const searchRef  = useRef(null);

  // Load products for autocomplete
  useEffect(() => {
    API.get('/api/products').then(r => setAllProducts(r.data)).catch(() => {});
  }, []);

  // Load dynamic categories from backend
  useEffect(() => {
    API.get('/api/site/categories')
      .then(r => {
        if (r.data.length > 0) setCategories(r.data.map(c => c.name));
      })
      .catch(() => {});
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSugg(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Generate suggestions as user types
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setSuggestions([]);
      setShowSugg(false);
      return;
    }

    const q = search.toLowerCase();
    const matched = [];

    // Starts-with matches first
    allProducts.forEach(p => {
      if (p.name.toLowerCase().startsWith(q)) {
        matched.push({ text: p.name, type: 'product', exact: true });
      }
    });

    // Contains matches
    allProducts.forEach(p => {
      if (!p.name.toLowerCase().startsWith(q) && p.name.toLowerCase().includes(q)) {
        matched.push({ text: p.name, type: 'product', exact: false });
      }
    });

    // Category matches
    categories.forEach(c => {
      if (c.toLowerCase().includes(q)) {
        matched.push({ text: c, type: 'category', exact: false });
      }
    });

    // Fuzzy "Did you mean"
    if (matched.length === 0) {
      const allNames = [
        ...allProducts.map(p => p.name),
        ...categories,
      ];
      const close = allNames
        .map(name => ({ name, dist: levenshtein(q, name.toLowerCase()) }))
        .filter(x => x.dist <= 4)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3)
        .map(x => ({ text: x.name, type: 'suggest', exact: false }));
      setSuggestions(close);
    } else {
      setSuggestions(matched.slice(0, 6));
    }

    setShowSugg(true);
  }, [search, allProducts, categories]);

  // Levenshtein distance for fuzzy matching
  const levenshtein = (a, b) => {
    const dp = Array.from({ length: a.length + 1 }, (_, i) =>
      Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        dp[i][j] = a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
    return dp[a.length][b.length];
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      setShowSugg(false);
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleSuggClick = (sugg) => {
    setShowSugg(false);
    if (sugg.type === 'category') {
      navigate(`/search?category=${encodeURIComponent(sugg.text)}`);
    } else {
      setSearch(sugg.text);
      navigate(`/search?q=${encodeURIComponent(sugg.text)}`);
    }
  };

  const highlight = (text, query) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <strong style={{ color: '#e91e63' }}>{text.slice(idx, idx + query.length)}</strong>
        {text.slice(idx + query.length)}
      </>
    );
  };

  return (
    <header style={S.header}>
      <div style={S.topBar}>

        {/* Logo */}
        <Link to="/" style={S.logo}>
          <div style={S.logoTitle}>Banasthali</div>
          <div style={S.logoSub}>
            Khadi Bhandar <em style={{ color: '#fce4ec', fontSize: 10 }}>Explore Plus</em>
          </div>
        </Link>

        {/* Search */}
        <div style={S.searchWrap} ref={searchRef}>
          <form onSubmit={handleSearch} style={S.searchForm}>
            <input
              type="text"
              placeholder="Search for kurtas, sarees, fabrics and more"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSugg(true)}
              style={S.searchInput}
              autoComplete="off"
            />
            <button type="submit" style={S.searchBtn}>🔍</button>
          </form>

          {/* Suggestions Dropdown */}
          {showSugg && suggestions.length > 0 && (
            <div style={S.suggBox}>
              {suggestions[0]?.type === 'suggest' && (
                <div style={S.didYouMean}>Did you mean:</div>
              )}

              {suggestions.map((sugg, i) => (
                <div
                  key={i}
                  className="sugg-item"
                  style={S.suggItem}
                  onMouseDown={() => handleSuggClick(sugg)}
                >
                  <span style={S.suggIcon}>
                    {sugg.type === 'category' ? '📂' : sugg.type === 'suggest' ? '🔄' : '🔍'}
                  </span>
                  <span style={{ flex: 1, fontSize: 14 }}>
                    {highlight(sugg.text, search)}
                  </span>
                  {sugg.type === 'category' && <span style={S.catTag}>Category</span>}
                  {sugg.type === 'suggest' && <span style={S.suggestTag}>Suggested</span>}
                </div>
              ))}

              <div
                className="sugg-item"
                style={{ ...S.suggItem, borderTop: '1px solid #f0f0f0', color: '#e91e63' }}
                onMouseDown={handleSearch}
              >
                <span style={S.suggIcon}>🔎</span>
                <span style={{ fontSize: 14 }}>Search for "<strong>{search}</strong>"</span>
              </div>
            </div>
          )}
        </div>

        {/* Nav Right */}
        <div style={S.navRight}>

          {/* Wishlist — show for all logged in users */}
            {user && (
              <Link to="/wishlist" style={S.iconBtn}>
                <span style={{ fontSize: 22 }}>❤️</span>
                <span style={S.iconLabel}>Wishlist</span>
                {wishlist?.length > 0 && <span style={S.badge}>{wishlist.length}</span>}
              </Link>
            )}

          {/* User menu */}
          {user ? (
            <div
              style={S.userMenu}
              onMouseEnter={() => setShowDrop(true)}
              onMouseLeave={() => setShowDrop(false)}
            >
              <div style={S.navText}>
                <span style={{ fontSize: 11, color: '#ccc' }}>Hello,</span><br />
                <strong style={{ color: '#fff' }}>{user.name.split(' ')[0]}</strong>
                <span style={{ color: '#fff' }}> ▾</span>
              </div>
              {showDrop && (
              <div style={S.dropdown}>
                {/* Role label */}
                <div style={S.roleLabel}>
                  {user.role === 'admin' ? '⚙️ Admin' : user.role === 'seller' ? '🏪 Seller' : '🛍️ Customer'}
                </div>

                {/* Customer links — ALL roles get these */}
                <Link to="/profile"  style={S.dropItem} className="drop-item">👤 My Profile</Link>
                <Link to="/orders"   style={S.dropItem} className="drop-item">📦 My Orders</Link>
                <Link to="/wishlist" style={S.dropItem} className="drop-item">❤️ Wishlist</Link>

                {/* Seller links — seller AND admin */}
                {(user.role === 'seller' || user.role === 'admin') && (
                  <Link to="/seller/dashboard" style={S.dropItem} className="drop-item">🏪 Seller Dashboard</Link>
                )}

                {/* Admin links — admin only */}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard" style={S.dropItem} className="drop-item">⚙️ Admin Panel</Link>
                )}

                <div
                  onClick={() => { logout(); setShowDrop(false); }}
                  style={{ ...S.dropItem, color: '#e91e63', cursor: 'pointer' }}
                  className="drop-item"
                >
                  🚪 Logout
                </div>
              </div>
            )}
            </div>
          ) : (
            <Link to="/login" style={S.loginBtn}>Login</Link>
          )}

          {/* Cart */}
          <Link to="/cart" style={S.iconBtn}>
            <span style={{ fontSize: 22 }}>🛒</span>
            <span style={S.iconLabel}>Cart</span>
            {cart.length > 0 && <span style={S.badge}>{cart.length}</span>}
          </Link>
        </div>
      </div>

      {/* Category Bar — dynamic from backend */}
      <div style={S.catBar}>
        <Link to="/" style={{ ...S.catLink, color: '#e91e63', fontWeight: 'bold' }}>
          🏠 Home
        </Link>
        {categories.map(c => (
          <Link
            key={c}
            to={`/search?category=${encodeURIComponent(c)}`}
            style={S.catLink}
            className="cat-link"
          >
            {c}
          </Link>
        ))}
        <Link to="/search" style={S.catLink} className="cat-link">
          All Products
        </Link>
      </div>
    </header>
  );
};

const S = {
  header: {
    background: '#000', position: 'sticky', top: 0,
    zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  topBar: {
    maxWidth: 1200, margin: '0 auto', display: 'flex',
    alignItems: 'center', padding: '10px 20px', gap: 20,
  },
  logo: { textDecoration: 'none', minWidth: 170 },
  logoTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, lineHeight: 1.2 },
  logoSub: { color: '#e91e63', fontSize: 11 },

  searchWrap: { flex: 1, position: 'relative' },
  searchForm: { display: 'flex', borderRadius: 3, overflow: 'hidden' },
  searchInput: { flex: 1, padding: '10px 16px', border: 'none', fontSize: 14, outline: 'none', width: '100%' },
  searchBtn: { background: '#e91e63', border: 'none', padding: '0 20px', fontSize: 18, cursor: 'pointer', color: '#fff' },

  suggBox: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    background: '#fff', borderRadius: '0 0 4px 4px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    zIndex: 9999, maxHeight: 380, overflowY: 'auto',
    border: '1px solid #f0f0f0', borderTop: 'none',
    animation: 'slideDown 0.15s ease forwards',
  },
  didYouMean: {
    padding: '10px 16px 4px', fontSize: 12,
    color: '#9e9e9e', fontStyle: 'italic',
    borderBottom: '1px solid #f9f9f9', background: '#fafafa',
  },
  suggItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 16px', cursor: 'pointer',
    borderBottom: '1px solid #fafafa', transition: 'background 0.15s',
    fontSize: 14, color: '#212121',
  },
  suggIcon: { fontSize: 14, minWidth: 20 },
  catTag: {
    fontSize: 10, background: '#e3f2fd', color: '#1565c0',
    padding: '2px 8px', borderRadius: 10, fontWeight: 'bold',
  },
  suggestTag: {
    fontSize: 10, background: '#fce4ec', color: '#e91e63',
    padding: '2px 8px', borderRadius: 10, fontWeight: 'bold',
  },

  navRight: { display: 'flex', alignItems: 'center', gap: 16, minWidth: 'fit-content' },
  userMenu: { position: 'relative', cursor: 'pointer' },
  navText: { fontSize: 13, lineHeight: 1.5 },
  loginBtn: {
    background: '#fff', color: '#e91e63', padding: '7px 24px',
    borderRadius: 2, fontWeight: 'bold', fontSize: 14,
    textDecoration: 'none', whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  iconBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    textDecoration: 'none', position: 'relative',
  },
  iconLabel: { color: '#fff', fontSize: 13 },
  badge: {
    position: 'absolute', top: -8, right: -8,
    background: '#e91e63', color: '#fff', borderRadius: '50%',
    width: 18, height: 18, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 11, fontWeight: 'bold',
  },
  dropdown: {
    position: 'absolute', top: '100%', right: 0,
    background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    borderRadius: 4, minWidth: 200, zIndex: 999,
    padding: 8, marginTop: 8,
    animation: 'slideDown 0.15s ease forwards',
  },
  dropItem: {
    display: 'block', padding: '10px 16px', color: '#333',
    textDecoration: 'none', fontSize: 14, borderRadius: 4,
    borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s',
  },

  catBar: {
    background: '#111', display: 'flex', justifyContent: 'center',
    padding: '0 20px', overflowX: 'auto',
  },
  catLink: {
    color: '#ccc', textDecoration: 'none', padding: '11px 16px',
    fontSize: 13, whiteSpace: 'nowrap', transition: 'color 0.2s',
    borderBottom: '2px solid transparent',
  },
};

export default Header;