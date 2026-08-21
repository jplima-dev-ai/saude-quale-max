#!/usr/bin/env python3
from pathlib import Path
import re, sys
ROOT=Path(__file__).resolve().parents[1]
chat=(ROOT/"js/chatbot.js").read_text(encoding="utf-8").lower()
config=(ROOT/"data/config.json").read_text(encoding="utf-8").lower()
proibidos=[
    "bora","poxa","relaxa","tamo junto","prontinho","no chute",
    "garimpar o catálogo","você tá","me conta:"
]
erros=[x for x in proibidos if x in chat]
if erros:
    print("FALHA_TOM_MAX")
    for x in erros: print("-",x)
    sys.exit(1)
if "acolhedor, claro, respeitoso e sem gírias" not in config:
    print("FALHA_TOM_MAX - configuração de tom ausente")
    sys.exit(1)
for trecho in ["explicarEscolha","criteriosAtendidos","produtoMaisCoerente"]:
    if trecho not in (ROOT/"js/chatbot.js").read_text(encoding="utf-8"):
        print("FALHA_RACIOCINIO_MAX -",trecho)
        sys.exit(1)
print("MAX_TONE_AND_REASONING_TESTS_OK")
