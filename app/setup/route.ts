import { NextResponse } from 'next/server'

const SCRIPT = `#!/usr/bin/env bash
set -euo pipefail

# ─── ClawProxy One-Command Setup ───
# This script finds your OpenClaw config, backs it up, and patches it
# to route requests through ClawProxy.

GREEN="\\033[0;32m"
YELLOW="\\033[0;33m"
RED="\\033[0;31m"
BOLD="\\033[1m"
NC="\\033[0m"

echo ""
echo -e "\${GREEN}\${BOLD}  ╔═══════════════════════════════════════╗\${NC}"
echo -e "\${GREEN}\${BOLD}  ║       ClawProxy Setup Script          ║\${NC}"
echo -e "\${GREEN}\${BOLD}  ╚═══════════════════════════════════════╝\${NC}"
echo ""

# ── Step 1: Ask for API key ──
echo -e "\${BOLD}Step 1:\${NC} Enter your ClawProxy API key"
echo -e "  (starts with \${GREEN}cp_sk_\${NC}, from your onboarding page)"
echo ""
read -rp "  API Key: " API_KEY < /dev/tty

if [[ -z "$API_KEY" ]]; then
  echo -e "\${RED}Error:\${NC} No API key provided. Exiting."
  exit 1
fi

if [[ ! "$API_KEY" =~ ^cp_sk_ ]]; then
  echo -e "\${YELLOW}Warning:\${NC} Key doesn't start with cp_sk_ — are you sure this is correct?"
  read -rp "  Continue anyway? (y/N): " CONFIRM < /dev/tty
  if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    echo "Exiting."
    exit 1
  fi
fi

echo ""

# ── Step 2: Find config file ──
echo -e "\${BOLD}Step 2:\${NC} Looking for OpenClaw config..."
echo ""

CONFIG_PATHS=(
  "$HOME/.openclaw/openclaw.json"
  "$HOME/.openclaw/config.json"
  "$HOME/.config/openclaw/openclaw.json"
  "$HOME/.config/openclaw/config.json"
)

CONFIG_FILE=""
for path in "\${CONFIG_PATHS[@]}"; do
  if [[ -f "$path" ]]; then
    CONFIG_FILE="$path"
    break
  fi
done

if [[ -z "$CONFIG_FILE" ]]; then
  echo -e "\${YELLOW}Could not auto-detect config file.\${NC}"
  echo "  Common locations:"
  echo "    ~/.openclaw/openclaw.json"
  echo "    ~/.config/openclaw/openclaw.json"
  echo ""
  read -rp "  Enter full path to your config file: " CONFIG_FILE < /dev/tty
  if [[ ! -f "$CONFIG_FILE" ]]; then
    echo -e "\${RED}Error:\${NC} File not found: $CONFIG_FILE"
    exit 1
  fi
fi

echo -e "  Found: \${GREEN}$CONFIG_FILE\${NC}"
echo ""

# ── Step 3: Back up ──
echo -e "\${BOLD}Step 3:\${NC} Creating backup..."
BACKUP="$CONFIG_FILE.backup.\$(date +%Y%m%d_%H%M%S)"
cp "$CONFIG_FILE" "$BACKUP"
echo -e "  Backup saved: \${GREEN}$BACKUP\${NC}"
echo ""

# ── Step 4: Patch config ──
echo -e "\${BOLD}Step 4:\${NC} Patching config with ClawProxy settings..."

if command -v jq &>/dev/null; then
  # Use jq for clean JSON manipulation
  TMP_FILE="\$(mktemp)"
  jq --arg key "$API_KEY" '. + {"apiBaseUrl": "https://api.clawproxy.ai/v1", "customHeaders": {"x-clawproxy-key": $key}}' "$CONFIG_FILE" > "$TMP_FILE"
  mv "$TMP_FILE" "$CONFIG_FILE"
  echo -e "  \${GREEN}✓\${NC} Patched using jq"
else
  # Fallback: use python3 (available on most systems)
  if command -v python3 &>/dev/null; then
    python3 -c "
import json, sys
with open('$CONFIG_FILE', 'r') as f:
    config = json.load(f)
config['apiBaseUrl'] = 'https://api.clawproxy.ai/v1'
config['customHeaders'] = {'x-clawproxy-key': '$API_KEY'}
with open('$CONFIG_FILE', 'w') as f:
    json.dump(config, f, indent=2)
print('  ✓ Patched using python3')
"
  else
    echo -e "\${RED}Error:\${NC} Neither jq nor python3 found. Please install one and retry, or edit manually."
    echo ""
    echo "  Add these lines to $CONFIG_FILE:"
    echo -e "    \${GREEN}\\"apiBaseUrl\\": \\"https://api.clawproxy.ai/v1\\",\${NC}"
    echo -e "    \${GREEN}\\"customHeaders\\": { \\"x-clawproxy-key\\": \\"$API_KEY\\" }\${NC}"
    exit 1
  fi
fi

echo ""

# ── Step 5: Verify ──
echo -e "\${BOLD}Step 5:\${NC} Verifying..."
if grep -q "api.clawproxy.ai" "$CONFIG_FILE"; then
  echo -e "  \${GREEN}✓\${NC} apiBaseUrl set correctly"
else
  echo -e "  \${RED}✗\${NC} apiBaseUrl not found in config"
  exit 1
fi

if grep -q "x-clawproxy-key" "$CONFIG_FILE"; then
  echo -e "  \${GREEN}✓\${NC} API key added to headers"
else
  echo -e "  \${RED}✗\${NC} API key not found in config"
  exit 1
fi

echo ""
echo -e "\${GREEN}\${BOLD}  ════════════════════════════════════════\${NC}"
echo -e "\${GREEN}\${BOLD}  ✓ ClawProxy is now configured!\${NC}"
echo -e "\${GREEN}\${BOLD}  ════════════════════════════════════════\${NC}"
echo ""
echo -e "  Config file: \${GREEN}$CONFIG_FILE\${NC}"
echo -e "  Backup:      \${GREEN}$BACKUP\${NC}"
echo ""
echo -e "  \${BOLD}Next step:\${NC} Restart your OpenClaw agent:"
echo -e "    \${GREEN}openclaw restart\${NC}"
echo ""
echo -e "  Then go back to ClawProxy onboarding to test the connection."
echo ""
`

export async function GET() {
  return new NextResponse(SCRIPT, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  })
}
