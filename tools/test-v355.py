#!/usr/bin/env python3
from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parents[1];errors=[];page=(root/"404.html").read_text(encoding="utf-8");haystack=page+(root/"assets/styles/not-found-v355.css").read_text(encoding="utf-8")
for token in ('data-max-excuse','aria-live="polite"','catalog.html','support.html','max-avatar-v333.svg','prefers-reduced-motion'):
    if token not in haystack:errors.append(f"404 sem {token}")
old_routes=("sobre.html","catalogo.html","conta.html","contato.html","atendimento.html","carrinho.html","campanhas.html")
for doc in (root/"docs").glob("*.md"):
    original=doc.read_text(encoding="utf-8");text=original.lower()
    for route in old_routes:
        if route in text:errors.append(f"{doc.name}: rota obsoleta {route}")
    for target in re.findall(r'\[[^]]+\]\(([^)]+)\)',original):
        if target.startswith(("http:","https:","#","mailto:")):continue
        path=(doc.parent/target.split("#")[0]).resolve()
        if not path.exists():errors.append(f"{doc.name}: link quebrado {target}")
if json.loads((root/"data/config.json").read_text(encoding="utf-8"))["versao"]!="3.5.9":errors.append("versão incorreta")
if errors:print("v3.5.9 FAILED\n"+"\n".join(errors));sys.exit(1)
print("v3.5.9 OK: página 404 e documentação validadas")
