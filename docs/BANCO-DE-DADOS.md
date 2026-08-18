# Banco de dados — Saúde Qualimax v2.0

## Tecnologia
A v2.0 usa IndexedDB, banco de dados local nativo do navegador. Isso mantém o projeto compatível com GitHub Pages e outras hospedagens estáticas.

## Fonte de verdade do catálogo
`data/produtos.json` continua sendo a fonte editável do template. Ao carregar o catálogo, os produtos são sincronizados para a store `produtos` do IndexedDB.

## Stores
- `produtos`: catálogo local sincronizado;
- `favoritos`: produtos marcados como favoritos;
- `interesse`: produtos adicionados à lista de interesse;
- `historico`: produtos abertos recentemente;
- `meta`: metadados de sincronização.

## Privacidade
Esses dados ficam no navegador/dispositivo do visitante. Não são enviados automaticamente para a Saúde Qualimax. A lista de interesse só vira informação enviada à loja quando o visitante escolhe consultar pelo WhatsApp.

## Fallback
Se IndexedDB não puder ser aberto, o sistema possui fallback local para evitar quebra dos recursos principais.

## O que IndexedDB não substitui
Para estoque central, pedidos, autenticação, pagamentos, sincronização entre dispositivos e painel administrativo remoto será necessário backend e banco de dados servidor em uma futura evolução.
