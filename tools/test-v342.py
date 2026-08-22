#!/usr/bin/env python3
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
html = [*root.glob("*.html"), *root.glob("products/*.html")]
for page in html:
    text = page.read_text(encoding="utf-8")
    assert "innovations-v342.css" in text, page
    assert "innovations-v342.js" in text, page

routes = json.loads((root / "data/routes.json").read_text(encoding="utf-8"))
assert routes["version"] == "3.5.9"
assert "journey.html" in routes["routes"] and "budget-planner.html" in routes["routes"]
platform = (root / "assets/scripts/platform-v340.js").read_text(encoding="utf-8")
assert 'get("produto")' in platform
assert "qualimax-compare-history-v342" in platform
sw = (root / "service-worker.js").read_text(encoding="utf-8")
assert 'qualimax-v3.5.9' in sw
assert sw.count("const cacheavel =") == 1
assert sw.count('if (url.username || url.password || event.request.headers.has("range")) return;') == 1
print(f"v3.5.9 OK: {len(html)} páginas verificadas")
