import { useState, useEffect, useRef } from 'react';
import { fetchStylists } from '../../lib/api.js';

const C = {
  bg: 'var(--owner-bg)', bg2: 'var(--owner-bg2)', bg3: 'var(--owner-bg3)',
  border: 'var(--owner-border)', border2: 'var(--owner-border2)',
  green: 'var(--owner-green)', greenDim: 'var(--owner-green-dim)',
  amber: 'var(--owner-amber)', red: 'var(--owner-red)', gold: 'var(--owner-gold)',
  text: 'var(--owner-text)', text2: 'var(--owner-text2)', text3: 'var(--owner-text3)',
};

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9); // 9h à 19h
const SLOT_HEIGHT = 64; // px par heure

const MOCK_APPOINTMENTS = [
  { id: 'a1', clientName: 'Sophie Laurent', service: 'Balayage + Coupe', stylistId: 's1', startHour: 9, duration: 2.5, color: '#4eca7e', status: 'completed', price: 170, avatar: 'SL' },
  { id: 'a2', clientName: 'Tom Williams', service: 'Coupe Homme', stylistId: 's2', startHour: 9, duration: 0.5, color: '#f0a500', status: 'completed', price: 35, avatar: 'TW' },
  { id: 'a3', clientName: 'Maria Chen', service: 'Kératine', stylistId: 's3', startHour: 9.5, duration: 2.5, color: '#c9a84c', status: 'in-progress', price: 180, avatar: 'MC' },
  { id: 'a4', clientName: 'Anna Kowalski', service: 'Couleur complète', stylistId: 's2', startHour: 10.5, duration: 1.5, color: '#e05555', status: 'confirmed', price: 95, avatar: 'AK' },
  { id: 'a5', clientName: 'Zara Obi', service: 'Coupe Femme', stylistId: 's4', startHour: 9, duration: 0.75, color: '#4eca7e', status: 'completed', price: 55, avatar: 'ZO' },
  { id: 'a6', clientName: 'Rachel Martin', service: 'Brushing', stylistId: 's1', startHour: 12.25, duration: 0.75, color: '#4eca7e', status: 'confirmed', price: 45, avatar: 'RM' },
  { id: 'a7', clientName: 'Nina Patel', service: 'Toner + Brushing', stylistId: 's4', startHour: 10, duration: 1, color: '#c9a84c', status: 'confirmed', price: 80, avatar: 'NP' },
  { id: 'a8', clientName: 'Luna Moreau', service: 'Balayage + Toner', stylistId: 's4', startHour: 12.75, duration: 2.5, color: '#f0a500', status: 'confirmed', price: 170, avatar: 'LM' },
  { id: 'a9', clientName: 'Chloe Bernard', service: 'Balayage', stylistId: 's1', startHour: 13.5, duration: 2, color: '#4eca7e', status: 'confirmed', price: 130, avatar: 'CB' },
  { id: 'a10', clientName: 'Marc Dubois', service: 'Highlights', stylistId: 's3', startHour: 11.25, duration: 1.5, color: '#c9a84c', status: 'confirmed', price: 110, avatar: 'MD' },
];

const STYLISTS_MOCK = [
  { id: 's1', name: 'Emma A.', avatar: 'EA', color: '#4eca7e', appts: 5, revenue: 480 },
  { id: 's2', name: 'James M.', avatar: 'JM', color: '#f0a500', appts: 4, revenue: 355 },
  { id: 's3', name: 'Sofia R.', avatar: 'SR', color: '#c9a84c', appts: 3, revenue: 435 },
  { id: 's4', name: 'Kai T.', avatar: 'KT', color: '#e05555', appts: 6, revenue: 540 },
];

const STATUS_COLORS = {
  completed: { bg: 'rgba(78,202,126,0.08)', border: 'rgba(78,202,126,0.3)', dot: '#4eca7e' },
  'in-progress': { bg: 'rgba(240,165,0,0.1)', border: 'rgba(240,165,0,0.35)', dot: '#f0a500' },
  confirmed: { bg: 'rgba(20,28,23,0.7)', border: 'rgba(78,202,126,0.15)', dot: '#3d5a47' },
};

