export const salonData = {
  name: "Atelier Lumière",
  owner: "Sarah Moreau",
  address: "14 rue de la Paix, 75002 Paris",
  phone: "+33 1 42 60 11 22",
  currency: "€",
  workingHours: { start: 9, end: 19 },
};

export const stylists = [
  { id: "s1", name: "Emma Aubert", avatar: "EA", color: "#4eca7e", specialties: ["Couleur", "Balayage", "Coupe"], rating: 4.9, appointmentsToday: 6, revenueMonth: 12840 },
  { id: "s2", name: "James Martin", avatar: "JM", color: "#f0a500", specialties: ["Coupe Homme", "Barbe", "Décoloration"], rating: 4.8, appointmentsToday: 5, revenueMonth: 10200 },
  { id: "s3", name: "Sofia Remi", avatar: "SR", color: "#c9a84c", specialties: ["Kératine", "Soins", "Lissage"], rating: 4.7, appointmentsToday: 4, revenueMonth: 8900 },
  { id: "s4", name: "Kai Torres", avatar: "KT", color: "#e05555", specialties: ["Tendances", "Créatif", "Balayage"], rating: 4.9, appointmentsToday: 7, revenueMonth: 14200 },
];

export const services = [
  { id: "svc1", name: "Coupe Femme", duration: 45, price: 55, category: "Coupe" },
  { id: "svc2", name: "Coupe Homme", duration: 30, price: 35, category: "Coupe" },
  { id: "svc3", name: "Couleur complète", duration: 90, price: 95, category: "Couleur" },
  { id: "svc4", name: "Balayage", duration: 120, price: 130, category: "Couleur" },
  { id: "svc5", name: "Mèches", duration: 90, price: 110, category: "Couleur" },
  { id: "svc6", name: "Brushing", duration: 45, price: 45, category: "Coiffage" },
  { id: "svc7", name: "Kératine", duration: 150, price: 180, category: "Soin" },
  { id: "svc8", name: "Soin profond", duration: 30, price: 35, category: "Soin" },
  { id: "svc9", name: "Coupe + Brushing", duration: 75, price: 85, category: "Pack" },
  { id: "svc10", name: "Balayage + Coupe", duration: 150, price: 170, category: "Pack" },
];

export const clients = [
  { id: "c1", name: "Sophie Laurent", email: "sophie.l@gmail.com", phone: "06 12 34 56 78", avatar: "SL", totalVisits: 24, lastVisit: "2026-03-10", totalSpent: 2160, favoriteService: "Balayage", preferredStylist: "s1", loyaltyPoints: 216, churnRisk: "low", notes: "Préfère les rendez-vous le matin. Allergique au latex." },
  { id: "c2", name: "Anna Kowalski", email: "anna.k@outlook.com", phone: "06 98 76 54 32", avatar: "AK", totalVisits: 8, lastVisit: "2026-01-15", totalSpent: 680, favoriteService: "Couleur complète", preferredStylist: "s2", loyaltyPoints: 68, churnRisk: "high", notes: "Cliente depuis 1 an. N'a pas rerebooké depuis 10 semaines." },
  { id: "c3", name: "Maria Chen", email: "maria.chen@icloud.com", phone: "07 11 22 33 44", avatar: "MC", totalVisits: 31, lastVisit: "2026-03-20", totalSpent: 3410, favoriteService: "Kératine", preferredStylist: "s3", loyaltyPoints: 341, churnRisk: "low", notes: "VIP — cliente fidèle depuis 3 ans. Recommande souvent." },
  { id: "c4", name: "Tom Williams", email: "t.williams@gmail.com", phone: "06 55 44 33 22", avatar: "TW", totalVisits: 2, lastVisit: "2026-03-15", totalSpent: 100, favoriteService: "Coupe Homme", preferredStylist: "s2", loyaltyPoints: 10, churnRisk: "medium", notes: "Nouveau client. Venu 2 fois. Pas encore rebooké." },
  { id: "c5", name: "Zara Obi", email: "zara.o@yahoo.fr", phone: "06 77 88 99 00", avatar: "ZO", totalVisits: 18, lastVisit: "2026-03-25", totalSpent: 1890, favoriteService: "Coupe Femme", preferredStylist: "s4", loyaltyPoints: 189, churnRisk: "low", notes: "Très active sur Instagram. Partage souvent ses résultats." },
  { id: "c6", name: "Isabelle Dupont", email: "isa.dupont@sfr.fr", phone: "06 23 45 67 89", avatar: "ID", totalVisits: 12, lastVisit: "2025-12-20", totalSpent: 960, favoriteService: "Balayage", preferredStylist: "s1", loyaltyPoints: 96, churnRisk: "critical", notes: "N'est pas revenue depuis plus de 3 mois. Risque élevé." },
];

