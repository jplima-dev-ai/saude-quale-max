# Testes e qualidade

## Suíte mínima de release

```bash
python3 tools/audit-structure-v331.py
python3 tools/audit-screenreader-v344.py
python3 tools/audit-client.py
python3 tools/test-security.py
python3 tools/test-commerce.py
python3 tools/test-v359.py
node tools/test-max.cjs
node tools/test-max-nlu.cjs
node tools/test-max-basket.cjs
node tools/test-max-decision.cjs
node tools/test-security-v351.cjs
```

Para a regressão completa, execute todos os arquivos `tools/test-*.py` e `tools/test-*.cjs`. Um teste visual ignorado por falta de navegador não equivale a aprovação; registre a limitação e realize a matriz manual.

## Revisão manual

- teclado, NVDA, zoom e tela estreita;
- catálogo, variantes, estoque, carrinho e orçamento;
- campanhas, kits, recompra, Alt+Q e notificações;
- MAX, Admin, exportações, PWA e offline;
- Compra Guiada, Minha Jornada, Planejador de orçamento e transferência para atendimento humano.

## Integridade

Valide JSON, JavaScript, links, slugs, imagens, CSP, sitemap, cache e ZIP. Não publique erro conhecido em fluxo essencial. Avisos aceitos precisam de impacto e plano de correção.
