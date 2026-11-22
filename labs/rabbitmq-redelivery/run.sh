#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
workspace=$(mktemp -d)
project="dictionary-redelivery-$(basename "$workspace" | tr '[:upper:].' '[:lower:]-')"
compose() { docker compose -p "$project" "$@"; }
cleanup() {
  compose down -v --remove-orphans --rmi local
  rmdir "$workspace"
}
trap cleanup EXIT
compose build runner
compose up -d --wait --wait-timeout 160 db broker
compose run --rm -T --no-deps runner seed
status=0
compose run --rm -T --no-deps runner crash || status=$?
if [[ "$status" != 42 ]]; then
  echo "Expected exit 42 between COMMIT and ACK, got $status" >&2
  exit 1
fi
compose run --rm -T --no-deps runner recover
