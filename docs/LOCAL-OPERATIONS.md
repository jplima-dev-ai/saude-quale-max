# Operação local

## Minha Conta

Perfil, preferências, jornada e pedidos preparados ficam no navegador. Exportação e importação oferecem portabilidade manual; não há conta remota.

`journey.html` reúne carrinho, perfil, comparações, lembretes e checkpoints. `budget-planner.html` monta alternativas de compra dentro de um teto. Esses recursos não enviam dados automaticamente.

## Carrinho

O carrinho reúne produtos, variantes e quantidades, calcula total e compara com orçamento. Preparar pedido registra uma cópia local; não conclui compra.

## Admin Studio

admin.html edita catálogo e configuração, mantém imagens locais, executa auditorias, exporta dados e mostra inteligência comercial. Não possui autenticação real.

A central de produtos permite busca, filtros, seleção múltipla, reajuste coletivo, exportação CSV, reversão da última ação e edição guiada. Consulte `ADMIN-PRODUCTS-V350.md`.

## Publicação

1. Salvar o rascunho.
2. Exportar dados.
3. Substituir arquivos no repositório.
4. Executar testes.
5. Revisar o diff.
6. Publicar.

Não coloque credenciais no frontend. Operação multiusuário exige backend com autenticação, autorização e logs.
