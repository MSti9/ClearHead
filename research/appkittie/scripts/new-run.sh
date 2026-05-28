#!/usr/bin/env bash
# Scaffold a dated research run from the templates.
# Usage: ./scripts/new-run.sh [label]   e.g. ./scripts/new-run.sh weightloss
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATE="$(date +%Y-%m-%d)"
LABEL="${1:-}"
RUN_DIR="${REPO_ROOT}/runs/${DATE}${LABEL:+-$LABEL}"

if [ -e "${RUN_DIR}" ]; then
  echo "Run folder already exists: ${RUN_DIR}" >&2
  echo "Pass a label to make a distinct one, e.g. ./scripts/new-run.sh ${LABEL:-pass2}" >&2
  exit 1
fi

mkdir -p "${RUN_DIR}"
cp "${REPO_ROOT}/templates/opportunities.csv" "${RUN_DIR}/opportunities.csv"
cp "${REPO_ROOT}/templates/final-report.md"   "${RUN_DIR}/final-report.md"

echo "Created run: ${RUN_DIR}"
echo "Next: in Claude Code, run the prompt at prompts/research-prompt.md and write results here."
