#!/usr/bin/env bash
# ── OrderNow Studio launcher ─────────────────────────────────
# Opens the studio in an app-style window (no tabs / address bar)
# using a Chromium-based browser, falling back to the default browser.

set -u

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
URL="file://${DIR}/index.html"

# Candidate Chromium-family browsers, in priority order.
CANDIDATES=(
  microsoft-edge
  microsoft-edge-stable
  google-chrome
  google-chrome-stable
  chromium
  chromium-browser
  brave-browser
  vivaldi
)

for browser in "${CANDIDATES[@]}"; do
  if command -v "$browser" >/dev/null 2>&1; then
    exec "$browser" --app="$URL" --window-size=1280,860 >/dev/null 2>&1
  fi
done

# Flatpak fallbacks (common on Fedora/Ubuntu desktops).
if command -v flatpak >/dev/null 2>&1; then
  for app_id in com.microsoft.Edge com.google.Chrome org.chromium.Chromium com.brave.Browser; do
    if flatpak info "$app_id" >/dev/null 2>&1; then
      exec flatpak run "$app_id" --app="$URL" --window-size=1280,860 >/dev/null 2>&1
    fi
  done
fi

# Fallback: default browser (opens as a normal tab).
if command -v xdg-open >/dev/null 2>&1; then
  exec xdg-open "$URL"
fi

echo "No supported browser found. Open this URL manually:" >&2
echo "  $URL" >&2
exit 1
