# Arquitetura da plataforma

## Visão geral

Saúde Qualimax é uma aplicação web multipágina, estática, orientada a dados e preparada para white-label. Funciona sem backend próprio em GitHub Pages e Netlify.

Tecnologias principais: HTML semântico, CSS responsivo, JavaScript modular, JSON, IndexedDB com fallback local, Service Worker e Web App Manifest.

## Páginas

- `index.html` — Home e descoberta editorial;
- `catalogo.html` — busca, filtros, ordenação e coleções;
- `quiz.html` — descoberta guiada;
- `sobre.html` — institucional;
- `contato.html` — contato e FAQ;
- `conta.html` — perfil, favoritos, lista e histórico locais;
- `admin.html` — editor local para preparar dados antes da publicação;
- `atendimento.html` — preparação e revisão da mensagem para WhatsApp;
- `produto/*.html` — 47 páginas individuais sincronizadas a partir do catálogo;
- `offline.html` — fallback sem conexão.

## Dados

- `config.json` — empresa, marca, contato, redes, comercial, recursos, chatbot e SEO;
- `produtos.json` — catálogo de 47 produtos;
- `categorias.json` — taxonomia;
- `quiz.json` — perguntas e regras do quiz;
- `faq.json` — FAQ.

## Max

- `max-core.js` — normalização, estado e memória curta;
- `max-entidades.js` — reconhecimento de produtos e referências;
- `max-intencoes.js` — classificação e prioridade das intenções;
- `max-recomendacao.js` — ranking de similares;
- `chatbot.js` — interface e execução das ações.

## Fluxos principais

**Catálogo:** `produtos.json` → catálogo → filtros/ordenação → produto → favoritos/lista/atendimento.

**Max:** mensagem → normalização → intenção → entidades/contexto → catálogo real → resposta/ação.

**Atendimento:** origem → dados locais opcionais → produtos/interesses → revisão → abertura explícita do WhatsApp.

**Admin Studio:** dados atuais → edição local → rascunho → exportação → substituição dos arquivos → sincronização → auditoria → publicação.

## Limites arquiteturais

A versão atual não possui autenticação real, banco remoto, checkout, pagamento, estoque central ou sincronização entre dispositivos. Esses recursos exigem backend/API e nova revisão de segurança e privacidade.
