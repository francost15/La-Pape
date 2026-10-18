#!/bin/sh
# Bloquea el push si React Doctor no está en 100.
set -e
score=$(npx -y react-doctor@latest -y --score --no-supply-chain)
if [ "$score" != "100" ]; then
  echo "React Doctor: $score. Hace falta 100 antes de push."
  exit 1
fi
echo "React Doctor: 100"
