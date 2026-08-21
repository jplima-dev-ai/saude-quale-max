# Catálogo e conteúdo

## Fonte de verdade

Produtos ficam em data/products.json. Variantes, estoque demonstrativo, campanhas, kits e notificações ficam em data/v333.json.

## Produto

Cada item deve possuir id, nome, slug, categoria, preço, apresentação, imagem, descrição e benefícios. IDs e slugs são únicos e estáveis.

## Preços

Os preços são valores fixos do catálogo. O administrador pode alterá-los e exportar o JSON atualizado. Pesquisa externa não é exibida ao visitante.

## Estoque e variantes

O estoque é demonstrativo e local; não substitui um sistema transacional. Variantes precisam de identificador estável, nome legível e eventual acréscimo.

## Imagens

- nomes seguros, sem espaços;
- miniaturas em assets/images/thumbs/ quando usadas nos cards;
- proporção consistente e tamanho otimizado;
- texto alternativo informativo.

## Campanhas e kits

Campanhas precisam de período válido e critério de seleção. Kits devem referenciar slugs existentes e informar composição e desconto.

## Novo produto

1. Adicionar o registro.
2. Incluir imagens.
3. Criar a página individual.
4. Revisar categoria, sitemap e busca.
5. Executar a suíte de testes.\n