export const appointments = [
  { id: "a1", clientId: "c5", stylistId: "s4", serviceId: "svc1", date: "2026-03-27", time: "09:00", status: "confirmed", price: 55 },
  { id: "a2", clientId: "c4", stylistId: "s2", serviceId: "svc2", date: "2026-03-27", time: "09:00", status: "confirmed", price: 35 },
  { id: "a3", clientId: "c3", stylistId: "s3", serviceId: "svc7", date: "2026-03-27", time: "09:30", status: "in-progress", price: 180 },
  { id: "a4", clientId: "c1", stylistId: "s1", serviceId: "svc4", date: "2026-03-27", time: "09:00", status: "completed", price: 130 },
  { id: "a5", clientId: "c2", stylistId: "s2", serviceId: "svc3", date: "2026-03-27", time: "10:30", status: "confirmed", price: 95 },
];

export const kpis = {
  revenueToday: 2847,
  revenueWeek: 14820,
  revenueMonth: 48600,
  revenueTarget: 55000,
  appointmentsToday: 24,
  appointmentsCapacity: 28,
  occupancyRate: 85.7,
  activeClients: 1284,
  newClientsWeek: 7,
  churnRiskCount: 12,
  avgBasket: 118,
  rebookingRate: 67,
  revenueGrowth: 18.3,
  weeklyRevenue: [1820, 2400, 1650, 1290, 2847, 0, 0],
};

export const campaigns = [
  { id: "camp1", name: "Win-back VIPs inactifs", status: "active", targets: 42, openRate: 28, revenueRecovered: 840, type: "winback" },
  { id: "camp2", name: "Offre flash jeudi 14h-16h", status: "draft", targets: 18, openRate: 0, revenueRecovered: 0, type: "flash" },
  { id: "camp3", name: "Spécial anniversaire du mois", status: "active", targets: 8, openRate: 91, revenueRecovered: 620, type: "birthday" },
];

export const aiInsights = [
  { id: "i1", type: "alert", priority: "high", title: "3 clientes VIP absentes depuis 8+ semaines", detail: "Sophie T., Maria K. et Isabelle D. n'ont pas rebooké. Valeur moyenne : 420€/visite.", action: "Envoyer campagne win-back" },
  { id: "i2", type: "opportunity", priority: "medium", title: "Jeudi 14h–16h systématiquement vide", detail: "4 dernières semaines consécutives. Perte estimée : 280€ de CA par semaine.", action: "Créer offre flash automatique" },
  { id: "i3", type: "performance", priority: "low", title: "Emma A. est votre meilleure styliste ce mois", detail: "12 840€ de CA — 23% au-dessus de la moyenne équipe. Taux de rebooking : 82%.", action: "Voir le rapport complet" },
  { id: "i4", type: "alert", priority: "high", title: "Anna K. est à risque de départ ce soir", detail: "Sa dernière visite date de 10 semaines. Elle repart sans rebooking 80% du temps.", action: "Préparer offre loyauté pour le checkout" },
];

// ─── DONNÉES FINANCIÈRES ─────────────────────────────────────────────────────

