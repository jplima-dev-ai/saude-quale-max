#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
chat=(ROOT/"js/chatbot.js").read_text(encoding="utf-8")
core=(ROOT/"js/max-core.js").read_text(encoding="utf-8")
erros=[]

for token in [
    "produtosGostei","produtosTalvez","produtosNaoGostei",
    "presente: { ativo:false",
]:
    if token not in core:
        erros.append(f"estado ausente: {token}")

for token in [
    "marcarAfinidade","responderAfinidade","produtosPorAfinidade",
    "detectarDestinatarioPresente","montarCestaPresente","responderModoPresente",
    "Adicionar cesta à seleção","outra cesta até",
]:
    if token not in chat:
        erros.append(f"recurso ausente: {token}")

if "if (responderAfinidade(termo)) return;" not in chat:
    erros.append("afinidade não está ligada ao fluxo principal")
if "if (responderModoPresente(termo)) return;" not in chat:
    erros.append("modo presente não está ligado ao fluxo principal")

# Limpar preferências não pode apagar carrinho/afinidades.
limpar_ini=chat.find("const limparPreferencias")
limpar_fim=chat.find("const aplicarContextoCatalogo",limpar_ini)
bloco=chat[limpar_ini:limpar_fim]
for token in ["const carrinho=","estado.carrinho=carrinho","estado.produtosGostei=gostei","estado.produtosTalvez=talvez"]:
    if token not in bloco:
        erros.append(f"limpar preferências não preserva: {token}")

# Outra cesta deve levar em conta a cesta anterior.
if "excluirAnterior" not in chat or "estado.presente.produtoIds" not in chat:
    erros.append("nova cesta não exclui a combinação anterior")
if "categoriasPresente" not in chat or "cuidados-pessoais" not in chat:
    erros.append("cesta padrão não restringe categorias adequadas a presente")
if r"/\bminha avo\b/" not in chat or r"/\bmeu avo\b/" not in chat:
    erros.append("destinatário avó/avô não está desambiguado")

# Adição incremental
if "adiciona|coloca|inclui" not in chat or "mais\\s+" not in chat:
    erros.append("incremento conversacional de quantidade ausente")

if erros:
    print("FALHA_AFINIDADE_PRESENTE")
    for e in erros: print("-",e)
    sys.exit(1)
print("MAX_AFFINITY_GIFT_TESTS_OK")
