#!/usr/bin/env bash
# Renders the sebha link-preview images from misbaha-og.html: public/og/misbaha.jpg, misbaha-{kind}.jpg,
# and the room bases public/og/base/room-{kind}.jpg that public/og-room.php writes the name on.
# with headless Chrome/Edge, then converts them to JPEG with Python Pillow.
# Usage: bash scripts/og/render-misbaha-og.sh
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
root="$(cd "$here/../.." && pwd)"
browser="${BROWSER_BIN:-}"
for b in "/c/Program Files/Google/Chrome/Application/chrome.exe" "/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" "$(command -v google-chrome || true)" "$(command -v chromium || true)"; do
  [ -z "$browser" ] && [ -n "$b" ] && [ -x "$b" ] && browser="$b"
done
[ -n "$browser" ] || { echo "No Chrome/Edge found (set BROWSER_BIN)"; exit 1; }
tmp="$(mktemp -d)"
html="$here/misbaha-og.html"
url="file:///$(cygpath -m "$html" 2>/dev/null || echo "$html")"
mkdir -p "$root/public/og/base"
for v in main sick deceased group room-sick room-deceased room-group; do
  out="$tmp/$v.png"
  "$browser" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --allow-file-access-from-files --virtual-time-budget=3000 \
    --window-size=1200,630 --screenshot="$(cygpath -w "$out" 2>/dev/null || echo "$out")" "$url?v=$v" >/dev/null 2>&1
  case "$v" in main) name=misbaha ;; room-*) name="base/$v" ;; *) name="misbaha-$v" ;; esac
  python -c "import sys;from PIL import Image;Image.open(sys.argv[1]).convert('RGB').save(sys.argv[2],'JPEG',quality=88,optimize=True,progressive=True)" \
    "$out" "$root/public/og/$name.jpg"
  echo "public/og/$name.jpg"
done
rm -rf "$tmp"
