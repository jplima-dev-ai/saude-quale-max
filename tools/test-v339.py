from pathlib import Path
import json,subprocess,sys
R=Path(__file__).resolve().parents[1];e=[];cfg=json.loads((R/"data/config.json").read_text(encoding="utf-8"))
if cfg.get("versao")!="3.5.0":e.append("versão")
ch=(R/"docs/CHANGELOG.md").read_text(encoding="utf-8")
if "## [3.5.0]" not in ch or "## [3.5.0]" not in ch or ("3.3"+".88") in ch:e.append("changelog")
chat=(R/"assets/scripts/chatbot.js").read_text(encoding="utf-8")
for t in ["responderDialogoV339","MaxDialogue?.registrarTurno",'produtosMencionados(termo)[0]||produtoContextual()']:
 if t not in chat:e.append(t)
sales=(R/"assets/scripts/max-sales.js").read_text(encoding="utf-8")
if 'const ordenados=base?[base,' not in sales:e.append("item-base não priorizado")
r=subprocess.run(["node","tools/test-max-dialogue-v339.cjs"],cwd=R,text=True,capture_output=True)
if r.returncode:e.append(r.stderr or r.stdout)
if e:print("v3.5.0 FAILED\n"+"\n".join(e));sys.exit(1)
print("v3.5.0: OK")
