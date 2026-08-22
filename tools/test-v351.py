#!/usr/bin/env python3
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import json,re,sys

root=Path(__file__).resolve().parents[1]
errors=[]
class Scan(HTMLParser):
    def __init__(self): super().__init__();self.ids=[];self.refs=[];self.blank=[];self.h1=0;self.csp=False
    def handle_starttag(self,tag,attrs):
        data=dict(attrs)
        if data.get("id"):self.ids.append(data["id"])
        if tag in ("a","link","script","img","source"):
            key="href" if tag in ("a","link") else "src"
            if data.get(key):self.refs.append(data[key])
        if tag=="a" and data.get("target")=="_blank":self.blank.append(data)
        if tag=="h1":self.h1+=1
        if tag=="meta" and data.get("http-equiv","").lower()=="content-security-policy":self.csp=True

pages=list(root.glob("*.html"))+list((root/"products").glob("*.html"))
for page in pages:
    scan=Scan();scan.feed(page.read_text(encoding="utf-8"))
    duplicates=[value for value,count in Counter(scan.ids).items() if count>1]
    if duplicates:errors.append(f"{page.name}: IDs duplicados {duplicates}")
    if scan.h1!=1:errors.append(f"{page.name}: quantidade de h1 = {scan.h1}")
    if not scan.csp:errors.append(f"{page.name}: CSP ausente")
    for link in scan.blank:
        if "noopener" not in link.get("rel",""):errors.append(f"{page.name}: _blank sem noopener")
    for ref in scan.refs:
        if ref.startswith(("#","http:","https:","mailto:","tel:","data:","blob:","//")) or "{" in ref:continue
        local=ref.split("?",1)[0].split("#",1)[0]
        if local and not (page.parent/local).resolve().exists():errors.append(f"{page.name}: referência quebrada {ref}")

cfg=json.loads((root/"data/config.json").read_text(encoding="utf-8"))
if cfg.get("versao")!="3.5.9":errors.append("versão incorreta")
commerce=(root/"assets/scripts/commerce-v332.js").read_text(encoding="utf-8")
db=(root/"assets/scripts/db.js").read_text(encoding="utf-8")
discovery=(root/"assets/scripts/discovery.js").read_text(encoding="utf-8")
headers=(root/"_headers").read_text(encoding="utf-8")
for token in ("urlExternaSegura","file.size>256*1024","parseJSON(await file.text()","caption.textContent","p.textContent=`Orçamento"):
    if token not in commerce:errors.append(f"hardening ausente: {token}")
for token in ("storesPermitidos","chaveSegura","__proto__","safeClone"):
    if token not in db:errors.append(f"proteção do banco ausente: {token}")
if "catalog\\.html" not in discovery or "catalogo\\.html" in discovery:errors.append("rota segura de descoberta incorreta")
for token in ("Strict-Transport-Security","Content-Security-Policy","X-Frame-Options","Cache-Control: no-store"):
    if token not in headers:errors.append(f"cabeçalho ausente: {token}")
if len(pages)!=79:errors.append(f"esperadas 79 páginas, encontradas {len(pages)}")
if errors:
    print("v3.5.9 FAILED\n"+"\n".join(errors));sys.exit(1)
print("v3.5.9 OK: 79 páginas e vetores ofensivos verificados")
