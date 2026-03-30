#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

TARGET_FILES=(
  assets/blind.svg
  assets/damageCut.svg
  assets/exalt.svg
  assets/haste.svg
  assets/pierce.svg
  assets/reflect.svg
  assets/silence.svg
  assets/weaken.svg
  dist/assets/1.svg
  dist/assets/2.svg
  dist/assets/blind.svg
  dist/assets/damageCut.svg
  dist/assets/exalt.svg
  dist/assets/haste.svg
  dist/assets/pierce.svg
  dist/assets/reflect.svg
  dist/assets/silence.svg
  dist/assets/weaken.svg
)

log() { printf '%s\n' "$*"; }

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  log "[ERR] Không phải git repository: $REPO_ROOT"
  exit 1
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  log "[ERR] Chưa có remote 'origin'. Hãy add remote trước khi chạy script."
  exit 1
fi

log "[1/6] Fetch origin..."
git fetch origin

log "[2/6] Chuyển về main..."
if git show-ref --verify --quiet refs/heads/main; then
  git switch main
else
  git switch -c main --track origin/main
fi

git pull --ff-only origin main

log "[3/6] Stage delete cho danh sách SVG mục tiêu..."
git rm -f --ignore-unmatch -- "${TARGET_FILES[@]}"

STAGED_DELETE_COUNT="$(git diff --cached --name-status -- "${TARGET_FILES[@]}" | awk '$1=="D"{c++} END{print c+0}')"
if [[ "$STAGED_DELETE_COUNT" -eq 0 ]]; then
  log "[STOP] Không có file SVG nào được stage delete."
  log "       Repo hiện không có thay đổi cần push cho danh sách mục tiêu."
  exit 2
fi

log "[4/6] Commit xoá SVG..."
git commit -m "Remove obsolete SVG assets"

log "[5/6] Push lên origin/main..."
git push -u origin main

log "[6/6] Verify SHA local đã có trên remote"
LOCAL_SHA="$(git rev-parse --short HEAD)"
REMOTE_MAIN="$(git ls-remote --heads origin main | awk '{print $1}')"
log "Local:  $LOCAL_SHA"
log "Remote: ${REMOTE_MAIN:-<empty>}"
log "Done."
