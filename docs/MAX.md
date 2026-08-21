# MAX — assistente local

## Papel

O MAX ajuda a descobrir, comparar e organizar produtos. Não realiza diagnóstico, prescrição, pagamento ou confirmação de estoque.

## Módulos

- max-core.js: estado e utilitários.
- max-entidades.js: critérios.
- max-nlu.js: linguagem natural.
- max-decision.js: decisão e confiança.
- max-recomendacao.js: ranking.
- max-intencoes.js: respostas.
- chatbot.js: diálogo e interface.

## Capacidades

- busca por nome, categoria, característica e orçamento;
- comparação contextual e correções;
- memória curta de preferências;
- cestas e seleções comerciais;
- explicação de critérios;
- encaminhamento explícito para atendimento humano.

## Privacidade e acessibilidade

O processamento é local. O visitante decide quando abrir o WhatsApp. O diálogo é operável por teclado, usa anúncios moderados e mantém identidade e estado do MAX em texto; o avatar é decorativo.

## Regressão

    node tools/test-max.cjs
    node tools/test-max-nlu.cjs
    node tools/test-max-decision.cjs
    node tools/test-max-basket.cjs\n