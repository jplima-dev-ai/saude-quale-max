#!/usr/bin/env python3
from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parents[1]; errors=[]
cfg=json.loads((root/"data/config.json").read_text(encoding="utf-8"))
if cfg.get("versao")!="3.5.9":errors.append("versão incorreta")
cart=(root/"cart.html").read_text(encoding="utf-8")
commerce=(root/"assets/scripts/commerce-v333.js").read_text(encoding="utf-8")
if "checkout-steps" not in cart or "Continuar para entrega" not in cart:errors.append("checkout guiado ausente")
if "🛒" in commerce or "icons/cart.svg" not in commerce:errors.append("ícone vetorial do carrinho ausente")
for token in ["quantity-control","confirm(`Remover","support.html?origem=carrinho"]:
    if token not in commerce:errors.append(f"recurso do carrinho ausente: {token}")
pages=list(root.rglob("*.html"))
if any("performance-v353.js" not in p.read_text(encoding="utf-8") for p in pages):errors.append("modo leve não integrado em todas as páginas")
if not (root/"assets/images/icons/cart.svg").exists():errors.append("SVG do carrinho ausente")
if errors:print("v3.5.9 FAILED\n"+"\n".join(errors));sys.exit(1)
print(f"v3.5.9 OK: checkout acessível e modo leve integrados em {len(pages)} páginas")
