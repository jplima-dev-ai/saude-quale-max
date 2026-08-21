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

## Raciocínio explicável e tom conversacional — v3.2.3

Max continua sendo um agente local e determinístico, mas agora possui uma camada de decisão mais explícita.

Ao organizar resultados, ele pode considerar:

- categoria escolhida;
- formato;
- preferência vegana;
- preferência sem glúten;
- termos citados na conversa;
- formatos ou categorias que o cliente pediu para evitar;
- orçamento aproximado;
- prioridade por menor preço;
- destaque cadastrado no catálogo.

Quando destaca uma opção, Max consegue explicar os critérios utilizados em linguagem simples. O usuário também pode perguntar:

- “Por que essa opção?”
- “Por que você escolheu esse produto?”
- “Explique sua escolha.”
- “Qual foi o critério?”

Essa explicação apresenta critérios objetivos do catálogo e não expõe raciocínio interno oculto.

### Tom

A linguagem da v3.2.3 foi revisada para ser:

- acolhedora;
- respeitosa;
- clara;
- paciente;
- sem gírias;
- confortável para adultos de diferentes idades.

O agente evita expressões excessivamente informais e prefere frases curtas, orientações progressivas e alternativas como “se desejar” e “se preferir”.

## Compreensão contextual — v3.2.4

A versão 3.2.4 adiciona uma camada local de interpretação de linguagem natural (`max-nlu.js`). Ela não usa uma API externa e permanece compatível com hospedagem estática.

O Max passa a decompor mensagens com vários critérios. Por exemplo, “quero algo vegano, sem glúten, em pó e até R$ 50” pode atualizar múltiplas preferências de uma só vez.

Também passa a reconhecer negações, correções do usuário e referências à última comparação. A memória conversacional continua limitada à sessão local do navegador e aos dados necessários para organizar a conversa.

O objetivo não é simular um modelo de linguagem remoto, mas aumentar a robustez do agente determinístico com interpretação, memória de estado, ranking e explicações verificáveis.

## Memória semântica curta — v3.2.5

Max passou a manter referências locais da conversa atual para compreender melhor continuações como:

- “a segunda parece melhor”;
- “não gostei dessas”;
- “tem outra mais barata parecida com ela?”;
- “volta naquela que você mostrou antes”.

A memória armazena somente referências aos produtos recentemente apresentados e opções rejeitadas durante a sessão. Ela não cria perfil remoto e não é enviada para um serviço externo.

### Estado de processamento

Consultas simples continuam respondendo diretamente. Em consultas com múltiplos critérios, comparação ou busca mais trabalhosa, o Max pode apresentar temporariamente mensagens como:

- “Um momento…”;
- “Só um instante…”;
- “Estou organizando as opções…”.

Esse texto representa processamento da solicitação e substitui indicadores genéricos como “pensando”. O status usa `role="status"` e `aria-live="polite"` para leitores de tela.

## Inteligência de horário local — v3.2.6

O Max consulta `new Date().getHours()` no navegador. Assim, a referência é o horário configurado no dispositivo do visitante, sem geolocalização e sem envio de localização para servidor.

Faixas usadas:

- 00:00–11:59: “Bom dia”;
- 12:00–17:59: “Boa tarde”;
- 18:00–23:59: “Boa noite”.

Ele também consegue responder perguntas diretas sobre o horário local. Se o relógio ou fuso do dispositivo estiver configurado incorretamente, a saudação refletirá essa configuração.
## Decision Engine — v3.2.7

`max-decision.js` adiciona uma camada de decisão sobre o NLU. Ela calcula confiança, detecta ambiguidades, encontra conflitos entre preferências e lê o contexto da página atual.

A conversa também passa a manter uma seleção de compra local. O usuário pode adicionar ou remover produtos, consultar o total aproximado e encaminhar a seleção para o pré-atendimento. Nenhum pedido é enviado automaticamente.

Quando a confiança é baixa, o Max prefere pedir mais contexto em vez de inventar uma interpretação.

## Decision Engine ativo — v3.2.8

A confiança calculada pelo Max passa a influenciar o comportamento da conversa. Em mensagens de baixa confiança, o agente pede um critério adicional em vez de inferir silenciosamente.

No catálogo, o contexto da página inclui filtros ativos. Assim o Max pode continuar uma conversa partindo da busca que o visitante já montou.

Quando uma combinação de preferências retorna zero produtos, o Max testa localmente a remoção de cada restrição e identifica qual flexibilização isolada recupera mais opções. Ele apresenta essa sugestão antes de propor limpar todos os filtros.

O carrinho conversacional também passa a aceitar ajustes e substituições, além de responder quanto o pedido está acima ou abaixo de um orçamento informado.

## Afinidades e modo presente — v3.2.9

Durante a sessão, Max pode registrar um produto como “gostei”, “talvez” ou “não gostei”. Essas marcações existem apenas para organizar a conversa atual.

“Gostei” aumenta a prioridade do produto e de seus contextos nas recomendações seguintes. “Não gostei” impede que a opção reapareça durante a sessão. “Talvez” mantém o produto como possibilidade sem tratá-lo como escolha principal.

O modo presente usa o orçamento informado, os preços aproximados do catálogo, preferências já expressas e diversidade de categorias para montar uma sugestão de cesta. A cesta não é adicionada automaticamente ao pedido: o visitante precisa confirmar a ação.

O algoritmo não infere necessidades clínicas do destinatário e não usa idade, gênero ou condição de saúde para criar alegações sobre produtos.

## Afinidade e modo presente — v3.2.9

Durante a sessão atual, o Max pode classificar produtos em três estados explícitos:

- `gostei`;
- `talvez`;
- `não gostei`.

Produtos marcados como “gostei” recebem prioridade adicional em sugestões posteriores. Produtos marcados como “não gostei” são evitados durante a conversa. O estado é local e temporário.

O modo presente/cesta aceita pedidos como “quero montar um presente para minha mãe até R$ 100”. O Max monta uma combinação com diversidade de categorias, respeita o orçamento aproximado e evita itens rejeitados. Ao pedir “outra cesta”, a combinação anterior perde prioridade para reduzir repetição.

A cesta pode ser adicionada à seleção comercial e seguir para o pré-atendimento existente.


## Benefícios comerciais — v3.3

O Max consulta o mesmo motor determinístico usado pelo pré-atendimento. Ele pode explicar cupons ativos, validar um código contra a seleção atual, indicar o melhor cupom disponível, informar quanto falta para o frete grátis e estimar os pontos gerados.

O Max não confirma saldo financeiro nem conclusão de compra. Pontos e benefícios locais são uma demonstração compatível com hospedagem estática; uma implantação real deve validar conta, saldo, pedidos e resgates no backend.
