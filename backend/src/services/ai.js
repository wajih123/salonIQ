/**
 * SalonIQ AI Service — Powered by Groq (free tier) + Meta Llama 3.3 70B (open-source)
 *
 * Provider : Groq — API gratuite sur console.groq.com (~30 req/min, ~14 400 req/jour)
 * Modèle   : llama-3.3-70b-versatile (Meta, open-source, Apache 2.0)
 * Local    : Ollama supporté via OLLAMA_HOST (usage 100% offline/gratuit)
 *
 * Variables d'environnement :
 *   GROQ_API_KEY  — clé Groq gratuite (obligatoire sans Ollama)
 *   OLLAMA_HOST   — ex: http://localhost:11434  (active le mode local)
 *   OLLAMA_MODEL  — modèle Ollama (défaut: llama3.2)
 */

import Groq from "groq-sdk";
import { salonData, stylists, services, clients, kpis, aiInsights, expenses } from "../data/salon.js";

// ─── Provider init ────────────────────────────────────────────────────────────

const isOllama = !!process.env.OLLAMA_HOST;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2";
const GROQ_MODEL = "llama-3.3-70b-versatile";

let groqClient = null;
if (!isOllama) {
  if (!process.env.GROQ_API_KEY) {
    console.warn("[SalonIQ AI] ⚠  GROQ_API_KEY manquante. Démarrez avec GROQ_API_KEY=votre_cle");
    console.warn("[SalonIQ AI]    Clé gratuite sur https://console.groq.com");
    console.warn("[SalonIQ AI]    Ou activez Ollama local : OLLAMA_HOST=http://localhost:11434");
  }
  groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY || "missing" });
}

/**
 * Appel LLM unifié — Groq (cloud gratuit) ou Ollama (local)
 */
