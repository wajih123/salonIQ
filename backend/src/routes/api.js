import express from "express";
import { chatWithOwnerAI, chatWithClientAI, generateCampaign, analyzeClientForCheckout, predictRevenue } from "../services/ai.js";
import { salonData, stylists, services, clients, appointments, kpis, campaigns, aiInsights, expenses, financials, stylistMetrics, reviews, loyaltyTiers, heatmapData, serviceProfitability, cashFlowData } from "../data/salon.js";

const router = express.Router();

// ─── DONNÉES ───────────────────────────────────────────────────────────────

router.get("/salon", (req, res) => res.json({ salon: salonData, kpis }));
router.get("/stylists", (req, res) => res.json(stylists));
router.get("/services", (req, res) => res.json(services));
router.get("/clients", (req, res) => res.json(clients));
router.get("/clients/:id", (req, res) => {
  const client = clients.find(c => c.id === req.params.id);
  client ? res.json(client) : res.status(404).json({ error: "Client not found" });
});
router.get("/appointments", (req, res) => res.json(appointments));
router.get("/campaigns", (req, res) => res.json(campaigns));
router.get("/insights", (req, res) => res.json(aiInsights));

// ─── FINANCE & PERFORMANCE ───────────────────────────────────────────────────

router.get("/finance", (req, res) => {
  const currentMonth = financials.at(-1);
  const prevMonth = financials.at(-2);
  const ytdRevenue = financials.reduce((s, m) => s + m.revenue, 0);
  const ytdProfit = financials.reduce((s, m) => s + m.grossMargin, 0);
  const ytdMarginPct = ((ytdProfit / ytdRevenue) * 100).toFixed(1);
  const revenueGrowthMoM = (((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1);
  const breakEvenDaily = Math.ceil(expenses.current.total / 26);

  res.json({
    expenses: expenses.current,
    expensesHistory: expenses.history,
    financials,
    summary: {
      ytdRevenue,
      ytdProfit,
      ytdMarginPct: Number.parseFloat(ytdMarginPct),
      currentMonthMargin: currentMonth.marginPct,
      revenueGrowthMoM: Number.parseFloat(revenueGrowthMoM),
      breakEvenMonthly: expenses.current.total,
      breakEvenDaily,
      revenueVsBreakEven: currentMonth.revenue - expenses.current.total,
    },
  });
});

router.get("/performance", (req, res) => {
  const totalRevenue = stylistMetrics.reduce((s, sm) => s + sm.revenueMonth, 0);
  const avgRevenuePerHour = (stylistMetrics.reduce((s, sm) => s + sm.revenuePerHour, 0) / stylistMetrics.length).toFixed(1);
  const avgRebooking = Math.round(stylistMetrics.reduce((s, sm) => s + sm.rebookingRate, 0) / stylistMetrics.length);
  res.json({
    stylists: stylistMetrics,
    teamSummary: {
      totalRevenue,
      avgRevenuePerHour: Number.parseFloat(avgRevenuePerHour),
      avgRebookingRate: avgRebooking,
      topPerformer: stylistMetrics.reduce((a, b) => a.revenueMonth > b.revenueMonth ? a : b, stylistMetrics[0]).name,
      totalClientsServed: stylistMetrics.reduce((s, sm) => s + sm.clientsServed, 0),
    },
  });
});

// ─── DISPONIBILITÉS BOOKING ──────────────────────────────────────────────

router.get("/availability", (req, res) => {
  const { date, serviceId, stylistId } = req.query;
  const service = services.find(s => s.id === serviceId);

  const slots = [];
  for (let h = 9; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 18 && m > 0) break;
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const busy = Math.random() < 0.35;
      if (!busy) {
        slots.push({ time, available: true, stylistId: stylistId || stylists[Math.floor(Math.random() * stylists.length)].id });
      }
    }
  }
  res.json({ date, slots, service });
});

// ─── IA PROPRIO ─────────────────────────────────────────────────────────────

router.post("/ai/owner/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const reply = await chatWithOwnerAI(messages);
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur IA", detail: err.message });
  }
});

