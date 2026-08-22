#!/usr/bin/env python3
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
pages=[*root.glob("*.html"),*root.glob("products/*.html")]
for page in pages:
    text=page.read_text(encoding="utf-8")
    prefix="../" if page.parent.name=="products" else ""
    assert f'{prefix}assets/scripts/screenreader-v344.js' in text,page
script=(root/"assets/scripts/screenreader-v344.js").read_text(encoding="utf-8")
for feature in ("aria-live","aria-atomic","caption","scope=\"col\"","preventScroll","abre em nova janela"):
    assert feature in script,feature
assert json.loads((root/"data/config.json").read_text(encoding="utf-8"))["versao"]=="3.5.0"
assert 'qualimax-v3.5.0' in (root/"service-worker.js").read_text(encoding="utf-8")
print(f"v3.5.0 OK: {len(pages)} páginas com camada para leitores de tela")