function AppointmentCard({ appt, colWidth, onSelect, selected }) {
  const top = (appt.startHour - 9) * SLOT_HEIGHT;
  const height = Math.max(appt.duration * SLOT_HEIGHT - 4, 28);
  const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.confirmed;

  return (
    <div
      onClick={() => onSelect(appt)}
      style={{
        position: 'absolute',
        top: top + 2,
        left: 4, right: 4,
        height,
        background: sc.bg,
        border: `1px solid ${selected ? appt.color : sc.border}`,
        borderLeft: `3px solid ${appt.color}`,
        borderRadius: 8,
        padding: '6px 8px',
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all 0.15s',
        zIndex: selected ? 10 : 1,
        boxShadow: selected ? `0 0 0 1px ${appt.color}40` : 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = appt.color; e.currentTarget.style.zIndex = 10; }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = sc.border; e.currentTarget.style.zIndex = 1; } }}
    >
      <div style={{ fontSize: 11, fontWeight: 500, color: C.text, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {appt.clientName}
      </div>
      {height > 40 && (
        <div style={{ fontSize: 10, color: C.text3, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {appt.service}
        </div>
      )}
      {height > 54 && (
        <div style={{ fontSize: 10, fontFamily: 'var(--mono)', color: appt.color, marginTop: 3 }}>
          {String(Math.floor(appt.startHour)).padStart(2, '0')}:{appt.startHour % 1 === 0.5 ? '30' : appt.startHour % 1 === 0.75 ? '45' : appt.startHour % 1 === 0.25 ? '15' : '00'} · {appt.duration * 60}min
        </div>
      )}
    </div>
  );
}

function AppointmentDetail({ appt, onClose }) {
  if (!appt) return null;
  const sc = STATUS_COLORS[appt.status] || STATUS_COLORS.confirmed;
  const statusLabel = { completed: 'Terminé', 'in-progress': 'En cours', confirmed: 'Confirmé' };

  return (
    <div style={{
      background: C.bg2, border: `1px solid ${C.border2}`,
      borderRadius: 16, padding: '20px', animation: 'fadeUp 0.3s ease both'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${appt.color}20`, border: `1.5px solid ${appt.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: appt.color }}>
            {appt.avatar}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.text }}>{appt.clientName}</div>
            <div style={{ fontSize: 11, color: C.text3 }}>{appt.service}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: C.text3, cursor: 'pointer', fontSize: 18 }}>×</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[
          ['Statut', <span style={{ color: sc.dot, fontWeight: 500 }}>{statusLabel[appt.status]}</span>],
          ['Heure', `${String(Math.floor(appt.startHour)).padStart(2, '0')}:${appt.startHour % 1 === 0.5 ? '30' : appt.startHour % 1 === 0.75 ? '45' : appt.startHour % 1 === 0.25 ? '15' : '00'}`],
          ['Durée', `${appt.duration * 60} min`],
          ['Prix', `${appt.price} €`],
        ].map(([label, val]) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: C.text3 }}>{label}</span>
            <span style={{ color: C.text, fontFamily: typeof val === 'string' ? 'var(--mono)' : undefined }}>{val}</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
        <button style={{ flex: 1, padding: '8px', background: C.greenDim, border: `1px solid ${C.border2}`, borderRadius: 8, color: C.green, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--sans)' }}>
          Modifier
        </button>
        <button style={{ flex: 1, padding: '8px', background: 'rgba(224,85,85,0.1)', border: '1px solid rgba(224,85,85,0.2)', borderRadius: 8, color: C.red, cursor: 'pointer', fontSize: 12, fontFamily: 'var(--sans)' }}>
          Annuler
        </button>
      </div>
    </div>
  );
}

