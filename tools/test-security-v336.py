from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
errors=[]
for p in root.rglob("*.html"):
    s=p.read_text(encoding="utf-8")
    tag="../assets/scripts/security.js" if p.parent.name=="products" else "assets/scripts/security.js"
    if tag not in s: errors.append(f"security.js ausente: {p.relative_to(root)}")
    if s.find(tag) > s.find("commerce-v333.js") >= 0: errors.append(f"ordem insegura: {p.relative_to(root)}")
sec=(root/"assets/scripts/security.js").read_text(encoding="utf-8")
for token in ['"__proto__"','"prototype"','"constructor"','depth > 12','slice(0, 100)','slice(-500)']:
    if token not in sec: errors.append(f"controle ausente: {token}")
admin=(root/"assets/scripts/admin.js").read_text(encoding="utf-8")
if "12*1024*1024" not in admin or "QualimaxSecurity?.parseJSON" not in admin: errors.append("importação administrativa não endurecida")
sw=(root/"service-worker.js").read_text(encoding="utf-8")
for token in ['qualimax-v3.5.4','headers.has("range")','const cacheavel','semQuery && cacheavel']:
    if token not in sw: errors.append(f"service worker: {token}")
headers=(root/"_headers").read_text(encoding="utf-8")
for token in ["frame-ancestors 'none'","Cross-Origin-Opener-Policy: same-origin","Cross-Origin-Resource-Policy: same-origin"]:
    if token not in headers: errors.append(f"header ausente: {token}")
if errors: raise SystemExit("\n".join(errors))
print("Segurança v3.3.6: OK")
