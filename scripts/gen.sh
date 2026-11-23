#!/usr/bin/env bash
# Batch-generate the site imagery on the Jimeng canvas, then wait + download.
set -uo pipefail
export PATH="$HOME/.local/bin:$PATH"

# 项目根目录取脚本上级目录，不写死绝对路径，换机器也能跑
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export DREAMINA_CANVAS_STATE_DIR="${DREAMINA_CANVAS_STATE_DIR:-$PROJECT_ROOT/.dreamina-state}"

P=cf5804ac-4482-49c4-8d7b-4bcb92926a55
cd "$PROJECT_ROOT" || exit 1
mkdir -p public/img
SPEC="${1:-/tmp/gen-spec.tsv}"
RESULTS=/tmp/gen-results.tsv
: > "$RESULTS"

jget() { python3 -c 'import sys,json;d=json.load(sys.stdin);print(eval(sys.argv[1],{"d":d}) or "")' "$1" 2>/dev/null; }

echo "=== SUBMIT PHASE ==="
while IFS='|' read -r slug ratio prompt; do
  [ -z "${slug:-}" ] && continue
  out=$(dreamina-canvas node create image --project-id "$P" --mode t2i --model seedream_5.5 \
    --ratio "$ratio" --resolution 2K --count 1 --title "$slug" --prompt "$prompt" \
    --run --non-interactive --format json 2>&1)
  printf '%s' "$out" > "/tmp/sub-$slug.json"
  sid=$(printf '%s' "$out" | jget 'd.get("data",{}).get("submission",{}).get("submitId")')
  if [ -z "$sid" ]; then
    echo "FAIL_SUBMIT $slug :: $(printf '%s' "$out" | tail -c 300)"
    continue
  fi
  printf '%s\t%s\n' "$slug" "$sid" >> "$RESULTS"
  echo "OK $slug $sid"
done < "$SPEC"

echo "=== WAIT + DOWNLOAD PHASE ==="
while IFS=$'\t' read -r slug sid; do
  [ -z "${slug:-}" ] && continue
  w=$(dreamina-canvas operation wait "$sid" --project-id "$P" --format json 2>&1)
  rid=$(printf '%s' "$w" | jget 'd.get("data",{}).get("resources",[{}])[0].get("resourceId")')
  if [ -z "$rid" ]; then
    echo "FAIL_WAIT $slug :: $(printf '%s' "$w" | tail -c 300)"
    continue
  fi
  d=$(dreamina-canvas resource download "$rid" --project-id "$P" --output "public/img/$slug.png" --format json 2>&1)
  echo "DONE $slug $rid $(printf '%s' "$d" | jget 'd.get("data",{}).get("size")')"
done < "$RESULTS"

echo "=== ALL FINISHED ==="
ls -la public/img | tail -30
