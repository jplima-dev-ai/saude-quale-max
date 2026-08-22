from pathlib import Path
import json,subprocess,sys
R=Path(__file__).resolve().parents[1];e=[]
required=["guided-shopping.html","kit-builder.html","compare.html","discover.html","recipes.html","data/v340.json","assets/styles/platform-v340.css","assets/scripts/platform-v340.js"]
for x in required:
 if not (R/x).exists():e.append("ausente: "+x)
cfg=json.loads((R/"data/config.json").read_text(encoding="utf-8"))
if cfg.get("versao")!="3.5.0":e.append("versão")
routes=json.loads((R/"data/routes.json").read_text(encoding="utf-8"))
for p in required[:5]:
 if p not in routes.get("routes",{}):e.append("rota: "+p)
js=(R/"assets/scripts/platform-v340.js").read_text(encoding="utf-8")
for t in ["function guided()","function discover()","function recipes()","function kits()","function compare()","function profile()","function recovery()","function admin()","qualimax-profile-v340","qualimax-max-editor-v340","const emit="]:
 if t not in js:e.append("recurso: "+t)
for p in R.glob("*.html"):
 s=p.read_text(encoding="utf-8")
 if "platform-v340.css" not in s or "platform-v340.js" not in s:e.append("integração: "+p.name)
sw=(R/"service-worker.js").read_text(encoding="utf-8")
for t in ["qualimax-v3.5.0","guided-shopping.html","data/v340.json","platform-v340.js"]:
 if t not in sw:e.append("cache: "+t)
r=subprocess.run(["node","--check","assets/scripts/platform-v340.js"],cwd=R,text=True,capture_output=True)
if r.returncode:e.append(r.stderr)
chat=(R/"assets/scripts/chatbot.js").read_text(encoding="utf-8")
for t in ["maxBehavior.maxSuggestions","maxBehavior.allowCrossSell"]:
 if t not in chat:e.append("editor sem efeito: "+t)
if e:print("v3.5.0 FAILED\n"+"\n".join(e));sys.exit(1)
print("v3.5.0: OK")
