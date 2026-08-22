#!/usr/bin/env python3
from pathlib import Path
import json,sys
R=Path(__file__).resolve().parents[1];errors=[]
required=["about.html","catalog.html","account.html","contact.html","support.html","cart.html","campaigns.html","assets/styles/main.css","assets/styles/animations.css","assets/scripts/site.js","data/products.json","data/routes.json","products","service-worker.js"]
for f in required:
 if not (R/f).exists():errors.append("missing: "+f)
legacy=["sobre.html","catalogo.html","conta.html","contato.html","atendimento.html","carrinho.html","campanhas.html","produto","img","js","style.css","script.js","sw.js"]
for f in legacy:
 if (R/f).exists():errors.append("legacy path remains: "+f)
cfg=json.loads((R/"data/config.json").read_text(encoding="utf-8"))
if cfg.get("versao")!="3.5.4":errors.append("wrong version")
products=json.loads((R/"data/products.json").read_text(encoding="utf-8"))["produtos"]
for item in products:
 if not (R/"products"/(item["slug"]+".html")).exists():errors.append("missing product: "+item["slug"])
for p in R.rglob("*"):
 if p.is_file() and p.suffix.lower() in {".html",".js",".css",".json",".md",".xml",".webmanifest"}:
  text=p.read_text(encoding="utf-8",errors="ignore")
  if "assets/styles/assets/styles" in text or "assets/scripts/assets/scripts" in text:errors.append("duplicated path: "+str(p))
print("v3.5.4:","OK" if not errors else "FAILED");print("\n".join(errors));sys.exit(bool(errors))
