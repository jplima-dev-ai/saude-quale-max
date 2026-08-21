#!/usr/bin/env python3
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
chat=(ROOT/"assets/scripts/chatbot.js").read_text(encoding="utf-8")
decision=(ROOT/"assets/scripts/max-decision.js").read_text(encoding="utf-8")
erros=[]

for token in [
    "aplicarContextoPaginaAoEstado",
    "responderContextoDaPagina",
    "diagnosticarRestricao",
    "contarComPreferencias",
    "definirQuantidadeCarrinho",
    "trocarItemCarrinho",
    "respostaOrcamentoCarrinho",
]:
    if token not in chat: erros.append(f"chat sem {token}")

for token in ["avaliarConfianca","sugestaoConflito","temFiltros","filtros"]:
    if token not in decision: erros.append(f"decision sem {token}")

if chat.count("if (responderDecisionEngine(termo)) return;") != 1:
    erros.append("Decision Engine deve ser chamado uma única vez no fluxo principal")

if "aplicarContextoPaginaAoEstado();" not in chat:
    erros.append("Contexto da página não é aplicado na inicialização")

if "O ponto que mais restringe a busca" not in chat:
    erros.append("Diagnóstico de zero resultados ausente")

if erros:
    print("FALHA_DECISION_328")
    for e in erros: print("-",e)
    sys.exit(1)
print("MAX_DECISION_328_TESTS_OK")
