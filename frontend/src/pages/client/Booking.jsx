import { useState, useEffect } from 'react';
import { fetchServices, fetchStylists, fetchAvailability, createBooking, submitReview } from '../../lib/api.js';
import AIChat from '../../components/shared/AIChat.jsx';

const C = {
  bg: 'var(--client-bg)', bg2: 'var(--client-bg2)', bg3: 'var(--client-bg3)',
  surface: 'var(--client-surface)',
  border: 'var(--client-border)', border2: 'var(--client-border2)',
  rose: 'var(--client-rose)', roseDim: 'var(--client-rose-dim)', rose2: 'var(--client-rose2)',
  sage: 'var(--client-sage)', sageDim: 'var(--client-sage-dim)',
  gold: 'var(--client-gold)',
  text: 'var(--client-text)', text2: 'var(--client-text2)', text3: 'var(--client-text3)',
};

// Generate next 14 bookable days (Mon–Sat, skip Sun)
function getBookableDates() {
  const dates = [];
  const d = new Date('2026-03-27');
  d.setDate(d.getDate() + 1); // start from tomorrow
  while (dates.length < 14) {
    if (d.getDay() !== 0) { // skip Sunday
      dates.push(d.toISOString().split('T')[0]);
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}
const BOOKABLE_DATES = getBookableDates();

function formatDate(iso) {
  const d = new Date(iso);
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`;
}

const STEPS = ['service', 'stylist', 'slot', 'info', 'confirm'];
function Step({ current, steps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 500, transition: 'all 0.3s',
            background: i < STEPS.indexOf(current) ? C.rose : i === STEPS.indexOf(current) ? C.rose : C.bg3,
            color: i <= STEPS.indexOf(current) ? '#fff' : C.text3,
            border: `2px solid ${i <= STEPS.indexOf(current) ? C.rose : C.border}`,
          }}>
            {i < STEPS.indexOf(current) ? '✓' : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 1, background: i < STEPS.indexOf(current) ? C.rose : C.border, transition: 'background 0.3s', margin: '0 6px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function ServiceCard({ service, selected, onSelect }) {
  return (
    <div onClick={() => onSelect(service)} style={{
      padding: '16px', borderRadius: 'var(--radius)', cursor: 'pointer',
      border: `1.5px solid ${selected ? C.rose : C.border}`,
      background: selected ? C.roseDim : C.surface,
      transition: 'all 0.2s'
    }}
      onMouseEnter={e => { if (!selected) e.currentTarget.style.borderColor = C.border2; }}
      onMouseLeave={e => { if (!selected) e.currentTarget.style.borderColor = C.border; }}
    >
      <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4 }}>{service.name}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: C.text3 }}>{service.duration} min</span>
        <span style={{ fontSize: 15, fontWeight: 500, fontFamily: 'var(--display)', color: selected ? C.rose : C.text }}>{service.price} €</span>
      </div>
    </div>
  );
}

function StylistCard({ stylist, selected, onSelect }) {
  return (
    <div onClick={() => onSelect(stylist)} style={{
      padding: '16px', borderRadius: 'var(--radius)', cursor: 'pointer',
      border: `1.5px solid ${selected ? C.rose : C.border}`,
      background: selected ? C.roseDim : C.surface,
      display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.2s'
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
        background: `${stylist.color}25`, border: `2px solid ${selected ? C.rose : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 500, color: stylist.color
      }}>{stylist.avatar}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{stylist.name}</div>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{stylist.specialties.join(' · ')}</div>
        <div style={{ fontSize: 11, color: C.gold, marginTop: 2 }}>{'★'.repeat(Math.round(stylist.rating))} {stylist.rating}/5</div>
      </div>
    </div>
  );
}