async function llmCall({ systemPrompt, messages, maxTokens = 1024, jsonMode = false }) {
  if (isOllama) {
    const body = {
      model: OLLAMA_MODEL,
      stream: false,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      ...(jsonMode ? { format: "json" } : {}),
    };
    const res = await fetch(`${process.env.OLLAMA_HOST}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
    const data = await res.json();
    return data.message?.content ?? "";
  }

  // Groq — OpenAI-compatible
  const params = {
    model: GROQ_MODEL,
    max_tokens: maxTokens,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  };
  if (jsonMode) params.response_format = { type: "json_object" };
  const response = await groqClient.chat.completions.create(params);
  return response.choices[0].message.content;
}

// ─── System prompts ───────────────────────────────────────────────────────────

const OWNER_SYSTEM_PROMPT = `Tu es SalonIQ AI, le copilote intelligent du salon "${salonData.name}" géré par ${salonData.owner}.

Tu combines trois expertises :
1. OPÉRATIONNEL : gestion salon, planification, équipe, clients
2. BUSINESS ANALYST : analyse data, tendances, optimisation CA, fidélisation
3. FINANCE : rentabilité, marges, charges, prévisions, seuil de rentabilité

DONNÉES OPÉRATIONNELLES TEMPS RÉEL :
- CA aujourd'hui : ${kpis.revenueToday}€ (+${kpis.revenueGrowth}% vs S-1)
- Rendez-vous : ${kpis.appointmentsToday}/${kpis.appointmentsCapacity} (occup. ${kpis.occupancyRate}%)
- Clients actifs : ${kpis.activeClients} | À risque : ${kpis.churnRiskCount}
- CA mensuel : ${kpis.revenueMonth}€ / objectif ${kpis.revenueTarget}€
- Panier moyen : ${kpis.avgBasket}€ | Rebooking : ${kpis.rebookingRate}%
- Stylistes : ${stylists.map(s => `${s.name} (${s.revenueMonth}€/mois)`).join(", ")}

DONNÉES FINANCIÈRES :
- Charges totales/mois : ${expenses.current.total}€
  · Loyer ${expenses.current.loyer}€ | Salaires ${expenses.current.salaires}€ | Charges sociales ${expenses.current.chargesSociales}€
  · Produits ${expenses.current.produits}€ | Marketing ${expenses.current.marketing}€ | Divers ${expenses.current.assurances + expenses.current.divers}€
- Résultat net ce mois : ${kpis.revenueMonth - expenses.current.total}€
- Marge nette : ${(((kpis.revenueMonth - expenses.current.total) / kpis.revenueMonth) * 100).toFixed(1)}%
- Seuil de rentabilité : ${expenses.current.total}€/mois

INSIGHTS ACTUELS :
${aiInsights.map(i => `- [${i.priority.toUpperCase()}] ${i.title}: ${i.detail}`).join("\n")}

CLIENTS À RISQUE :
${clients.filter(c => c.churnRisk === "high" || c.churnRisk === "critical").map(c => `- ${c.name}: ${c.notes}`).join("\n")}

RÈGLES : Réponds toujours en français. Direct et actionnable (3-4 phrases max). Chiffres précis. Ton : expert consultant, professionnel mais accessible.`;

const CLIENT_SYSTEM_PROMPT = `Tu es l'assistant de réservation du salon "${salonData.name}", un salon de coiffure premium à Paris.

Tu aides les clients à :
- Choisir la prestation idéale selon leurs besoins et leur type de cheveux
- Trouver le bon créneau et la bonne styliste
- Répondre à leurs questions sur les services, prix et l'équipe
- Préparer leur visite au salon

SERVICES DISPONIBLES :
${services.map(s => `- ${s.name} : ${s.duration}min, ${s.price}€`).join("\n")}

STYLISTES :
${stylists.map(s => `- ${s.name} : spécialités ${s.specialties.join(", ")}, note ${s.rating}/5`).join("\n")}

HORAIRES : Lundi au samedi, 9h à 19h | ADRESSE : ${salonData.address}

RÈGLES : Réponds toujours en français. Chaleureux et enthousiaste. Pose des questions sur les besoins. Propose créneau + styliste précis. Ton : amie experte du salon.`;

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function chatWithOwnerAI(messages) {
  return llmCall({ systemPrompt: OWNER_SYSTEM_PROMPT, messages, maxTokens: 1200 });
}

export async function chatWithClientAI(messages) {
  return llmCall({ systemPrompt: CLIENT_SYSTEM_PROMPT, messages, maxTokens: 1024 });
}

export async function generateCampaign(type, targetClients) {
  const typeContext = {
    winback: "Ces clients ne sont pas revenus depuis 8+ semaines. Reconquête avec offre irrésistible.",
    flash: "Offre urgente pour remplir les créneaux vides du jeudi 14h-16h. Délai : 48h.",
    birthday: "Offre anniversaire personnalisée. Le client doit se sentir unique.",
    loyalty: "Récompense fidélité après 10 visites. Renforcer l'attachement à long terme.",
  }[type] || "Offre de fidélisation générale.";

  const prompt = `Génère une campagne marketing pour le salon "${salonData.name}" (Paris, haut de gamme, panier moyen ${kpis.avgBasket}€).
Type : ${type} — ${typeContext}
Clients cibles : ${targetClients.map(c => c.name).join(", ")}

Génère un JSON avec exactement ces champs :
{
  "subject": "objet email accrocheur max 55 caractères",
  "sms": "SMS percutant max 160 caractères avec nom du salon",
  "emailHtml": "corps email HTML élégant 6-8 lignes, balises p et strong uniquement"
}
Réponds UNIQUEMENT avec le JSON.`;

  try {
    const text = await llmCall({
      systemPrompt: "Tu es expert marketing luxe. Réponds uniquement en JSON valide.",
      messages: [{ role: "user", content: prompt }],
      maxTokens: 1024,
      jsonMode: !isOllama,
    });
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    return {
      subject: `Offre exclusive — ${salonData.name}`,
      sms: `${salonData.name} vous réserve une surprise. Réservez : ${salonData.phone}`,
      emailHtml: `<p>Chère cliente,</p><p>Nous avons une offre exclusive pour vous.</p><p>Prenez rendez-vous au <strong>${salonData.phone}</strong>.</p><p><strong>L'équipe ${salonData.name}</strong></p>`,
    };
  }
}

