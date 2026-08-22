#!/usr/bin/env python3
from pathlib import Path
root=Path(__file__).resolve().parents[1]
for pattern in ("*.json","*.js","*.py"):
    for p in root.rglob(pattern):
        if p.name=="migrate-v355.py":continue
        try:s=p.read_text(encoding="utf-8")
        except UnicodeDecodeError:continue
        if "3.5.4" in s:p.write_text(s.replace("3.5.4","3.5.6"),encoding="utf-8")
sw=root/"service-worker.js";s=sw.read_text(encoding="utf-8");needle="const SHELL = [";assets='\n  "./404.html", "./assets/styles/not-found-v355.css", "./assets/scripts/not-found-v355.js",'
if "not-found-v355.css" not in s:s=s.replace(needle,needle+assets)
sw.write_text(s,encoding="utf-8");print("Migração 3.5.6 aplicada")
