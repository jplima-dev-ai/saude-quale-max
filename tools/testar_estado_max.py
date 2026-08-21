#!/usr/bin/env python3
from pathlib import Path
import re, sys
ROOT=Path(__file__).resolve().parents[1]
core=(ROOT/"js/max-core.js").read_text(encoding="utf-8")
erros=[]
for key in ["produtosGostei","produtosTalvez","produtosNaoGostei","presente"]:
    count=len(re.findall(rf"^\s*{key}:\s*",core,re.M))
    if count!=1: erros.append(f"{key}: esperado 1, encontrado {count}")
for key in ["estado.produtosGostei = []","estado.produtosTalvez = []","estado.produtosNaoGostei = []","estado.presente = {"]:
    count=core.count(key)
    if count!=1: erros.append(f"reset {key}: esperado 1, encontrado {count}")
if erros:
    print("FALHA_ESTADO_MAX")
    for e in erros: print("-",e)
    sys.exit(1)
print("MAX_STATE_SCHEMA_TESTS_OK")
