import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div style={{ background: '#fce4ec', minHeight: '100vh' }}>

      {/* Hero */}
      <div style={S.hero}>
        <div style={S.heroContent}>
          <div style={S.heroTag}>Our Story</div>
          <h1 style={S.heroTitle}>Weaving Lives,<br />One Thread at a Time</h1>
          <p style={S.heroSub}>
            Banasthali Khadi Bhandar is more than a store — it's a movement to empower
            rural women through the ancient art of handwoven Khadi.
          </p>
        </div>
        <div style={S.heroImg}>🧵</div>
      </div>

      {/* Mission */}
      <div style={S.section}>
        <div style={S.sectionInner}>
          <div style={S.sectionTag}>Our Mission</div>
          <h2 style={S.sectionTitle}>Empowering Women Through Khadi</h2>
          <p style={S.sectionText}>
            At Banasthali Khadi Bhandar, we believe that every thread tells a story
            of resilience and hope. Our mission is to provide sustainable livelihoods
            to rural and uneducated women by connecting their handcrafted Khadi
            products directly to conscious consumers across India.
          </p>
          <p style={S.sectionText}>
            These women — many of whom have never had formal employment — pour their
            hearts into every weave, every stitch, and every fold. By purchasing from
            us, you are directly contributing to their financial independence and
            dignity.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsSection}>
        <div style={S.statsGrid}>
          {[
            { num: '500+', label: 'Women Employed', icon: '👩' },
            { num: '50+',  label: 'Villages Reached', icon: '🏘️' },
            { num: '10K+', label: 'Products Sold', icon: '🛍️' },
            { num: '100%', label: 'Handmade & Authentic', icon: '✅' },
          ].map(s => (
            <div key={s.label} style={S.statCard}>
              <div style={S.statIcon}>{s.icon}</div>
              <div style={S.statNum}>{s.num}</div>
              <div style={S.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* What is Khadi */}
      <div style={S.section}>
        <div style={S.sectionInner}>
          <div style={S.sectionTag}>About Khadi</div>
          <h2 style={S.sectionTitle}>What Makes Our Khadi Special?</h2>
          <div style={S.featuresGrid}>
            {[
              { icon: '🤲', title: '100% Handwoven', desc: 'Every product is carefully handwoven by skilled artisans using traditional spinning wheels (charkha), preserving centuries-old techniques.' },
              { icon: '🌿', title: 'Eco-Friendly', desc: 'Khadi is made using natural fibres and organic dyes, making it one of the most sustainable fabrics in the world.' },
              { icon: '👗', title: 'Pure Cotton', desc: 'We use only pure Khadi cotton that is breathable, soft, and perfect for all seasons — especially Indian summers.' },
              { icon: '🎨', title: 'Natural Dyes', desc: 'Our vibrant colors come from natural plant-based dyes, free from harmful chemicals, safe for you and the environment.' },
              { icon: '🏅', title: 'Certified Authentic', desc: 'All our products are certified authentic Khadi, meeting quality standards set by the Khadi and Village Industries Commission (KVIC).' },
              { icon: '💝', title: 'Made with Love', desc: 'Each piece carries the love and dedication of the women who made it — no two pieces are exactly alike, making each one truly unique.' },
            ].map(f => (
              <div key={f.title} style={S.featureCard}>
                <div style={S.featureIcon}>{f.icon}</div>
                <div style={S.featureTitle}>{f.title}</div>
                <div style={S.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Our Women */}
      <div style={{ background: '#fff', padding: '60px 20px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <div style={S.sectionTag}>The Heart of Our Work</div>
          <h2 style={S.sectionTitle}>The Women Behind Every Thread</h2>
          <p style={S.sectionText}>
            Our weavers are primarily rural women from villages around Banasthali, Rajasthan —
            many of whom had no formal education or income source before joining our initiative.
            Through training programs and fair wages, we have helped hundreds of women achieve
            financial independence and self-respect.
          </p>
          <div style={S.womenGrid}>
            {[
              { icon: '🏠', title: 'Rural Women', desc: 'Women from remote villages who had limited access to education and employment opportunities.' },
              { icon: '📚', title: 'Skill Training', desc: 'We provide free training in traditional Khadi weaving, spinning, and natural dyeing techniques.' },
              { icon: '💰', title: 'Fair Wages', desc: 'Every artisan receives fair compensation directly, ensuring they benefit from every sale.' },
              { icon: '🌟', title: 'Self Reliance', desc: 'Our goal is complete financial independence and dignity for every woman in our network.' },
            ].map(w => (
              <div key={w.title} style={S.womenCard}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{w.icon}</div>
                <div style={{ fontWeight: 'bold', fontSize: 16, color: '#212121', marginBottom: 8 }}>{w.title}</div>
                <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banasthali Connection */}
      <div style={S.section}>
        <div style={S.sectionInner}>
          <div style={S.sectionTag}>Our Roots</div>
          <h2 style={S.sectionTitle}>Rooted in Banasthali Vidyapith</h2>
          <p style={S.sectionText}>
            Banasthali Khadi Bhandar is proudly associated with Banasthali Vidyapith —
            one of India's largest residential women's universities. Founded on the
            principles of women's empowerment and self-reliance, the institution has
            been a beacon of hope for rural women for over 85 years.
          </p>
          <p style={S.sectionText}>
            Our Khadi initiative is an extension of that legacy — bringing the philosophy
            of <em>"Atma Nirbharta"</em> (self-reliance) to life through every handwoven
            fabric we sell.
          </p>
          <div style={S.quoteBox}>
            <div style={S.quoteText}>
              "Khadi is not just cloth. It is a thought, a philosophy, and a way of life
              that puts the dignity of labour at its centre."
            </div>
            <div style={S.quoteAuthor}>— Inspired by Mahatma Gandhi</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={S.ctaSection}>
        <h2 style={S.ctaTitle}>Join the Movement</h2>
        <p style={S.ctaText}>
          Every purchase you make directly supports a woman's livelihood.
          Shop authentic Khadi and be part of something meaningful.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/search" style={S.ctaBtn}>🛍️ Shop Now</Link>
          <Link to="/register?role=seller" style={S.ctaBtnOutline}>🏪 Become a Seller</Link>
        </div>
      </div>

    </div>
  );
};

const S = {
  hero: { background: 'linear-gradient(135deg, #000 0%, #1a0008 100%)', padding: '80px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 60, flexWrap: 'wrap' },
  heroContent: { maxWidth: 560 },
  heroTag: { color: '#e91e63', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 },
  heroTitle: { color: '#fff', fontSize: 48, fontWeight: 'bold', lineHeight: 1.2, marginBottom: 20 },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 17, lineHeight: 1.7 },
  heroImg: { fontSize: 120 },

  section: { padding: '60px 20px', background: '#fce4ec' },
  sectionInner: { maxWidth: 900, margin: '0 auto' },
  sectionTag: { color: '#e91e63', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 },
  sectionTitle: { fontSize: 32, fontWeight: 'bold', color: '#212121', marginBottom: 20 },
  sectionText: { fontSize: 16, color: '#555', lineHeight: 1.8, marginBottom: 16 },

  statsSection: { background: '#000', padding: '50px 20px' },
  statsGrid: { maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 },
  statCard: { textAlign: 'center', padding: 20 },
  statIcon: { fontSize: 36, marginBottom: 8 },
  statNum: { fontSize: 36, fontWeight: 'bold', color: '#e91e63', marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#9e9e9e' },

  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginTop: 20 },
  featureCard: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  featureIcon: { fontSize: 32, marginBottom: 12 },
  featureTitle: { fontSize: 15, fontWeight: 'bold', color: '#212121', marginBottom: 8 },
  featureDesc: { fontSize: 13, color: '#666', lineHeight: 1.6 },

  womenGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 40 },
  womenCard: { background: '#fce4ec', borderRadius: 12, padding: 24, textAlign: 'center' },

  quoteBox: { background: '#000', borderRadius: 12, padding: '28px 32px', marginTop: 32, borderLeft: '4px solid #e91e63' },
  quoteText: { fontSize: 17, color: '#fff', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 12 },
  quoteAuthor: { fontSize: 13, color: '#e91e63', fontWeight: 'bold' },

  ctaSection: { background: 'linear-gradient(135deg, #e91e63, #880e4f)', padding: '70px 20px', textAlign: 'center' },
  ctaTitle: { fontSize: 36, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  ctaText: { fontSize: 17, color: 'rgba(255,255,255,0.85)', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' },
  ctaBtn: { background: '#fff', color: '#e91e63', padding: '14px 36px', borderRadius: 4, fontWeight: 'bold', fontSize: 16, textDecoration: 'none' },
  ctaBtnOutline: { background: 'transparent', color: '#fff', padding: '14px 36px', borderRadius: 4, fontWeight: 'bold', fontSize: 16, textDecoration: 'none', border: '2px solid #fff' },
};

export default About;