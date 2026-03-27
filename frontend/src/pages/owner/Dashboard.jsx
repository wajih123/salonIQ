import { useState, useEffect, useRef } from 'react';
import { fetchSalon, fetchInsights, fetchClients, generateCampaign, checkoutAnalysis, predictRevenue } from '../../lib/api.js';
import AIChat from '../../components/shared/AIChat.jsx';
import AgendaView from '../../components/owner/AgendaView.jsx';
import ClientProfile from '../../components/owner/ClientProfile.jsx';
import StatsView from '../../components/owner/StatsView.jsx';
import { useNotifications, NotificationPanel, ToastStack } from '../../components/owner/Notifications.jsx';

const C = {
  bg: 'var(--owner-bg)', bg2: 'var(--owner-bg2)', bg3: 'var(--owner-bg3)',
  border: 'var(--owner-border)', border2: 'var(--owner-border2)',
  green: 'var(--owner-green)', greenDim: 'var(--owner-green-dim)',
  amber: 'var(--owner-amber)', amberDim: 'rgba(240,165,0,0.12)',
  red: 'var(--owner-red)', redDim: 'rgba(224,85,85,0.12)',
  gold: 'var(--owner-gold)', goldDim: 'rgba(201,168,76,0.12)',
  text: 'var(--owner-text)', text2: 'var(--owner-text2)', text3: 'var(--owner-text3)',
};

function KPICard({ label, value, change, changeType, unit = '' }) {
  return (
    <div style={{
      background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)',
      padding: '20px', position: 'relative', overflow: 'hidden', transition: 'border-color 0.2s',
      cursor: 'default'
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.border2}
      onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
    >
      <div style={{ fontSize: 11, color: C.text3, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: 'var(--display)', fontSize: 30, fontWeight: 500, color: C.text, lineHeight: 1 }}>
        {unit}{typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
      </div>
      {change && (
        <div style={{ marginTop: 8, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: changeType === 'up' ? C.green : changeType === 'down' ? C.red : C.amber, fontWeight: 500 }}>
            {changeType === 'up' ? '↑' : changeType === 'down' ? '↓' : '·'} {change}
          </span>
        </div>
      )}
    </div>
  );
}

function InsightCard({ insight, onAction }) {
  const colors = {
    alert: { bg: C.redDim, color: C.red, icon: '⚠' },
    opportunity: { bg: C.greenDim, color: C.green, icon: '✦' },
    performance: { bg: C.goldDim, color: C.gold, icon: '↑' },
  };
  const c = colors[insight.type] || colors.alert;
  return (
    <div style={{
      padding: '12px 16px', display: 'flex', gap: 12, borderBottom: `1px solid ${C.border}`,
      cursor: 'pointer', transition: 'background 0.15s'
    }}
      onMouseEnter={e => e.currentTarget.style.background = C.greenDim}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      onClick={() => onAction(insight)}
    >
      <div style={{ width: 32, height: 32, borderRadius: 10, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: c.color, fontSize: 14 }}>{c.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.text, lineHeight: 1.4 }}>{insight.title}</div>
        <div style={{ fontSize: 11, color: C.text3, marginTop: 3 }}>{insight.detail}</div>
        <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>{insight.action} →</div>
      </div>
    </div>
  );
}

function RevenueBar({ data }) {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  const max = Math.max(...data.filter(v => v > 0));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 80 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
          <div style={{
            width: '100%', borderRadius: '4px 4px 0 0',
            height: v > 0 ? `${(v / max) * 100}%` : '8%',
            background: i === 4 ? C.greenDim : 'rgba(30,43,39,0.6)',
            border: `1px solid ${i === 4 ? C.green : C.border}`,
            opacity: v === 0 ? 0.3 : 1,
            position: 'relative', transition: 'all 0.3s'
          }}>
            {i === 4 && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: C.green, borderRadius: 4 }} />}
          </div>
          <span style={{ fontSize: 9, color: C.text3, fontFamily: 'var(--mono)' }}>{days[i]}</span>
        </div>
      ))}
    </div>
  );
}

