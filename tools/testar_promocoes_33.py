#!/usr/bin/env python3
from pathlib import Path
import json, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
cfg=json.loads((ROOT/"data/config.json").read_text(encoding="utf-8"))
erros=[]
if not (ROOT/"js/promocoes.js").exists(): erros.append("motor de promoções ausente")
p=cfg.get("promocoes",{})
if p.get("freteGratis",{}).get("valorMinimo")!=120: erros.append("limite de frete grátis inesperado")
codigos={c.get("codigo") for c in p.get("cupons",[])}
for c in ["BEMVINDO10","QUALIMAX5","CHA15","FRETEGRATIS"]:
    if c not in codigos: erros.append(f"cupom ausente: {c}")
for arquivo,tokens in {
 "atendimento.html":["data-atendimento-aplicar-cupom","data-frete-barra","data-atendimento-pontos-gerados"],
 "conta.html":["data-conta-pontos","data-conta-cupons"],
 "admin.html":["data-admin-panel=\"promocoes\"","data-admin-promocoes-form"],
 "js/chatbot.js":["responderBeneficios","melhorCupom","faltaFrete"],
 "js/atendimento.js":["beneficiosEstimados","cupomAplicado","pontosGerados"],
}.items():
 t=(ROOT/arquivo).read_text(encoding="utf-8")
 for token in tokens:
  if token not in t: erros.append(f"{arquivo}: falta {token}")
r=subprocess.run(["node","--check",str(ROOT/"js/promocoes.js")],capture_output=True,text=True)
if r.returncode: erros.append("promocoes.js com erro de sintaxe")
if erros:
 print("FALHA_PROMOCOES_33")
 for e in erros: print("-",e)
 sys.exit(1)
print("PROMOCOES_33_TESTS_OK")
