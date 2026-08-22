# Revisão funcional e de segurança — versão 3.5.1

Data: 22 de agosto de 2026.

## Escopo

A revisão cobriu as 79 páginas HTML, scripts do frontend, dados JSON, armazenamento local, IndexedDB, importação/exportação, painel administrativo, service worker, rotas, links externos e cabeçalhos de implantação. Os testes foram realizados no código local autorizado do projeto; nenhum sistema de terceiros foi atacado.

## Vulnerabilidades corrigidas

### Injeção HTML orientada a dados

O comparador e as cestas inseriam nomes vindos de JSON por `innerHTML`. Um catálogo adulterado poderia transformar texto em marcação executável. A montagem agora usa elementos DOM e `textContent`, mantendo os dados como texto.

### Importação de jornada sem limites

A jornada portátil aceitava qualquer JSON e gravava valores diretamente no armazenamento. Isso permitia arquivos excessivos, formatos incompatíveis e persistência de estruturas não previstas. A importação agora limita o arquivo a 256 KiB, exige extensão JSON, usa o parser seguro, valida valores e limita cada bloco interno.

### Poluição de protótipo no fallback local

O fallback do IndexedDB usava objetos comuns e chaves derivadas dos dados. Chaves como `__proto__` poderiam alterar o comportamento do objeto. Agora stores e chaves são allowlisted, estruturas são clonadas com segurança e objetos sem protótipo são usados no fallback.

### URLs externas configuráveis

Fontes da pesquisa de preços eram atribuídas diretamente a links. Agora apenas URLs HTTPS válidas são aceitas, credenciais não são usadas e o referenciador é omitido.

### Cabeçalhos de implantação incompletos

O arquivo `_headers` agora fornece CSP completa, HSTS, isolamento de origem, bloqueio de MIME sniffing, framing, permissões desnecessárias e cache do painel administrativo.

## Bugs funcionais corrigidos

- trilhas editoriais voltaram a preservar filtros após a migração de `catalogo.html` para `catalog.html`;
- logo e avatar white-label em `assets/images` voltaram a ser aceitos pelo validador de caminhos;
- testes estruturais confirmam ausência de links locais quebrados, IDs duplicados e páginas sem `h1`.

## Limites arquiteturais

O Admin Studio é um editor local estático, não um painel remoto autenticado. Ele não consegue alterar o site publicado sozinho. Para uma operação com usuários administrativos reais, estoque central ou pedidos persistentes, é necessário um backend com autenticação, autorização por função, sessões seguras, logs no servidor e proteção contra CSRF. Um bloqueio puramente em JavaScript não seria autenticação real e, por isso, não foi apresentado como tal.
