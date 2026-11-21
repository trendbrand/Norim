#!/usr/bin/env bash
# =============================================================================
# NormInvoice — One-Command Hetzner Germany Production Deployment Script
# Usage: chmod +x infra/deploy-hetzner.sh && ./infra/deploy-hetzner.sh
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> [1/5] Validating production .env secrets..."
if [[ ! -f .env ]]; then
  echo "ERROR: .env file missing. Copy .env.example -> .env and fill real secrets."
  exit 1
fi

set -a
# shellcheck source=/dev/null
source .env
set +a

if [[ "${APP_ENCRYPTION_KEY_HEX:-}" == "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef" ]] || [[ ${#APP_ENCRYPTION_KEY_HEX} -ne 64 ]]; then
  echo "ERROR: Set a fresh 64-char hex APP_ENCRYPTION_KEY_HEX via 'openssl rand -hex 32'."
  exit 1
fi

if [[ "${AUTH_SECRET:-}" == *"change_me"* ]] || [[ ${#AUTH_SECRET} -lt 32 ]]; then
  echo "ERROR: Set a strong AUTH_SECRET (>= 32 chars) in .env."
  exit 1
fi

echo "==> [2/5] Building & launching EU-sovereign Docker stack..."
docker compose -f infra/docker-compose.prod.yml up -d --build --remove-orphans

echo "==> [3/5] Waiting for PostgreSQL & applying idempotent GoBD RLS migrations..."
sleep 6
docker compose -f infra/docker-compose.prod.yml exec -T postgres \
  psql -U norminvoice -d norminvoice -f /docker-entrypoint-initdb.d/0001_initial_gobd_rls.sql || true

echo "==> [4/5] Verifying live /api/health endpoint..."
for i in {1..15}; do
  if curl -fsS http://127.0.0.1:3000/api/health 2>/dev/null || curl -fsS "https://${APP_DOMAIN:-localhost}/api/health" 2>/dev/null; then
    echo ""
    echo "==> [5/5] NormInvoice is LIVE and healthy!"
    exit 0
  fi
  sleep 2
done

echo "WARNING: Health check timed out; inspect logs via: docker compose -f infra/docker-compose.prod.yml logs --tail=100"
exit 1
