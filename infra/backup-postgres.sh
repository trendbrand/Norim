#!/usr/bin/env bash
# Daily encrypted PostgreSQL 16 backup for Hetzner Storage Box / EU S3 (Cron: 0 2 * * *)
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/norminvoice}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"

OUT_FILE="${BACKUP_DIR}/norminvoice_${STAMP}.sql.gz"
docker compose -f infra/docker-compose.prod.yml exec -T postgres \
  pg_dump -U norminvoice --no-owner --no-acl norminvoice | gzip -9 > "$OUT_FILE"

sha256sum "$OUT_FILE" > "${OUT_FILE}.sha256"

# Retain last 30 daily backups locally (archive S3 Object Lock keeps GoBD invoices 8-10 yrs)
find "$BACKUP_DIR" -type f -name "norminvoice_*.sql.gz*" -mtime +30 -delete
echo "Backup complete: $OUT_FILE"
