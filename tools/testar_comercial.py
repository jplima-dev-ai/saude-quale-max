#!/usr/bin/env python3
from pathlib import Path
import json, sys
ROOT=Path(__file__).resolve().parents[1]
erros=[]
produtos=json.loads((ROOT/"data/produtos.json").read_text(encoding="utf-8"))["produtos"]
if len(produtos)!=47: erros.append(f"Esperados 47 produtos, encontrados {len(produtos)}")
for p in produtos:
    if not isinstance(p.get("preco"),(int,float)) or p["preco"]<=0: erros.append(f"{p.get('nome')}: preço inválido")
    if not p.get("apresentacao"): erros.append(f"{p.get('nome')}: apresentação ausente")
    if p.get("venda_tipo") not in ("unidade","peso"): erros.append(f"{p.get('nome')}: venda_tipo inválido")
at=(ROOT/"atendimento.html").read_text(encoding="utf-8")
atjs=(ROOT/"js/atendimento.js").read_text(encoding="utf-8")
for x in ['value="Pix"','value="Dinheiro em espécie"',"data-atendimento-total"]:
    if x not in at: erros.append(f"Atendimento sem {x}")
for x in ["TOTAL ESTIMADO","subtotal","data-atendimento-quantidade"]:
    if x not in atjs: erros.append(f"Cálculo/mensagem sem {x}")
maxjs=(ROOT/"js/chatbot.js").read_text(encoding="utf-8")
if "extrairOrcamento" not in maxjs or "precoTexto" not in maxjs: erros.append("Max sem inteligência de preço")
admin=(ROOT/"admin.html").read_text(encoding="utf-8")
for x in ['name="preco"','name="apresentacao"','name="venda_tipo"']:
    if x not in admin: erros.append(f"Admin sem {x}")
if erros:
    print("FALHA_COMERCIAL")
    for e in erros: print("-",e)
    sys.exit(1)
print("COMMERCIAL_REGRESSION_TESTS_OK")
