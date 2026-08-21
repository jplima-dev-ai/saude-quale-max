# Arquitetura

## Visão geral

A Saúde Qualimax é uma aplicação web estática, multipágina e white-label em HTML, CSS e JavaScript. Funciona em GitHub Pages e Netlify sem compilação ou backend obrigatório.

## Camadas

- Interface: páginas HTML, style.css e v333.css.
- Aplicação: módulos em assets/scripts/.
- Dados publicados: JSON em data/.
- Persistência local: localStorage e IndexedDB.
- Offline: service-worker.js e manifest.webmanifest.
- Operação: scripts Python e Node em tools/.

## Páginas

| Página | Responsabilidade |
|---|---|
| index.html | Entrada e descoberta |
| catalog.html | Busca, filtros, comparação e carrinho |
| products/ | Conteúdo individual |
| cart.html | Quantidades, orçamento e pedido preparado |
| campaigns.html | Campanhas, kits e combos |
| account.html | Perfil, jornada e recompra |
| support.html | Revisão antes do WhatsApp |
| admin.html | Edição e inteligência comercial local |

## Dados

- data/config.json: identidade, contato, SEO, MAX e recursos.
- data/products.json: catálogo e preços fixos.
- data/categories.json: taxonomia.
- data/v333.json: estoque, variantes, kits, campanhas e notificações.
- data/quiz.json, data/faq.json e data/baskets.json: conteúdos auxiliares.

## Persistência

Perfil, carrinho, pedidos preparados e eventos permanecem no dispositivo. Não há sincronização central. O WhatsApp só abre após ação explícita.

## Limites

Sem backend, não existem autenticação real, estoque central, pagamento online, pedidos transacionais ou sincronização entre dispositivos. O Admin Studio é um editor local, não uma área protegida.\n