# Publicação — GitHub Pages e Netlify

## Ambiente atual

A aplicação foi projetada para hospedagem estática e utiliza caminhos relativos compatíveis com GitHub Pages.

## Antes do commit

1. valide os arquivos JSON;
2. valide JavaScript;
3. confirme a versão do cache em `sw.js`;
4. revise `data/config.json`;
5. revise sitemap e robots;
6. execute o checklist de `TESTES-E-QUALIDADE.md`.

## Finais de linha

O projeto inclui `.gitattributes` para manter arquivos textuais em LF e reduzir warnings de CRLF no Windows.

## Commit

Exemplo:

```bash
git add --renormalize .
git add .
git commit -m "release: Saúde Qualimax v3.1.3"
git push
```

Use `git add --renormalize .` somente quando houver necessidade de normalizar finais de linha; ele não precisa ser repetido em todo commit.

## GitHub Pages

Após o push:

1. aguarde a publicação terminar;
2. abra a Home em janela anônima;
3. faça hard refresh;
4. valide páginas internas;
5. valide uma URL direta de produto;
6. valide o Service Worker;
7. confira se o navegador não está servindo cache antigo.

## Mudança de nome do repositório

Renomear o repositório altera a URL do GitHub Pages. Nesse caso, pesquise e atualize todas as URLs absolutas do projeto antes do deploy.

## HTTPS

Mantenha HTTPS obrigatório habilitado no GitHub Pages.

## Netlify

A plataforma também pode ser publicada como site estático no Netlify. Preserve os caminhos relativos, use HTTPS e repita o mesmo smoke test pós-deploy. Se configurar cabeçalhos HTTP adicionais, valide CSP e políticas de segurança antes de publicar.
