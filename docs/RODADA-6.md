# Rodada 6 — Fluxos e acessibilidade dinâmica

- Quiz passou a aguardar a configuração centralizada e não contém WhatsApp hardcoded.
- CTA final do quiz usa o número definido em `data/config.json`.
- Contador do catálogo usa `role=status`, `aria-live` e `aria-atomic` para anunciar resultados ao leitor de tela.
- Área de mensagens do assistente foi marcada como `role=log` para comunicar novas mensagens de forma previsível.
- Validação automatizada de JavaScript, JSON, HTML e smoke test em Chromium.
