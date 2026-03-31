import React, { useState, useEffect } from 'react';
import API from '../api';

const defaultBanners = [
  { title: 'Khadi Mahotsav', subtitle: '2nd October to 31st October', buttonText: 'Shop Now', bgColor: 'linear-gradient(135deg,#fce4ec,#f8bbd0)', textColor: '#d32f2f' },
  { title: 'New Arrivals 2024', subtitle: 'Fresh handwoven collection just landed', buttonText: 'Explore Now', bgColor: 'linear-gradient(135deg,#e8f5e9,#c8e6c9)', textColor: '#1b5e20' },
  { title: 'Up to 50% Off', subtitle: 'On select Khadi fabrics & sarees', buttonText: 'Grab Deals', bgColor: 'linear-gradient(135deg,#e3f2fd,#bbdefb)', textColor: '#0d47a1' },
];

const BannerCarousel = () => {
  const [banners, setBanners] = useState(defaultBanners);
  const [cur, setCur] = useState(0);

  useEffect(() => {
    API.get('/api/site/banners')
      .then(r => { if (r.data.length > 0) setBanners(r.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setCur(p => (p + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners.length]);

  const b = banners[cur];

  return (
    <div style={{ position: 'relative', marginBottom: 16, borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ background: b.bgColor || b.bg || '#fce4ec', height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, transition: 'background 0.5s', position: 'relative' }}>
        {b.image && (
          <img src={b.image} alt={b.title} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', opacity: 0.3 }} />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 42, fontWeight: 'bold', color: b.textColor || '#d32f2f', marginBottom: 10 }}>{b.title}</div>
          <div style={{ fontSize: 18, color: '#555', marginBottom: 20 }}>{b.subtitle || b.sub}</div>
          <a href={b.buttonLink || '/search'} style={{ background: '#e91e63', color: '#fff', padding: '13px 36px', borderRadius: 2, fontSize: 16, fontWeight: 'bold', textDecoration: 'none', display: 'inline-block' }}>
            {b.buttonText || b.cta || 'Shop Now'} →
          </a>
        </div>
      </div>

      <button onClick={() => setCur(p => (p - 1 + banners.length) % banners.length)}
        style={{ position: 'absolute', top: '50%', left: 10, transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 22, cursor: 'pointer' }}>‹</button>
      <button onClick={() => setCur(p => (p + 1) % banners.length)}
        style={{ position: 'absolute', top: '50%', right: 10, transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.85)', border: 'none', borderRadius: '50%', width: 40, height: 40, fontSize: 22, cursor: 'pointer' }}>›</button>

      <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
        {banners.map((_, i) => (
          <div key={i} onClick={() => setCur(i)}
            style={{ width: 10, height: 10, borderRadius: '50%', background: i === cur ? '#e91e63' : 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'background 0.3s' }} />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;