/** Charges mensuelles détaillées (réalistes pour un salon 4 stylistes, Paris 2ème) */
export const expenses = {
  current: {
    loyer: 3500,           // Loyer + charges locatives, Paris intramuros
    salaires: 15200,       // Salaires bruts 4 stylistes (base + variable)
    chargesSociales: 6840, // Charges patronales ~45% des salaires bruts
    produits: 3200,        // Produits capillaires, fournitures, consommables
    marketing: 800,        // Publicité réseaux sociaux, Google Ads, flyers
    assurances: 420,       // RC Pro, multirisque, prévoyance
    divers: 640,           // Maintenance, logiciels, abonnements, divers
    total: 30600,          // ∑ = seuil de rentabilité mensuel
  },
  /** Historique 6 mois pour analyse des tendances */
  history: [
    { month: "Oct", loyer: 3500, salaires: 14800, chargesSociales: 6660, produits: 2900, marketing: 700, assurances: 420, divers: 580, total: 29560 },
    { month: "Nov", loyer: 3500, salaires: 14800, chargesSociales: 6660, produits: 3100, marketing: 750, assurances: 420, divers: 610, total: 29840 },
    { month: "Déc", loyer: 3500, salaires: 16200, chargesSociales: 7290, produits: 4100, marketing: 1200, assurances: 420, divers: 800, total: 33510 },
    { month: "Jan", loyer: 3500, salaires: 14800, chargesSociales: 6660, produits: 2700, marketing: 650, assurances: 420, divers: 540, total: 29270 },
    { month: "Fév", loyer: 3500, salaires: 15000, chargesSociales: 6750, produits: 2950, marketing: 750, assurances: 420, divers: 590, total: 29960 },
    { month: "Mar", loyer: 3500, salaires: 15200, chargesSociales: 6840, produits: 3200, marketing: 800, assurances: 420, divers: 640, total: 30600 },
  ],
};

/** Compte de résultat mensuel sur 6 mois */
export const financials = [
  { month: "Oct", revenue: 38400, expenses: 29560, grossMargin: 8840,  marginPct: 23, cumulative: 8840  },
  { month: "Nov", revenue: 41200, expenses: 29840, grossMargin: 11360, marginPct: 27.6, cumulative: 20200 },
  { month: "Déc", revenue: 52800, expenses: 33510, grossMargin: 19290, marginPct: 36.5, cumulative: 39490 },
  { month: "Jan", revenue: 35600, expenses: 29270, grossMargin: 6330,  marginPct: 17.8, cumulative: 45820 },
  { month: "Fév", revenue: 40100, expenses: 29960, grossMargin: 10140, marginPct: 25.3, cumulative: 55960 },
  { month: "Mar", revenue: 48600, expenses: 30600, grossMargin: 18000, marginPct: 37, cumulative: 73960 },
];

/** Performance individuelle des stylistes — KPIs business et finance */
export const stylistMetrics = [
  { id: "s1", name: "Emma Aubert",  avatar: "EA", color: "#4eca7e", hoursMonth: 152, revenueMonth: 12840, revenuePerHour: 84.5, rebookingRate: 82, clientsServed: 78,  avgBasket: 165, bonusTarget: 14000, bonusAchievedPct: 91.7, satisfactionScore: 4.9 },
  { id: "s2", name: "James Martin", avatar: "JM", color: "#f0a500", hoursMonth: 144, revenueMonth: 10200, revenuePerHour: 70.8, rebookingRate: 74, clientsServed: 65,  avgBasket: 157, bonusTarget: 12000, bonusAchievedPct: 85, satisfactionScore: 4.8 },
  { id: "s3", name: "Sofia Remi",   avatar: "SR", color: "#c9a84c", hoursMonth: 148, revenueMonth: 8900,  revenuePerHour: 60.1, rebookingRate: 71, clientsServed: 58,  avgBasket: 153, bonusTarget: 11000, bonusAchievedPct: 80.9, satisfactionScore: 4.7 },
  { id: "s4", name: "Kai Torres",   avatar: "KT", color: "#e05555", hoursMonth: 156, revenueMonth: 14200, revenuePerHour: 91, rebookingRate: 86, clientsServed: 84,  avgBasket: 169, bonusTarget: 14000, bonusAchievedPct: 101.4, satisfactionScore: 4.9 },
];

