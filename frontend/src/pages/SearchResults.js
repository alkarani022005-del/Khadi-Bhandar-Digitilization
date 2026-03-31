import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import API from '../api';
import ProductCard from '../components/ProductCard';

const CATS = ['All', 'Men', 'Women', 'Kids', 'Kurtas', 'Sarees', 'Fabrics', 'Home Decor', 'Accessories'];

const SORTS = [
  { v: '',            l: '🔥 Relevance'         },
  { v: 'price_asc',  l: '💰 Price: Low to High' },
  { v: 'price_desc', l: '💰 Price: High to Low' },
  { v: 'rating',     l: '⭐ Best Rating'         },
];

const PRICE_RANGES = [
  { l: 'All Prices',    min: '',    max: ''    },
  { l: 'Under ₹500',   min: '',    max: '500' },
  { l: '₹500 - ₹1000', min: '500', max: '1000'},
  { l: '₹1000 - ₹2000',min: '1000',max: '2000'},
  { l: 'Above ₹2000',  min: '2000',max: ''    },
];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const q          = searchParams.get('q') || '';
  const catParam   = searchParams.get('category') || '';
  const sortParam  = searchParams.get('sort') || '';
  const minParam   = searchParams.get('minPrice') || '';
  const maxParam   = searchParams.get('maxPrice') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [cat, setCat]           = useState(catParam);
  const [sort, setSort]         = useState(sortParam);
  const [priceRange, setPriceRange] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  // Sync state when URL params change
  useEffect(() => {
    setCat(catParam);
    setSort(sortParam);
  }, [catParam, sortParam]);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [q, cat, sort, priceRange]);

  const fetchProducts = async () => {
    setLoading(true);
    setProducts([]);
    try {
      const params = new URLSearchParams();
      if (q)    params.set('search', q);
      if (cat && cat !== 'All') params.set('category', cat);
      if (sort) params.set('sort', sort);

      const range = PRICE_RANGES[priceRange];
      if (range.min) params.set('minPrice', range.min);
      if (range.max) params.set('maxPrice', range.max);

      console.log('Fetching:', `/api/products?${params}`);
      const { data } = await API.get(`/api/products?${params}`);
      setProducts(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  };

  const handleCatChange = (c) => {
    setCat(c);
    const newParams = new URLSearchParams(searchParams);
    if (c && c !== 'All') newParams.set('category', c);
    else newParams.delete('category');
    setSearchParams(newParams);
  };

  const handleSortChange = (s) => {
    setSort(s);
    const newParams = new URLSearchParams(searchParams);
    if (s) newParams.set('sort', s);
    else newParams.delete('sort');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setCat('');
    setSort('');
    setPriceRange(0);
    setSearchParams(q ? { q } : {});
  };

  const activeFilters = [
    cat && cat !== 'All' && { label: `📂 ${cat}`, clear: () => handleCatChange('') },
    sort && { label: SORTS.find(s => s.v === sort)?.l, clear: () => handleSortChange('') },
    priceRange > 0 && { label: `💰 ${PRICE_RANGES[priceRange].l}`, clear: () => setPriceRange(0) },
  ].filter(Boolean);

  return (
    <div style={{ background: '#fce4ec', minHeight: '100vh', padding: '16px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>

        {/* Top bar */}
        <div style={S.topBar}>
          <div style={{ fontSize: 16, fontWeight: 'bold', color: '#212121' }}>
            {q
              ? <>Results for <span style={{ color: '#e91e63' }}>"{q}"</span></>
              : cat && cat !== 'All' ? cat : 'All Products'
            }
            <span style={{ color: '#878787', fontWeight: 'normal', fontSize: 14 }}>
              {' '}({loading ? '...' : products.length} items)
            </span>
          </div>

          {/* Sort dropdown — always visible on top */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#555' }}>Sort by:</span>
            <select
              value={sort}
              onChange={e => handleSortChange(e.target.value)}
              style={S.sortSelect}
            >
              {SORTS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
            <button
              style={S.filterToggleBtn}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '✕ Hide Filters' : '☰ Show Filters'}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div style={S.activeFilters}>
            <span style={{ fontSize: 12, color: '#555' }}>Active:</span>
            {activeFilters.map((f, i) => (
              <div key={i} style={S.chip}>
                {f.label}
                <span style={S.chipClose} onClick={f.clear}>✕</span>
              </div>
            ))}
            <button style={S.clearBtn} onClick={clearAllFilters}>Clear All</button>
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

          {/* Sidebar */}
          {showFilters && (
            <div style={S.sidebar}>

              {/* Categories */}
              <div style={S.filterSection}>
                <div style={S.filterTitle}>📂 Categories</div>
                {CATS.map(c => (
                  <div
                    key={c}
                    onClick={() => handleCatChange(c)}
                    style={{
                      ...S.filterItem,
                      background: (cat === c || (c === 'All' && !cat)) ? '#fce4ec' : 'transparent',
                      color: (cat === c || (c === 'All' && !cat)) ? '#e91e63' : '#333',
                      fontWeight: (cat === c || (c === 'All' && !cat)) ? 'bold' : 'normal',
                      borderLeft: (cat === c || (c === 'All' && !cat)) ? '3px solid #e91e63' : '3px solid transparent',
                    }}
                  >
                    {c}
                    {c !== 'All' && (
                      <span style={S.catCount}>
                        {products.filter(p => p.category === c).length || ''}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Price Range */}
              <div style={S.filterSection}>
                <div style={S.filterTitle}>💰 Price Range</div>
                {PRICE_RANGES.map((r, i) => (
                  <div
                    key={i}
                    onClick={() => setPriceRange(i)}
                    style={{
                      ...S.filterItem,
                      background: priceRange === i ? '#fce4ec' : 'transparent',
                      color: priceRange === i ? '#e91e63' : '#333',
                      fontWeight: priceRange === i ? 'bold' : 'normal',
                      borderLeft: priceRange === i ? '3px solid #e91e63' : '3px solid transparent',
                    }}
                  >
                    {r.l}
                  </div>
                ))}
              </div>

              {/* Sort */}
              <div style={S.filterSection}>
                <div style={S.filterTitle}>🔃 Sort By</div>
                {SORTS.map(s => (
                  <div
                    key={s.v}
                    onClick={() => handleSortChange(s.v)}
                    style={{
                      ...S.filterItem,
                      background: sort === s.v ? '#fce4ec' : 'transparent',
                      color: sort === s.v ? '#e91e63' : '#333',
                      fontWeight: sort === s.v ? 'bold' : 'normal',
                      borderLeft: sort === s.v ? '3px solid #e91e63' : '3px solid transparent',
                    }}
                  >
                    {s.l}
                  </div>
                ))}
              </div>

              {/* Availability */}
              <div style={S.filterSection}>
                <div style={S.filterTitle}>✅ Availability</div>
                <div style={{ fontSize: 13, color: '#555', padding: '6px 10px' }}>
                  In Stock: {products.filter(p => p.stock > 0).length} items
                </div>
                <div style={{ fontSize: 13, color: '#d32f2f', padding: '6px 10px' }}>
                  Out of Stock: {products.filter(p => p.stock === 0).length} items
                </div>
              </div>

              {/* Clear all */}
              {activeFilters.length > 0 && (
                <button style={S.clearAllBtn} onClick={clearAllFilters}>
                  ✕ Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Products */}
          <div style={{ flex: 1 }}>
            {loading ? (
              <div style={S.loadingBox}>
                <div style={S.spinner} />
                <div style={{ color: '#e91e63', marginTop: 16, fontSize: 15 }}>
                  Finding products...
                </div>
              </div>
            ) : products.length === 0 ? (
              <div style={S.emptyBox}>
                <div style={{ fontSize: 70 }}>😕</div>
                <h3 style={{ margin: '12px 0 8px' }}>No products found</h3>
                <p style={{ color: '#888', marginBottom: 20 }}>
                  {q
                    ? `No results for "${q}". Try different keywords.`
                    : 'No products in this filter. Try changing filters.'}
                </p>
                <button style={S.shopBtn} onClick={clearAllFilters}>
                  View All Products
                </button>
              </div>
            ) : (
              <>
                {/* Results info */}
                <div style={S.resultsInfo}>
                  Showing <strong>{products.length}</strong> products
                  {cat && cat !== 'All' && <> in <strong>{cat}</strong></>}
                  {sort && <> sorted by <strong>{SORTS.find(s => s.v === sort)?.l}</strong></>}
                  {priceRange > 0 && <> · <strong>{PRICE_RANGES[priceRange].l}</strong></>}
                </div>

                <div style={S.grid}>
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

const S = {
  topBar: {
    background: '#fff', borderRadius: 4, padding: '14px 18px',
    marginBottom: 12, display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', flexWrap: 'wrap', gap: 10,
  },
  sortSelect: {
    padding: '7px 12px', border: '1px solid #e0e0e0', borderRadius: 4,
    fontSize: 13, cursor: 'pointer', background: '#fff', color: '#333',
  },
  filterToggleBtn: {
    padding: '7px 14px', background: '#f5f5f5', border: '1px solid #e0e0e0',
    borderRadius: 4, fontSize: 13, cursor: 'pointer', color: '#555',
  },
  activeFilters: {
    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
    flexWrap: 'wrap',
  },
  chip: {
    display: 'flex', alignItems: 'center', gap: 6, background: '#fce4ec',
    color: '#e91e63', padding: '4px 12px', borderRadius: 20, fontSize: 12,
    fontWeight: 'bold',
  },
  chipClose: {
    cursor: 'pointer', fontSize: 11, fontWeight: 'bold',
    marginLeft: 2, opacity: 0.7,
  },
  clearBtn: {
    background: 'none', border: '1px solid #e91e63', color: '#e91e63',
    padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
  },
  sidebar: {
    width: 220, background: '#fff', borderRadius: 4,
    padding: 16, height: 'fit-content', position: 'sticky', top: 80,
  },
  filterSection: { marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f5f5f5' },
  filterTitle: {
    fontSize: 12, fontWeight: 'bold', color: '#878787',
    marginBottom: 10, letterSpacing: 0.5, textTransform: 'uppercase',
  },
  filterItem: {
    padding: '8px 10px', fontSize: 13, cursor: 'pointer',
    borderRadius: 2, marginBottom: 2, transition: 'all 0.15s',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  catCount: {
    fontSize: 11, background: '#f5f5f5', color: '#888',
    padding: '1px 7px', borderRadius: 10,
  },
  clearAllBtn: {
    width: '100%', background: 'none', border: '1px solid #e91e63',
    color: '#e91e63', padding: '8px', borderRadius: 4,
    cursor: 'pointer', fontSize: 13, marginTop: 4,
  },
  resultsInfo: {
    fontSize: 13, color: '#555', marginBottom: 12,
    padding: '8px 12px', background: '#fff', borderRadius: 4,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 12,
  },
  loadingBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: 60, background: '#fff', borderRadius: 4,
  },
  spinner: {
    width: 40, height: 40, border: '4px solid #fce4ec',
    borderTop: '4px solid #e91e63', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  emptyBox: {
    textAlign: 'center', padding: 60, background: '#fff',
    borderRadius: 4, display: 'flex', flexDirection: 'column',
    alignItems: 'center',
  },
  shopBtn: {
    background: '#e91e63', color: '#fff', border: 'none',
    padding: '10px 28px', borderRadius: 2, cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default SearchResults;