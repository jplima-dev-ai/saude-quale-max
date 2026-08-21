# PWA e modo offline

## Componentes

- manifest.webmanifest: instalação.
- service-worker.js: cache e atualização.
- offline.html: fallback.
- assets/scripts/pwa.js e assets/scripts/offline.js: interface.

## Estratégia

O shell essencial é pré-armazenado. Navegações usam o conteúdo disponível e recorrem ao fallback sem rede.

## Atualização

Cada versão deve renovar o identificador do cache e listar novos recursos essenciais. A v3.3.3 usa qualimax-v3.3.3.

## Verificação

1. Publicar em HTTPS.
2. Abrir uma vez online.
3. Ativar modo offline.
4. Testar início, catálogo, carrinho e fallback.
5. Restaurar a rede e confirmar atualização.

O modo offline não confirma disponibilidade, envia WhatsApp ou cria pedido real.\n