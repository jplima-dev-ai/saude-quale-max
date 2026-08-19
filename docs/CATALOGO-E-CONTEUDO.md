# Catálogo e conteúdo

## Fontes principais

- `data/produtos.json` — produtos;
- `data/categorias.json` — categorias;
- `data/quiz.json` — descoberta guiada;
- `data/faq.json` — FAQ.

## Produtos

Cada produto deve usar dados reais e verificáveis. A plataforma reaproveita essas informações em:

- cards;
- busca;
- filtros;
- modal;
- páginas individuais;
- produtos relacionados;
- Max;
- quiz;
- favoritos e lista;
- mensagens de consulta pelo WhatsApp;
- dados estruturados.

## Regras editoriais

Não adicionar sem evidência:

- preço;
- estoque;
- “mais vendido”;
- avaliações;
- quantidade de clientes;
- urgência artificial;
- benefícios médicos;
- alegações terapêuticas;
- garantias de resultado.

A copy pode trabalhar curiosidade, sabor, textura, aroma, praticidade e contexto cotidiano quando isso for compatível com o produto.

## Imagens

Os produtos usam imagens em `img/` e miniaturas em `img/thumbs/`.

Ao adicionar um produto:

1. use um nome de arquivo simples e seguro;
2. gere a miniatura correspondente;
3. cadastre a imagem em `produtos.json`;
4. valide card, modal, Max e página individual;
5. confirme que nenhum caminho está quebrado.

## Slugs

Os slugs das páginas individuais seguem letras minúsculas, números e hífens.

Exemplo:

```text
creatina-monohidratada
```

A página correspondente é:

```text
produto/creatina-monohidratada.html
```

## Categorias

O `id` de uma categoria é usado em filtros e URLs, portanto alterações devem ser tratadas como mudança estrutural.

Exemplo:

```text
catalogo.html?categoria=chas#produtos
```

## Inclusão de novos produtos

A arquitetura atual possui páginas HTML individuais pré-geradas. Adicionar um item ao JSON não cria automaticamente a nova página de produto. É necessário gerar/adicionar a página correspondente e revisar sitemap e SEO.
