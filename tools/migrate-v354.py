#!/usr/bin/env python3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
for page in root.rglob("*.html"):
    h=page.read_text(encoding="utf-8"); prefix="../" if page.parent.name=="products" else ""
    css=f'<link rel="stylesheet" href="{prefix}assets/styles/accessibility-v354.css">'
    js=f'<script src="{prefix}assets/scripts/accessibility-v354.js" defer></script>'
    if "accessibility-v354.css" not in h:h=h.replace("</head>",css+"</head>")
    if "accessibility-v354.js" not in h:h=h.replace("</body>",js+"</body>")
    page.write_text(h,encoding="utf-8")
for pattern in ("*.json","*.js","*.py","*.md"):
    for p in root.rglob(pattern):
        if p.name=="migrate-v354.py":continue
        try:s=p.read_text(encoding="utf-8")
        except UnicodeDecodeError:continue
        if "3.5.3" in s:p.write_text(s.replace("3.5.3","3.5.4"),encoding="utf-8")
sw=root/"service-worker.js";s=sw.read_text(encoding="utf-8")
needle="const SHELL = ["
assets='\n  "./assets/styles/accessibility-v354.css", "./assets/scripts/accessibility-v354.js",'
if "accessibility-v354.css" not in s:s=s.replace(needle,needle+assets)
sw.write_text(s,encoding="utf-8")
print("Migração 3.5.4 aplicada")
