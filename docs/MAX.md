# Max — assistente local de descoberta

## Papel

Max é um assistente determinístico baseado no catálogo e na configuração da loja. Não usa API externa de IA e não precisa de chave secreta.

## Arquitetura

- `max-core.js` — normalização, estado e memória curta;
- `max-entidades.js` — produtos citados e referências contextuais;
- `max-intencoes.js` — classificação da mensagem;
- `max-recomendacao.js` — similaridade e ranking;
- `chatbot.js` — interface, filtros e ações.

## Capacidades atuais

Max localiza e explica produtos cadastrados, reconhece categorias e preferências, combina critérios sucessivos, compara produtos, mostra similares, retoma contexto curto e encaminha para catálogo, quiz, coleções, redes e pré-atendimento.

A descoberta guiada usa as categorias reais de `categorias.json`, conta produtos e prioriza categorias com itens. Frases como “não sei o que escolher”, “me recomenda algo” e “quero uma sugestão” entram na descoberta guiada em vez de virarem termos de busca.

## Prioridade das intenções

Guardrails médicos e intenções específicas precedem regras genéricas de produto e busca. Isso evita falsos positivos como interpretar “o que escolher” como “o que é”.

## Limites

Max não inventa preço, estoque, disponibilidade, prazo, contraindicação ou resultado clínico. Não diagnostica nem recomenda produto para tratar doença. Dados variáveis são encaminhados para confirmação humana.

## Privacidade

A conversa não é enviada a servidor de IA. O contexto é local e de curta duração. Ao pedir atendimento humano, somente o contexto preparado segue para a etapa local de revisão.

## Regressão

Ao alterar produtos, categorias, tipos ou regras de intenção, execute:

```bash
node tools/testar_max.cjs
```
