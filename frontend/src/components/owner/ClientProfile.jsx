import { useState, useEffect } from 'react';
import { fetchClient, checkoutAnalysis } from '../../lib/api.js';

const C = {
  bg: 'var(--owner-bg)', bg2: 'var(--owner-bg2)', bg3: 'var(--owner-bg3)',
  border: 'var(--owner-border)', border2: 'var(--owner-border2)',
  green: 'var(--owner-green)', greenDim: 'var(--owner-green-dim)',
  amber: 'var(--owner-amber)', amberDim: 'rgba(240,165,0,0.12)',
  red: 'var(--owner-red)', redDim: 'rgba(224,85,85,0.12)',
  gold: 'var(--owner-gold)',
  text: 'var(--owner-text)', text2: 'var(--owner-text2)', text3: 'var(--owner-text3)',
};

const HISTORY = [
  { date: '27 Mar 2026', service: 'Balayage + Coupe', stylist: 'Emma A.', price: 170, rebookedSameDay: false },
  { date: '10 Mar 2026', service: 'Couleur complète', stylist: 'Emma A.', price: 95, rebookedSameDay: true },
  { date: '18 Fév 2026', service: 'Balayage', stylist: 'Emma A.', price: 130, rebookedSameDay: true },
  { date: '05 Jan 2026', service: 'Coupe + Brushing', stylist: 'Kai T.', price: 85, rebookedSameDay: false },
  { date: '14 Déc 2025', service: 'Balayage + Coupe', stylist: 'Emma A.', price: 170, rebookedSameDay: true },
  { date: '02 Nov 2025', service: 'Soin profond + Brushing', stylist: 'Sofia R.', price: 80, rebookedSameDay: true },
];

const NOTES = [
  { date: '10 Mar 2026', author: 'Emma A.', text: 'Cliente très satisfaite du résultat. Demande toujours des reflets chauds. Sensible sur les tempes.' },
  { date: '05 Jan 2026', author: 'Kai T.', text: 'A essayé une nouvelle coupe — enchantée. Souhaite essayer le balayage rosé à la prochaine visite.' },
];

