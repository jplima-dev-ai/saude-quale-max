# Saúde Qualimax — Plataforma Web

**Versão atual: 3.1.6**

Plataforma web multipágina e white-label para casas de produtos naturais, construída com HTML, CSS e JavaScript sem framework obrigatório. O projeto prioriza catálogo orientado a dados, acessibilidade, descoberta assistida e preparação do atendimento via WhatsApp, mantendo compatibilidade com GitHub Pages e Netlify.

## Estado atual

- 47 produtos e 47 páginas individuais;
- catálogo com busca, filtros, ordenação e compartilhamento;
- favoritos, lista de interesse, recentes e retomada da jornada local;
- quiz de descoberta;
- Max, assistente local contextual e modular;
- pré-atendimento com revisão antes de abrir o WhatsApp;
- Minha Conta local e Admin Studio local;
- IndexedDB com fallback local;
- PWA, modo offline e atualização de cache;
- SEO multipágina, sitemap e dados estruturados;
- recursos white-label e auditoria por cliente;
- acessibilidade para teclado e leitores de tela.

## Arquitetura

A aplicação não possui backend próprio, autenticação remota, checkout, pagamento ou estoque central. Preço, disponibilidade, entrega e demais condições comerciais são confirmados pela equipe da loja.

Dados principais:

- `data/config.json` — marca, contato, redes, SEO, Max e módulos;
- `data/produtos.json` — catálogo;
- `data/categorias.json` — taxonomia;
- `data/quiz.json` — descoberta guiada;
- `data/faq.json` — perguntas frequentes.

Páginas utilitárias importantes:

- `conta.html` — perfil e dados locais do visitante;
- `admin.html` — editor local; não é uma área autenticada;
- `atendimento.html` — prepara a mensagem e só abre o WhatsApp após ação explícita.

## Manutenção

```bash
python tools/sincronizar_cliente.py --check
python tools/sincronizar_cliente.py
python tools/auditar_cliente.py
node tools/testar_max.cjs
```

O teste em Node é recomendado quando Node.js estiver disponível.

## White-label

Para adaptar a plataforma a outra loja, altere `data/config.json`, revise catálogo, categorias, imagens, FAQ e quiz, execute a sincronização e depois a auditoria. Veja [`docs/WHITE-LABEL-E-CLIENTES.md`](docs/WHITE-LABEL-E-CLIENTES.md).

## Documentação

A documentação viva fica em [`docs/README.md`](docs/README.md). O histórico de versões está consolidado em [`docs/CHANGELOG.md`](docs/CHANGELOG.md), evitando dezenas de relatórios antigos concorrendo com a documentação atual.

## Segurança e privacidade

Consulte [`SECURITY.md`](SECURITY.md) e [`docs/PRIVACIDADE.md`](docs/PRIVACIDADE.md). Nunca coloque senhas, tokens, chaves privadas ou credenciais de publicação no frontend.

## Publicação

Consulte [`docs/PUBLICACAO.md`](docs/PUBLICACAO.md) e execute [`docs/TESTES-E-QUALIDADE.md`](docs/TESTES-E-QUALIDADE.md) antes de cada deploy.
