#!/usr/bin/env python3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
for page in [*ROOT.glob("*.html"),*ROOT.glob("products/*.html")]:
 text=page.read_text(encoding="utf-8");prefix="../" if page.parent.name=="products" else "";tag=f'<script src="{prefix}assets/scripts/max-handoff-v346.js" defer></script>'
 if tag not in text:
  marker=f'<script src="{prefix}assets/scripts/chatbot.js" defer></script>'
  text=text.replace(marker,tag+marker) if marker in text else text.replace("</body>",tag+"</body>")
 page.write_text(text,encoding="utf-8")
for rel in ("README.md","SECURITY.md","data/config.json","data/products.json","data/routes.json","assets/scripts/admin.js","tools/audit-client.py"):
 p=ROOT/rel;p.write_text(p.read_text(encoding="utf-8").replace("3.4.5","3.4.6"),encoding="utf-8")
for p in ROOT.glob("tools/test*.py"):
 if p.name!="test-v346.py":p.write_text(p.read_text(encoding="utf-8").replace("3.4.5","3.4.6"),encoding="utf-8")
sw=ROOT/"service-worker.js";text=sw.read_text(encoding="utf-8").replace("qualimax-v3.4.5","qualimax-v3.4.6")
if "max-handoff-v346.js" not in text:text=text.replace('const SHELL = [','const SHELL = [\n  "./assets/scripts/max-handoff-v346.js", ')
sw.write_text(text,encoding="utf-8");print("Migração v3.4.6 integrada.")
