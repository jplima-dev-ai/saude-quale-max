# PWA e modo offline

## Componentes

- manifest.webmanifest: instalação.
- service-worker.js: cache e atualização.
- offline.html: fallback.
- `assets/scripts/pwa.js` e `assets/scripts/offline.js`: interface.

## Estratégia

O shell essencial é pré-armazenado. Navegações usam o conteúdo disponível e recorrem ao fallback sem rede.

## Atualização

Cada versão deve renovar o identificador do cache e listar os novos recursos essenciais. Na versão atual, confirme `qualimax-v3.5.9` em `service-worker.js`; nunca reutilize o identificador de uma versão anterior.

## Verificação de release

1. Confirme que cada item de `SHELL` existe e não está duplicado.
2. Incremente o nome do cache.
3. Teste primeira visita, atualização e navegação offline.
4. Verifique se uma falha de rede conduz a `offline.html` sem ciclo de recarga.

## Verificação

1. Publicar em HTTPS.
2. Abrir uma vez online.
3. Ativar modo offline.
4. Testar início, catálogo, carrinho e fallback.
5. Restaurar a rede e confirmar atualização.

O modo offline não confirma disponibilidade, envia WhatsApp ou cria pedido real.
