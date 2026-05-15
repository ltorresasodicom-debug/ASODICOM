#!/usr/bin/env bash
# =============================================================================
# SIGEL — Script de bootstrap para entornos de desarrollo
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "🛠  Bootstrap SIGEL — verificando dependencias..."

command -v docker >/dev/null 2>&1 || { echo "❌ docker no instalado"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1 || \
    { echo "❌ docker compose no disponible"; exit 1; }

if [ ! -f .env ]; then
    echo "📄 Creando .env desde .env.example"
    cp .env.example .env
fi

echo "🐳 Construyendo imágenes…"
docker compose build --parallel

echo "🚀 Levantando stack…"
docker compose up -d

echo "⏳ Esperando healthchecks (~60s)…"
sleep 30
docker compose ps

cat <<EOF

✅ SIGEL levantado.

   Web      → http://localhost:4000
   Gateway  → http://localhost:3000/api/v1
   Swagger  → http://localhost:3000/api/docs
   Analytics→ http://localhost:8000/docs
   AI       → http://localhost:8001/docs
   Grafana  → http://localhost:3001 (admin/admin)

Para detener:   docker compose down
Para resetear:  docker compose down -v
EOF
