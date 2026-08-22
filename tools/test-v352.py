#!/usr/bin/env python3
from pathlib import Path
import json,subprocess,sys,re
root=Path(__file__).resolve().parents[1];errors=[]
cfg=json.loads((root/"data/config.json").read_text(encoding="utf-8"))
routes=json.loads((root/"data/routes.json").read_text(encoding="utf-8"))
admin=(root/"admin.html").read_text(encoding="utf-8")
script=(root/"assets/scripts/client-customizer-v352.js").read_text(encoding="utf-8")
config_script=(root/"assets/scripts/config.js").read_text(encoding="utf-8")
style=(root/"assets/styles/client-customizer-v352.css").read_text(encoding="utf-8")
sw=(root/"service-worker.js").read_text(encoding="utf-8")
if cfg.get("versao")!="3.5.4" or routes.get("version")!="3.5.4":errors.append("versão")
for token in ("client-customizer-v352.js","client-customizer-v352.css"):
    if token not in admin or token not in sw:errors.append(f"integração {token}")
for token in ("Personalizar site","data-wl-auto-seo","qualimax-client-profile","data-wl-preview-logo","file.size>2*1024*1024","conteudo.home.titulo"):
    if token not in script:errors.append(f"recurso {token}")
if len(re.findall(r'\w+:"[^"]+"',script.split("featureLabels=",1)[1].split("};",1)[0]))!=14:errors.append("14 recursos configuráveis")
for token in ("aplicarConteudoPersonalizado","config.conteudo","textContent"):
    if token not in config_script:errors.append(f"frontend {token}")
if "prefers-reduced-motion" not in style:errors.append("movimento reduzido")
check=subprocess.run(["node","--check","assets/scripts/client-customizer-v352.js"],cwd=root,capture_output=True,text=True)
if check.returncode:errors.append(check.stderr)
if errors:print("v3.5.4 FAILED\n"+"\n".join(errors));sys.exit(1)
print("v3.5.4 OK: White-label Studio integrado")
