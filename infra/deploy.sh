#!/usr/bin/env bash
set -euo pipefail

cd ~/infra

docker login ghcr.io -u "$GHCR_USER" -p "$GHCR_TOKEN"

docker compose -f docker-compose.yml pull
docker compose -f docker-compose.yml up -d --remove-orphans

docker image prune -f
