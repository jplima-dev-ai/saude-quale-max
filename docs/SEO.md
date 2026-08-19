# SEO e dados estruturados

## Páginas principais

`data/config.json` contém título, descrição e canonical por página:

- Home;
- Catálogo;
- Quiz;
- Sobre;
- Contato.

Não usar o mesmo canonical para páginas diferentes.

## Páginas de produto

Cada página individual possui metadados próprios e dados estruturados de produto.

A implementação trabalha com:

- `Product`;
- `BreadcrumbList`;
- Open Graph;
- Twitter Card;
- canonical.

Como preço e estoque não são confirmados pelo frontend, não adicionar `Offer` com valores fictícios.

## Site e loja

As páginas principais podem descrever:

- `Store`;
- `WebSite`;
- `SearchAction`;
- `BreadcrumbList`.

## Sitemap

`sitemap.xml` deve conter somente URLs públicas e indexáveis.

Ao adicionar ou remover uma página de produto:

1. atualizar o sitemap;
2. revisar canonical;
3. revisar imagem social;
4. validar dados estruturados;
5. conferir links internos.

`offline.html` não deve ser promovida como página indexável.

## robots.txt

O sitemap declarado em `robots.txt` deve apontar para a implantação pública atual.

## Mudança de domínio ou repositório

Revisar globalmente:

- `data/config.json`;
- canonical das páginas;
- `sitemap.xml`;
- `robots.txt`;
- `/.well-known/security.txt`;
- URLs absolutas dos dados estruturados.

## Qualidade editorial

SEO não deve degradar a copy da experiência. Títulos e descrições devem ser claros, específicos e coerentes com o conteúdo real.
