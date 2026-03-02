#!/bin/bash
# Runs ESLint on the file edited/written by Claude.
# Receives tool-use JSON payload on stdin.
# Exit code 2 surfaces the output to Claude as a warning (non-blocking).

set -euo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only lint JS/TS source files
if [[ "$FILE_PATH" =~ \.(tsx?|jsx?)$ ]]; then
  cd "$(dirname "$0")/../.."  # project root
  OUTPUT=$(npx eslint --no-warn-ignored "$FILE_PATH" 2>&1) || {
    echo "[hook] lint issues in: $FILE_PATH"
    echo "$OUTPUT"
    exit 2  # exit 2 = show output to Claude without blocking
  }
fi