// ─── AVIS & FIDÉLITÉ ─────────────────────────────────────────────────────────

/** Avis clients vérifiés après prestation */
export const reviews = [
  { id: "r1", clientId: "c3", clientName: "Maria Chen",    avatar: "MC", stylistId: "s3", stylistName: "Sofia Remi",   serviceId: "svc7", date: "2026-03-20", rating: 5, comment: "Sofia est exceptionnelle — ma kératine dure 4 mois. Résultat parfait !", published: true },
  { id: "r2", clientId: "c1", clientName: "Sophie Laurent", avatar: "SL", stylistId: "s1", stylistName: "Emma Aubert",  serviceId: "svc4", date: "2026-03-10", rating: 5, comment: "Emma a transformé mes cheveux avec un balayage naturel magnifique. Cliente à vie !", published: true },
  { id: "r3", clientId: "c5", clientName: "Zara Obi",       avatar: "ZO", stylistId: "s4", stylistName: "Kai Torres",   serviceId: "svc1", date: "2026-03-25", rating: 5, comment: "Kai est créatif et à l'écoute. Tout le monde me demande où je me coiffe.", published: true },
  { id: "r4", clientId: "c4", clientName: "Tom Williams",   avatar: "TW", stylistId: "s2", stylistName: "James Martin", serviceId: "svc2", date: "2026-03-15", rating: 4, comment: "Très bonne coupe, ambiance agréable. Reviendrai sans hésiter.", published: true },
  { id: "r5", clientId: "c2", clientName: "Anna Kowalski",  avatar: "AK", stylistId: "s2", stylistName: "James Martin", serviceId: "svc3", date: "2026-01-15", rating: 4, comment: "Belle couleur, bon conseil sur la teinte. Satisfaite du résultat.", published: true },
  { id: "r6", clientId: "c3", clientName: "Maria Chen",    avatar: "MC", stylistId: "s3", stylistName: "Sofia Remi",   serviceId: "svc7", date: "2026-01-20", rating: 5, comment: "Fidèle depuis 3 ans — toujours impeccable. La meilleure adresse de Paris.", published: true },
  { id: "r7", clientId: "c1", clientName: "Sophie Laurent", avatar: "SL", stylistId: "s1", stylistName: "Emma Aubert",  serviceId: "svc9", date: "2026-02-18", rating: 5, comment: "Emma comprend exactement ce que je veux. Coupe + brushing parfaits.", published: true },
];

/** Paliers programme de fidélité */
export const loyaltyTiers = [
  { name: "Bronze", minPoints: 0,   maxPoints: 99,       color: "#c9a84c", perk: "1 point par euro dépensé" },
  { name: "Silver", minPoints: 100, maxPoints: 249,      color: "#9eb3c2", perk: "-5% sur les soins & traitements" },
  { name: "Gold",   minPoints: 250, maxPoints: 499,      color: "#f0a500", perk: "-10% + priorité créneaux + soin offert à l'anniversaire" },
  { name: "VIP",    minPoints: 500, maxPoints: Infinity,  color: "#e05555", perk: "-15% sur tout + service offert 1×/an + accès événements privés" },
];

// ─── ANALYTICS AVANCÉS ───────────────────────────────────────────────────────

/** Heatmap d'occupation : occupancy% par heure (9h–18h) × jour (Lun–Sam) */
export const heatmapData = {
  hours: ["9h", "10h", "11h", "12h", "13h", "14h", "15h", "16h", "17h", "18h"],
  days: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
  data: [
    [72, 85, 68, 42, 90, 98],   // 9h
    [68, 78, 72, 38, 88, 95],   // 10h
    [85, 90, 80, 45, 92, 100],  // 11h
    [60, 72, 65, 40, 85, 92],   // 12h
    [45, 55, 48, 32, 78, 88],   // 13h
    [78, 85, 70, 35, 88, 94],   // 14h
    [82, 90, 75, 38, 90, 96],   // 15h
    [75, 82, 72, 42, 85, 90],   // 16h
    [68, 75, 65, 35, 80, 85],   // 17h
    [40, 45, 38, 20, 60, 70],   // 18h
  ],
};