function SlotButton({ slot, selected, onSelect }) {
  return (
    <button onClick={() => onSelect(slot)} style={{
      padding: '10px 14px', borderRadius: 10,
      border: `1.5px solid ${selected ? C.rose : C.border}`,
      background: selected ? C.roseDim : C.surface,
      color: selected ? C.rose : C.text2, cursor: 'pointer',
      fontSize: 13, fontFamily: 'var(--mono)', fontWeight: selected ? 500 : 400,
      transition: 'all 0.15s'
    }}>{slot.time}</button>
  );
}

export default function ClientBooking() {
  const [step, setStep] = useState('service');
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDate, setSelectedDate] = useState(BOOKABLE_DATES[0]);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [clientInfo, setClientInfo] = useState({ name: '', phone: '', email: '' });
  const [booking, setBooking] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    fetchServices().then(data => {
      setServices(data);
      const cats = ['Tous', ...new Set(data.map(s => s.category))];
      setCategories(cats);
    });
    fetchStylists().then(setStylists);
  }, []);

  useEffect(() => {
    if (step === 'slot' && selectedService && selectedStylist) {
      setLoadingSlots(true);
      fetchAvailability(selectedDate, selectedService.id, selectedStylist.id)
        .then(data => { setSlots(data.slots || []); setLoadingSlots(false); });
    }
  }, [step, selectedDate]);

  async function handleConfirm() {
    const result = await createBooking({
      clientName: clientInfo.name, clientPhone: clientInfo.phone,
      serviceId: selectedService.id, stylistId: selectedStylist.id,
      date: selectedDate, time: selectedSlot.time
    });
    setBooking(result.booking);
    setStep('confirm');
  }

  async function handleSubmitReview() {
    if (reviewRating === 0) return;
    await submitReview({
      clientName: clientInfo.name,
      avatar: clientInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      stylistId: selectedStylist?.id,
      stylistName: selectedStylist?.name,
      serviceId: selectedService?.id,
      rating: reviewRating,
      comment: reviewComment,
    }).catch(() => {});
    setReviewSubmitted(true);
  }

  const filteredServices = activeCategory === 'Tous' ? services : services.filter(s => s.category === activeCategory);

  return (
    <div className="client-view" style={{ background: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Hero header */}
      <header style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: '0', position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, color: C.text, letterSpacing: '0.02em' }}>Atelier Lumière</div>
            <div style={{ fontSize: 11, color: C.text3, marginTop: 1 }}>14 rue de la Paix · Paris 2e</div>
          </div>
          <button onClick={() => setShowAI(!showAI)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: C.roseDim, border: `1px solid ${C.border2}`,
            borderRadius: 100, padding: '8px 16px', fontSize: 12, color: C.rose,
            cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'all 0.15s'
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.rose, animation: 'pulse 2s infinite' }} />
            Aide & conseils IA
          </button>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', maxWidth: 1100, margin: '0 auto', width: '100%', padding: '0 16px' }}>

        {/* Main booking flow */}
        <main style={{ flex: 1, padding: '32px 24px 48px' }}>

          {step !== 'confirm' && (
            <Step current={step} steps={STEPS} />
          )}

          {/* SERVICE STEP */}
          {step === 'service' && (
            <div className="fade-up">
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, color: C.text, marginBottom: 6 }}>Choisissez votre prestation</h1>
              <p style={{ fontSize: 14, color: C.text3, marginBottom: 24 }}>Sélectionnez parmi nos services signatures</p>

              {/* Categories */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                    padding: '6px 14px', borderRadius: 100, fontSize: 12,
                    border: `1.5px solid ${activeCategory === cat ? C.rose : C.border}`,
                    background: activeCategory === cat ? C.roseDim : C.surface,
                    color: activeCategory === cat ? C.rose : C.text3,
                    cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'all 0.15s'
                  }}>{cat}</button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {filteredServices.map(s => (
                  <ServiceCard key={s.id} service={s} selected={selectedService?.id === s.id} onSelect={svc => { setSelectedService(svc); }} />
                ))}
              </div>

              <button onClick={() => setStep('stylist')} disabled={!selectedService} style={{
                marginTop: 24, width: '100%', padding: '14px', borderRadius: 12,
                background: selectedService ? C.rose : C.bg3,
                color: selectedService ? '#fff' : C.text3,
                border: 'none', cursor: selectedService ? 'pointer' : 'not-allowed',
                fontSize: 14, fontFamily: 'var(--sans)', fontWeight: 500, transition: 'all 0.2s'
              }}>
                {selectedService ? `Continuer — ${selectedService.name} · ${selectedService.price} €` : 'Sélectionnez une prestation'}
              </button>
            </div>
          )}

          {/* STYLIST STEP */}
          {step === 'stylist' && (
            <div className="fade-up">
              <button onClick={() => setStep('service')} style={{ background: 'none', border: 'none', color: C.text3, cursor: 'pointer', fontSize: 13, marginBottom: 16, fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: 6 }}>← Retour</button>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, color: C.text, marginBottom: 6 }}>Votre styliste</h1>
              <p style={{ fontSize: 14, color: C.text3, marginBottom: 24 }}>Toute notre équipe maîtrise <strong>{selectedService?.name}</strong></p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stylists.map(s => (
                  <StylistCard key={s.id} stylist={s} selected={selectedStylist?.id === s.id} onSelect={setStylist => setSelectedStylist(setStylist)} />
                ))}
              </div>

              <button onClick={() => setStep('slot')} disabled={!selectedStylist} style={{
                marginTop: 24, width: '100%', padding: '14px', borderRadius: 12,
                background: selectedStylist ? C.rose : C.bg3,
                color: selectedStylist ? '#fff' : C.text3,
                border: 'none', cursor: selectedStylist ? 'pointer' : 'not-allowed',
                fontSize: 14, fontFamily: 'var(--sans)', fontWeight: 500, transition: 'all 0.2s'
              }}>
                {selectedStylist ? `Voir les disponibilités de ${selectedStylist.name}` : 'Choisissez un styliste'}
              </button>
            </div>
          )}

          {/* SLOT STEP */}
          {step === 'slot' && (
            <div className="fade-up">
              <button onClick={() => setStep('stylist')} style={{ background: 'none', border: 'none', color: C.text3, cursor: 'pointer', fontSize: 13, marginBottom: 16, fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: 6 }}>← Retour</button>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, color: C.text, marginBottom: 6 }}>Choisissez une date & un créneau</h1>
              <p style={{ fontSize: 14, color: C.text3, marginBottom: 20 }}>{selectedStylist?.name} · {selectedService?.name}</p>

              {/* Date picker */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: C.text3, marginBottom: 8, fontWeight: 500 }}>Date souhaitée</div>
                <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 6 }}>
                  {BOOKABLE_DATES.map(d => (
                    <button key={d} onClick={() => { setSelectedDate(d); setSelectedSlot(null); }} style={{
                      padding: '8px 14px', borderRadius: 10, cursor: 'pointer', whiteSpace: 'nowrap',
                      border: `1.5px solid ${selectedDate === d ? C.rose : C.border}`,
                      background: selectedDate === d ? C.roseDim : C.surface,
                      color: selectedDate === d ? C.rose : C.text2, fontSize: 12,
                      fontFamily: 'var(--sans)', transition: 'all 0.15s', flexShrink: 0
                    }}>{formatDate(d)}</button>
                  ))}
                </div>
              </div>

              {loadingSlots ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.text3, fontSize: 13, padding: '24px 0' }}>
                  <div className="spinner rose" style={{ width: 16, height: 16 }} /> Vérification des disponibilités…
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
                  {slots.map((slot, i) => (
                    <SlotButton key={i} slot={slot} selected={selectedSlot?.time === slot.time} onSelect={setSelectedSlot} />
                  ))}
                  {slots.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', color: C.text3, fontSize: 13, padding: '16px 0' }}>Aucun créneau disponible ce jour.</div>}
                </div>
              )}

              <button onClick={() => setStep('info')} disabled={!selectedSlot} style={{
                width: '100%', padding: '14px', borderRadius: 12,
                background: selectedSlot ? C.rose : C.bg3,
                color: selectedSlot ? '#fff' : C.text3,
                border: 'none', cursor: selectedSlot ? 'pointer' : 'not-allowed',
                fontSize: 14, fontFamily: 'var(--sans)', fontWeight: 500, transition: 'all 0.2s'
              }}>
                {selectedSlot ? `Confirmer ${selectedSlot.time}` : 'Choisissez un horaire'}
              </button>
            </div>
          )}

          {/* INFO STEP */}
          {step === 'info' && (
            <div className="fade-up">
              <button onClick={() => setStep('slot')} style={{ background: 'none', border: 'none', color: C.text3, cursor: 'pointer', fontSize: 13, marginBottom: 16, fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', gap: 6 }}>← Retour</button>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, color: C.text, marginBottom: 6 }}>Vos coordonnées</h1>
              <p style={{ fontSize: 14, color: C.text3, marginBottom: 24 }}>Pour la confirmation et les rappels</p>

              {/* Récapitulatif */}
              <div style={{ background: C.roseDim, border: `1px solid ${C.border2}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: C.rose, marginBottom: 8, fontWeight: 500 }}>VOTRE RÉSERVATION</div>
                <div style={{ fontSize: 13, color: C.text }}>{selectedService?.name} · {selectedStylist?.name}</div>
                <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>Sam. 28 mars · {selectedSlot?.time} · {selectedService?.duration} min</div>
                <div style={{ fontSize: 16, fontFamily: 'var(--display)', color: C.rose, marginTop: 6 }}>{selectedService?.price} €</div>
              </div>

              {['name', 'phone', 'email'].map(field => (
                <div key={field} style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, color: C.text3, marginBottom: 6, textTransform: 'capitalize' }}>
                    {field === 'name' ? 'Nom complet' : field === 'phone' ? 'Téléphone' : 'Email'}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                    value={clientInfo[field]}
                    onChange={e => setClientInfo(prev => ({ ...prev, [field]: e.target.value }))}
                    placeholder={field === 'name' ? 'Sophie Laurent' : field === 'phone' ? '06 12 34 56 78' : 'sophie@email.com'}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10,
                      border: `1.5px solid ${C.border}`, background: C.surface,
                      color: C.text, fontSize: 14, fontFamily: 'var(--sans)', outline: 'none',
                      transition: 'border-color 0.15s'
                    }}
                    onFocus={e => e.target.style.borderColor = C.rose}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </div>
              ))}

              <button
                onClick={handleConfirm}
                disabled={!clientInfo.name || !clientInfo.phone}
                style={{
                  marginTop: 8, width: '100%', padding: '14px', borderRadius: 12,
                  background: clientInfo.name && clientInfo.phone ? C.rose : C.bg3,
                  color: clientInfo.name && clientInfo.phone ? '#fff' : C.text3,
                  border: 'none', cursor: clientInfo.name && clientInfo.phone ? 'pointer' : 'not-allowed',
                  fontSize: 14, fontFamily: 'var(--sans)', fontWeight: 500, transition: 'all 0.2s'
                }}>
                Confirmer ma réservation
              </button>
            </div>
          )}

          {/* CONFIRM STEP */}
          {step === 'confirm' && booking && (
            <div className="fade-up" style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.sageDim, border: `2px solid ${C.sage}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 28 }}>✓</div>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, color: C.text, marginBottom: 8 }}>Réservation confirmée !</h1>
              <p style={{ fontSize: 14, color: C.text3, marginBottom: 28 }}>
                Un SMS de confirmation a été envoyé au {clientInfo.phone}
              </p>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, maxWidth: 360, margin: '0 auto', textAlign: 'left' }}>
                <div style={{ fontSize: 11, color: C.text3, marginBottom: 12, letterSpacing: '0.06em' }}>CODE DE RÉSERVATION</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 22, fontWeight: 500, color: C.rose, letterSpacing: '0.1em', marginBottom: 16 }}>{booking.confirmationCode}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[['Prestation', booking.service], ['Styliste', booking.stylist], ['Date', 'Sam. 28 mars 2026'], ['Heure', booking.time], ['Durée', `${selectedService?.duration} min`], ['Prix', `${selectedService?.price} €`]].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: C.text3 }}>{l}</span>
                      <span style={{ color: C.text, fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => { setStep('service'); setSelectedService(null); setSelectedStylist(null); setSelectedSlot(null); setClientInfo({ name: '', phone: '', email: '' }); setBooking(null); }} style={{
                marginTop: 24, padding: '12px 28px', borderRadius: 12,
                background: 'none', border: `1.5px solid ${C.border2}`,
                color: C.text2, cursor: 'pointer', fontSize: 13, fontFamily: 'var(--sans)'
              }}>Nouvelle réservation</button>

              {/* Loyalty points earned */}
              <div style={{ marginTop: 20, padding: '14px 20px', background: C.sageDim, border: `1px solid ${C.sage}`, borderRadius: 12, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto' }}>
                <div style={{ fontSize: 11, color: C.sage, fontWeight: 500, marginBottom: 4 }}>✦ Points fidélité gagnés</div>
                <div style={{ fontSize: 22, fontFamily: 'var(--display)', color: C.text }}>+{Math.round((selectedService?.price || 0) / 10)} points</div>
                <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>1 point par tranche de 10 € · Consultez votre solde en salon</div>
              </div>

              {/* Post-booking review */}
              {reviewSubmitted ? (
                <div style={{ marginTop: 20, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', color: C.sage, fontSize: 13, padding: '12px 0' }}>
                  ✓ Merci pour votre avis ! Il aide toute l'équipe.
                </div>
              ) : (
                <div style={{ marginTop: 20, maxWidth: 360, marginLeft: 'auto', marginRight: 'auto', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 20px' }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 12 }}>Comment s'est passée votre dernière visite ?</div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setReviewRating(star)} style={{
                        fontSize: 28, background: 'none', border: 'none', cursor: 'pointer',
                        color: star <= reviewRating ? '#f0a500' : C.border2,
                        transition: 'transform 0.15s, color 0.15s',
                        transform: star <= reviewRating ? 'scale(1.2)' : 'scale(1)'
                      }}>★</button>
                    ))}
                  </div>
                  {reviewRating > 0 && (
                    <textarea
                      placeholder="Un commentaire ? (optionnel)"
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg3, color: C.text, fontSize: 12, fontFamily: 'var(--sans)', resize: 'none', minHeight: 60, outline: 'none', boxSizing: 'border-box' }}
                    />
                  )}
                  {reviewRating > 0 && (
                    <button onClick={handleSubmitReview} style={{
                      marginTop: 10, width: '100%', padding: '10px', borderRadius: 10,
                      background: C.roseDim, border: `1px solid ${C.border2}`, color: C.rose,
                      cursor: 'pointer', fontSize: 13, fontFamily: 'var(--sans)', fontWeight: 500
                    }}>Envoyer mon avis</button>
                  )}
                </div>
              )}
            </div>
          )}
        </main>

        {/* AI Side Panel */}
        {showAI && (
          <aside style={{
            width: 340, borderLeft: `1px solid ${C.border}`, padding: '24px 16px',
            display: 'flex', flexDirection: 'column', gap: 0, animation: 'fadeIn 0.3s ease both',
            position: 'sticky', top: 73, height: 'calc(100vh - 73px)'
          }}>
            <AIChat
              theme="client"
              style={{ flex: 1, height: '100%', border: 'none', borderRadius: 0 }}
              placeholder="Quelle prestation me conseillez-vous ?"
              onClose={() => setShowAI(false)}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
