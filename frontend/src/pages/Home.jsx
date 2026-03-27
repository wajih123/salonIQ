import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#070b09', position: 'relative', overflow: 'hidden'
    }}>
      {/* Ambient */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(78,202,126,0.06) 0%, transparent 70%)' }} />

      <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, animation: 'fadeUp 0.6s ease both', padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, background: '#4eca7e', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#070b09' }}>S</div>
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 400, color: '#e4ede8', letterSpacing: '0.04em' }}>SalonIQ</span>
        </div>

        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'rgba(228,237,232,0.5)', marginBottom: 56, letterSpacing: '0.06em' }}>
          INTELLIGENT SALON MANAGEMENT
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Owner card */}
          <div onClick={() => navigate('/owner')} style={{
            width: 240, padding: '28px 24px', borderRadius: 20, cursor: 'pointer',
            background: 'rgba(13,18,16,0.8)', border: '1px solid rgba(78,202,126,0.15)',
            backdropFilter: 'blur(20px)', transition: 'all 0.2s', textAlign: 'left'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(78,202,126,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(78,202,126,0.15)'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(78,202,126,0.12)', border: '1px solid rgba(78,202,126,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 20 }}>◈</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 400, color: '#e4ede8', marginBottom: 6 }}>Espace Gérant</div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(228,237,232,0.45)', lineHeight: 1.5 }}>Dashboard IA · Clients · Campagnes · Prévisions</div>
            <div style={{ marginTop: 20, fontSize: 12, color: '#4eca7e', fontFamily: 'DM Sans, sans-serif' }}>Accéder →</div>
          </div>

          {/* Client card */}
          <div onClick={() => navigate('/book')} style={{
            width: 240, padding: '28px 24px', borderRadius: 20, cursor: 'pointer',
            background: 'rgba(250,248,245,0.04)', border: '1px solid rgba(196,119,90,0.15)',
            backdropFilter: 'blur(20px)', transition: 'all 0.2s', textAlign: 'left'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(196,119,90,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(196,119,90,0.15)'; e.currentTarget.style.transform = 'none'; }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(196,119,90,0.12)', border: '1px solid rgba(196,119,90,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, fontSize: 20 }}>◎</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 400, color: '#e4ede8', marginBottom: 6 }}>Réserver</div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'rgba(228,237,232,0.45)', lineHeight: 1.5 }}>Booking en ligne · Assistant IA · Confirmation</div>
            <div style={{ marginTop: 20, fontSize: 12, color: '#c4775a', fontFamily: 'DM Sans, sans-serif' }}>Prendre RDV →</div>
          </div>
        </div>

        <p style={{ marginTop: 40, fontSize: 11, color: 'rgba(228,237,232,0.2)', fontFamily: 'DM Sans, sans-serif' }}>
          Atelier Lumière · Paris 2e · IA propulsée par Claude
        </p>
      </div>
    </div>
  );
}
