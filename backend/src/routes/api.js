import express from "express";
import { chatWithOwnerAI, chatWithClientAI, generateCampaign, analyzeClientForCheckout, predictRevenue } from "../services/ai.js";
import { salonData, stylists, services, clients, appointments, kpis, campaigns, aiInsights } from "../data/salon.js";

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

// ─── DISPONIBILITÉS BOOKING ──────────────────────────────────────────────

router.get("/availability", (req, res) => {
  const { date, serviceId, stylistId } = req.query;
  const service = services.find(s => s.id === serviceId);
  const duration = service?.duration || 60;

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