function StatBlock({ label, value, sub, color }) {
  return (
    <div style={{ background: C.bg3, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--display)', fontSize: 26, fontWeight: 500, color: color || C.text, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: C.text3, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: color || C.text3, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function ClientProfile({ clientId = 'c1', onBack }) {
  const [client, setClient] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    fetchClient(clientId).then(setClient);
  }, [clientId]);

  async function handleAIAnalysis() {
    setLoadingAI(true);
    try {
      const result = await checkoutAnalysis(clientId);
      setAnalysis(result);
    } catch { }
    setLoadingAI(false);
  }

  if (!client) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: C.text3, fontSize: 13 }}>
      <div className="spinner green" style={{ width: 20, height: 20, marginRight: 10 }} /> Chargement…
    </div>
  );

  const riskColors = { low: C.green, medium: C.amber, high: C.red, critical: '#ff3333' };
  const riskLabels = { low: 'Fidèle', medium: 'Moyen', high: 'Risque', critical: 'Critique' };
  const visitFreq = Math.round(365 / (client.totalVisits || 1));
  const avgBasket = Math.round(client.totalSpent / client.totalVisits);

  return (
    <div className="fade-up">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
        {onBack && (
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: C.text3, cursor: 'pointer', fontSize: 13, paddingTop: 4, fontFamily: 'var(--sans)' }}>← Retour</button>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: C.greenDim, border: `2px solid ${C.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 500, color: C.green, flexShrink: 0 }}>
            {client.avatar}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 24, fontWeight: 400, color: C.text }}>{client.name}</div>
            <div style={{ fontSize: 12, color: C.text3, marginTop: 2 }}>{client.email} · {client.phone}</div>
            <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: `${riskColors[client.churnRisk]}18`, color: riskColors[client.churnRisk], border: `1px solid ${riskColors[client.churnRisk]}30` }}>
                {riskLabels[client.churnRisk]}
              </span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: C.amberDim, color: C.amber }}>
                {client.loyaltyPoints} pts fidélité
              </span>
            </div>
          </div>
        </div>

        {/* AI CTA */}
        <button onClick={handleAIAnalysis} disabled={loadingAI} style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
          background: C.greenDim, border: `1px solid ${C.border2}`, borderRadius: 12,
          color: C.green, cursor: loadingAI ? 'not-allowed' : 'pointer',
          fontSize: 12, fontFamily: 'var(--sans)', opacity: loadingAI ? 0.7 : 1
        }}>
          {loadingAI ? <><div className="spinner green" style={{ width: 14, height: 14 }} />Analyse…</> : '⬡ Analyser IA'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        <StatBlock label="Visites totales" value={client.totalVisits} sub="depuis le début" color={C.green} />
        <StatBlock label="CA total" value={`${client.totalSpent}€`} sub={`~${avgBasket}€/visite`} color={C.gold} />
        <StatBlock label="Panier moyen" value={`${avgBasket}€`} sub="par visite" />
        <StatBlock label="Fréquence" value={`${visitFreq}J`} sub="entre visites" color={visitFreq < 40 ? C.green : visitFreq < 70 ? C.amber : C.red} />
      </div>

      {/* AI Analysis result */}
      {analysis && (
        <div style={{ background: C.greenDim, border: `1px solid ${C.border2}`, borderRadius: 14, padding: 16, marginBottom: 20, animation: 'fadeUp 0.3s ease both' }}>
          <div style={{ fontSize: 12, color: C.green, fontWeight: 500, marginBottom: 10 }}>⬡ Analyse IA — Recommandation checkout</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ background: C.bg3, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Offre suggérée</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{analysis.offerText}</div>
              {analysis.discountPercent > 0 && <div style={{ fontSize: 12, color: C.amber, marginTop: 4 }}>-{analysis.discountPercent}%</div>}
            </div>
            <div style={{ background: C.bg3, borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Prochain service suggéré</div>
              <div style={{ fontSize: 13, color: C.green }}>{analysis.nextServiceSuggestion}</div>
              <div style={{ fontSize: 11, color: C.text3, marginTop: 6 }}>Pour la styliste</div>
              <div style={{ fontSize: 12, color: C.text2, marginTop: 2 }}>{analysis.messageToCashier}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 16 }}>
        {[['history', 'Historique'], ['notes', 'Notes'], ['preferences', 'Préférences']].map(([id, label]) => (
          <button key={id} onClick={() => setActiveTab(id)} style={{
            padding: '8px 16px', background: 'none', border: 'none',
            borderBottom: `2px solid ${activeTab === id ? C.green : 'transparent'}`,
            color: activeTab === id ? C.green : C.text3,
            cursor: 'pointer', fontSize: 13, fontFamily: 'var(--sans)',
            fontWeight: activeTab === id ? 500 : 400, transition: 'all 0.15s'
          }}>{label}</button>
        ))}
      </div>

      {/* History */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {HISTORY.map((visit, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.bg3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: visit.rebookedSameDay ? C.green : C.red }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{visit.service}</div>
                <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{visit.date} · {visit.stylist}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontFamily: 'var(--mono)', color: C.text }}>{visit.price} €</div>
                <div style={{ fontSize: 10, color: visit.rebookedSameDay ? C.green : C.red, marginTop: 2 }}>
                  {visit.rebookedSameDay ? '✓ Rebooké' : '✗ Pas rebooké'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notes */}
      {activeTab === 'notes' && (
        <div>
          {NOTES.map((note, i) => (
            <div key={i} style={{ background: C.bg3, borderRadius: 12, padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: C.green }}>{note.author}</span>
                <span style={{ fontSize: 11, color: C.text3, fontFamily: 'var(--mono)' }}>{note.date}</span>
              </div>
              <p style={{ fontSize: 13, color: C.text2, lineHeight: 1.6, margin: 0 }}>{note.text}</p>
            </div>
          ))}
          <div style={{ background: C.bg3, borderRadius: 12, padding: 14 }}>
            <div style={{ fontSize: 11, color: C.text3, marginBottom: 6 }}>Note interne</div>
            <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.6 }}>{client.notes}</div>
          </div>
        </div>
      )}

      {/* Preferences */}
      {activeTab === 'preferences' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            ['Service favori', client.favoriteService],
            ['Styliste préféré', 'Emma Aubert'],
            ['Horaire préféré', 'Matin (9h–12h)'],
            ['Fréquence souhaitée', 'Toutes les 6 semaines'],
            ['Canal contact', 'SMS'],
            ['Origine', 'Recommandation client'],
          ].map(([label, val]) => (
            <div key={label} style={{ background: C.bg3, borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
