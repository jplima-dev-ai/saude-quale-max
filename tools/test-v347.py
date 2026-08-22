#!/usr/bin/env python3
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1];products=json.loads((root/"data/products.json").read_text(encoding="utf-8"))["produtos"]
assert len(products)==60
new=[p for p in products if p["id"]>=48];assert len(new)==13
assert len({p["slug"] for p in products})==60
for p in new:
 assert p.get("preco_fixo") is True and p["preco"]>0
 assert (root/"assets/images"/p["imagem"]).is_file(),p["imagem"]
 assert (root/"products"/f'{p["slug"]}.html').is_file(),p["slug"]
 assert not p.get("preco_aproximado")
cats=json.loads((root/"data/categories.json").read_text(encoding="utf-8"))["categorias"]
assert {"farinhas","frutas-secas","snacks"}<={x["id"] for x in cats}
sitemap=(root/"sitemap.xml").read_text(encoding="utf-8")
assert "products/omega-3.html" in sitemap and "budget-planner.html" in sitemap
print("v3.5.4 OK: 60 produtos, 13 novos e 3 categorias novas")
