#!/usr/bin/env python3
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1];pages=[*root.glob("*.html"),*root.glob("products/*.html")]
for page in pages:
 text=page.read_text(encoding="utf-8");prefix="../" if page.parent.name=="products" else ""
 assert f'{prefix}assets/scripts/max-personality-v345.js' in text,page
 assert text.index("max-personality-v345.js")<text.index("chatbot.js") if "chatbot.js" in text else True
chat=(root/"assets/scripts/chatbot.js").read_text(encoding="utf-8")
assert chat.count("if (responderInteligenciaV337(termo)) return;")==1
assert "respostaHumana" in chat and "MaxPersonality?.reset" in chat
assert json.loads((root/"data/config.json").read_text(encoding="utf-8"))["versao"]=="3.5.4"
print(f"v3.5.4 OK: personalidade integrada em {len(pages)} páginas")
