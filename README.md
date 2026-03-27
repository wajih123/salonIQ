# SalonIQ — Intelligent Salon Management Platform

Application complète de gestion de salon avec IA intégrée côté client et propriétaire.

## Architecture

```
saloniq/
├── backend/               # Node.js + Express + Anthropic SDK
│   └── src/
│       ├── server.js      # Point d'entrée Express
│       ├── routes/api.js  # Toutes les routes REST
│       ├── services/ai.js # Intégration Anthropic (Claude)
│       └── data/salon.js  # Données mockées réalistes
│
└── frontend/              # React + Vite
    └── src/
        ├── pages/
        │   ├── Home.jsx              # Page d'accueil (choix rôle)
        │   ├── owner/Dashboard.jsx   # Dashboard propriétaire complet
        │   └── client/Booking.jsx    # Interface booking client
        ├── components/shared/
        │   └── AIChat.jsx            # Composant chat IA réutilisable
        └── lib/api.js                # Appels API frontend
```

## Fonctionnalités IA

### Côté Propriétaire
- **Copilote IA** : Chat en langage naturel avec accès aux données temps réel du salon
- **Génération de campagnes** : Win-back, flash, anniversaire, fidélité — générées par Claude
- **Analyse checkout** : Pour chaque client à risque, l'IA génère une offre personnalisée
- **Prévision revenus** : Prédiction sur 30 jours avec facteurs de risque et opportunités
- **Insights automatiques** : 4 alertes/opportunités générées en permanence

### Côté Client
- **Assistant booking IA** : Répond aux questions, conseille les prestations, guide le choix
- **Quick prompts** : Suggestions contextuelles pour démarrer la conversation
- **Expérience conversationnelle** : Pas de FAQ statique — vraie conversation

## Lancement

### Prérequis
- Node.js 18+
- Clé API Anthropic (variable `ANTHROPIC_API_KEY`)

### Installation
```bash
# Racine du projet
npm run install:all

# Ou manuellement :
cd backend && npm install
cd ../frontend && npm install
```

### Démarrage
```bash
# Depuis la racine (lance les deux en parallèle)
ANTHROPIC_API_KEY=your_key npm run dev

# Ou séparément :
cd backend && ANTHROPIC_API_KEY=your_key node src/server.js
cd frontend && npm run dev
```

### URLs
- **Accueil** : http://localhost:3000
- **Dashboard propriétaire** : http://localhost:3000/owner
- **Booking client** : http://localhost:3000/book
- **API** : http://localhost:3001/api

## Routes API

| Method | Route | Description |
|--------|-------|-------------|
| GET | /api/salon | KPIs et infos salon |
| GET | /api/stylists | Liste des stylistes |
| GET | /api/services | Liste des prestations |
| GET | /api/clients | Base clients |
| GET | /api/insights | Insights IA pré-calculés |
| GET | /api/campaigns | Campagnes actives |
| GET | /api/availability | Créneaux disponibles |
| POST | /api/bookings | Créer une réservation |
| POST | /api/ai/owner/chat | Chat IA propriétaire |
| POST | /api/ai/client/chat | Chat IA client |
| POST | /api/ai/generate-campaign | Générer campagne par IA |
| POST | /api/ai/checkout-analysis | Analyser client pour checkout |
| GET | /api/ai/predict-revenue | Prévision revenus 30J |

## Stack Technique
- **Frontend** : React 18, Vite, React Router, CSS variables (sans Tailwind)
- **Backend** : Node.js, Express, Anthropic SDK (Claude claude-opus-4-5)
- **IA** : Claude claude-opus-4-5 avec system prompts contextuels riches
- **Design** : Typographie Cormorant Garamond + DM Sans, thème owner sombre/émeraude, thème client chaud/crème

## Modèle IA utilisé
Toutes les features IA utilisent **Claude claude-opus-4-5** avec des system prompts qui injectent les données réelles du salon en temps réel. Le modèle connaît les KPIs, les clients à risque, les stylistes, les campagnes actives — et répond de manière contextuelle et actionnelle.
