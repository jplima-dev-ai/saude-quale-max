#!/usr/bin/env python3
from pathlib import Path
import re, sys

ROOT=Path(__file__).resolve().parents[1]
chat=(ROOT/"js/chatbot.js").read_text(encoding="utf-8")
core=(ROOT/"js/max-core.js").read_text(encoding="utf-8")
css=(ROOT/"style.css").read_text(encoding="utf-8")

erros=[]

for token in [
    "ultimoLoteExibido",
    "historicoProdutosExibidos",
    "produtosRejeitados",
]:
    if token not in core:
        erros.append(f"Estado sem {token}")

for funcao in [
    "iniciarProcessamento",
    "encerrarProcessamento",
    "consultaComplexa",
    "responderReferenciaSemantica",
    "produtoPorPosicao",
    "similaresMaisBaratos",
    "produtoAnteriorAoContexto",
]:
    if funcao not in chat:
        erros.append(f"Chat sem {funcao}")

for frase in ["Um momento…","Só um instante…","Estou organizando as opções…"]:
    if frase not in chat:
        erros.append(f"Status de processamento ausente: {frase}")

if 'role","status"' not in chat or 'aria-live","polite"' not in chat:
    erros.append("Status de processamento sem anúncio acessível")

if "memorizarProdutosExibidos(pagina)" not in chat:
    erros.append("Resultados exibidos não alimentam memória curta")

if "estado.produtosRejeitados" not in chat:
    erros.append("Rejeição de opções não influencia a busca")

if ".chat-processando" not in css:
    erros.append("CSS do estado de processamento ausente")

# Garante que não há texto de 'pensando' exposto.
if re.search(r'\bpensando\b',chat,re.I):
    erros.append("Interface voltou a exibir 'pensando'")

if erros:
    print("FALHA_MEMORIA_MAX")
    for erro in erros: print("-",erro)
    sys.exit(1)

print("MAX_SHORT_MEMORY_TESTS_OK")
