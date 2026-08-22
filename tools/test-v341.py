from pathlib import Path
import json,subprocess,sys
R=Path(__file__).resolve().parents[1];e=[]
cfg=json.loads((R/"data/config.json").read_text(encoding="utf-8"))
if cfg.get("versao")!="3.5.0":e.append("versão")
for p in list(R.glob("*.html"))+list((R/"products").glob("*.html")):
 s=p.read_text(encoding="utf-8");prefix="../" if p.parent.name=="products" else ""
 if prefix+"assets/styles/experience-v341.css" not in s:e.append("CSS: "+str(p.relative_to(R)))
 if prefix+"assets/scripts/experience-v341.js" not in s:e.append("JS: "+str(p.relative_to(R)))
js=(R/"assets/scripts/experience-v341.js").read_text(encoding="utf-8")
for t in ["function home()","function catalog()","function product()","function cartPage()","function account()","function support()","function contact()","function about()","function recoveryPage()","qualimax-support-draft-v341"]:
 if t not in js:e.append("recurso: "+t)
cmp=(R/"assets/scripts/platform-v340.js").read_text(encoding="utf-8")
if 'cell.scope="row"' not in cmp:e.append("comparador sem cabeçalho de linha")
r=subprocess.run(["node","--check","assets/scripts/experience-v341.js"],cwd=R,text=True,capture_output=True)
if r.returncode:e.append(r.stderr)
if e:print("v3.5.0 FAILED\n"+"\n".join(e));sys.exit(1)
print("v3.5.0: OK")
