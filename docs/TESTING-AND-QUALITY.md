# Testes e qualidade

## Suíte

    python tools/test-v333.py
    python tools/test-fixes-v331.py
    python tools/test-v332.py
    python tools/test-security.py
    python tools/audit-structure-v331.py
    python tools/audit-client.py
    node tools/test-max.cjs
    node tools/test-max-nlu.cjs
    node tools/test-max-basket.cjs
    node tools/test-max-decision.cjs
    python tools/test-commerce.py
    python tools/test-promotions-v33.py
    python tools/test-v351.py
    node tools/test-security-v351.cjs

## Revisão manual

- teclado, NVDA, zoom e tela estreita;
- catálogo, variantes, estoque, carrinho e orçamento;
- campanhas, kits, recompra, Alt+Q e notificações;
- MAX, Admin, exportações, PWA e offline.
- Compra Guiada, Minha Jornada, Planejador de orçamento e transferência para atendimento humano.

## Integridade

Valide JSON, JavaScript, links, slugs, imagens, CSP, sitemap, cache e ZIP. Não publique erro conhecido em fluxo essencial. Avisos aceitos precisam de impacto e plano de correção.
