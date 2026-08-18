# Saúde Qualemax — Rodada 1.2

## Objetivo
Revisão corretiva da base v1.1 rodada 7, priorizando bugs funcionais, acessibilidade e consistência entre componentes dinâmicos.

## Correções
- WhatsApp flutuante passou a usar a configuração centralizada.
- Mensagens de produto no WhatsApp usam o nome configurado da loja.
- Catálogo não presume WhatsApp configurado no fallback de erro.
- Seleção de categoria permanece pendente quando o catálogo ainda não terminou de carregar.
- Assistente agora aplica de fato a categoria encontrada ao filtro do catálogo.
- Assistente agora preenche a busca do catálogo quando encontra um produto por texto.
- Modal de produto recebeu `aria-describedby` e uma região de descrição identificável.
- Título do quiz foi ajustado para descrever exploração do catálogo, sem sugerir uma indicação absoluta.

## Critério de acessibilidade
A revisão considera WCAG 2.2 e práticas WAI-ARIA. A W3C mantém uma tradução autorizada das WCAG 2.2 em português do Brasil e recomenda atenção especial a foco, diálogo modal e operação por teclado.

## Limitação
Não é possível declarar aprovação de teste NVDA apenas por inspeção estática. A validação final com NVDA + navegador deve ser executada em ambiente real.
