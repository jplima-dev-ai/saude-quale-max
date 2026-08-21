#!/usr/bin/env python3
from pathlib import Path
import json,sys
R=Path(__file__).resolve().parents[1];errors=[]
for f in ["assets/styles/animations.css","assets/scripts/animations.js","docs/ANIMATIONS.md"]:
 if not (R/f).exists():errors.append("ausente: "+f)
for p in [x for x in R.glob("*.html") if x.name!="404.html"]+list((R/"products").glob("*.html")):
 t=p.read_text(encoding="utf-8");prefix="../" if p.parent.name=="products" else ""
 if prefix+"assets/styles/animations.css" not in t:errors.append(str(p)+": CSS ausente")
 if prefix+"assets/scripts/animations.js" not in t:errors.append(str(p)+": JS ausente")
cfg=json.loads((R/"data/config.json").read_text(encoding="utf-8"))
if cfg.get("versao")!="3.3.6":errors.append("versão incorreta")
if set(cfg.get("animacoes",{}))!={"ativo","nivel","estilo","revelacao","hero","cards","conversao","cabecalho"}:errors.append("configuração incompleta")
css=(R/"assets/styles/animations.css").read_text(encoding="utf-8");js=(R/"assets/scripts/animations.js").read_text(encoding="utf-8")
for token in ["prefers-reduced-motion",'data-motion-level="off"',"motion-reveal","motion-cart-bump"]:
 if token not in css:errors.append("CSS sem "+token)
for token in ["IntersectionObserver","MutationObserver","prefers-reduced-motion","const admin","qualimax-motion-preference"]:
 if token not in js:errors.append("JS sem "+token)
print("v3.3.4:","OK" if not errors else "FALHOU");print("\n".join(errors));sys.exit(bool(errors))
