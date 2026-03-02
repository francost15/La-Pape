#!/bin/bash
# Formats the file edited/written by Claude with Prettier.
# Receives tool-use JSON payload on stdin.

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only format files that Prettier can handle
if [[ "$FILE_PATH" =~ \.(tsx?|jsx?|json|css|md)$ ]]; then
  cd "$(dirname "$0")/../.."  # project root
  npx prettier --write "$FILE_PATH" 2>/dev/null && echo "[hook] formatted: $FILE_PATH" || true
fi
