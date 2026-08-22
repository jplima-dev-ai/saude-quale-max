# MAX — assistente local

## Papel

O MAX ajuda a descobrir, comparar e organizar produtos. Não realiza diagnóstico, prescrição, pagamento ou confirmação de estoque.

## Módulos

- max-core.js: estado e utilitários.
- max-entities.js: critérios.
- max-nlu.js: linguagem natural.
- max-decision.js: decisão e confiança.
- max-recommendation.js: ranking.
- max-intents.js: respostas.
- max-personality-v345.js: adaptação de tom e ritmo.
- max-handoff-v346.js: transferência contextual para atendimento humano.
- chatbot.js: diálogo e interface.

## Capacidades

- busca por nome, categoria, característica e orçamento;
- comparação contextual e correções;
- memória curta de preferências;
- cestas e seleções comerciais;
- explicação de critérios;
- encaminhamento explícito para atendimento humano.

## Personalidade e naturalidade

O Max reconhece confusão, insegurança, pressa, sensibilidade a preço e navegação sem compromisso. Ele faz uma pergunta por vez quando necessário, adapta o nível de detalhe, aceita correções e mantém o cliente no controle. Não finge emoções humanas, não cria urgência falsa e não usa intimidade artificial para pressionar compras.

## Transferência para a loja

Pedidos, pagamentos, trocas, estoque real, entrega, reclamações e dúvidas individuais de saúde são encaminhados para `support.html`. O Max prepara um resumo limitado e revisável; nada é enviado e o WhatsApp nunca abre sem ação explícita do cliente. O contexto temporário expira automaticamente.

## Privacidade e acessibilidade

O processamento é local. O visitante decide quando abrir o WhatsApp. O diálogo é operável por teclado, usa anúncios moderados e mantém identidade e estado do MAX em texto; o avatar é decorativo.

## Regressão

    node tools/test-max.cjs
    node tools/test-max-nlu.cjs
    node tools/test-max-decision.cjs
    node tools/test-max-basket.cjs
    node tools/test-max-personality-v345.cjs
    node tools/test-max-handoff-v346.cjs