export async function analyzeClientForCheckout(clientId) {
  const client = clients.find(c => c.id === clientId);
  if (!client) return null;

  const daysSinceLast = Math.floor((Date.now() - new Date(client.lastVisit).getTime()) / 86400000);
  const avgVisitValue = Math.round(client.totalSpent / client.totalVisits);

  const prompt = `Analyse ce profil client pour le checkout du salon "${salonData.name}".

${client.name} | ${client.totalVisits} visites | Dernière visite il y a ${daysSinceLast} jours
CA total : ${client.totalSpent}€ | Valeur moy/visite : ${avgVisitValue}€
Service favori : ${client.favoriteService} | Risque départ : ${client.churnRisk}
Notes : ${client.notes}

Génère un JSON :
{
  "offerText": "offre à voir par la styliste, max 2 phrases courtes",
  "discountPercent": nombre entier 0-20 (proportionnel au risque),
  "nextServiceSuggestion": "nom exact du service suggéré",
  "messageToCashier": "conseil stratégique checkout, max 2 phrases"
}
Réponds UNIQUEMENT avec le JSON.`;

  try {
    const text = await llmCall({
      systemPrompt: "Tu es expert en fidélisation client salon de coiffure. Réponds uniquement en JSON valide.",
      messages: [{ role: "user", content: prompt }],
      maxTokens: 512,
      jsonMode: !isOllama,
    });
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    const discount = { low: 0, medium: 5, high: 10, critical: 15 }[client.churnRisk] || 5;
    return {
      offerText: `Merci ${client.name.split(" ")[0]} ! Profitez de -${discount}% sur votre prochaine visite.`,
      discountPercent: discount,
      nextServiceSuggestion: client.favoriteService,
      messageToCashier: "Proposez le rebooking immédiat. Insistez sur la disponibilité de la styliste préférée.",
    };
  }
}

export async function predictRevenue(horizon = 30) {
  const currentMargin = (((kpis.revenueMonth - expenses.current.total) / kpis.revenueMonth) * 100).toFixed(1);
  const avgDailyRevenue = Math.round(kpis.revenueMonth / 26);

  const prompt = `Prévision financière sur ${horizon} jours pour le salon "${salonData.name}".

Données :
- CA moyen/jour : ${avgDailyRevenue}€ | Croissance : +${kpis.revenueGrowth}%
- Occupation : ${kpis.occupancyRate}% | Panier moyen : ${kpis.avgBasket}€ | Rebooking : ${kpis.rebookingRate}%
- Clients à risque : ${kpis.churnRiskCount} | Charges/mois : ${expenses.current.total}€ | Marge nette : ${currentMargin}%
- Objectif mensuel : ${kpis.revenueTarget}€

Génère un JSON :
{
  "predictedRevenue": CA prévu sur ${horizon} jours,
  "predictedNetProfit": bénéfice net estimé,
  "confidence": "low" ou "medium" ou "high",
  "mainRisk": "facteur de risque principal, une phrase courte",
  "mainOpportunity": "opportunité principale, une phrase courte",
  "dailyEstimates": [liste de exactement ${horizon} entiers, CA quotidien estimé]
}
Réponds UNIQUEMENT avec le JSON.`;

  try {
    const text = await llmCall({
      systemPrompt: "Tu es analyste financier spécialisé en retail beauté. Réponds uniquement en JSON valide.",
      messages: [{ role: "user", content: prompt }],
      maxTokens: 1500,
      jsonMode: !isOllama,
    });
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    if (!Array.isArray(parsed.dailyEstimates) || parsed.dailyEstimates.length < horizon) {
      parsed.dailyEstimates = new Array(horizon).fill(0).map((_, i) =>
        Math.floor(avgDailyRevenue * (0.82 + Math.random() * 0.38 + (i / horizon) * 0.12))
      );
    }
    return parsed;
  } catch {
    return {
      predictedRevenue: Math.round(avgDailyRevenue * horizon * 1.05),
      predictedNetProfit: Math.round((avgDailyRevenue * horizon * 1.05) - expenses.current.total),
      confidence: "medium",
      mainRisk: `${kpis.churnRiskCount} clients à risque — impact potentiel -${kpis.churnRiskCount * kpis.avgBasket}€`,
      mainOpportunity: "Créneaux jeudi sous-exploités : +4 RDV/sem = +1 900€/mois",
      dailyEstimates: new Array(horizon).fill(0).map(() =>
        Math.floor(avgDailyRevenue * (0.82 + Math.random() * 0.38))
      ),
    };
  }
}
