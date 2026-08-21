# Publicação

## Antes do commit

- testes e auditorias aprovados;
- dados e URLs revisados;
- nenhuma credencial;
- cache PWA atualizado;
- diff revisado.

## Git

    git status
    git diff --check
    git add .
    git commit -m "release: Saúde Qualimax v3.3.3"
    git push

## GitHub Pages

Em Settings > Pages, publique a branch e a pasta que contêm index.html. Teste a URL em navegação normal e privada.

## Netlify

Publique a raiz sem comando de build e preserve _headers.

## Pós-deploy

Teste início, catálogo, produto, carrinho, campanhas, conta, atendimento, MAX, Admin, sitemap, manifest e service worker. Confirme HTTPS e console sem erros.\n