/** Rentabilité par prestation — marges nettes après produits + main d'œuvre */
export const serviceProfitability = [
  { id: "svc1",  name: "Coupe Femme",     category: "Coupe",    revenue: 9720,  sessions: 177, avgPrice: 55,  productCost: 2,  laborCost: 18, grossMarginPct: 63.6, trend: "+5%"  },
  { id: "svc2",  name: "Coupe Homme",     category: "Coupe",    revenue: 3395,  sessions: 97,  avgPrice: 35,  productCost: 1,  laborCost: 12, grossMarginPct: 62.9, trend: "-2%"  },
  { id: "svc3",  name: "Couleur complète",category: "Couleur",  revenue: 10692, sessions: 113, avgPrice: 95,  productCost: 18, laborCost: 38, grossMarginPct: 41.1, trend: "+3%"  },
  { id: "svc4",  name: "Balayage",        category: "Couleur",  revenue: 13608, sessions: 105, avgPrice: 130, productCost: 22, laborCost: 48, grossMarginPct: 46.2, trend: "+8%"  },
  { id: "svc6",  name: "Brushing",        category: "Coiffage", revenue: 4860,  sessions: 108, avgPrice: 45,  productCost: 3,  laborCost: 14, grossMarginPct: 62.2, trend: "0%"   },
  { id: "svc7",  name: "Kératine",        category: "Soin",     revenue: 7290,  sessions: 41,  avgPrice: 180, productCost: 45, laborCost: 62, grossMarginPct: 40.6, trend: "+12%" },
  { id: "svc8",  name: "Soin profond",    category: "Soin",     revenue: 2430,  sessions: 69,  avgPrice: 35,  productCost: 8,  laborCost: 12, grossMarginPct: 42.9, trend: "+4%"  },
  { id: "svc10", name: "Balayage + Coupe",category: "Pack",     revenue: 5950,  sessions: 35,  avgPrice: 170, productCost: 24, laborCost: 55, grossMarginPct: 53.5, trend: "+15%" },
];

/** Trésorerie mensuelle — historique + prévision 3 mois */
export const cashFlowData = [
  { month: "Oct", opening: 38200, revenue: 38400, fixedCosts: 26660, variableCosts: 2900,  net:  8840, closing:  47040, forecast: false },
  { month: "Nov", opening: 47040, revenue: 41200, fixedCosts: 26660, variableCosts: 3180,  net: 11360, closing:  58400, forecast: false },
  { month: "Déc", opening: 58400, revenue: 52800, fixedCosts: 26660, variableCosts: 6850,  net: 19290, closing:  79240, forecast: false },
  { month: "Jan", opening: 79240, revenue: 35600, fixedCosts: 26660, variableCosts: 2610,  net:  6330, closing:  85570, forecast: false },
  { month: "Fév", opening: 85570, revenue: 40100, fixedCosts: 26660, variableCosts: 3300,  net: 10140, closing:  95710, forecast: false },
  { month: "Mar", opening: 95710, revenue: 48600, fixedCosts: 26660, variableCosts: 3940,  net: 18000, closing: 113710, forecast: false },
  { month: "Avr", opening: 113710, revenue: 46000, fixedCosts: 26660, variableCosts: 3700, net: 15640, closing: 129350, forecast: true  },
  { month: "Mai", opening: 129350, revenue: 50000, fixedCosts: 26660, variableCosts: 4000, net: 19340, closing: 148690, forecast: true  },
  { month: "Jun", opening: 148690, revenue: 55000, fixedCosts: 26660, variableCosts: 4400, net: 23940, closing: 172630, forecast: true  },
];
