import { useState, useEffect } from 'react';
import { predictRevenue } from '../../lib/api.js';

const C = {
  bg: 'var(--owner-bg)', bg2: 'var(--owner-bg2)', bg3: 'var(--owner-bg3)',
  border: 'var(--owner-border)', border2: 'var(--owner-border2)',
  green: 'var(--owner-green)', greenDim: 'var(--owner-green-dim)',
  amber: 'var(--owner-amber)', red: 'var(--owner-red)', gold: 'var(--owner-gold)',
  text: 'var(--owner-text)', text2: 'var(--owner-text2)', text3: 'var(--owner-text3)',
};

const MONTHLY = [
  { month: 'Oct', revenue: 38400, clients: 210, appts: 312 },
  { month: 'Nov', revenue: 41200, clients: 228, appts: 336 },
  { month: 'Déc', revenue: 52800, clients: 265, appts: 408 },
  { month: 'Jan', revenue: 35600, clients: 198, appts: 289 },
  { month: 'Fév', revenue: 40100, clients: 215, appts: 318 },
  { month: 'Mar', revenue: 48600, clients: 241, appts: 374 },
];

const SERVICES_MIX = [
  { name: 'Balayage', pct: 28, revenue: 13608, color: '#4eca7e' },
  { name: 'Couleur', pct: 22, revenue: 10692, color: '#f0a500' },
  { name: 'Coupe', pct: 20, revenue: 9720, color: '#c9a84c' },
  { name: 'Kératine', pct: 15, revenue: 7290, color: '#e05555' },
  { name: 'Brushing', pct: 10, revenue: 4860, color: '#3d5a47' },
  { name: 'Soins', pct: 5, revenue: 2430, color: '#2a3d32' },
];

const RETENTION = [
  { week: 'S1', new: 12, returning: 48, lost: 3 },
  { week: 'S2', new: 8, returning: 52, lost: 5 },
  { week: 'S3', new: 15, returning: 45, lost: 2 },
  { week: 'S4', new: 10, returning: 55, lost: 4 },
];

function LineChart({ data, height = 120, color = '#4eca7e' }) {
  const max = Math.max(...data);
  const min = Math.min(...data.filter(v => v > 0));
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = v > 0 ? 100 - ((v - min) / (max - min)) * 85 : 100;
    return `${x},${y}`;
  }).join(' ');
  const area = `0,100 ${pts} 100,100`;

  return (
    <svg width="100%" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#areaGrad)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = v > 0 ? 100 - ((v - min) / (max - min)) * 85 : 100;
        return v > 0 ? <circle key={i} cx={x} cy={y} r="1.5" fill={color} vectorEffect="non-scaling-stroke" /> : null;
      })}
    </svg>
  );
}

function BarChart({ data, height = 80, colorFn }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{ fontSize: 10, color: C.text3, fontFamily: 'var(--mono)' }}>{d.label}</div>
          <div style={{ width: '100%', borderRadius: '4px 4px 0 0', height: `${(d.value / max) * 80}%`, background: colorFn ? colorFn(i) : C.greenDim, border: `1px solid ${colorFn ? colorFn(i) : C.green}`, minHeight: 4, transition: 'height 0.5s ease' }} />
          <div style={{ fontSize: 9, color: C.text3 }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
}

