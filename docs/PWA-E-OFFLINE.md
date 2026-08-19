# PWA e modo offline

## Componentes

- `manifest.webmanifest`;
- `sw.js`;
- `js/pwa.js`;
- `offline.html`;
- `js/offline.js`.

## Instalação

Quando o navegador oferece `beforeinstallprompt`, a interface pode exibir a ação de instalação.

A ação não é simulada em navegadores que não oferecem suporte.

## Atualizações

O Service Worker usa cache versionado.

Na implementação atual, novas versões aguardam até a ação explícita **Atualizar agora**. O frontend envia `SKIP_WAITING` somente quando o visitante solicita a atualização.

A primeira instalação não deve provocar reload inesperado.

## Estratégia de navegação

Navegações usam rede primeiro. Quando a rede falha:

1. tenta a página correspondente no cache;
2. para URLs com filtros/query string, a busca pode ignorar a query ao localizar a página base;
3. se não existir página utilizável, entrega `offline.html`.

## Recursos estáticos

Recursos same-origin podem ser reutilizados do cache. O Service Worker não deve interceptar recursos cross-origin desnecessariamente.

## Cuidados de manutenção

Ao adicionar um arquivo essencial:

- decidir se ele deve entrar no shell do Service Worker;
- incrementar a versão do cache;
- testar primeira instalação;
- testar atualização de uma versão anterior;
- testar conexão offline;
- testar URL com query string;
- testar entrada direta por uma página de produto.

## Limite de hospedagem

GitHub Pages controla parte dos cabeçalhos HTTP. Proteções que dependem de headers específicos devem ser verificadas na implantação real.
