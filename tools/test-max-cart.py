from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
chat=(ROOT/'assets/scripts/chatbot.js').read_text(encoding='utf-8')
at=(ROOT/'assets/scripts/support.js').read_text(encoding='utf-8')
need=['carrinhoTotal','atualizarCarrinho','removerCarrinho','resumoCarrinho','responderCarrinho','MaxDecision',
      'definirQuantidadeCarrinho','trocarItemCarrinho','respostaOrcamentoCarrinho','diferencaParaOrcamento',
      'responderContextoDaPagina','diagnosticarRestricao']
err=[x for x in need if x not in chat]
for x in ['maxContexto?.carrinho','quantidadesMax']:
    if x not in at:err.append(x)
if err:
    print('FALHA_CARRINHO_MAX',err);sys.exit(1)
print('MAX_CART_TESTS_OK')
