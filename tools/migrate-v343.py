#!/usr/bin/env python3
"""Integra a camada responsiva e metadados da versão 3.4.3."""
from pathlib import Path
import json

ROOT=Path(__file__).resolve().parents[1]
for page in [*ROOT.glob("*.html"),*ROOT.glob("products/*.html")]:
    text=page.read_text(encoding="utf-8")
    prefix="../" if page.parent.name=="products" else ""
    tag=f'<link rel="stylesheet" href="{prefix}assets/styles/responsive-v343.css">'
    if tag not in text:text=text.replace("</head>",tag+"</head>")
    page.write_text(text,encoding="utf-8")

for rel in ("README.md","SECURITY.md","data/config.json","data/products.json","data/routes.json","assets/scripts/admin.js","tools/audit-client.py"):
    path=ROOT/rel
    path.write_text(path.read_text(encoding="utf-8").replace("3.4.2","3.4.3"),encoding="utf-8")
for path in ROOT.glob("tools/test*.py"):
    if path.name!="test-v343.py":path.write_text(path.read_text(encoding="utf-8").replace("3.4.2","3.4.3"),encoding="utf-8")

sw=ROOT/"service-worker.js"
text=sw.read_text(encoding="utf-8").replace('const CACHE = "qualimax-v3.4.2"','const CACHE = "qualimax-v3.4.3"')
asset='"./assets/styles/responsive-v343.css", '
if asset not in text:text=text.replace('const SHELL = [',f'const SHELL = [\n  {asset}')
sw.write_text(text,encoding="utf-8")

print("Migração v3.4.3 integrada.")
