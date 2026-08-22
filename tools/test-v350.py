#!/usr/bin/env python3
import json
from pathlib import Path

root=Path(__file__).resolve().parents[1]
admin=(root/"admin.html").read_text(encoding="utf-8")
script=(root/"assets/scripts/admin-products-v350.js").read_text(encoding="utf-8")
style=(root/"assets/styles/admin-products-v350.css").read_text(encoding="utf-8")
config=json.loads((root/"data/config.json").read_text(encoding="utf-8"))
routes=json.loads((root/"data/routes.json").read_text(encoding="utf-8"))
sw=(root/"service-worker.js").read_text(encoding="utf-8")

assert config["versao"]=="3.5.9"
assert routes["version"]=="3.5.9"
assert "admin-products-v350.css" in admin and "admin-products-v350.js" in admin
for marker in ("data-v350-filtro-categoria","data-v350-aplicar-reajuste","data-v350-exportar-csv","data-v350-quality-value"):
    assert marker in admin, marker
for marker in ("filtrarOrdenar","price-adjustment","downloadCSV","qualidade"):
    assert marker in script, marker
assert "prefers-reduced-motion" in style
assert "admin-products-v350.js" in sw and "qualimax-v3.5.9" in sw
print("v3.5.9 OK: central profissional de produtos integrada")
