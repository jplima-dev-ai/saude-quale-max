# Documentação — Saúde Qualimax v3.1.6

Esta pasta contém documentação viva: arquivos que descrevem como a plataforma funciona agora e como mantê-la. O histórico das releases está consolidado em `CHANGELOG.md`.

## Mapa da documentação

| Documento | Finalidade |
|---|---|
| [ARQUITETURA.md](ARQUITETURA.md) | Páginas, módulos, dados e limites arquiteturais |
| [CONFIGURACAO.md](CONFIGURACAO.md) | Marca, contato, redes, SEO, módulos e Max |
| [CATALOGO-E-CONTEUDO.md](CATALOGO-E-CONTEUDO.md) | Produtos, categorias, imagens e copy |
| [MAX.md](MAX.md) | Arquitetura, intenções, descoberta e limites do Max |
| [BANCO-LOCAL.md](BANCO-LOCAL.md) | IndexedDB, fallback e persistência no navegador |
| [ACESSIBILIDADE.md](ACESSIBILIDADE.md) | Requisitos e testes com teclado e NVDA |
| [PRIVACIDADE.md](PRIVACIDADE.md) | Dados locais, pré-atendimento e integrações |
| [PWA-E-OFFLINE.md](PWA-E-OFFLINE.md) | Service Worker, instalação, atualização e offline |
| [SEO.md](SEO.md) | Metadados, sitemap e dados estruturados |
| [TESTES-E-QUALIDADE.md](TESTES-E-QUALIDADE.md) | QA, regressão do Max e checklist pré-deploy |
| [PUBLICACAO.md](PUBLICACAO.md) | Git, GitHub Pages, Netlify e pós-deploy |
| [WHITE-LABEL-E-CLIENTES.md](WHITE-LABEL-E-CLIENTES.md) | Processo para adaptar a outro cliente |
| [OPERACAO-LOCAL.md](OPERACAO-LOCAL.md) | Minha Conta, Admin Studio e pré-atendimento |
| [CHANGELOG.md](CHANGELOG.md) | Histórico consolidado das versões |

## Segurança

A política principal fica em [`../SECURITY.md`](../SECURITY.md). O arquivo `/.well-known/security.txt` fornece o ponto padronizado de descoberta do canal de segurança.

## Regra de manutenção

Quando uma release mudar o funcionamento atual, atualize o documento temático correspondente e o `CHANGELOG.md`. Não crie um novo relatório `Vx.y.z-*.md` apenas para registrar uma release.
