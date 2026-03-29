const BASE = '/api';

export async function fetchSalon() {
  const r = await fetch(`${BASE}/salon`); return r.json();
}
export async function fetchStylists() {
  const r = await fetch(`${BASE}/stylists`); return r.json();
}
export async function fetchServices() {
  const r = await fetch(`${BASE}/services`); return r.json();
}
export async function fetchClients() {
  const r = await fetch(`${BASE}/clients`); return r.json();
}
export async function fetchClient(id) {
  const r = await fetch(`${BASE}/clients/${id}`); return r.json();
}
export async function fetchInsights() {
  const r = await fetch(`${BASE}/insights`); return r.json();
}
export async function fetchCampaigns() {
  const r = await fetch(`${BASE}/campaigns`); return r.json();
}
export async function fetchAvailability(date, serviceId, stylistId) {
  const params = new URLSearchParams({ date, serviceId, stylistId: stylistId || '' });
  const r = await fetch(`${BASE}/availability?${params}`); return r.json();
}
export async function createBooking(data) {
  const r = await fetch(`${BASE}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return r.json();
}

// IA calls
export async function ownerChat(messages) {
  const r = await fetch(`${BASE}/ai/owner/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) });
  return r.json();
}
export async function clientChat(messages) {
  const r = await fetch(`${BASE}/ai/client/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) });
  return r.json();
}
export async function generateCampaign(type, clientIds) {
  const r = await fetch(`${BASE}/ai/generate-campaign`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, clientIds }) });
  return r.json();
}
export async function checkoutAnalysis(clientId) {
  const r = await fetch(`${BASE}/ai/checkout-analysis`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ clientId }) });
  return r.json();
}
export async function predictRevenue() {
  const r = await fetch(`${BASE}/ai/predict-revenue`); return r.json();
}
export async function fetchFinance() {
  const r = await fetch(`${BASE}/finance`); return r.json();
}
export async function fetchPerformance() {
  const r = await fetch(`${BASE}/performance`); return r.json();
}
export async function fetchReviews() {
  const r = await fetch(`${BASE}/reviews`); return r.json();
}
export async function submitReview(data) {
  const r = await fetch(`${BASE}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return r.json();
}
export async function fetchLoyalty(clientId) {
  const r = await fetch(`${BASE}/loyalty/${clientId}`); return r.json();
}
export async function fetchHeatmap() {
  const r = await fetch(`${BASE}/analytics/heatmap`); return r.json();
}
export async function fetchServiceProfitability() {
  const r = await fetch(`${BASE}/analytics/services`); return r.json();
}
export async function fetchCashFlow() {
  const r = await fetch(`${BASE}/cashflow`); return r.json();
}
