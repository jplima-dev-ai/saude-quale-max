# Central de produtos — Admin Studio 3.5

A central foi projetada para que o catálogo seja administrado sem editar HTML ou JSON manualmente. O painel continua local: os dados são salvos no navegador e só chegam ao site publicado após a exportação e a publicação dos arquivos.

## Fluxo recomendado

1. Abra `admin.html` por um servidor local e acesse **Produtos**.
2. Use a busca e os filtros para localizar o item.
3. Edite o cadastro pelas etapas Essencial, Venda, Conteúdo e Mídia.
4. Procure manter o indicador de qualidade acima de 85%.
5. Salve no rascunho e revise a prévia.
6. Em **Exportar e backup**, baixe `products.json` e publique-o como `data/products.json`.

## Reajuste de preços

Selecione os produtos desejados, informe um percentual ou valor fixo e aplique. Valores negativos reduzem o preço; nenhum preço fica abaixo de zero. A data de atualização também é registrada. Use **Desfazer última ação** caso perceba um erro antes de continuar.

## Segurança operacional

- faça um backup completo antes de alterações grandes;
- confirme preços, apresentação e disponibilidade antes da publicação;
- a exportação CSV protege células que poderiam ser interpretadas como fórmulas;
- o histórico das últimas ações em lote fica apenas neste navegador;
- o painel local não substitui autenticação de um backend em uma operação real.

## Critério de qualidade

O indicador considera nome, endereço, categoria, preço, apresentação, copy, descrição, CTA, imagem, tags e benefícios. Ele orienta a revisão editorial, mas não publica nem bloqueia o produto automaticamente.