function ClientRow({ client, onAnalyze, onViewProfile }) {
  const riskColors = { low: C.green, medium: C.amber, high: C.red, critical: '#ff3333' };
  const riskLabels = { low: 'Fidèle', medium: 'Moyen', high: 'Risque', critical: 'Critique' };
  return (
    <div style={{
      padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12,
      borderBottom: `1px solid ${C.border}`, cursor: 'pointer', transition: 'background 0.15s'
    }}
      onMouseEnter={e => e.currentTarget.style.background = C.greenDim}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      onClick={() => onViewProfile && onViewProfile(client)}
    >
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: C.greenDim, border: `1px solid ${C.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: C.green, flexShrink: 0 }}>
        {client.avatar}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{client.name}</div>
        <div style={{ fontSize: 11, color: C.text3 }}>{client.totalVisits} visites · {client.totalSpent}€ total</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: `${riskColors[client.churnRisk]}20`, color: riskColors[client.churnRisk] }}>
          {riskLabels[client.churnRisk]}
        </span>
        <button onClick={(e) => { e.stopPropagation(); onAnalyze(client); }} style={{
          fontSize: 10, padding: '2px 8px', borderRadius: 100,
          background: C.greenDim, border: `1px solid ${C.border2}`, color: C.green,
          cursor: 'pointer', fontFamily: 'var(--sans)'
        }}>Analyser IA</button>
      </div>
    </div>
  );
}

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [clients, setClients] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [campaignResult, setCampaignResult] = useState(null);
  const [generatingCampaign, setGeneratingCampaign] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const { notifs, toasts, unreadCount, markRead, markAllRead, dismissToast } = useNotifications();

  useEffect(() => {
    fetchSalon().then(setData);
    fetchInsights().then(setInsights);
    fetchClients().then(setClients);
  }, []);

  async function handleGenerateCampaign(type) {
    setGeneratingCampaign(true);
    setCampaignResult(null);
    try {
      const result = await generateCampaign(type, []);
      setCampaignResult({ ...result, type });
    } catch { setCampaignResult({ error: true }); }
    setGeneratingCampaign(false);
  }

  async function handleAnalyzeClient(client) {
    setCheckoutResult({ loading: true, client });
    try {
      const result = await checkoutAnalysis(client.id);
      setCheckoutResult({ ...result, client });
    } catch { setCheckoutResult({ error: true, client }); }
  }

  async function handlePrediction() {
    setLoadingPrediction(true);
    try {
      const result = await predictRevenue();
      setPrediction(result);
    } catch { }
    setLoadingPrediction(false);
  }

  const kpis = data?.kpis;
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '◈' },
    { id: 'agenda', label: 'Agenda', icon: '◻' },
    { id: 'clients', label: 'Clients', icon: '◎' },
    { id: 'campaigns', label: 'Campagnes IA', icon: '◇' },
    { id: 'stats', label: 'Statistiques', icon: '◉' },
  ];

  return (
    <div className="owner-view" style={{ background: C.bg, minHeight: '100vh', display: 'flex', color: C.text }}>

      {/* Ambient */}
      <div style={{ position: 'fixed', top: -200, left: -200, width: 500, height: 500, background: 'radial-gradient(circle, rgba(78,202,126,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0, borderRadius: '50%', animation: 'pulse 8s ease-in-out infinite' }} />

      {/* Sidebar */}
      <nav style={{
        width: 64, background: C.bg2, borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '18px 0', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, gap: 4
      }}>
        <div style={{
          width: 36, height: 36, background: C.green, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          cursor: 'pointer', fontSize: 18, fontWeight: 700, color: C.bg
        }}>S</div>

        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} title={item.label} style={{
            width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', background: activeTab === item.id ? C.greenDim : 'none',
            border: 'none', color: activeTab === item.id ? C.green : C.text3,
            fontSize: 18, position: 'relative', transition: 'all 0.15s'
          }}>
            {item.icon}
            {activeTab === item.id && <div style={{ position: 'absolute', right: -1, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20, background: C.green, borderRadius: '2px 0 0 2px' }} />}
          </button>
        ))}

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setShowChat(!showChat)} title="IA Copilote" style={{
            width: 44, height: 44, borderRadius: 12, background: showChat ? C.greenDim : 'none',
            border: `1px solid ${showChat ? C.border2 : 'transparent'}`, cursor: 'pointer',
            color: showChat ? C.green : C.text3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
          }}>⬡</button>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.green}, ${C.gold})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: C.bg }}>SM</div>
        </div>
      </nav>

      {/* Main */}
      <div style={{ marginLeft: 64, flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>

        {/* Topbar */}
        <header style={{
          padding: '16px 28px', borderBottom: `1px solid ${C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(7,11,9,0.85)', backdropFilter: 'blur(20px)',
          position: 'sticky', top: 0, zIndex: 50
        }}>
          <div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 22, fontWeight: 400 }}>Bonjour, Sarah</div>
            <div style={{ fontSize: 11, color: C.text3, marginTop: 1 }}>
              Vendredi 27 mars 2026 &nbsp;·&nbsp;
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(224,85,85,0.15)', color: C.red, borderRadius: 100, padding: '2px 8px', fontSize: 10 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.red, display: 'inline-block', animation: 'pulse 1.5s infinite' }} />LIVE
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => setShowChat(!showChat)} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: C.greenDim, border: `1px solid ${C.border2}`,
              borderRadius: 100, padding: '7px 14px', fontSize: 12, color: C.green,
              cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'all 0.15s'
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, animation: 'pulse 2s infinite' }} />
              SalonIQ AI · 4 insights
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowNotifs(!showNotifs)} style={{
                width: 36, height: 36, borderRadius: 10, background: C.bg3,
                border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: C.text2, position: 'relative'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                {unreadCount > 0 && <span style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: C.amber, border: `2px solid ${C.bg}` }} />}
              </button>
              {showNotifs && (
                <NotificationPanel notifs={notifs} unreadCount={unreadCount} onMarkRead={markRead} onMarkAll={markAllRead} onClose={() => setShowNotifs(false)} />
              )}
            </div>
          </div>
        </header>

        <div style={{ padding: '24px 28px', flex: 1 }}>

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="fade-up">
              {/* KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
                <KPICard label="CA aujourd'hui" value={kpis?.revenueToday || 2847} unit="€" change="+18.3% vs ven. dernier" changeType="up" />
                <KPICard label="Rendez-vous" value={`${kpis?.appointmentsToday || 24}/${kpis?.appointmentsCapacity || 28}`} change={`${kpis?.occupancyRate || 85.7}% d'occupation`} changeType="neutral" />
                <KPICard label="Clients actifs" value={kpis?.activeClients || 1284} change={`+${kpis?.newClientsWeek || 7} cette semaine`} changeType="up" />
                <KPICard label="Risque départ" value={kpis?.churnRiskCount || 12} change="3 critiques · action requise" changeType="down" />
              </div>

              {/* Main grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Revenue chart */}
                  <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.green }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>Revenus cette semaine</span>
                      </div>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: C.green }}>14 820 € MTD</span>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                      <RevenueBar data={kpis?.weeklyRevenue || [1820, 2400, 1650, 1290, 2847, 0, 0]} />
                    </div>
                  </div>

                  {/* Stylists */}
                  <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>Performance stylistes</span>
                      </div>
                    </div>
                    <div style={{ padding: '12px 20px' }}>
                      {[
                        { name: 'Kai Torres', rev: 14200, pct: 100, color: '#e05555' },
                        { name: 'Emma Aubert', rev: 12840, pct: 90, color: C.green },
                        { name: 'James Martin', rev: 10200, pct: 72, color: C.amber },
                        { name: 'Sofia Remi', rev: 8900, pct: 63, color: C.gold },
                      ].map(s => (
                        <div key={s.name} style={{ marginBottom: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                            <span style={{ fontSize: 12, color: C.text2 }}>{s.name}</span>
                            <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: C.text }}>{s.rev.toLocaleString('fr-FR')} €</span>
                          </div>
                          <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${s.pct}%`, background: s.color, borderRadius: 2, transition: 'width 0.8s ease' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right col */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* AI Insights */}
                  <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>Insights IA</span>
                      </div>
                      <button onClick={() => setShowChat(true)} style={{ fontSize: 11, color: C.green, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)' }}>Demander à l'IA →</button>
                    </div>
                    {insights.slice(0, 4).map(ins => (
                      <InsightCard key={ins.id} insight={ins} onAction={(ins) => { setShowChat(true); }} />
                    ))}
                  </div>

                  {/* Occupancy ring */}
                  <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold }} />
                      <span style={{ fontSize: 13, fontWeight: 500 }}>Occupation aujourd'hui</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ position: 'relative', width: 70, height: 70 }}>
                        <svg width="70" height="70" viewBox="0 0 70 70" style={{ transform: 'rotate(-90deg)' }}>
                          <circle cx="35" cy="35" r="28" fill="none" stroke={C.bg3} strokeWidth="6" />
                          <circle cx="35" cy="35" r="28" fill="none" stroke={C.green} strokeWidth="6" strokeDasharray="176" strokeDashoffset="25" strokeLinecap="round" />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                          <div style={{ fontFamily: 'var(--display)', fontSize: 18, fontWeight: 500 }}>86%</div>
                        </div>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {[['Terminés', 14, C.green], ['En cours', 10, C.amber], ['Libres', 4, C.bg3]].map(([l, v, c]) => (
                          <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: C.text3 }}>
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: c, display: 'inline-block' }} />{l}
                            </span>
                            <span style={{ color: C.text, fontFamily: 'var(--mono)', fontWeight: 500 }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CLIENTS TAB */}
          {activeTab === 'clients' && !selectedClientId && (
            <div className="fade-up">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
                <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)' }}>
                  <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Base clients ({clients.length})</div>
                    <div style={{ fontSize: 12, color: C.red }}>↓ {clients.filter(c => c.churnRisk === 'high' || c.churnRisk === 'critical').length} à risque</div>
                  </div>
                  {clients.map(c => <ClientRow key={c.id} client={c} onAnalyze={handleAnalyzeClient} onViewProfile={(cl) => setSelectedClientId(cl.id)} />)}
                </div>

                <div>
                  {checkoutResult && (
                    <div style={{ background: C.bg2, border: `1px solid ${C.border2}`, borderRadius: 'var(--radius-lg)', padding: 16, animation: 'fadeUp 0.4s ease both' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12, color: C.green }}>
                        Analyse IA — {checkoutResult.client?.name}
                      </div>
                      {checkoutResult.loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text3, fontSize: 13 }}>
                          <div className="spinner green" style={{ width: 16, height: 16 }} /> Analyse en cours…
                        </div>
                      ) : checkoutResult.error ? (
                        <div style={{ color: C.red, fontSize: 13 }}>Erreur d'analyse</div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          <div style={{ background: C.greenDim, border: `1px solid ${C.border2}`, borderRadius: 10, padding: 12 }}>
                            <div style={{ fontSize: 11, color: C.green, marginBottom: 4 }}>Offre fidélité suggérée</div>
                            <div style={{ fontSize: 13, color: C.text }}>{checkoutResult.offerText}</div>
                            {checkoutResult.discountPercent > 0 && <div style={{ fontSize: 12, color: C.amber, marginTop: 4 }}>Remise : -{checkoutResult.discountPercent}%</div>}
                          </div>
                          <div style={{ background: C.bg3, borderRadius: 10, padding: 12 }}>
                            <div style={{ fontSize: 11, color: C.text3, marginBottom: 4 }}>Message à la styliste</div>
                            <div style={{ fontSize: 12, color: C.text2 }}>{checkoutResult.messageToCashier}</div>
                          </div>
                          <div style={{ fontSize: 12, color: C.text3 }}>
                            Service suggéré : <span style={{ color: C.green }}>{checkoutResult.nextServiceSuggestion}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AGENDA TAB */}
          {activeTab === 'agenda' && (
            <div className="fade-up" style={{ height: 'calc(100vh - 160px)' }}>
              <AgendaView />
            </div>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="fade-up">
              <StatsView />
            </div>
          )}

          {/* CLIENT PROFILE VIEW */}
          {activeTab === 'clients' && selectedClientId && (
            <div className="fade-up">
              <ClientProfile clientId={selectedClientId} onBack={() => setSelectedClientId(null)} />
            </div>
          )}
          {activeTab === 'campaigns' && (
            <div className="fade-up">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {[
                  { type: 'winback', title: 'Win-back clients inactifs', desc: 'Reconquérir les clients absents depuis 8+ semaines', color: C.red },
                  { type: 'flash', title: 'Offre flash créneaux vides', desc: 'Remplir automatiquement les créneaux du jeudi', color: C.amber },
                  { type: 'birthday', title: 'Offre anniversaire', desc: 'Surprendre les clients le mois de leur anniversaire', color: C.gold },
                  { type: 'loyalty', title: 'Récompense fidélité', desc: 'Remercier les clients après 10 visites', color: C.green },
                ].map(camp => (
                  <div key={camp.type} style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)', padding: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>{camp.title}</div>
                    <div style={{ fontSize: 12, color: C.text3, marginBottom: 16 }}>{camp.desc}</div>
                    <button onClick={() => handleGenerateCampaign(camp.type)} disabled={generatingCampaign} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
                      background: `${camp.color}20`, border: `1px solid ${camp.color}40`,
                      borderRadius: 10, color: camp.color, cursor: generatingCampaign ? 'not-allowed' : 'pointer',
                      fontSize: 12, fontFamily: 'var(--sans)', opacity: generatingCampaign ? 0.6 : 1, transition: 'all 0.15s'
                    }}>
                      {generatingCampaign ? <><div className="spinner" style={{ borderTopColor: camp.color, borderRightColor: camp.color, width: 12, height: 12 }} /> Génération IA…</> : '⬡ Générer avec IA'}
                    </button>
                  </div>
                ))}
              </div>

              {campaignResult && !campaignResult.error && (
                <div style={{ marginTop: 16, background: C.bg2, border: `1px solid ${C.border2}`, borderRadius: 'var(--radius-lg)', padding: 20, animation: 'fadeUp 0.4s ease both' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.green, marginBottom: 16 }}>✦ Campagne générée par IA</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div style={{ background: C.bg3, borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 11, color: C.text3, marginBottom: 6 }}>Objet email</div>
                      <div style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{campaignResult.subject}</div>
                    </div>
                    <div style={{ background: C.bg3, borderRadius: 10, padding: 14 }}>
                      <div style={{ fontSize: 11, color: C.text3, marginBottom: 6 }}>SMS</div>
                      <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.5 }}>{campaignResult.sms}</div>
                    </div>
                  </div>
                  <div style={{ marginTop: 12, background: C.bg3, borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: 11, color: C.text3, marginBottom: 6 }}>Email HTML preview</div>
                    <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: campaignResult.emailHtml }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STATS TAB — remplace prediction */}
          {activeTab === 'stats' && (
            <div className="fade-up">
              <StatsView />
            </div>
          )}
        </div>
      </div>

      {/* AI Chat Panel */}
      {showChat && (
        <>
          <div onClick={() => setShowChat(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 150, backdropFilter: 'blur(4px)', animation: 'fadeIn 0.3s ease both' }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: 380, zIndex: 200, padding: 16, display: 'flex', flexDirection: 'column', animation: 'slideRight 0.3s ease both' }}>
            <AIChat
              theme="owner"
              style={{ flex: 1, height: '100%' }}
              onClose={() => setShowChat(false)}
              placeholder="Demandez n'importe quoi sur votre salon…"
            />
          </div>
        </>
      )}

      {/* Toast notifications */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
