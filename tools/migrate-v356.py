#!/usr/bin/env python3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
for page in [*root.glob("*.html"),*root.glob("products/*.html")]:
    h=page.read_text(encoding="utf-8");prefix="../" if page.parent.name=="products" else ""
    tag=f'<script src="{prefix}assets/scripts/max-reasoning-v356.js" defer></script>'
    if "chatbot.js" in h and "max-reasoning-v356.js" not in h:
        h=h.replace(f'<script src="{prefix}assets/scripts/chatbot.js" defer></script>',tag+f'<script src="{prefix}assets/scripts/chatbot.js" defer></script>')
    page.write_text(h,encoding="utf-8")
for pattern in ("*.json","*.js","*.py"):
    for p in root.rglob(pattern):
        if p.name=="migrate-v356.py":continue
        try:s=p.read_text(encoding="utf-8")
        except UnicodeDecodeError:continue
        if "3.5.5" in s:p.write_text(s.replace("3.5.5","3.5.6"),encoding="utf-8")
sw=root/"service-worker.js";s=sw.read_text(encoding="utf-8");needle="const SHELL = ["
if "max-reasoning-v356.js" not in s:s=s.replace(needle,needle+'\n  "./assets/scripts/max-reasoning-v356.js",')
sw.write_text(s,encoding="utf-8");print("Migração 3.5.6 aplicada")
