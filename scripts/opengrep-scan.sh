#!/usr/bin/env bash
# Run opengrep security scan against site/src.
# Called by the deploy workflow; can also be run locally.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# ── Configuration ──────────────────────────────────────────────────────────────
RULES_FILE="$REPO_ROOT/.opengrep/rules.yml"
SCAN_TARGET="$REPO_ROOT/site/src"

# Additional rulesets from the opengrep/semgrep registry (uncomment to enable):
# EXTRA_CONFIGS=(
#   "p/typescript"          # TypeScript best-practices ruleset
#   "p/secrets"             # Secret/credential detection
#   "p/react"               # React-specific security rules
#   "p/owasp-top-ten"       # OWASP Top 10 coverage
# )
EXTRA_CONFIGS=()
# ──────────────────────────────────────────────────────────────────────────────

if ! command -v opengrep &>/dev/null; then
  echo "[opengrep-scan] opengrep not found — installing..."
  curl -fsSL https://raw.githubusercontent.com/opengrep/opengrep/main/install.sh | bash
  # installer puts the binary at ~/.local/bin/opengrep or ~/.opengrep/cli/latest/opengrep
  export PATH="$HOME/.local/bin:$HOME/.opengrep/cli/latest:$PATH"
fi

# Build config flags
CONFIG_FLAGS=(--config "$RULES_FILE")
for cfg in "${EXTRA_CONFIGS[@]+"${EXTRA_CONFIGS[@]}"}"; do
  CONFIG_FLAGS+=(--config "$cfg")
done

echo "[opengrep-scan] scanning $SCAN_TARGET"
echo "[opengrep-scan] rules: $RULES_FILE${EXTRA_CONFIGS[*]:+ + ${EXTRA_CONFIGS[*]}}"
echo ""

opengrep scan \
  "${CONFIG_FLAGS[@]}" \
  --error \
  "$SCAN_TARGET"
