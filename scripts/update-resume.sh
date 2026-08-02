#!/bin/bash
# Refresh the profile README (cards + stats) and re-print the résumé PDF.
#   ./scripts/update-resume.sh       # just update
#   ./scripts/update-resume.sh -y    # ...and commit + push
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

# The résumé HTML is the PDF's only input, so only reprint when it actually moved.
if [[ resume/index.html -nt assets/Jonatan-Verstraete-resume-2026.pdf ]]; then
    python3 resume/pdf.py
fi

# Bypass the network cache when the showcase config or the card design changed.
if [[ scripts/showcase.json -nt README.md || scripts/cards.ts -nt README.md ]]; then
    bun scripts/readme.ts --no-cache
else
    bun scripts/readme.ts
fi

if [ "${1:-}" ]; then
    git add -A -- . ':!web'
    git diff --cached --quiet && { echo "Nothing changed."; exit 0; }
    git commit -m "(job: update profile)"
    git push origin main
fi
