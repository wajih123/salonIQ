#!/bin/bash
# SalonIQ — Script de démarrage

echo ""
echo "  ███████╗ █████╗ ██╗      ██████╗ ███╗   ██╗██╗ ██████╗ "
echo "  ██╔════╝██╔══██╗██║     ██╔═══██╗████╗  ██║██║██╔═══██╗"
echo "  ███████╗███████║██║     ██║   ██║██╔██╗ ██║██║██║   ██║"
echo "  ╚════██║██╔══██║██║     ██║   ██║██║╚██╗██║██║██║▄▄ ██║"
echo "  ███████║██║  ██║███████╗╚██████╔╝██║ ╚████║██║╚██████╔╝"
echo "  ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝ ╚══▀▀═╝ "
echo ""
echo "  Intelligent Salon Management — Powered by Claude AI"
echo ""

# Vérifier la clé API
if [ -z "$ANTHROPIC_API_KEY" ]; then
  echo "  ⚠️  ANTHROPIC_API_KEY manquante !"
  echo "  Export: export ANTHROPIC_API_KEY=sk-ant-..."
  echo ""
  read -p "  Entrez votre clé API Anthropic: " key
  export ANTHROPIC_API_KEY=$key
fi

echo "  ✅ Clé API configurée"
echo ""

# Installer si nécessaire
if [ ! -d "backend/node_modules" ]; then
  echo "  📦 Installation backend..."
  cd backend && npm install --silent && cd ..
fi
if [ ! -d "frontend/node_modules" ]; then
  echo "  📦 Installation frontend..."
  cd frontend && npm install --silent && cd ..
fi

echo "  🚀 Démarrage des serveurs..."
echo ""
echo "  Backend  → http://localhost:3001"
echo "  Frontend → http://localhost:3000"
echo ""
echo "  Pages :"
echo "  → Accueil    : http://localhost:3000"
echo "  → Gérant     : http://localhost:3000/owner"
echo "  → Client     : http://localhost:3000/book"
echo ""
echo "  Ctrl+C pour arrêter"
echo ""

# Lancer les deux serveurs
trap "kill 0" EXIT

cd backend && node src/server.js &
BACKEND_PID=$!

cd ../frontend && npx vite --port 3000 &
FRONTEND_PID=$!

wait
