#!/usr/bin/env bash
# Register the AppKittie MCP server with Claude Code (user scope).
# Requires: APPKITTIE_API_KEY in the environment (create one at
# https://appkittie.com/settings/api-keys — it is shown only once).
set -euo pipefail

: "${APPKITTIE_API_KEY:?Set APPKITTIE_API_KEY first — create a key at https://appkittie.com/settings/api-keys}"

if ! command -v claude >/dev/null 2>&1; then
  echo "error: 'claude' CLI not found on PATH. Install Claude Code first." >&2
  exit 1
fi

claude mcp add appkittie \
  --transport http \
  https://mcp.appkittie.com \
  --header "Authorization: Bearer ${APPKITTIE_API_KEY}"

echo
echo "Registered the 'appkittie' MCP server."
echo "Verify with:  claude mcp list"
