#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
STACK_DIR="/opt/infra/project-manager"
LOG_FILE="/tmp/project-manager-deploy.log"
LOCK_DIR="/tmp/project-manager-deploy.lock"

{
  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] deploy-from-pull: start"

  if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] deploy-from-pull: skipped (lock active)"
    exit 0
  fi
  trap 'rmdir "$LOCK_DIR" >/dev/null 2>&1 || true' EXIT

  cd "$REPO_ROOT"

  if ! command -v docker >/dev/null 2>&1; then
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] deploy-from-pull: docker not found"
    exit 1
  fi

  if [ ! -f "$STACK_DIR/compose.yml" ]; then
    echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] deploy-from-pull: missing $STACK_DIR/compose.yml"
    exit 1
  fi

  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] deploy-from-pull: rebuilding container"
  docker compose -f "$STACK_DIR/compose.yml" up -d --build project-manager

  echo "[$(date -u +'%Y-%m-%dT%H:%M:%SZ')] deploy-from-pull: done"
} >>"$LOG_FILE" 2>&1
