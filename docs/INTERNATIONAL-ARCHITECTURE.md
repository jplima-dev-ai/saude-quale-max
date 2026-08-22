# International-ready architecture

Technical filenames and routes use English while customer-facing content remains independent. Portuguese names belong only to labels shown to customers and must not be used as file paths in documentation, links or deployment configuration.

## Structure

- `assets/images/`: media;
- `assets/scripts/`: application modules;
- `assets/styles/`: stylesheets;
- `data/`: configuration and content;
- `products/`: product pages;
- `docs/`: documentation;
- `tools/`: automation.

## Canonical routes

| Customer-facing concept | Technical route |
|---|---|
| Início | `index.html` |
| Catálogo | `catalog.html` |
| Carrinho | `cart.html` |
| Campanhas | `campaigns.html` |
| Minha conta | `account.html` |
| Sobre | `about.html` |
| Contato | `contact.html` |
| Atendimento | `support.html` |
| Descobrir | `discover.html` |
| Receitas | `recipes.html` |
| Minha jornada | `journey.html` |
| Planejador de orçamento | `budget-planner.html` |
| Comparador | `compare.html` |

`data/routes.json` is the route registry. Its legacy aliases exist only to support migration logic; new documentation, links, canonical URLs, sitemap entries and deployment rules must always use the English technical routes.
