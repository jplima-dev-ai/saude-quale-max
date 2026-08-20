# Saúde Qualimax — Plataforma Web

**Versão atual: 3.1**

Plataforma web multipágina para descoberta e atendimento de produtos naturais, construída com foco em acessibilidade, navegação orientada a dados e conversão via WhatsApp.

## Principais recursos

- catálogo com busca e filtros;
- 32 páginas individuais de produto;
- favoritos e lista de interesse;
- histórico e retomada da jornada local;
- quiz de descoberta;
- Max, assistente local contextual;
- produtos relacionados;
- trilhas editoriais;
- IndexedDB com fallback local;
- PWA e modo offline;
- compartilhamento;
- SEO multipágina e dados estruturados;
- acessibilidade para teclado e leitores de tela.

## Stack

HTML, CSS, JavaScript modular, JSON, IndexedDB, Service Worker e Web App Manifest.

O projeto não depende de framework frontend nem backend próprio na arquitetura atual.

## Estrutura principal

```text
/
├── index.html
├── catalogo.html
├── quiz.html
├── sobre.html
├── contato.html
├── offline.html
├── produto/
├── data/
├── js/
├── img/
├── docs/
├── manifest.webmanifest
├── sw.js
├── sitemap.xml
├── robots.txt
└── SECURITY.md
```

## Configuração

Dados de marca, contato, redes e SEO ficam em `data/config.json`.

Produtos e categorias ficam em:

- `data/produtos.json`
- `data/categorias.json`

A copy editorial da interface ainda não está totalmente centralizada em um único arquivo de dados; partes da Home permanecem no HTML e outras nos JSONs de produto/categoria.

## Documentação

Comece por [`docs/README.md`](docs/README.md).

Os documentos principais cobrem arquitetura, configuração, catálogo, Max, banco local, acessibilidade, privacidade, PWA, SEO, QA e publicação.

## Segurança

Consulte [`SECURITY.md`](SECURITY.md) para relato responsável de vulnerabilidades.

## Limites da versão atual

Não há autenticação, checkout, pagamento, estoque central ou backend remoto. Preço e disponibilidade são confirmados pelo atendimento.

## Publicação

A implantação atual é compatível com GitHub Pages. Antes de publicar uma nova versão, execute o checklist em [`docs/TESTES-E-QUALIDADE.md`](docs/TESTES-E-QUALIDADE.md).


## Adaptação para clientes

A plataforma possui fluxo white-label para reutilização comercial.

Edite `data/config.json` e execute:

```bash
python tools/sincronizar_cliente.py --check
python tools/sincronizar_cliente.py
```

A ferramenta sincroniza metadados, páginas individuais, manifest, sitemap e arquivos estáticos derivados.

Consulte [`docs/WHITE-LABEL-E-CLIENTES.md`](docs/WHITE-LABEL-E-CLIENTES.md).


## Conta local e Admin Studio

A v3.1 adiciona duas áreas estáticas:

- `conta.html` — perfil local, favoritos, lista e histórico;
- `admin.html` — CMS local para editar catálogo e configuração antes da publicação.

O Admin Studio não altera o site publicado diretamente. Ele exporta os dados para o fluxo normal de publicação.

Veja [`docs/V3.0-CONTA-LOCAL-E-ADMIN-STUDIO.md`](docs/V3.0-CONTA-LOCAL-E-ADMIN-STUDIO.md).
