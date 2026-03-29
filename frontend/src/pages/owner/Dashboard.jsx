import { useState, useEffect } from 'react';
import { fetchSalon, fetchInsights, fetchClients, generateCampaign, checkoutAnalysis, fetchFinance, fetchReviews } from '../../lib/api.js';
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
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [financeData, setFinanceData] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [clientSearch, setClientSearch] = useState('');
  const { notifs, toasts, unreadCount, markRead, markAllRead, dismissToast } = useNotifications();

  useEffect(() => {
    fetchSalon().then(setData);
    fetchInsights().then(setInsights);
    fetchClients().then(setClients);
    fetchFinance().then(setFinanceData).catch(() => {});
    fetchReviews().then(setReviewsData).catch(() => {});
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

  const kpis = data?.kpis;
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '◈' },
    { id: 'agenda', label: 'Agenda', icon: '◻' },
    { id: 'clients', label: 'Clients', icon: '◎' },
    { id: 'campaigns', label: 'Campagnes IA', icon: '◇' },
    { id: 'stats', label: 'Statistiques', icon: '◉' },
    { id: 'finance', label: 'Finance P&L', icon: '◑' },
    { id: 'reviews', label: 'Avis & NPS', icon: '★' },
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>
                <KPICard label="CA aujourd'hui" value={kpis?.revenueToday || 2847} unit="€" change="+18.3% vs ven. dernier" changeType="up" />
                <KPICard label="Rendez-vous" value={`${kpis?.appointmentsToday || 24}/${kpis?.appointmentsCapacity || 28}`} change={`${kpis?.occupancyRate || 85.7}% d'occupation`} changeType="neutral" />
                <KPICard label="Clients actifs" value={kpis?.activeClients || 1284} change={`+${kpis?.newClientsWeek || 7} cette semaine`} changeType="up" />
                <KPICard label="Risque départ" value={kpis?.churnRiskCount || 12} change="3 critiques · action requise" changeType="down" />
              </div>

              {/* Revenue goal tracker */}
              {(() => {
                const current = kpis?.revenueMonth || 48600;
                const target = kpis?.revenueTarget || 55000;
                const pct = Math.min(100, Math.round((current / target) * 100));
                const remaining = Math.max(0, target - current);
                const daysLeft = 4;
                const dailyNeeded = daysLeft > 0 ? Math.ceil(remaining / daysLeft) : 0;
                return (
                  <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)', padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ minWidth: 120 }}>
                      <div style={{ fontSize: 10, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Objectif mensuel</div>
                      {(() => {
                          const goalColor = pct >= 100 ? C.green : (pct >= 80 ? C.amber : C.red);
                          const barBg = pct >= 100 ? C.green : (pct >= 80 ? `linear-gradient(90deg, ${C.amber}, ${C.green})` : C.amber);
                          return (
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                              <span style={{ fontFamily: 'var(--display)', fontSize: 24, color: goalColor }}>{pct}%</span>
                              <span style={{ fontSize: 11, color: C.text3 }}>{current.toLocaleString('fr-FR')} / {target.toLocaleString('fr-FR')} €</span>
                            </div>
                          );
                        })()}
                    </div>
                    <div style={{ flex: 1 }}>
                      {(() => {
                        const barBg = pct >= 100 ? C.green : (pct >= 80 ? `linear-gradient(90deg, ${C.amber}, ${C.green})` : C.amber);
                        return (
                          <div style={{ height: 8, background: C.bg3, borderRadius: 100, overflow: 'hidden', marginBottom: 6 }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: barBg, borderRadius: 100, transition: 'width 1s ease' }} />
                          </div>
                        );
                      })()}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3 }}>
                        <span>{remaining > 0 ? `Il manque ${remaining.toLocaleString('fr-FR')} €` : '✓ Objectif atteint !'}</span>
                        <span>{daysLeft} jours restants · besoin de <span style={{ color: C.amber, fontFamily: 'var(--mono)' }}>{dailyNeeded.toLocaleString('fr-FR')} €/j</span></span>
                      </div>
                    </div>
                    {reviewsData && (
                      <div style={{ textAlign: 'center', minWidth: 80 }}>
                        <div style={{ fontFamily: 'var(--display)', fontSize: 26, color: C.gold, lineHeight: 1 }}>{reviewsData.avgRating}</div>
                        <div style={{ fontSize: 10, color: C.text3, marginTop: 3 }}>★ {reviewsData.totalReviews} avis</div>
                      </div>
                    )}
                  </div>
                );
              })()}

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
                  <div style={{ padding: '12px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Base clients ({clients.length})</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, maxWidth: 280 }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input
                          type="text"
                          placeholder="Rechercher un client…"
                          value={clientSearch}
                          onChange={e => setClientSearch(e.target.value)}
                          style={{
                            width: '100%', padding: '7px 12px 7px 30px', borderRadius: 8,
                            border: `1px solid ${clientSearch ? C.border2 : C.border}`,
                            background: C.bg3, color: C.text, fontSize: 12,
                            fontFamily: 'var(--sans)', outline: 'none', boxSizing: 'border-box'
                          }}
                        />
                        <svg style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      </div>
                      {clientSearch && <button onClick={() => setClientSearch('')} style={{ fontSize: 11, color: C.text3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', fontFamily: 'var(--sans)' }}>✕</button>}
                    </div>
                    <div style={{ fontSize: 12, color: C.red }}>↓ {clients.filter(c => c.churnRisk === 'high' || c.churnRisk === 'critical').length} à risque</div>
                  </div>
                  {clients
                    .filter(c => !clientSearch || c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.email.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch))
                    .map(c => <ClientRow key={c.id} client={c} onAnalyze={handleAnalyzeClient} onViewProfile={(cl) => setSelectedClientId(cl.id)} />)
                  }
                  {clientSearch && clients.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()) || c.email.toLowerCase().includes(clientSearch.toLowerCase()) || c.phone.includes(clientSearch)).length === 0 && (
                    <div style={{ padding: 24, textAlign: 'center', color: C.text3, fontSize: 13 }}>Aucun client ne correspond à "{clientSearch}"</div>
                  )}
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

          {/* FINANCE TAB */}
          {activeTab === 'finance' && (
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 400, color: C.text }}>Finance & Compte de Résultat</div>

              {/* Summary KPIs */}
              {financeData && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                    {[
                      { label: 'CA mensuel', value: `${financeData.financials[5].revenue.toLocaleString('fr-FR')} €`, change: `Obj. ${kpis?.revenueTarget?.toLocaleString('fr-FR')} €`, changeType: financeData.financials[5].revenue >= (kpis?.revenueTarget || 55000) ? 'up' : 'neutral' },
                      { label: 'Charges totales', value: `${financeData.expenses.total.toLocaleString('fr-FR')} €`, change: `Seuil rentabilité/mois`, changeType: 'neutral' },
                      { label: 'Résultat net', value: `${financeData.financials[5].grossMargin.toLocaleString('fr-FR')} €`, change: `Marge ${financeData.financials[5].marginPct}%`, changeType: 'up' },
                      { label: 'Résultat YTD', value: `${(financeData.summary.ytdProfit / 1000).toFixed(1)}k €`, change: `Marge moy. ${financeData.summary.ytdMarginPct}%`, changeType: 'up' },
                    ].map(k => <KPICard key={k.label} {...k} />)}
                  </div>

                  {/* P&L 6 months chart */}
                  <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>CA vs Charges vs Résultat — 6 mois</span>
                      </div>
                      <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: C.gold }}>YTD {(financeData.summary.ytdProfit / 1000).toFixed(1)}k € net</div>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                      {(() => {
                        const fin = financeData.financials;
                        const maxVal = Math.max(...fin.map(m => m.revenue));
                        return (
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 110 }}>
                            {fin.map((m, i) => (
                              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'flex-end', height: '100%', position: 'relative' }}>
                                  {/* Revenue bar */}
                                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${(m.revenue / maxVal) * 100}%`, background: i === 5 ? C.greenDim : 'rgba(30,43,39,0.5)', border: `1px solid ${i === 5 ? C.green : C.border}`, borderRadius: '3px 3px 0 0' }} />
                                  {/* Expenses bar */}
                                  <div style={{ position: 'absolute', bottom: 0, left: '15%', right: '15%', height: `${(m.expenses / maxVal) * 100}%`, background: 'rgba(224,85,85,0.15)', border: `1px solid rgba(224,85,85,0.3)`, borderRadius: '3px 3px 0 0' }} />
                                  {/* Profit bar */}
                                  <div style={{ position: 'absolute', bottom: 0, left: '30%', right: '30%', height: `${(m.grossMargin / maxVal) * 100}%`, background: 'rgba(201,168,76,0.25)', border: `1px solid ${C.gold}`, borderRadius: '3px 3px 0 0' }} />
                                </div>
                                <div style={{ fontSize: 10, color: i === 5 ? C.green : C.text3 }}>{m.month}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                        {[['CA', C.green], ['Charges', '#e05555'], ['Résultat net', C.gold]].map(([l, c]) => (
                          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: C.text3 }}>
                            <div style={{ width: 10, height: 4, borderRadius: 2, background: c, opacity: 0.7 }} />{l}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detail grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    {/* Expenses breakdown */}
                    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />
                        Détail charges — Mars 2026
                      </div>
                      <div style={{ padding: '14px 16px' }}>
                        {[
                          ['Salaires bruts', financeData.expenses.salaires, '#e05555'],
                          ['Charges sociales', financeData.expenses.chargesSociales, '#cc6655'],
                          ['Loyer + charges', financeData.expenses.loyer, C.amber],
                          ['Produits & fournitures', financeData.expenses.produits, C.gold],
                          ['Marketing', financeData.expenses.marketing, C.green],
                          ['Assurances & divers', financeData.expenses.assurances + financeData.expenses.divers, C.text3],
                        ].map(([label, val, color]) => {
                          const pct = ((val / financeData.expenses.total) * 100).toFixed(1);
                          return (
                            <div key={label} style={{ marginBottom: 11 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                                <span style={{ fontSize: 11, color: C.text2 }}>{label}</span>
                                <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: C.text }}>{val.toLocaleString('fr-FR')} € <span style={{ color: C.text3 }}>({pct}%)</span></span>
                              </div>
                              <div style={{ height: 3, background: C.bg3, borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: color, opacity: 0.75, borderRadius: 2, transition: 'width 1s ease' }} />
                              </div>
                            </div>
                          );
                        })}
                        <div style={{ paddingTop: 10, borderTop: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>Total</span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 14, color: C.red, fontWeight: 600 }}>{financeData.expenses.total.toLocaleString('fr-FR')} €</span>
                        </div>
                      </div>
                    </div>

                    {/* Break-even */}
                    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)' }}>
                      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber }} />
                        Analyse seuil de rentabilité
                      </div>
                      <div style={{ padding: '16px' }}>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ fontSize: 10, color: C.text3, marginBottom: 2 }}>Seuil mensuel</div>
                          <div style={{ fontFamily: 'var(--display)', fontSize: 34, color: C.amber }}>{financeData.summary.breakEvenMonthly.toLocaleString('fr-FR')} €</div>
                          <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>soit {financeData.summary.breakEvenDaily} €/jour</div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span style={{ fontSize: 11, color: C.text3 }}>CA atteint vs seuil</span>
                            <span style={{ fontSize: 11, fontFamily: 'var(--mono)', color: C.green, fontWeight: 500 }}>{Math.round((financeData.financials[5].revenue / financeData.summary.breakEvenMonthly) * 100)}%</span>
                          </div>
                          <div style={{ height: 10, background: C.bg3, borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${Math.min(100, (financeData.financials[5].revenue / financeData.summary.breakEvenMonthly) * 100)}%`, background: `linear-gradient(90deg, ${C.amber}, ${C.green})`, borderRadius: 100, transition: 'width 1.2s ease' }} />
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          {[
                            ['Excédent ce mois', `+${financeData.summary.revenueVsBreakEven.toLocaleString('fr-FR')} €`, C.green],
                            ['Croissance MoM', `+${financeData.summary.revenueGrowthMoM}%`, C.gold],
                            ['Marge nette Mars', `${financeData.financials[5].marginPct}%`, C.green],
                            ['Marge moy. 6M', `${financeData.summary.ytdMarginPct}%`, C.amber],
                          ].map(([l, v, c]) => (
                            <div key={l} style={{ background: C.bg3, borderRadius: 10, padding: '10px 12px' }}>
                              <div style={{ fontSize: 9, color: C.text3, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>{l}</div>
                              <div style={{ fontSize: 16, fontFamily: 'var(--display)', color: c }}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Finance Chat CTA */}
                  <div style={{ background: C.greenDim, border: `1px solid ${C.border2}`, borderRadius: 'var(--radius-lg)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.green, marginBottom: 4 }}>⬡ Demandez à SalonIQ AI</div>
                      <div style={{ fontSize: 12, color: C.text3 }}>
                        "Comment améliorer ma marge nette ?" · "Quel est mon ROI sur les campagnes ?" · "Où couper les charges ?"
                      </div>
                    </div>
                    <button onClick={() => setShowChat(true)} style={{ padding: '8px 16px', background: C.bg2, border: `1px solid ${C.border2}`, borderRadius: 10, color: C.green, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap' }}>
                      Ouvrir le copilote →
                    </button>
                  </div>
                </>
              )}
              {!financeData && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text3, fontSize: 13, padding: 20 }}>
                  <div className="spinner green" style={{ width: 16, height: 16 }} /> Chargement des données financières…
                </div>
              )}
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ fontFamily: 'var(--display)', fontSize: 20, fontWeight: 400, color: C.text }}>Avis & Satisfaction clients</div>

              {reviewsData ? (
                <>
                  {/* NPS / rating overview */}
                  <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>
                    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'var(--display)', fontSize: 56, color: C.gold, lineHeight: 1 }}>{reviewsData.avgRating}</div>
                      <div style={{ fontSize: 18, color: C.gold, margin: '6px 0 4px' }}>{'★'.repeat(Math.round(reviewsData.avgRating))}{'☆'.repeat(5 - Math.round(reviewsData.avgRating))}</div>
                      <div style={{ fontSize: 12, color: C.text3 }}>{reviewsData.totalReviews} avis vérifiés</div>
                      <div style={{ marginTop: 14, padding: '6px 14px', borderRadius: 100, background: `${C.green}20`, border: `1px solid ${C.green}40`, fontSize: 11, color: C.green }}>
                        NPS Score · +72 (Excellent)
                      </div>
                    </div>
                    <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)', padding: '20px 24px' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14, color: C.text }}>Distribution des notes</div>
                      {reviewsData.distribution.map(d => {
                        const pct = reviewsData.totalReviews > 0 ? Math.round((d.count / reviewsData.totalReviews) * 100) : 0;
                        return (
                          <div key={d.stars} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                            <span style={{ fontSize: 12, color: C.gold, minWidth: 14, textAlign: 'right' }}>{d.stars}</span>
                            <span style={{ color: C.gold, fontSize: 12 }}>★</span>
                            <div style={{ flex: 1, height: 8, background: C.bg3, borderRadius: 100, overflow: 'hidden' }}>
                              {(() => { const starColor = d.stars >= 4 ? C.green : (d.stars === 3 ? C.amber : C.red); return <div style={{ height: '100%', width: `${pct}%`, background: starColor, borderRadius: 100, transition: 'width 0.8s ease' }} />; })()}
                            </div>
                            <span style={{ fontSize: 11, color: C.text3, fontFamily: 'var(--mono)', minWidth: 28, textAlign: 'right' }}>{d.count}</span>
                            <span style={{ fontSize: 10, color: C.text3, minWidth: 28 }}>({pct}%)</span>
                          </div>
                        );
                      })}
                      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        {[
                          ['Promoteurs (5★)', `${reviewsData.distribution.find(d => d.stars === 5)?.count || 0}`, C.green],
                          ['Neutres (3-4★)', `${(reviewsData.distribution.find(d => d.stars === 4)?.count || 0) + (reviewsData.distribution.find(d => d.stars === 3)?.count || 0)}`, C.amber],
                          ['Détracteurs (1-2★)', `${(reviewsData.distribution.find(d => d.stars === 2)?.count || 0) + (reviewsData.distribution.find(d => d.stars === 1)?.count || 0)}`, C.red],
                        ].map(([l, v, c]) => (
                          <div key={l} style={{ background: C.bg3, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                            <div style={{ fontFamily: 'var(--display)', fontSize: 24, color: c }}>{v}</div>
                            <div style={{ fontSize: 10, color: C.text3, marginTop: 2 }}>{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reviews list */}
                  <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 'var(--radius-lg)' }}>
                    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.gold }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>Avis récents</span>
                      </div>
                      <span style={{ fontSize: 11, color: C.green }}>Tous publiés</span>
                    </div>
                    {reviewsData.reviews.map(r => (
                      <div key={r.id} style={{ padding: '16px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 14 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', flexShrink: 0, background: C.greenDim, border: `1px solid ${C.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, color: C.green }}>{r.avatar}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                            <div>
                              <span style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{r.clientName}</span>
                              <span style={{ fontSize: 11, color: C.text3, marginLeft: 10 }}>via {r.stylistName}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ color: C.gold, fontSize: 13 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                              <span style={{ fontSize: 10, color: C.text3, fontFamily: 'var(--mono)' }}>{r.date}</span>
                            </div>
                          </div>
                          <div style={{ fontSize: 13, color: C.text2, lineHeight: 1.5, fontStyle: 'italic' }}>"{r.comment}"</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI CTA */}
                  <div style={{ background: C.greenDim, border: `1px solid ${C.border2}`, borderRadius: 'var(--radius-lg)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: C.green, marginBottom: 4 }}>⬡ Analyse IA des avis</div>
                      <div style={{ fontSize: 12, color: C.text3 }}>Demandez "Quels points améliorer selon les avis ?" ou "Qui sont mes clientes les plus satisfaites ?"</div>
                    </div>
                    <button onClick={() => setShowChat(true)} style={{ padding: '8px 16px', background: C.bg2, border: `1px solid ${C.border2}`, borderRadius: 10, color: C.green, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap' }}>Analyser avec IA →</button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.text3, fontSize: 13, padding: 20 }}>
                  <div className="spinner green" style={{ width: 16, height: 16 }} /> Chargement des avis…
                </div>
              )}
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
