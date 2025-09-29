#!/bin/bash
set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: ./restore.sh <backup-file>"
  exit 1
fi

export $(grep -v '^#' ../project/.env.local | xargs)
DB_URL="${DATABASE_URL}?sslmode=require"

pg_restore --clean --if-exists --no-owner --dbname="$DB_URL" "$1"

echo "Database restored from $1"
