import { useState, useEffect, useCallback } from 'react';

const C = {
  bg2: 'var(--owner-bg2)', bg3: 'var(--owner-bg3)',
  border: 'var(--owner-border)', border2: 'var(--owner-border2)',
  green: 'var(--owner-green)', greenDim: 'var(--owner-green-dim)',
  amber: 'var(--owner-amber)', red: 'var(--owner-red)',
  text: 'var(--owner-text)', text2: 'var(--owner-text2)', text3: 'var(--owner-text3)',
};

const NOTIF_TYPES = {
  booking: { color: '#4eca7e', icon: '📅' },
  payment: { color: '#f0a500', icon: '💳' },
  alert: { color: '#e05555', icon: '⚠' },
  ai: { color: '#4eca7e', icon: '⬡' },
  message: { color: '#c9a84c', icon: '💬' },
};

const INITIAL_NOTIFS = [
  { id: 'n1', type: 'booking', title: 'Nouveau RDV confirmé', detail: 'Luna M. · Balayage + Toner · Kai · 12:45', time: 'Il y a 2 min', read: false },
  { id: 'n2', type: 'ai', title: 'Insight IA : opportunité détectée', detail: 'Jeudi 14h–16h vide depuis 4 semaines — flash offer recommandée', time: 'Il y a 5 min', read: false },
  { id: 'n3', type: 'alert', title: 'Client à risque en RDV ce soir', detail: 'Anna K. · 10:30 avec James · Dernier rebooking : jamais', time: 'Il y a 12 min', read: false },
  { id: 'n4', type: 'payment', title: 'Paiement reçu', detail: 'Sophie L. · 170 € · Balayage + Coupe', time: 'Il y a 28 min', read: true },
  { id: 'n5', type: 'message', title: 'SMS client envoyé', detail: 'Campagne win-back · 42 destinataires · 28% ouverture', time: 'Il y a 1h', read: true },
];

// Simulated real-time notifications
const NEW_NOTIFS = [
  { type: 'booking', title: 'RDV annulé — créneau libre', detail: 'Marc D. · 15:30 · Sofia R. · Annulation client', time: 'À l\'instant' },
  { type: 'payment', title: 'Paiement en ligne reçu', detail: 'Nina P. · 80 € · Toner + Brushing', time: 'À l\'instant' },
  { type: 'ai', title: 'IA : Isabelle D. vient de consulter votre site', detail: 'Dernière visite il y a 98 jours — probabilité rebooking 34%', time: 'À l\'instant' },
];

export function useNotifications() {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [toasts, setToasts] = useState([]);

  // Simulate incoming notifications
  useEffect(() => {
    const timers = NEW_NOTIFS.map((notif, i) =>
      setTimeout(() => {
        const newNotif = { ...notif, id: `live_${i}`, read: false };
        setNotifs(prev => [newNotif, ...prev]);
        setToasts(prev => [...prev, { ...newNotif, toastId: `toast_${Date.now()}` }]);
        // Auto-dismiss toast
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.toastId !== `toast_${Date.now() - 5000}`));
        }, 5000);
      }, (i + 1) * 18000) // Every 18 seconds
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const markRead = useCallback((id) => {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const dismissToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  }, []);

  const unreadCount = notifs.filter(n => !n.read).length;

  return { notifs, toasts, unreadCount, markRead, markAllRead, dismissToast };
}

export function NotificationPanel({ notifs, unreadCount, onMarkRead, onMarkAll, onClose }) {
  return (
    <div style={{
      position: 'absolute', right: 0, top: '100%', marginTop: 8,
      width: 360, background: C.bg2, border: `1px solid ${C.border2}`,
      borderRadius: 16, overflow: 'hidden', zIndex: 200,
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      animation: 'fadeUp 0.25s ease both'
    }}>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>
          Notifications {unreadCount > 0 && <span style={{ background: C.red, color: '#fff', borderRadius: 100, padding: '1px 7px', fontSize: 10, marginLeft: 6 }}>{unreadCount}</span>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onMarkAll} style={{ fontSize: 11, color: C.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)' }}>Tout lire</button>
          <button onClick={onClose} style={{ fontSize: 16, color: C.text3, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>
      </div>
      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
        {notifs.map(n => {
          const tc = NOTIF_TYPES[n.type] || NOTIF_TYPES.ai;
          return (
            <div key={n.id} onClick={() => onMarkRead(n.id)} style={{
              padding: '12px 16px', display: 'flex', gap: 10,
              borderBottom: `1px solid ${C.border}`,
              background: n.read ? 'transparent' : `${tc.color}06`,
              cursor: 'pointer', transition: 'background 0.15s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = C.greenDim}
              onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : `${tc.color}06`}
            >
              <div style={{ width: 32, height: 32, borderRadius: 10, background: `${tc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                {tc.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: n.read ? 400 : 500, color: C.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title}</div>
                <div style={{ fontSize: 11, color: C.text3, marginTop: 2, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.detail}</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 3, fontFamily: 'var(--mono)' }}>{n.time}</div>
              </div>
              {!n.read && <div style={{ width: 7, height: 7, borderRadius: '50%', background: tc.color, flexShrink: 0, marginTop: 4 }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ToastStack({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.slice(-3).map(t => {
        const tc = NOTIF_TYPES[t.type] || NOTIF_TYPES.ai;
        return (
          <div key={t.toastId} onClick={() => onDismiss(t.toastId)} style={{
            background: C.bg2, border: `1px solid ${C.border2}`,
            borderRadius: 14, padding: '12px 16px',
            display: 'flex', gap: 12, alignItems: 'center',
            maxWidth: 320, cursor: 'pointer',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            animation: 'slideRight 0.4s cubic-bezier(0.34,1.56,0.64,1) both'
          }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: `${tc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {tc.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{t.title}</div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.detail}</div>
            </div>
            <span style={{ color: C.text3, fontSize: 16, flexShrink: 0 }}>×</span>
          </div>
        );
      })}
    </div>
  );
}
