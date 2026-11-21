#!/usr/bin/env bash
# =============================================================================
# NormInvoice — Daily consistent SQLite backup (Cron: 0 2 * * *)
# Source of truth: data/norminvoice.sqlite inside the web_data Docker volume.
# Uses sqlite3 ".backup" for a crash-consistent copy while the app is running
# (WAL-safe — does NOT rely on cp of a live, WAL-journaled database).
# =============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/norminvoice}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_FILE="${BACKUP_DIR}/norminvoice_${STAMP}.sqlite.gz"
mkdir -p "$BACKUP_DIR"

# Resolve the running web-api container so we inherit its exact volume mounts
# (project-name agnostic — works regardless of the compose project prefix).
WEB_CID="$(docker compose -f infra/docker-compose.prod.yml ps -q web-api)"
if [[ -z "${WEB_CID}" ]]; then
  echo "ERROR: web-api container is not running; cannot back up SQLite." >&2
  exit 1
fi

# Produce a consistent snapshot into the host BACKUP_DIR via a throwaway alpine
# container that shares the web-api volumes (gives it /app/data/norminvoice.sqlite).
docker run --rm \
  --volumes-from "${WEB_CID}" \
  -v "${BACKUP_DIR}:/backup" \
  alpine:3.20 \
  sh -c 'apk add --no-cache sqlite >/dev/null 2>&1 && \
         sqlite3 /app/data/norminvoice.sqlite ".backup /backup/_tmp_snapshot.sqlite"'

gzip -9 -c "${BACKUP_DIR}/_tmp_snapshot.sqlite" > "${OUT_FILE}"
rm -f "${BACKUP_DIR}/_tmp_snapshot.sqlite"
sha256sum "${OUT_FILE}" > "${OUT_FILE}.sha256"

# Retain last 30 daily backups locally. (Finalized invoice PDFs/XML are also
# archived to EU S3 Object Lock for the full 8–10yr GoBD retention window.)
find "${BACKUP_DIR}" -type f -name "norminvoice_*.sqlite.gz*" -mtime +30 -delete
echo "SQLite backup complete: ${OUT_FILE}"
