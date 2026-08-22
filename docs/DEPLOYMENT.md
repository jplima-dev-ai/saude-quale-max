# Publicação e entrega

Procedimento de release para GitHub Pages, Netlify ou entrega white-label. Execute os comandos a partir da raiz do projeto.

## Antes do commit

- testes e auditorias aprovados;
- dados e URLs revisados;
- nenhuma credencial;
- cache PWA atualizado;
- diff revisado.

## Git

```bash
git status
git diff --check
git add .
git commit -m "release: Saúde Qualimax v3.5.9"
```

Revise o diff antes de adicionar arquivos. Não publique backups locais, credenciais, dados de clientes ou pacotes de outra loja.
    git push

## GitHub Pages

Em Settings > Pages, publique a branch e a pasta que contêm index.html. Teste a URL em navegação normal e privada.

## Netlify

Publique a raiz sem comando de build e preserve _headers.

## Pós-deploy

Teste `index.html`, `catalog.html`, uma página de `products/`, `cart.html`, `campaigns.html`, `account.html`, `support.html`, o Max, `admin.html`, `404.html`, `sitemap.xml`, `manifest.webmanifest` e `service-worker.js`. Confirme HTTPS e console sem erros.
