#!/usr/bin/env python3
"""Integra as inovações da versão 3.4.2 nas páginas e manifestos."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

for page in [*ROOT.glob("*.html"), *ROOT.glob("products/*.html")]:
    text = page.read_text(encoding="utf-8")
    prefix = "../" if page.parent.name == "products" else ""
    css = f'<link rel="stylesheet" href="{prefix}assets/styles/innovations-v342.css">'
    js = f'<script src="{prefix}assets/scripts/innovations-v342.js" defer></script>'
    if css not in text:
        text = text.replace("</head>", css + "</head>")
    if js not in text:
        text = text.replace("</body>", js + "</body>")
    page.write_text(text, encoding="utf-8")

for rel in ["README.md", "SECURITY.md", "data/config.json", "data/products.json"]:
    path = ROOT / rel
    if path.exists():
        path.write_text(path.read_text(encoding="utf-8").replace("3.4.1", "3.4.2"), encoding="utf-8")

# Os testes cumulativos validam sempre a versão operacional mais recente.
for path in ROOT.glob("tools/test*.py"):
    if path.name != "test-v342.py":
        path.write_text(path.read_text(encoding="utf-8").replace("3.4.1", "3.4.2"), encoding="utf-8")

routes_path = ROOT / "data/routes.json"
routes = json.loads(routes_path.read_text(encoding="utf-8"))
routes["version"] = "3.4.2"
routes["routes"]["journey.html"] = {"locale": "pt-BR", "public": True}
routes["routes"]["budget-planner.html"] = {"locale": "pt-BR", "public": True}
routes_path.write_text(json.dumps(routes, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

sitemap = ROOT / "sitemap.xml"
text = sitemap.read_text(encoding="utf-8")
marker = "</urlset>"
for page in ("journey.html", "budget-planner.html"):
    if page not in text:
        text = text.replace(marker, f'  <url><loc>https://jplima-dev-ai.github.io/saude-quali-max/{page}</loc></url>\n{marker}')
sitemap.write_text(text, encoding="utf-8")

print("Migração v3.4.2 integrada.")
