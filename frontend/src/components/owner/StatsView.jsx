import { useState, useEffect } from 'react';
import { predictRevenue, fetchFinance, fetchPerformance, fetchHeatmap, fetchServiceProfitability } from '../../lib/api.js';

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
  const [finance, setFinance] = useState(null);
  const [perf, setPerf] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [svcProfit, setSvcProfit] = useState(null);

  const maxRevenue = Math.max(...MONTHLY.map(m => m.revenue));

  async function loadPrediction() {
    setLoadingPred(true);
    try { setPrediction(await predictRevenue()); }
    catch { }
    setLoadingPred(false);
  }

  useEffect(() => {
    loadPrediction();
    fetchFinance().then(setFinance).catch(() => {});
    fetchPerformance().then(setPerf).catch(() => {});
    fetchHeatmap().then(setHeatmap).catch(() => {});
    fetchServiceProfitability().then(setSvcProfit).catch(() => {});
  }, []);

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
                  {prediction.predictedNetProfit !== undefined && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ fontSize: 10, color: C.text3 }}>Bénéfice net estimé</div>
                      <div style={{ fontSize: 16, fontFamily: 'var(--display)', color: C.gold }}>
                        {prediction.predictedNetProfit?.toLocaleString('fr-FR')} €
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: C.text3, marginTop: 6 }}>Confiance : <span style={{ color: prediction.confidence === 'high' ? C.green : prediction.confidence === 'medium' ? C.amber : C.red }}>{prediction.confidence}</span></div>
                  <div style={{ marginTop: 10 }}>
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

      {/* ── BLOC FINANCE & P&L ─────────────────────────────────────────────── */}
      {finance && (
        <>
          {/* Finance KPIs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold }} />
            <span style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 400, color: C.text }}>Finance & Rentabilité</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {[
              { label: 'CA cumulé YTD', value: `${(finance.summary.ytdRevenue / 1000).toFixed(0)}k €`, color: C.green, sub: '6 derniers mois' },
              { label: 'Résultat net YTD', value: `${(finance.summary.ytdProfit / 1000).toFixed(0)}k €`, color: C.gold, sub: `Marge ${finance.summary.ytdMarginPct}%` },
              { label: 'Marge nette ce mois', value: `${finance.summary.currentMonthMargin}%`, color: finance.summary.currentMonthMargin > 30 ? C.green : finance.summary.currentMonthMargin > 20 ? C.amber : C.red, sub: `vs 25.3% mois préc.` },
              { label: 'Seuil rentabilité/j', value: `${finance.summary.breakEvenDaily} €`, color: C.amber, sub: 'CA min journalier' },
            ].map(k => (
              <div key={k.label} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: C.text3, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>{k.label}</div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 26, color: k.color, lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: 10, color: C.text3, marginTop: 6 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* P&L Table */}
          <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16 }}>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Compte de résultat — 6 derniers mois</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {['', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: h === '' ? 'left' : 'right', color: C.text3, fontWeight: 400, fontSize: 11, letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Chiffre d\'affaires', key: 'revenue', color: C.green, bold: true },
                    { label: '  − Charges totales', key: 'expenses', color: C.red, invert: true },
                    { label: 'Résultat net', key: 'grossMargin', color: C.gold, bold: true, separator: true },
                    { label: 'Marge nette', key: 'marginPct', color: C.text2, suffix: '%' },
                  ].map(row => (
                    <tr key={row.label} style={{ borderBottom: row.separator ? `2px solid ${C.border2}` : `1px solid ${C.border}` }}>
                      <td style={{ padding: '9px 16px', color: row.bold ? C.text : C.text3, fontWeight: row.bold ? 500 : 400 }}>{row.label}</td>
                      {finance.financials.map((m, i) => {
                        const val = m[row.key];
                        const display = row.suffix ? `${val}${row.suffix}` : `${val.toLocaleString('fr-FR')} €`;
                        return (
                          <td key={i} style={{ padding: '9px 16px', textAlign: 'right', fontFamily: 'var(--mono)', color: row.color, fontWeight: row.bold ? 500 : 400, background: i === 5 ? `${C.green}08` : 'transparent' }}>
                            {display}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expense breakdown + Break-even */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16 }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
                Détail des charges — Mars
              </div>
              <div style={{ padding: '12px 16px' }}>
                {[
                  { label: 'Salaires bruts', value: finance.expenses.salaires, color: '#e05555' },
                  { label: 'Charges sociales', value: finance.expenses.chargesSociales, color: '#e07555' },
                  { label: 'Loyer + charges', value: finance.expenses.loyer, color: C.amber },
                  { label: 'Produits & fournitures', value: finance.expenses.produits, color: C.gold },
                  { label: 'Marketing', value: finance.expenses.marketing, color: C.green },
                  { label: 'Assurances & divers', value: finance.expenses.assurances + finance.expenses.divers, color: C.text3 },
                ].map(e => {
                  const pct = Math.round((e.value / finance.expenses.total) * 100);
                  return (
                    <div key={e.label} style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: C.text2 }}>{e.label}</span>
                        <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: C.text }}>{e.value.toLocaleString('fr-FR')} € <span style={{ color: C.text3 }}>({pct}%)</span></span>
                      </div>
                      <div style={{ height: 3, background: C.bg3, borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: e.color, borderRadius: 2, transition: 'width 0.8s ease', opacity: 0.8 }} />
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>Total charges</span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: C.red, fontWeight: 600 }}>{finance.expenses.total.toLocaleString('fr-FR')} €</span>
                </div>
              </div>
            </div>

            <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16 }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber }} />
                Analyse seuil de rentabilité
              </div>
              <div style={{ padding: '16px' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: C.text3, marginBottom: 2 }}>Seuil mensuel</div>
                  <div style={{ fontFamily: 'var(--display)', fontSize: 32, color: C.amber }}>{finance.summary.breakEvenMonthly.toLocaleString('fr-FR')} €</div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 11, color: C.text3 }}>Atteint</span>
                    <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: C.green }}>{Math.round((finance.financials[5].revenue / finance.summary.breakEvenMonthly) * 100)}%</span>
                  </div>
                  <div style={{ height: 8, background: C.bg3, borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, Math.round((finance.financials[5].revenue / finance.summary.breakEvenMonthly) * 100))}%`, background: `linear-gradient(90deg, ${C.amber}, ${C.green})`, borderRadius: 100, transition: 'width 1s ease' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                  {[
                    { label: 'Excédent vs seuil', value: `+${finance.summary.revenueVsBreakEven.toLocaleString('fr-FR')} €`, color: C.green },
                    { label: 'Croissance MoM', value: `+${finance.summary.revenueGrowthMoM}%`, color: C.gold },
                    { label: 'Seuil journalier', value: `${finance.summary.breakEvenDaily} €/j`, color: C.amber },
                    { label: 'Résultat net mois', value: `${(finance.financials[5].grossMargin).toLocaleString('fr-FR')} €`, color: C.gold },
                  ].map(k => (
                    <div key={k.label} style={{ background: C.bg3, borderRadius: 10, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, color: C.text3, marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
                      <div style={{ fontSize: 14, fontFamily: 'var(--display)', color: k.color }}>{k.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── PERFORMANCE ÉQUIPE ─────────────────────────────────────────────── */}
      {perf && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16 }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Performance équipe — détail</span>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                ['Top performer', perf.teamSummary.topPerformer, C.green],
                ['CA total équipe', `${perf.teamSummary.totalRevenue.toLocaleString('fr-FR')} €`, C.gold],
                ['Rebooking moyen', `${perf.teamSummary.avgRebookingRate}%`, C.amber],
              ].map(([l, v, c]) => (
                <div key={l} style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
                  <div style={{ fontSize: 12, color: c, fontWeight: 500 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Styliste', 'CA mois', '€/heure', 'Clients', 'Rebooking', 'Panier moy.', 'Bonus target', 'Atteint'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: h === 'Styliste' ? 'left' : 'right', color: C.text3, fontWeight: 400, fontSize: 11, letterSpacing: '0.03em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {perf.stylists.sort((a, b) => b.revenueMonth - a.revenueMonth).map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: i === 0 ? `${C.green}06` : 'transparent' }}>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: `${s.color}20`, border: `1px solid ${s.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: s.color, fontWeight: 500 }}>{s.avatar}</div>
                        <div>
                          <div style={{ color: C.text, fontWeight: i === 0 ? 500 : 400 }}>{s.name}</div>
                          {i === 0 && <div style={{ fontSize: 10, color: C.green }}># 1 ce mois</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--mono)', color: C.text, fontWeight: 500 }}>{s.revenueMonth.toLocaleString('fr-FR')} €</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--mono)', color: s.revenuePerHour > 80 ? C.green : s.revenuePerHour > 65 ? C.amber : C.text2 }}>{s.revenuePerHour} €</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: C.text2 }}>{s.clientsServed}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <span style={{ color: s.rebookingRate >= 80 ? C.green : s.rebookingRate >= 70 ? C.amber : C.red }}>{s.rebookingRate}%</span>
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--mono)', color: C.text2 }}>{s.avgBasket} €</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: C.text3, fontFamily: 'var(--mono)' }}>{s.bonusTarget.toLocaleString('fr-FR')} €</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 100,
                        background: s.bonusAchievedPct >= 100 ? `${C.green}20` : s.bonusAchievedPct >= 80 ? `${C.amber}20` : `${C.red}20`,
                        color: s.bonusAchievedPct >= 100 ? C.green : s.bonusAchievedPct >= 80 ? C.amber : C.red,
                      }}>{s.bonusAchievedPct}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── HEATMAP D'OCCUPATION ──────────────────────────────────────── */}
      {heatmap && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16 }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Heatmap d'occupation — heures × jours</span>
            </div>
            <div style={{ fontSize: 11, color: C.text3 }}>% de remplissage par créneau</div>
          </div>
          <div style={{ padding: '16px 20px', overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `52px repeat(6, 1fr)`, gap: 4, minWidth: 380 }}>
              <div />
              {heatmap.days.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, color: C.text3, fontWeight: 500, padding: '4px 0' }}>{d}</div>
              ))}
              {heatmap.hours.map((h, hi) => (
                <HeatRow key={h} hour={h} row={heatmap.data[hi]} days={heatmap.days} C={C} />
              ))}
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 14, flexWrap: 'wrap' }}>
              {[['≥ 90% Complet', '#4eca7e'], ['70–89% Bien rempli', '#f0a500'], ['45–69% Moyen', '#c9a84c'], ['< 45% Creux', null]].map(([l, c]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: C.text3 }}>
                  <div style={{ width: 14, height: 10, borderRadius: 3, background: c ? `${c}35` : C.bg3, border: `1px solid ${c ? `${c}60` : C.border}` }} />{l}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── RENTABILITÉ PAR PRESTATION ───────────────────────────────── */}
      {svcProfit && (
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 16 }}>
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Rentabilité par prestation</span>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                ['CA total', `${svcProfit.totals.revenue.toLocaleString('fr-FR')} €`, C.green],
                ['Sessions', String(svcProfit.totals.sessions), C.text2],
                ['Marge moy.', `${svcProfit.totals.avgMarginPct}%`, C.gold],
              ].map(([l, v, c]) => (
                <div key={l} style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 9, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
                  <div style={{ fontSize: 12, color: c, fontWeight: 500, fontFamily: 'var(--mono)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Prestation', 'Cat.', 'CA', '% CA', 'Sessions', 'Prix moy.', 'Produits', 'Main d\'œuvre', 'Marge €', 'Marge %', '±'].map(h => (
                    <th key={h} style={{ padding: '9px 12px', textAlign: h === 'Prestation' || h === 'Cat.' ? 'left' : 'right', color: C.text3, fontWeight: 400, fontSize: 10, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...svcProfit.services].sort((a, b) => b.revenue - a.revenue).map((s, i) => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, background: i === 0 ? `${C.gold}06` : 'transparent' }}>
                    <td style={{ padding: '9px 12px', color: C.text, fontWeight: i === 0 ? 500 : 400, whiteSpace: 'nowrap' }}>{s.name}</td>
                    <td style={{ padding: '9px 12px', color: C.text3, fontSize: 11 }}>{s.category}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'var(--mono)', color: C.green, fontWeight: 500 }}>{s.revenue.toLocaleString('fr-FR')} €</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                        <div style={{ width: 32, height: 3, background: C.bg3, borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s.revenuePct}%`, background: C.green, borderRadius: 2 }} />
                        </div>
                        <span style={{ color: C.text3, fontFamily: 'var(--mono)', fontSize: 10 }}>{s.revenuePct}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: C.text2, fontFamily: 'var(--mono)' }}>{s.sessions}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'var(--mono)', color: C.text2 }}>{s.avgPrice} €</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'var(--mono)', color: '#e07555' }}>{s.productCost} €</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'var(--mono)', color: C.amber }}>{s.laborCost} €</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', fontFamily: 'var(--mono)', fontWeight: 500, color: C.gold }}>{s.netMarginEur} €</td>
                    <td style={{ padding: '9px 12px', textAlign: 'right' }}>
                      <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 100, background: s.grossMarginPct >= 55 ? `${C.green}20` : s.grossMarginPct >= 40 ? `${C.amber}20` : `${C.red}20`, color: s.grossMarginPct >= 55 ? C.green : s.grossMarginPct >= 40 ? C.amber : C.red }}>{s.grossMarginPct}%</span>
                    </td>
                    <td style={{ padding: '9px 12px', textAlign: 'right', color: s.trend.startsWith('+') ? C.green : s.trend === '0%' ? C.text3 : C.red, fontFamily: 'var(--mono)', fontSize: 11 }}>{s.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

function HeatRow({ hour, row, days, C }) {
  return (
    <>
      <div style={{ fontSize: 10, color: C.text3, display: 'flex', alignItems: 'center', fontFamily: 'var(--mono)' }}>{hour}</div>
      {row.map((val, di) => (
        <div key={`${hour}-${di}`} title={`${hour} ${days[di]} — ${val}%`} style={{
          borderRadius: 6, height: 30,
          background: val >= 90 ? `${'#4eca7e'}35` : val >= 70 ? `${'#f0a500'}30` : val >= 45 ? 'rgba(201,168,76,0.18)' : C.bg3,
          border: `1px solid ${val >= 90 ? '#4eca7e60' : val >= 70 ? '#f0a50050' : C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 10, color: val >= 70 ? C.text : C.text3, fontFamily: 'var(--mono)',
          opacity: val === 0 ? 0.2 : 1,
        }}>{val > 0 ? `${val}%` : '—'}</div>
      ))}
    </>
  );
}