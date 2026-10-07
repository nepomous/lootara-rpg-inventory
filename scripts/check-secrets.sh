#!/usr/bin/env bash
# Gate A, check 4: sensitive files in staged changes. Use --history to scan git history.
set -euo pipefail

# Padrões ancorados em fronteira de path e extensão: termos soltos como
# `secrets|credentials` casariam com o próprio script e com .ai/** (review blocker).
PATTERN='(^|/)\.env$|(^|/)\.env\.|google-services\.json|GoogleService-Info\.plist|\.p12$|\.jks$|\.key$|\.mobileprovision$|(^|/)(secrets|credentials)\.(json|ya?ml|env|plist|pem|txt)$'
ALLOW='\.env\.example$'

if [ "${1:-}" = "--history" ]; then
  hits=$(git log --all --diff-filter=A --name-only --format="" | grep -E "$PATTERN" | grep -vE "$ALLOW" | sort -u || true)
  label="history"
else
  hits=$(git diff --cached --name-only | grep -E "$PATTERN" | grep -vE "$ALLOW" || true)
  label="staged files"
fi

if [ -n "$hits" ]; then
  echo "SENSITIVE FILES FOUND ($label):"
  echo "$hits"
  exit 1
fi
echo "secrets scan OK ($label)"
