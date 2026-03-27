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