router.post("/ai/generate-campaign", async (req, res) => {
  try {
    const { type, clientIds } = req.body;
    const targetClients = clients.filter(c => clientIds?.includes(c.id) || c.churnRisk === "high" || c.churnRisk === "critical");
    const campaign = await generateCampaign(type || "winback", targetClients);
    res.json(campaign);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/ai/checkout-analysis", async (req, res) => {
  try {
    const { clientId } = req.body;
    const analysis = await analyzeClientForCheckout(clientId);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/ai/predict-revenue", async (req, res) => {
  try {
    const prediction = await predictRevenue(30);
    res.json(prediction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── IA CLIENT ───────────────────────────────────────────────────────────────

router.post("/ai/client/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const reply = await chatWithClientAI(messages);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AVIS CLIENTS ────────────────────────────────────────────────────────────

router.get("/reviews", (req, res) => {
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const dist = [5, 4, 3, 2, 1].map(s => ({ stars: s, count: reviews.filter(r => r.rating === s).length }));
  res.json({ reviews, avgRating: Math.round(avg * 10) / 10, totalReviews: reviews.length, distribution: dist });
});

router.post("/reviews", (req, res) => {
  const { clientName, avatar, stylistId, stylistName, serviceId, rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "La note doit être entre 1 et 5" });
  }
  const review = {
    id: `r${Date.now()}`,
    clientName: clientName || "Client anonyme",
    avatar: avatar || "??",
    stylistId, stylistName, serviceId,
    date: new Date().toISOString().split("T")[0],
    rating, comment: comment || "",
    published: true,
  };
  res.json({ success: true, review });
});

// ─── FIDÉLITÉ CLIENT ─────────────────────────────────────────────────────────

router.get("/loyalty/:clientId", (req, res) => {
  const client = clients.find(c => c.id === req.params.clientId);
  if (!client) return res.status(404).json({ error: "Client introuvable" });
  const tier = loyaltyTiers.reduce((best, t) => (client.loyaltyPoints >= t.minPoints ? t : best), loyaltyTiers[0]);
  const nextTier = loyaltyTiers.find(t => t.minPoints > client.loyaltyPoints) || null;
  const pointsEarnedPerVisit = Math.round(client.totalSpent / client.totalVisits / 10);
  res.json({
    points: client.loyaltyPoints,
    tier,
    nextTier: nextTier ? { ...nextTier, pointsNeeded: nextTier.minPoints - client.loyaltyPoints } : null,
    pointsEarnedPerVisit,
    allTiers: loyaltyTiers,
  });
});

// ─── ANALYTICS AVANCÉS ───────────────────────────────────────────────────────

router.get("/analytics/heatmap", (req, res) => res.json(heatmapData));

router.get("/analytics/services", (req, res) => {
  const totalRevenue = serviceProfitability.reduce((s, sv) => s + sv.revenue, 0);
  const totalSessions = serviceProfitability.reduce((s, sv) => s + sv.sessions, 0);
  const avgMargin = (serviceProfitability.reduce((s, sv) => s + sv.grossMarginPct, 0) / serviceProfitability.length).toFixed(1);
  const enriched = serviceProfitability.map(sv => ({
    ...sv,
    revenuePct: Math.round((sv.revenue / totalRevenue) * 100),
    netMarginEur: Math.round(sv.avgPrice - sv.productCost - sv.laborCost),
  }));
  res.json({ services: enriched, totals: { revenue: totalRevenue, sessions: totalSessions, avgMarginPct: Number.parseFloat(avgMargin) } });
});

// ─── TRÉSORERIE ──────────────────────────────────────────────────────────────

router.get("/cashflow", (req, res) => {
  const history = cashFlowData.filter(m => !m.forecast);
  const forecast = cashFlowData.filter(m => m.forecast);
  const currentCash = history.at(-1).closing;
  const avgMonthlyNet = Math.round(history.reduce((s, m) => s + m.net, 0) / history.length);
  res.json({ cashFlow: cashFlowData, currentCash, avgMonthlyNet, forecastMonths: forecast.length });
});

// ─── BOOKING ─────────────────────────────────────────────────────────────────

router.post("/bookings", (req, res) => {
  const { clientName, clientPhone, serviceId, stylistId, date, time } = req.body;
  const service = services.find(s => s.id === serviceId);
  const stylist = stylists.find(s => s.id === stylistId);
  res.json({
    success: true,
    booking: { id: `booking_${Date.now()}`, clientName, clientPhone, service: service?.name, stylist: stylist?.name, date, time, confirmationCode: Math.random().toString(36).substring(2, 8).toUpperCase() }
  });
});

export default router;
