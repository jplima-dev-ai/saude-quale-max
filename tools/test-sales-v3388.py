from pathlib import Path
import json,subprocess,sys
R=Path(__file__).resolve().parents[1];e=[]
cfg=json.loads((R/"data/config.json").read_text(encoding="utf-8"));
if cfg.get("versao")!="3.5.4":e.append("versão incorreta")
for p in list(R.glob("*.html"))+list((R/"products").glob("*.html")):
 s=p.read_text(encoding="utf-8")
 if "chatbot.js" in s and ("max-sales.js" not in s or s.index("max-sales.js")>s.index("chatbot.js")):e.append("módulo ausente ou fora de ordem: "+str(p.relative_to(R)))
chat=(R/"assets/scripts/chatbot.js").read_text(encoding="utf-8")
for t in ["responderVendasV338","alternativasEconomicas","Adicionar seleção ao carrinho","Não vou criar urgência falsa","MaxSales.urgenciaVerdadeira"]:
 if t not in chat:e.append("integração ausente: "+t)
sw=(R/"service-worker.js").read_text(encoding="utf-8")
if "qualimax-v3.5.4" not in sw or "max-sales.js" not in sw:e.append("cache incompleto")
r=subprocess.run(["node","tools/test-max-sales-v3388.cjs"],cwd=R,text=True,capture_output=True)
if r.returncode:e.append(r.stderr or r.stdout)
if e:print("v3.5.4: FAILED\n"+"\n".join(e));sys.exit(1)
print("v3.5.4: OK")
