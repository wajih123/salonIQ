import Anthropic from "@anthropic-ai/sdk";
import { salonData, stylists, services, clients, kpis, appointments, aiInsights } from "../data/salon.js";

const anthropic = new Anthropic();

const OWNER_SYSTEM_PROMPT = `Tu es SalonIQ AI, le copilote intelligent du salon "${salonData.name}" géré par ${salonData.owner}.

Tu es un expert en gestion de salon de coiffure avec accès aux données en temps réel du salon.

DONNÉES ACTUELLES DU SALON :
- CA aujourd'hui : ${kpis.revenueToday}€ (croissance +${kpis.revenueGrowth}% vs semaine dernière)
- Rendez-vous aujourd'hui : ${kpis.appointmentsToday}/${kpis.appointmentsCapacity} (taux d'occupation : ${kpis.occupancyRate}%)
- Clients actifs : ${kpis.activeClients} (dont ${kpis.churnRiskCount} à risque de départ)
- CA mensuel : ${kpis.revenueMonth}€ / objectif ${kpis.revenueTarget}€
- Stylistes : ${stylists.map(s => `${s.name} (${s.revenueMonth}€ ce mois)`).join(", ")}

INSIGHTS ACTUELS :
${aiInsights.map(i => `- [${i.priority.toUpperCase()}] ${i.title}: ${i.detail}`).join("\n")}

CLIENTS À RISQUE :
${clients.filter(c => c.churnRisk === "high" || c.churnRisk === "critical").map(c => `- ${c.name}: ${c.notes}`).join("\n")}

RÈGLES :
- Réponds toujours en français
- Sois direct, concis et actionnable (max 3 phrases pour les réponses simples)
- Quand tu proposes une action, donne les étapes concrètes
- Utilise les données réelles du salon dans tes réponses
- Tu peux générer des messages SMS/email pour les clients si demandé
- Format : pas de markdown lourd, texte fluide
- Ton : professionnel mais chaleureux, comme un vrai consultant`;

const CLIENT_SYSTEM_PROMPT = `Tu es l'assistant de réservation du salon "${salonData.name}", un salon de coiffure premium à Paris.

Tu aides les clients à :
- Choisir la prestation idéale selon leurs besoins
- Trouver le bon créneau et la bonne styliste
- Répondre à leurs questions sur les services et prix
- Préparer leur visite

SERVICES DISPONIBLES :
${services.map(s => `- ${s.name} : ${s.duration}min, ${s.price}€`).join("\n")}

STYLISTES :
${stylists.map(s => `- ${s.name} : spécialités ${s.specialties.join(", ")}, note ${s.rating}/5`).join("\n")}

HORAIRES : Du lundi au samedi, 9h à 19h

RÈGLES :
- Réponds toujours en français
- Sois chaleureux, accessible et enthousiaste
- Guide subtilement vers les services premium adaptés
- Si le client hésite, pose des questions sur ses cheveux/besoins
- Propose toujours un créneau spécifique
- Rassure sur la qualité et l'expertise de l'équipe
- Ton : comme une amie qui connaît bien le salon`;

export async function chatWithOwnerAI(messages) {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system: OWNER_SYSTEM_PROMPT,
    messages: messages,
  });
  return response.content[0].text;
}

export async function chatWithClientAI(messages) {
  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    system: CLIENT_SYSTEM_PROMPT,
    messages: messages,
  });
  return response.content[0].text;
}

export async function generateCampaign(type, targetClients) {
  const prompt = `Génère une campagne SMS/email pour le salon ${salonData.name}.
Type : ${type}
Clients cibles : ${targetClients.map(c => c.name).join(", ")}
Contexte : ${type === "winback" ? "Ces clients ne sont pas revenus depuis 8+ semaines" : type === "flash" ? "Offre spéciale pour remplir les créneaux du jeudi" : "Offre anniversaire personnalisée"}

Génère :
1. Un objet email accrocheur (max 50 caractères)
2. Un message SMS court (max 160 caractères) 
3. Un corps d'email HTML court et élégant (5-8 lignes max)

Réponds en JSON strict : { "subject": "...", "sms": "...", "emailHtml": "..." }`;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  try {
    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { subject: "Offre spéciale pour vous", sms: "Bonjour ! Votre salon vous manque. Réservez maintenant avec -20%.", emailHtml: "<p>Offre générée.</p>" };
  }
}

export async function analyzeClientForCheckout(clientId) {
  const client = clients.find(c => c.id === clientId);
  if (!client) return null;

  const prompt = `Analyse cette cliente et génère une offre de fidélisation pour le checkout.

Cliente : ${client.name}
Visites totales : ${client.totalVisits}
Dernier RDV : ${client.lastVisit}
CA total : ${client.totalSpent}€
Service favori : ${client.favoriteService}
Risque de départ : ${client.churnRisk}
Notes : ${client.notes}

Génère en JSON : { "offerText": "texte court de l'offre à montrer à la styliste (max 2 phrases)", "discountPercent": nombre entre 0 et 20, "nextServiceSuggestion": "nom du service suggéré", "messageToCashier": "conseil pour la styliste au moment du checkout" }`;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 512,
    messages: [{ role: "user", content: prompt }],
  });

  try {
    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { offerText: "Offre fidélité -10% sur votre prochaine visite", discountPercent: 10, nextServiceSuggestion: client.favoriteService, messageToCashier: "Proposez le rebooking immédiat." };
  }
}

export async function predictRevenue(horizon = 30) {
  const prompt = `Basé sur les données du salon, génère une prédiction de revenus.

Données actuelles :
- CA aujourd'hui : ${kpis.revenueToday}€
- CA semaine : ${kpis.revenueWeek}€  
- CA mois : ${kpis.revenueMonth}€
- Objectif mois : ${kpis.revenueTarget}€
- Taux d'occupation : ${kpis.occupancyRate}%
- Clients actifs : ${kpis.activeClients}
- Clients à risque : ${kpis.churnRiskCount}
- Croissance : +${kpis.revenueGrowth}%

Génère une prédiction sur ${horizon} jours en JSON :
{ "predictedRevenue": nombre, "confidence": "low|medium|high", "mainRisk": "phrase courte", "mainOpportunity": "phrase courte", "dailyEstimates": [tableau de ${horizon} nombres représentant le CA quotidien estimé] }`;

  const response = await anthropic.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  try {
    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { predictedRevenue: 52000, confidence: "medium", mainRisk: "12 clients à risque de départ", mainOpportunity: "Créneaux jeudi sous-exploités", dailyEstimates: Array(horizon).fill(0).map(() => Math.floor(Math.random() * 1000 + 1500)) };
  }
}
