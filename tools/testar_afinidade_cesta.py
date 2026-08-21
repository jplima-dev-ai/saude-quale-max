#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
core=(ROOT/"js/max-core.js").read_text(encoding="utf-8")
chat=(ROOT/"js/chatbot.js").read_text(encoding="utf-8")
decision=(ROOT/"js/max-decision.js").read_text(encoding="utf-8")
erros=[]

for token in ["produtosGostei","produtosTalvez","presente","produtoIds"]:
    if token not in core: erros.append(f"estado sem {token}")

for token in [
    "marcarAfinidade","responderAfinidade","produtosPorAfinidade",
    "responderModoPresente","montarCestaPresente",
    "detectarDestinatarioPresente"
]:
    if token not in chat: erros.append(f"chat sem {token}")

for token in ["montarCestaPorOrcamento","avaliarCesta"]:
    if token not in decision: erros.append(f"decision sem {token}")

if "estado.produtosGostei?.includes(String(produto.id))" not in chat:
    erros.append("gostei não influencia ranking")

for frase in ["como “gostei”","como “talvez”","como “não gostei”"]:
    if frase not in chat: erros.append(f"feedback ausente: {frase}")

if erros:
    print("FALHA_AFINIDADE_CESTA")
    for e in erros: print("-",e)
    sys.exit(1)

print("MAX_AFFINITY_GIFT_TESTS_OK")
