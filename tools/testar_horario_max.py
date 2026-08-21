#!/usr/bin/env python3
from pathlib import Path
import re, sys

ROOT=Path(__file__).resolve().parents[1]
chat=(ROOT/"js/chatbot.js").read_text(encoding="utf-8")
erros=[]

required=[
    "const obterTempoLocal",
    "const saudacaoLocal",
    "const responderHorarioLocal",
    'hora < 12 ? "manha" : hora < 18 ? "tarde" : "noite"',
    '"Bom dia"',
    '"Boa tarde"',
    '"Boa noite"',
    "agora.getHours()",
]
for token in required:
    if token not in chat: erros.append(f"Ausente: {token}")

if "findLastIndex" in chat:
    erros.append("Compatibilidade: findLastIndex ainda presente")

if "produtosRejeitados.includes(Number(" in chat:
    erros.append("IDs rejeitados ainda são forçados para Number")

# Status should be removed before final answer rendering.
inicio=chat.find("const executarComProcessamento")
fim=chat.find("const adicionarAcoes",inicio)
if inicio<0 or fim<0:
    erros.append("executarComProcessamento não encontrado")
else:
    b=chat[inicio:fim]
    pos_encerrar=b.find("encerrarProcessamento();")
    pos_fn=b.find("try { fn();")
    if pos_encerrar<0 or pos_fn<0 or pos_encerrar > pos_fn:
        erros.append("Status de processamento não é encerrado antes da resposta")

if erros:
    print("FALHA_TIME_AND_MAX_FIXES")
    for e in erros: print("-",e)
    sys.exit(1)
print("MAX_TIME_AND_FIXES_TESTS_OK")
