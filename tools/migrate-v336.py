from pathlib import Path
import json, re

ROOT = Path(__file__).resolve().parents[1]

for html in ROOT.rglob("*.html"):
    s = html.read_text(encoding="utf-8")
    prefix = "../" if html.parent.name == "products" else ""
    tag = f'<script src="{prefix}assets/scripts/security.js" defer></script>'
    if tag not in s:
        pos = s.find("<script ")
        s = s[:pos] + tag + s[pos:] if pos >= 0 else s.replace("</body>", tag + "</body>")
    html.write_text(s, encoding="utf-8")

commerce = ROOT / "assets/scripts/commerce-v333.js"
s = commerce.read_text(encoding="utf-8")
s = s.replace('const money=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}),read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));',
'''const SEC=window.QualimaxSecurity,money=v=>Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}),read=(k,d)=>SEC?.readStorage(k,d)??d,write=(k,v)=>SEC?.writeStorage(k,v);''')
s = s.replace('x.qtd=Math.max(1,Number(inp.value)||1)', 'x.qtd=Math.min(99,Math.max(1,Number(inp.value)||1))')
s = s.replace('console.warn("Qualimax v3.3.4:"', 'console.warn("Qualimax v3.3.6:"')
commerce.write_text(s, encoding="utf-8")

admin = ROOT / "assets/scripts/admin.js"
s = admin.read_text(encoding="utf-8").replace('ADMIN_BACKUP_VERSION="3.3.5"', 'ADMIN_BACKUP_VERSION="3.3.6"')
s = s.replace('if(file.size>64*1024*1024) throw new Error("Backup muito grande");\n            const b=JSON.parse(await file.text());', 'if(file.size>12*1024*1024) throw new Error("Backup muito grande");\n            const b=window.QualimaxSecurity?.parseJSON(await file.text(),null,12*1024*1024);\n            if(!b) throw new Error("JSON inseguro");')
admin.write_text(s, encoding="utf-8")

db = ROOT / "assets/scripts/db.js"
s = db.read_text(encoding="utf-8")
s = s.replace('if (evento.data?.origem !== "qualimax") return;', 'if (evento.data?.origem !== "qualimax" || typeof evento.data?.tipo !== "string" || evento.data.tipo.length > 50 || !Number.isFinite(evento.data?.em)) return;')
db.write_text(s, encoding="utf-8")

sw = ROOT / "service-worker.js"
s = sw.read_text(encoding="utf-8").replace('qualimax-v3.3.5', 'qualimax-v3.3.6')
s = s.replace('"./assets/scripts/animations.js",', '"./assets/scripts/animations.js", "./assets/scripts/security.js",')
s = s.replace('const url = new URL(event.request.url);', 'const url = new URL(event.request.url);\n  if (url.username || url.password || event.request.headers.has("range")) return;')
s = s.replace('const semQuery = url.search === "";', 'const semQuery = url.search === "";\n    const cacheavel = /\\.(?:html|css|js|json|webmanifest|png|jpe?g|webp|svg|ico|woff2?)$/i.test(url.pathname) || url.pathname.endsWith("/");')
s = s.replace('if (response && response.ok && response.type === "basic" && semQuery) {', 'if (response && response.ok && response.type === "basic" && semQuery && cacheavel) {')
sw.write_text(s, encoding="utf-8")

for rel in ["README.md", "SECURITY.md", "data/config.json", "data/products.json", "data/routes.json"]:
    p = ROOT / rel
    if p.exists(): p.write_text(p.read_text(encoding="utf-8").replace("3.3.5", "3.3.6"), encoding="utf-8")

for rel in ["tools/test-fixes-v331.py", "tools/test-v334.py", "tools/test-v335.py", "tools/audit-client.py"]:
    p = ROOT / rel
    p.write_text(p.read_text(encoding="utf-8").replace("3.3.5", "3.3.6"), encoding="utf-8")
legacy_security = ROOT / "tools/test-security.py"
legacy_security.write_text(legacy_security.read_text(encoding="utf-8").replace('file.size>64*1024*1024', 'file.size>12*1024*1024'), encoding="utf-8")

headers = ROOT / "_headers"
s = headers.read_text(encoding="utf-8")
if "Cross-Origin-Opener-Policy" not in s:
    s += "  Cross-Origin-Opener-Policy: same-origin\n  Cross-Origin-Resource-Policy: same-origin\n"
headers.write_text(s, encoding="utf-8")
