#!/usr/bin/env python3
from pathlib import Path
import json,re,sys
root=Path(__file__).resolve().parents[1];errors=[];pages=[*root.glob("*.html"),*root.glob("products/*.html")]
for page in pages:
    h=page.read_text(encoding="utf-8");prefix="../" if page.parent.name=="products" else ""
    for asset in (f'{prefix}assets/styles/accessibility-v354.css',f'{prefix}assets/scripts/accessibility-v354.js'):
        if asset not in h:errors.append(f"{page.name}: camada 3.5.4 ausente")
    if not re.search(r'<meta name="viewport"[^>]*width=device-width',h,re.I):errors.append(f"{page.name}: viewport ausente")
    if "user-scalable=no" in h or "maximum-scale=1" in h:errors.append(f"{page.name}: zoom bloqueado")
css=(root/"assets/styles/accessibility-v354.css").read_text(encoding="utf-8")
js=(root/"assets/scripts/accessibility-v354.js").read_text(encoding="utf-8")
for token in ("pointer:coarse","forced-colors:active","prefers-contrast:more","orientation:landscape","min-width:600px","prefers-reduced-motion:reduce"):
    if token not in css:errors.append(f"CSS sem {token}")
for token in ("visualViewport","orientationchange","a354-modal-open","inert=true","autocomplete","invalid"):
    if token not in js:errors.append(f"JS sem {token}")
if json.loads((root/"data/config.json").read_text(encoding="utf-8"))["versao"]!="3.5.4":errors.append("versão incorreta")
if errors:print("v3.5.4 FAILED\n"+"\n".join(errors));sys.exit(1)
print(f"v3.5.4 OK: matriz acessível integrada em {len(pages)} páginas")
