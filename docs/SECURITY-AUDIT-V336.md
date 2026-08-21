# Auditoria de segurança — v3.3.6

Data: 21 de agosto de 2026. Escopo: código cliente e arquivos estáticos da plataforma.

## Falhas reproduzidas e corrigidas

| Risco | Severidade | Correção |
|---|---:|---|
| Estado do carrinho manipulável via `localStorage` aceitava quantidades, preços e estruturas sem limites | Alta (integridade local) | Validação de esquema, limites numéricos, tamanho máximo e normalização antes do uso |
| Importação de backup administrativo permitia JSON excessivamente grande e chaves de poluição de protótipo | Alta | Limite de 12 MiB, clonagem segura, bloqueio de `__proto__`, `prototype` e `constructor`, limite de profundidade |
| Eventos e pedidos locais podiam ser inflados para causar consumo excessivo de memória/DOM | Média | Limites de 500 eventos, 20 pedidos, 100 itens e textos com tamanho máximo |
| Mensagens do `BroadcastChannel` tinham validação insuficiente | Média | Validação de origem lógica, tipo, comprimento e timestamp |
| Cache dinâmico aceitava mais tipos de recursos do que o necessário | Média | Lista de extensões cacheáveis, bloqueio de credenciais na URL, `Range` e URLs com consulta |
| Isolamento entre contextos de navegação incompleto nos cabeçalhos | Baixa | COOP e CORP, mantendo CSP, `frame-ancestors`, X-Frame-Options e Permissions-Policy |

## Limites do modelo atual

O Admin Studio é um editor local, não uma área autenticada de servidor. Nenhum segredo, credencial real, pagamento ou autorização deve depender apenas de JavaScript ou armazenamento do navegador. Antes de produção comercial, autenticação, autorização, pedidos, estoque e pagamentos devem ser validados em backend.

## Testes ofensivos utilizados

- cargas JSON com poluição de protótipo e profundidade excessiva;
- adulteração de preço, quantidade e total no armazenamento local;
- inflação de listas de eventos/pedidos;
- mensagens inválidas entre abas;
- tentativas de amplificação do cache por query string e respostas parciais;
- revisão de sinks HTML, URLs, CSP, enquadramento e importação de arquivos.
