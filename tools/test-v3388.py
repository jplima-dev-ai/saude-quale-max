from pathlib import Path
import json,subprocess,sys
R=Path(__file__).resolve().parents[1];e=[]
for p in R.rglob("*"):
 if p.is_file() and p.suffix.lower() in {".html",".js",".json",".md",".py",".cjs",".webmanifest"} and ("3"+".7"+".8") in p.read_text(encoding="utf-8",errors="ignore"):e.append("versão antiga em "+str(p.relative_to(R)))
cfg=json.loads((R/"data/config.json").read_text(encoding="utf-8"));
if cfg.get("versao")!="3.5.0":e.append("versão incorreta")
for p in list(R.glob("*.html"))+list((R/"products").glob("*.html")):
 s=p.read_text(encoding="utf-8")
 if "chatbot.js" in s and ("max-sales-advanced.js" not in s or s.index("max-sales-advanced.js")>s.index("chatbot.js")):e.append("módulo fora de ordem: "+str(p.relative_to(R)))
chat=(R/"assets/scripts/chatbot.js").read_text(encoding="utf-8")
for t in ["responderVendasAvancadasV338","planoEconomia","pedidoRecente","faltaFrete","proximoPasso"]:
 if t not in chat:e.append("integração ausente: "+t)
r=subprocess.run(["node","tools/test-max-sales-advanced-v3388.cjs"],cwd=R,text=True,capture_output=True)
if r.returncode:e.append(r.stderr or r.stdout)
if e:print("v3.5.0: FAILED\n"+"\n".join(e));sys.exit(1)
print("v3.5.0: OK")
