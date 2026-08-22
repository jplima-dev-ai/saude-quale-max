#!/usr/bin/env python3
from pathlib import Path
import json

root=Path(__file__).resolve().parents[1]
pages=[*root.glob("*.html"),*root.glob("products/*.html")]
for page in pages:
    text=page.read_text(encoding="utf-8")
    prefix="../" if page.parent.name=="products" else ""
    assert f'{prefix}assets/styles/responsive-v343.css' in text,page
    assert 'name="viewport"' in text,page
css=(root/"assets/styles/responsive-v343.css").read_text(encoding="utf-8")
for feature in ("100dvh","safe-area-inset-bottom","forced-colors","touch-action","max-height:560px"):
    assert feature in css,feature
config=json.loads((root/"data/config.json").read_text(encoding="utf-8"))
assert config["versao"]=="3.5.0"
sw=(root/"service-worker.js").read_text(encoding="utf-8")
assert 'qualimax-v3.5.0' in sw and 'responsive-v343.css' in sw
print(f"v3.5.0 OK: {len(pages)} páginas responsivas integradas")
