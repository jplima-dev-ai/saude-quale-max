from pathlib import Path
import json,subprocess,sys
R=Path(__file__).resolve().parents[1];errors=[]
for p in list(R.glob("*.html"))+list((R/"products").glob("*.html")):
    s=p.read_text(encoding="utf-8")
    if "chatbot.js" in s:
        if "max-intelligence.js" not in s: errors.append(f"módulo ausente: {p.relative_to(R)}")
        elif s.index("max-intelligence.js")>s.index("chatbot.js"): errors.append(f"ordem incorreta: {p.relative_to(R)}")
cfg=json.loads((R/"data/config.json").read_text(encoding="utf-8"))
if cfg.get("versao")!="3.5.9": errors.append("versão incorreta")
chat=(R/"assets/scripts/chatbot.js").read_text(encoding="utf-8")
for token in ["responderInteligenciaV337","Ranking inteligente do Max","orientação de catálogo","MaxIntelligence.encontrarAproximados",'aria-keyshortcuts", "Alt+M"',"qualimax:max-recommendation"]:
    if token not in chat: errors.append("integração ausente: "+token)
sw=(R/"service-worker.js").read_text(encoding="utf-8")
if "qualimax-v3.5.9" not in sw or "max-intelligence.js" not in sw: errors.append("cache v3.5.9 incompleto")
run=subprocess.run(["node","tools/test-max-intelligence-v337.cjs"],cwd=R,text=True,capture_output=True)
if run.returncode: errors.append(run.stderr or run.stdout)
if errors: print("v3.5.9: FAILED\n"+"\n".join(errors));sys.exit(1)
print("v3.5.9: OK")