export default function StatsView() {
  const [period, setPeriod] = useState('month');
  const [prediction, setPrediction] = useState(null);
  const [loadingPred, setLoadingPred] = useState(false);

  const maxRevenue = Math.max(...MONTHLY.map(m => m.revenue));

  async function loadPrediction() {
    setLoadingPred(true);
    try { setPrediction(await predictRevenue()); }
    catch { }
    setLoadingPred(false);
  }

  useEffect(() => { loadPrediction(); }, []);

  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 400, color: C.text }}>Statistiques & Analyses</div>
        <div style={{ display: 'flex', gap: 4, background: C.bg3, borderRadius: 10, padding: 3 }}>
          {[['week', 'Semaine'], ['month', 'Mois'], ['year', 'Année']].map(([id, label]) => (
            <button key={id} onClick={() => setPeriod(id)} style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 11,
              background: period === id ? C.bg2 : 'none',
              color: period === id ? C.text : C.text3,
              cursor: 'pointer', fontFamily: 'var(--sans)',
              border: period === id ? `1px solid ${C.border2}` : '1px solid transparent',
              transition: 'all 0.15s'
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* Revenue trend */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16 }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Évolution CA</span>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[['Total 6 mois', '256 700 €', C.green], ['Meilleur mois', 'Déc 52 800 €', C.gold], ['Croissance', '+21%', C.green]].map(([l, v, c]) => (
              <div key={l} style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: C.text3 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: c, fontFamily: 'var(--mono)' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {/* Month bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100, marginBottom: 8 }}>
            {MONTHLY.map((m, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ fontSize: 10, color: C.text3, fontFamily: 'var(--mono)' }}>{(m.revenue / 1000).toFixed(0)}k</div>
                <div style={{
                  width: '100%', borderRadius: '4px 4px 0 0',
                  height: `${(m.revenue / maxRevenue) * 85}%`,
                  background: i === 5 ? C.greenDim : 'rgba(30,43,39,0.5)',
                  border: `1px solid ${i === 5 ? C.green : C.border}`,
                  position: 'relative', minHeight: 8, transition: 'height 0.5s ease'
                }}>
                  {i === 5 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: C.green, borderRadius: 4 }} />}
                </div>
                <div style={{ fontSize: 10, color: i === 5 ? C.green : C.text3 }}>{m.month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Services mix */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16 }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold }} />
            Mix de prestations
          </div>
          <div style={{ padding: '12px 16px' }}>
            {SERVICES_MIX.map(s => (
              <div key={s.name} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: C.text2 }}>{s.name}</span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: C.text }}>{s.revenue.toLocaleString('fr-FR')} €</span>
                </div>
                <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: 2, transition: 'width 0.8s ease' }} />
                </div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 2, textAlign: 'right' }}>{s.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Retention */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16 }}>
          <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber }} />
            Rétention clients
          </div>
          <div style={{ padding: '12px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                ['Taux fidélisation', '73%', C.green],
                ['Taux rebooking', '67%', C.gold],
                ['Nouveaux/mois', '+7', C.amber],
                ['Perdus/mois', '-4', C.red],
              ].map(([l, v, c]) => (
                <div key={l} style={{ background: C.bg3, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: C.text3, marginBottom: 2 }}>{l}</div>
                  <div style={{ fontSize: 18, fontFamily: 'var(--display)', color: c, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
            {RETENTION.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 10, color: C.text3, width: 24, fontFamily: 'var(--mono)' }}>{r.week}</span>
                <div style={{ flex: 1, display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 1 }}>
                  <div style={{ width: `${(r.returning / (r.new + r.returning + r.lost)) * 100}%`, background: C.green, opacity: 0.6 }} />
                  <div style={{ width: `${(r.new / (r.new + r.returning + r.lost)) * 100}%`, background: C.amber, opacity: 0.6 }} />
                  <div style={{ width: `${(r.lost / (r.new + r.returning + r.lost)) * 100}%`, background: C.red, opacity: 0.4 }} />
                </div>
                <span style={{ fontSize: 10, color: C.text3, width: 20, textAlign: 'right' }}>{r.returning + r.new}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              {[['Fidèles', C.green], ['Nouveaux', C.amber], ['Perdus', C.red]].map(([l, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: C.text3 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: c, opacity: 0.6 }} />
                  {l}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Revenue Prediction */}
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16 }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 500 }}>Prévision IA — 30 prochains jours</span>
          </div>
          <button onClick={loadPrediction} disabled={loadingPred} style={{ fontSize: 11, color: C.green, background: C.greenDim, border: `1px solid ${C.border2}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--sans)', opacity: loadingPred ? 0.6 : 1 }}>
            {loadingPred ? '…' : '↺ Actualiser'}
          </button>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {prediction ? (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 16, alignItems: 'start' }}>
                <div>
                  <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>CA prévu</div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 28, color: C.green, lineHeight: 1 }}>
                    {prediction.predictedRevenue?.toLocaleString('fr-FR')} €
                  </div>
                  <div style={{ fontSize: 10, color: C.text3, marginTop: 4 }}>Confiance : <span style={{ color: prediction.confidence === 'high' ? C.green : prediction.confidence === 'medium' ? C.amber : C.red }}>{prediction.confidence}</span></div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 10, color: C.red, marginBottom: 2 }}>⚠ Risque</div>
                    <div style={{ fontSize: 11, color: C.text2, lineHeight: 1.4 }}>{prediction.mainRisk}</div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <div style={{ fontSize: 10, color: C.green, marginBottom: 2 }}>✦ Opportunité</div>
                    <div style={{ fontSize: 11, color: C.text2, lineHeight: 1.4 }}>{prediction.mainOpportunity}</div>
                  </div>
                </div>
                {prediction.dailyEstimates && (
                  <div>
                    <div style={{ fontSize: 10, color: C.text3, marginBottom: 8 }}>Estimation quotidienne</div>
                    <LineChart data={prediction.dailyEstimates.slice(0, 30)} height={90} color={C.green} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.text3, marginTop: 4, fontFamily: 'var(--mono)' }}>
                      <span>J+1</span><span>J+10</span><span>J+20</span><span>J+30</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text3, fontSize: 13 }}>
              <div className="spinner green" style={{ width: 16, height: 16 }} /> Chargement de la prévision…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
