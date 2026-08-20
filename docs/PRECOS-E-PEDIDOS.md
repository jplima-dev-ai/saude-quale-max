# Preços e pedidos — v3.2

## Objetivo

A v3.2 usa preços aproximados para demonstrar uma experiência comercial realista em um projeto de portfólio. Os valores não representam cotação vinculante e devem ser substituídos pelo empreendedor ao adaptar a plataforma para uma loja real.

## Estrutura de produto

Cada produto possui:

- `preco`: preço de referência;
- `apresentacao`: peso, volume ou quantidade;
- `venda_tipo`: `unidade` ou `peso`;
- `quantidade_base`: base usada no cálculo;
- `unidade_venda`: `un.` ou `g`;
- `incremento`: passo permitido;
- `preco_atualizado_em`: data da referência;
- `preco_aproximado`: identifica que o valor é demonstrativo.

Itens a granel usam 100 g como base. Produtos embalados usam uma unidade/embalagem.

## Pedido assistido

O pré-atendimento permite selecionar produtos e quantidades, calcula subtotais e um total estimado e prepara esses dados para revisão antes de abrir o WhatsApp.

O total é sempre apresentado como **estimado**. A loja confirma disponibilidade, preço final e eventuais condições de entrega.

## Pagamento

A demonstração oferece:

- Pix;
- dinheiro em espécie.

Para dinheiro existe campo opcional de troco. A plataforma não recebe, processa ou confirma pagamentos.

## Admin Studio

Preço, apresentação e forma de venda podem ser editados localmente no Admin Studio antes da exportação/publicação.

## Referência de mercado

Os preços da versão 3.2 foram definidos como aproximações comerciais em 20/08/2026, usando referências públicas de varejo brasileiro e arredondamento compatível com uma loja pequena/média. Não se pretende reproduzir exatamente o preço de uma marca específica.
