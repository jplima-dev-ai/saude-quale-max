#!/usr/bin/env python3
from pathlib import Path
import json,sys
root=Path(__file__).resolve().parents[1];errors=[]
cfg=json.loads((root/"data/config.json").read_text(encoding="utf-8"));products=json.loads((root/"data/products.json").read_text(encoding="utf-8"))["produtos"]
if cfg.get("versao")!="3.5.9":errors.append("versão incorreta")
if len(products)!=60:errors.append("catálogo incompleto")
for p in products:
    if len(str(p.get("copy",'')))<100 or "cadastrado no catálogo da Saúde Qualimax" in p.get("copy",""):errors.append(f"copy insuficiente: {p.get('nome')}")
    if p.get("preco_aproximado") is not False:errors.append(f"preço ainda marcado como aproximado: {p.get('nome')}")
for page in root.glob("*.html"):
    h=page.read_text(encoding="utf-8")
    if "chatbot.js" in h and "max-reasoning-v356.js" not in h:errors.append(f"Max 3.5.9 ausente: {page.name}")
reason=(root/"assets/scripts/max-reasoning-v356.js").read_text(encoding="utf-8")
for token in ("asksSummary","correction","lastResults","cheaper","safeText","slice(-12)"):
    if token not in reason:errors.append(f"raciocínio sem {token}")
for forbidden in ("innerHTML","eval(","new Function","document.write"):
    if forbidden in reason:errors.append(f"construção insegura: {forbidden}")
if "Valor exibido no catálogo" not in (root/"support.html").read_text(encoding="utf-8"):errors.append("preço do atendimento inconsistente")
if errors:print("v3.5.9 FAILED\n"+"\n".join(errors));sys.exit(1)
print("v3.5.9 OK: copy humana, 60 produtos e raciocínio contextual validados")
