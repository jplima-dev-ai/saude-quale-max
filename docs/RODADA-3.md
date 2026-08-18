# Saúde Qualemax v1.1 — Rodada 3

## Implementado

- Configuração centralizada com evento `qualemax:config-ready`.
- SEO configurável a partir de `data/config.json`.
- Catálogo e chatbot aguardam a configuração antes de montar links dependentes do contato.
- Removidos fallbacks de WhatsApp hardcoded dos módulos de catálogo e chatbot.
- Chatbot respeita `chatbot.ativo`.
- Chatbot com gerenciamento de foco, Escape e armadilha de foco por teclado.
- Chatbot integrado ao catálogo e categorias carregados dos mesmos JSONs.
- Modal de produto com gerenciamento de foco e Escape.
- Foco visível reforçado nos componentes interativos.
- Bloqueio de rolagem do documento enquanto modal/chatbot estão abertos.
- Ajustes mobile para evitar sobreposição dos controles flutuantes.
- Quiz com linguagem mais neutra, centrada em preferências e exploração do catálogo.

## Validações

- JavaScript: sintaxe validada com Node.js.
- JSON: todos os arquivos em `data/` validados.
- HTML: 1 H1 principal e nenhum ID duplicado.
- Referências de WhatsApp: centralizadas por configuração.

## Próxima rodada

- Revisão visual completa e design system.
- SEO estruturado e dados Schema.org configuráveis.
- Auditoria de performance de imagens.
- Revisão de headings, landmarks e ordem de leitura com foco em NVDA.
- Testes automatizados de navegação por teclado e estados interativos.
- Documentação comercial do template.