export default function AgendaView() {
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [date, setDate] = useState('2026-03-27');
  const gridRef = useRef(null);

  // Current time line position
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const nowTop = Math.max(0, (currentHour - 9) * SLOT_HEIGHT);

  const totalRevenue = MOCK_APPOINTMENTS.reduce((s, a) => s + a.price, 0);
  const completed = MOCK_APPOINTMENTS.filter(a => a.status === 'completed').length;

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%' }}>

      {/* Agenda principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => {}} style={{ width: 30, height: 30, borderRadius: 8, background: C.bg3, border: `1px solid ${C.border}`, color: C.text2, cursor: 'pointer', fontSize: 14 }}>‹</button>
            <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 400, color: C.text }}>
              Vendredi 27 mars 2026
            </div>
            <button onClick={() => {}} style={{ width: 30, height: 30, borderRadius: 8, background: C.bg3, border: `1px solid ${C.border}`, color: C.text2, cursor: 'pointer', fontSize: 14 }}>›</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ fontSize: 12, color: C.text3, background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 12px' }}>
              {completed}/{MOCK_APPOINTMENTS.length} terminés
            </div>
            <div style={{ fontSize: 12, color: C.green, background: C.greenDim, border: `1px solid ${C.border2}`, borderRadius: 8, padding: '6px 12px', fontFamily: 'var(--mono)' }}>
              {totalRevenue} € CA
            </div>
            <button style={{ fontSize: 12, color: C.text, background: C.bg3, border: `1px solid ${C.border2}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              + RDV
            </button>
          </div>
        </div>

        {/* Grid */}
        <div style={{ flex: 1, background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

          {/* Stylist headers */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
            <div style={{ width: 52, flexShrink: 0, borderRight: `1px solid ${C.border}` }} />
            {STYLISTS_MOCK.map(s => (
              <div key={s.id} style={{ flex: 1, padding: '10px 12px', borderRight: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${s.color}20`, border: `1.5px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: s.color, flexShrink: 0 }}>
                  {s.avatar}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: C.text3 }}>{s.appts} RDV · {s.revenue}€</div>
                </div>
              </div>
            ))}
          </div>

          {/* Scrollable grid */}
          <div ref={gridRef} style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            <div style={{ display: 'flex', minHeight: HOURS.length * SLOT_HEIGHT }}>

              {/* Hours */}
              <div style={{ width: 52, flexShrink: 0, borderRight: `1px solid ${C.border}` }}>
                {HOURS.map(h => (
                  <div key={h} style={{ height: SLOT_HEIGHT, display: 'flex', alignItems: 'flex-start', padding: '4px 8px', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 10, color: C.text3, fontFamily: 'var(--mono)' }}>{String(h).padStart(2, '0')}:00</span>
                  </div>
                ))}
              </div>

              {/* Stylist columns */}
              {STYLISTS_MOCK.map(s => {
                const appts = MOCK_APPOINTMENTS.filter(a => a.stylistId === s.id);
                return (
                  <div key={s.id} style={{ flex: 1, position: 'relative', borderRight: `1px solid ${C.border}` }}>
                    {/* Hour lines */}
                    {HOURS.map(h => (
                      <div key={h} style={{ height: SLOT_HEIGHT, borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ height: '50%', borderBottom: `1px dashed ${C.border}`, opacity: 0.4 }} />
                      </div>
                    ))}
                    {/* Now line */}
                    <div style={{
                      position: 'absolute', left: 0, right: 0,
                      top: nowTop, height: 1.5, background: C.green, zIndex: 20,
                      boxShadow: `0 0 6px ${C.green}`
                    }}>
                      <div style={{ position: 'absolute', left: -4, top: -4, width: 9, height: 9, borderRadius: '50%', background: C.green }} />
                    </div>
                    {/* Appointments */}
                    {appts.map(a => (
                      <AppointmentCard
                        key={a.id}
                        appt={a}
                        colWidth={160}
                        onSelect={setSelectedAppt}
                        selected={selectedAppt?.id === a.id}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div style={{ width: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Selected appointment detail */}
        {selectedAppt ? (
          <AppointmentDetail appt={selectedAppt} onClose={() => setSelectedAppt(null)} />
        ) : (
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: 12, color: C.text3, textAlign: 'center', padding: '16px 0' }}>
              Cliquez sur un RDV pour le détail
            </div>
          </div>
        )}

        {/* Mini summary per stylist */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, fontSize: 12, fontWeight: 500, color: C.text }}>
            Résumé équipe
          </div>
          {STYLISTS_MOCK.map(s => (
            <div key={s.id} style={{ padding: '9px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color }} />
                <span style={{ fontSize: 12, color: C.text2 }}>{s.name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: C.text }}>{s.revenue} €</div>
                <div style={{ fontSize: 10, color: C.text3 }}>{s.appts} RDV</div>
              </div>
            </div>
          ))}
        </div>

        {/* Créneaux libres */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>Créneaux libres</span>
            <span style={{ fontSize: 11, color: C.amber }}>4 slots</span>
          </div>
          {['11:00 · Emma A.', '13:00 · James M.', '15:30 · Sofia R.', '16:00 · Emma A.'].map(slot => (
            <div key={slot} style={{ padding: '8px 14px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: C.text3, fontFamily: 'var(--mono)' }}>{slot}</span>
              <button style={{ fontSize: 10, color: C.green, background: C.greenDim, border: `1px solid ${C.border2}`, borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                Bloquer
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
