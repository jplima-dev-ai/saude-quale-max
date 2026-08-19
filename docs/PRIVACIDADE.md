# Privacidade

## Estado atual

A Saúde Qualimax é uma aplicação frontend estática e não possui autenticação, formulário de cadastro, checkout ou banco remoto próprio.

## Dados locais

A aplicação pode armazenar no navegador:

- favoritos;
- lista de interesse;
- histórico de produtos visualizados;
- preferências técnicas necessárias à experiência.

A persistência usa IndexedDB, com fallback local quando necessário.

## Transmissão para a loja

Os dados locais não são enviados automaticamente.

Uma informação é transmitida ao atendimento quando o visitante inicia uma ação externa, como consultar sua lista pelo WhatsApp.

## Max

A implementação atual não envia a conversa do Max para uma API externa de IA.

## Analytics

`data/config.json` possui a configuração `analytics.enabled`, atualmente desativada. Não implementar rastreamento oculto.

Se analytics for adicionado futuramente, revisar:

- finalidade;
- base legal aplicável;
- política de privacidade;
- consentimento quando necessário;
- retenção;
- terceiros envolvidos.

## Segredos e credenciais

Nunca armazenar no frontend:

- senhas;
- tokens privados;
- chaves de API secretas;
- credenciais de serviços;
- dados sensíveis de clientes.

## Evolução futura

A introdução de login, backend, pedidos, pagamentos, formulários ou analytics altera significativamente o escopo de privacidade e exige nova revisão técnica e jurídica.
