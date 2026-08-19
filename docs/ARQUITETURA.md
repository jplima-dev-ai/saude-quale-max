# Arquitetura da plataforma

## Visão geral

A Saúde Qualimax é uma aplicação web multipágina, estática e orientada a dados. O projeto foi desenhado para funcionar em GitHub Pages sem backend próprio.

Tecnologias principais:

- HTML semântico;
- CSS responsivo;
- JavaScript modular sem framework obrigatório;
- arquivos JSON como fonte editável do catálogo;
- IndexedDB com fallback local para estado do visitante;
- Service Worker e Web App Manifest para recursos de PWA.

## Páginas públicas

- `index.html` — Home, descoberta editorial e retomada da jornada local;
- `catalogo.html` — busca, filtros, destaques, favoritos, lista e histórico;
- `quiz.html` — descoberta guiada;
- `sobre.html` — posicionamento institucional;
- `contato.html` — canais de atendimento e FAQ;
- `produto/*.html` — 32 páginas individuais de produto;
- `offline.html` — fallback para navegação sem conexão.

## Organização do código

### Dados

`data/` concentra os arquivos editáveis:

- `config.json` — empresa, marca, contato, redes, chatbot e SEO;
- `produtos.json` — catálogo;
- `categorias.json` — taxonomia do catálogo;
- `quiz.json` — perguntas e regras do quiz;
- `faq.json` — perguntas frequentes;

### JavaScript

- `config.js` — aplica configuração e metadados;
- `produtos.js` — catálogo, filtros e modal;
- `categorias.js` — categorias;
- `quiz.js` — fluxo do quiz;
- `chatbot.js` — Max;
- `db.js` — persistência local;
- `colecoes.js` — favoritos, lista e recentes;
- `jornada.js` — retomada da navegação local;
- `descobertas.js` — trilhas editoriais;
- `produto-page.js` — páginas individuais;
- `pwa.js` — instalação, atualização e conectividade;
- `offline.js` — ação da página offline;
- `acessibilidade.js` — preferências complementares;
- `faq.js` — FAQ;
- `frame-guard.js` — defesa complementar contra incorporação em frames.

`script.js` concentra comportamentos globais de interface e navegação.

## Fluxo de dados

1. o catálogo é carregado de `data/produtos.json`;
2. os produtos são sincronizados para IndexedDB;
3. a interface renderiza cards, busca, filtros e detalhes;
4. favoritos, lista e histórico são gravados localmente;
5. a Home pode usar esses sinais para oferecer retomada da jornada;
6. o Max consulta somente os dados reais do catálogo e da configuração;
7. preço, estoque e condições comerciais permanecem sob confirmação humana.

## Limites atuais

A aplicação não possui:

- autenticação;
- backend próprio;
- banco de dados remoto;
- checkout;
- pagamento;
- estoque central;
- sincronização entre dispositivos.

Esses recursos exigiriam uma arquitetura servidor/API e uma nova revisão de segurança.
