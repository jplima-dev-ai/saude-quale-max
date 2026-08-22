#!/usr/bin/env python3
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1];pages=[*root.glob("*.html"),*root.glob("products/*.html")]
for page in pages:
 text=page.read_text(encoding="utf-8");prefix="../" if page.parent.name=="products" else ""
 assert f'{prefix}assets/scripts/max-handoff-v346.js' in text,page
 if "chatbot.js" in text:assert text.index("max-handoff-v346.js")<text.index("chatbot.js")
chat=(root/"assets/scripts/chatbot.js").read_text(encoding="utf-8")
for feature in ("transferirParaWhatsApp","MaxHandoff?.evaluate","MaxHandoff?.unresolved","Nada será enviado automaticamente","qualimax:max-handoff"):
 assert feature in chat,feature
assert json.loads((root/"data/config.json").read_text(encoding="utf-8"))["versao"]=="3.5.9"
print(f"v3.5.9 OK: transferência integrada em {len(pages)} páginas")
