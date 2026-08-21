# Changelog

Histórico consolidado das principais evoluções da Saúde Qualimax. Relatórios antigos de rodada foram removidos da pasta `docs/` para evitar duplicação.

### 3.3 — Rewards & Promotions Engine

- novo motor `js/promocoes.js` para cupons, pontos, resgate e frete grátis;
- cupons demonstrativos BEMVINDO10, QUALIMAX5, CHA15 e FRETEGRATIS;
- frete grátis configurado por valor mínimo, inicialmente R$ 120;
- barra de progresso textual e visual no pré-atendimento;
- cálculo de pontos que a compra pode gerar após confirmação;
- resgate demonstrativo de pontos com limite percentual do pedido;
- Max passa a responder sobre cupons, melhor cupom, pontos e quanto falta para frete grátis;
- Minha Conta ganha carteira local de benefícios e cupons disponíveis;
- Admin Studio ganha área Promoções e Fidelidade;
- pré-atendimento envia subtotal, descontos, pontos e condição de frete na mensagem;
- arquitetura permanece compatível com hospedagem estática; saldos locais são explicitamente demonstrativos.

## 3.2.9 — afinidades, modo presente e revisão geral

- Max passa a memorizar três estados explícitos durante a sessão: “gostei”, “talvez” e “não gostei”;
- produtos marcados como “gostei” recebem peso adicional nas sugestões seguintes;
- produtos marcados como “não gostei” deixam de aparecer nas buscas da conversa;
- usuário pode pedir para rever os produtos marcados como “gostei” ou “talvez”;
- novo modo presente/cesta com orçamento aproximado;
- Max pode perguntar o orçamento quando ele não foi informado;
- cesta prioriza diversidade de categorias e preferências já demonstradas na conversa;
- cliente pode pedir outra sugestão sem repetir a cesta imediatamente anterior;
- cesta sugerida só entra no pedido após ação explícita do cliente;
- carrinho e pré-atendimento continuam usando preços aproximados e confirmação final pela loja;
- adicionados testes automatizados de afinidade e cesta;
- revisão geral da plataforma executada após a implementação.

## 3.2.8 — Decision Engine mais ativo e carrinho conversacional refinado

- contexto do catálogo passa a incluir busca, categoria, formato, característica e faixa de preço;
- Max consegue explicar os filtros atuais quando o cliente pergunta “o que estou vendo?”;
- confiança da interpretação passa a ser usada de forma efetiva no fluxo de decisão;
- ambiguidade continua sendo resolvida antes de qualquer recomendação;
- conflitos de formato ganham ações específicas para manter o formato ou manter a exclusão;
- buscas sem resultado passam a diagnosticar qual critério mais restringe o catálogo;
- Max pode flexibilizar somente um critério, preservando o restante das preferências;
- carrinho conversacional passa a aceitar troca de produto por outro;
- carrinho permite ajustar quantidade de item já selecionado;
- Max responde se o pedido ultrapassa um orçamento e informa a diferença;
- removida chamada duplicada do Decision Engine no fluxo principal;
- testes do Decision Engine e carrinho foram ampliados.

## 3.2.7 — Max Decision Engine

- novo módulo `max-decision.js` para confiança, ambiguidade, conflitos e contexto;
- Max deixa de adivinhar termos ambíguos e pede confirmação quando necessário;
- nível de confiança passa a orientar perguntas de esclarecimento;
- contexto do catálogo e produto em foco passa a influenciar referências como “esse”;
- carrinho conversacional local permite adicionar, remover, limpar e somar itens;
- quantidades por unidade ou peso entram no cálculo aproximado;
- seleção criada no Max é transferida ao pré-atendimento com quantidades;
- conflitos de preferências são detectados antes da busca;
- linguagem estática do widget foi alinhada ao tom maduro do Max;
- arquitetura continua 100% estática e white-label.

## 3.2.6 — revisão do Max e inteligência de horário local

- Max passa a usar a hora local do dispositivo para escolher entre “Bom dia”, “Boa tarde” e “Boa noite”;
- perguntas como “que horas são?” passam a receber o horário local do navegador;
- manhã definida até 11:59, tarde de 12:00 a 17:59 e noite a partir de 18:00;
- corrigido estado “Um momento…” que podia permanecer visível junto com a resposta final;
- processamento complexo agora remove o indicador antes de renderizar a resposta;
- adicionada recuperação amigável caso uma análise complexa lance erro;
- removida dependência de `Array.findLastIndex`, melhorando compatibilidade com navegadores antigos;
- corrigida memória de produtos rejeitados para funcionar também com IDs não numéricos;
- consultas semânticas complexas passam a usar o mesmo estado de processamento do restante do Max;
- adicionados testes automatizados dos limites de horário e das correções de regressão.

## 3.2.5 — memória semântica curta e processamento elegante

- Max passa a lembrar o último grupo de produtos exibido;
- referências como “a primeira”, “a segunda” e “a terceira” passam a apontar para produtos do último lote;
- “não gostei dessas” exclui temporariamente aquelas opções da conversa;
- suporte a “tem outra mais barata parecida com ela?”;
- suporte a retomar uma opção mostrada anteriormente;
- histórico curto mantém até 12 produtos recentes, apenas na sessão atual;
- consultas complexas podem mostrar “Um momento…”, “Só um instante…” ou “Estou organizando as opções…”;
- o status de processamento é acessível via `role=status` e `aria-live=polite`;
- perguntas simples continuam sem indicador de processamento;
- adicionado teste de regressão da memória curta do Max.

## 3.2.4 — compreensão contextual ampliada do Max

- novo módulo `max-nlu.js` para interpretação local de linguagem natural;
- reconhecimento conjunto de múltiplas preferências na mesma frase;
- tratamento de negações como “não quero cápsulas”;
- compreensão de orçamento com “no máximo” e variações;
- correção de alguns erros comuns de digitação, como “glutem”;
- comparação contextual com “qual dos dois?” e “qual deles?”;
- memória da última comparação;
- suporte a correções como “na verdade...” e “quis dizer...”;
- busca de alternativas com linguagem mais natural;
- ranking por orçamento corrigido para apresentar preços menores primeiro;
- descoberta guiada agora trabalha em etapas e faz uma pergunta de refinamento após a primeira escolha;
- novos testes automatizados de NLU e regressão conversacional.

## 3.2.3 — Max mais humano e com raciocínio explicável

- linguagem do Max revisada para um tom acolhedor, paciente e respeitoso;
- removidas gírias e expressões excessivamente juvenis;
- saudação e subtítulo do agente atualizados;
- nova intenção para explicar por que uma opção foi destacada;
- Max passa a justificar sugestões com critérios objetivos do catálogo;
- comparação passa a considerar categoria, destaques, preço e preferências da conversa;
- orçamento e prioridade por menor preço passam a integrar o estado de preferências;
- resultados podem destacar uma primeira opção e explicar o motivo;
- mensagens de ausência de resultado e encaminhamento ficaram mais cuidadosas;
- adicionado teste automático de tom e raciocínio explicável.

## 3.2.2 — estabilização comercial e hardening do pedido

- corrigida estrutura inválida/ambígua dos controles de produto e quantidade no pré-atendimento;
- checkbox e quantidade agora possuem labels independentes e previsíveis para teclado e leitores de tela;
- prévia comercial passa a ser somente leitura, evitando alteração acidental de preços e subtotais;
- a equipe continua tratando preços do frontend como estimativas e confirma o total final;
- abertura do WhatsApp deixa de depender do valor de retorno de `window.open` com `noopener`, eliminando falso aviso de popup bloqueado;
- Max passa a reconhecer frases naturais de orçamento como “tenho 50 reais”, “posso gastar 80” e “quero gastar 100”;
- auditoria de segurança e regressão comercial ampliadas para cobrir as novas garantias.

## 3.2.1 — refinamento comercial e consistência

- corrige o contador editorial do catálogo de 32 para 47 produtos;
- corrige persistência via URL das ordenações por menor e maior preço;
- adiciona filtro por faixa de preço ao catálogo;
- páginas de produto passam a mostrar preço também nos produtos relacionados;
- Minha Conta passa a exibir preços em favoritos, lista e histórico recente;
- novos produtos no Admin Studio recebem estrutura comercial padrão;
- reforça testes de regressão da camada comercial.

### 3.2 — preços, pedido estimado e pagamento

- 47 produtos passam a exibir preços aproximados de portfólio e apresentação comercial;
- itens a granel usam preço de referência por 100 g;
- catálogo ganha ordenação por menor e maior preço;
- páginas individuais exibem preço e data de referência;
- pré-atendimento recebe quantidade por item, subtotal e total estimado;
- mensagem do WhatsApp leva produtos, quantidades, preços, subtotais e total estimado;
- formas de pagamento disponíveis: Pix e dinheiro em espécie, com campo opcional de troco;
- nenhum pagamento é processado pela plataforma;
- Admin Studio passa a editar preço, apresentação e forma de venda;
- Max passa a responder preços aproximados e buscas por orçamento;
- preços marcados como aproximados e atualizados em 20/08/2026.

## v3.1.7 — hardening de segurança

- pré-atendimento deixa de usar submit nativo, evitando PII em query string se JavaScript falhar;
- URL de retorno do catálogo passa a ser estritamente relativa;
- adicionado `_headers` para proteção HTTP no Netlify contra clickjacking e MIME sniffing;
- frame guard das páginas utilitárias passa a carregar sem `defer`;
- importação de backup do Admin Studio ganha limites contra arquivos maliciosos e consumo excessivo de memória;
- adicionado `tools/testar_seguranca.py` para regressão de segurança.

## 3.1.7 — home mais humana e acolhedora

- reescrita completa das copys da página inicial;
- hero passa a priorizar acolhimento, simplicidade e presença humana;
- benefícios deixam o tom institucional e adotam linguagem mais próxima;
- categorias recebem textos mais cotidianos e sensoriais;
- jornada local ganha mensagens de retorno mais naturais;
- descoberta editorial recebe trilhas com linguagem mais calorosa;
- CTAs passam a convidar em vez de pressionar;
- convite para visita à loja e atendimento pelo WhatsApp fica mais pessoal;
- linguagem revisada sem acrescentar alegações clínicas ou promessas de resultado.

## 3.1.6 — revisão geral e correções de jornada

- contexto temporário do Max passa a ser aplicado somente quando o pré-atendimento é aberto pelo próprio Max;
- contexto do Quiz também é lido somente quando a origem é Quiz;
- CEP lembrado no dispositivo é consultado automaticamente ao selecionar “Receber em casa”;
- consultas de CEP em andamento são canceladas ao sair do modo de entrega;
- versão do backup do Admin Studio atualizada para 3.1.6;
- cache PWA atualizado para `qualimax-v3.1.6`;
- auditoria ampliada para proteger CEP automático, isolamento de contexto, destino único de `wa.me`, acessibilidade básica e shell da PWA;
- revisão completa do catálogo de 47 produtos, páginas, imagens, documentação, CSP e Max.

## 3.1.5 — expansão para 47 produtos

- catálogo ampliado de 40 para 47 produtos a partir das novas imagens fornecidas;
- adicionados Protetor Solar Mineral, Maca Peruana em Pó, Sabonete Artesanal Vegetal, Óleo de Rosa Mosqueta Puro, Argila Verde Facial, Desodorante Natural em Cristal e Xampu Sólido Natural;
- geradas miniaturas WebP otimizadas para os sete novos produtos;
- criadas páginas individuais e integração automática com catálogo, busca, filtros, favoritos, lista, Max e pré-atendimento;
- copies e descrições mantêm linguagem comercial sem inventar preço, estoque ou alegações clínicas;
- versão de backup do Admin Studio e cache PWA atualizados para 3.1.5;
- revisão completa de integridade, documentação, assets e regressão do Max.

## 3.1.4 — CEP automático, Max renovado e inteligência contextual

- removidos os campos de cidade e estado do endereço de entrega;
- integração de CEP com ViaCEP e fallback BrasilAPI;
- rua e bairro passam a ser preenchidos automaticamente;
- CEP fora da cidade/UF configuradas para entrega é bloqueado antes do WhatsApp;
- novo avatar e refinamento visual do Max;
- Max passa a compreender exclusões simples de formato, como “não quero cápsulas”;
- comando conversacional para resumir as preferências entendidas;
- filtros e contexto continuam locais e sem API externa de IA.

## 3.1.3 — estabilidade, contexto e manutenção

- corrigida a versão interna dos backups do Admin Studio, que ainda exportavam como v3.0.1;
- removido código morto na passagem da Minha Conta para o pré-atendimento;
- contextos temporários do Max e do Quiz agora expiram após 30 minutos, evitando reaproveitamento acidental de uma jornada antiga;
- cache do Service Worker atualizado para `qualimax-v3.1.3`;
- auditoria ampliada para detectar atributos de acessibilidade essenciais e links `_blank` sem `noopener`;
- revisão de sintaxe, catálogo, páginas, imagens, CSP, documentação e regressão do Max.

## 3.1.2 — consolidação da documentação

- documentação revisada para refletir 40 produtos e a arquitetura atual;
- relatórios de releases antigas removidos após consolidação no changelog;
- documentos de prompts de imagens removidos após integração das imagens definitivas;
- documentação duplicada de segurança consolidada em `SECURITY.md`;
- Conta, Admin Studio e pré-atendimento consolidados em `OPERACAO-LOCAL.md`;
- guias de arquitetura, Max, testes, publicação, white-label e ferramentas atualizados;
- política adotada: manter documentação temática viva e usar o changelog para histórico de releases.

## 3.1.1 — QA, correção do Max e descoberta dinâmica

- corrigido bug em “não sei o que escolher” que gerava dezenas de resultados por palavras irrelevantes;
- regra de detalhes de produto passa a usar limites de palavra;
- intenção de descoberta recebe prioridade explícita;
- detector de intenções normaliza acentos, pontuação e caixa;
- stopwords de busca livre foram reforçadas;
- “me recomenda algo”, “me sugere alguma coisa” e equivalentes entram na descoberta guiada;
- categorias da descoberta passam a vir de `categorias.json`;
- categorias são ordenadas pela quantidade real de produtos;
- incluído `tools/testar_max.cjs` para regressão automatizada do agente;
- revisão estrutural completa da plataforma com 40 produtos.

## 3.1 — expansão do catálogo

- catálogo ampliado de 32 para 35 produtos;
- adicionada Paçoca Integral de Amendoim;
- adicionado Chocolate sem Adição de Açúcares;
- adicionado Biscoito Integral de Aveia;
- novos produtos seguem a mesma estrutura orientada a dados, páginas individuais, busca, filtros, favoritos, lista e pré-atendimento;
- nomenclatura genérica, sem marcas comerciais;
- incluídos prompts profissionais para geração das três imagens definitivas.
- adicionados Mel, Açúcar Mascavo, Sal Rosa do Himalaia e Xarope Natural de Ervas, ampliando o catálogo para 39 itens.

## 3.0.8 — pré-atendimento inteligente para WhatsApp

- nova página `atendimento.html`;
- formulário progressivo de dados, recebimento, interesses e revisão;
- endereço aparece somente para entrega;
- produto de origem, lista e favoritos podem alimentar o atendimento;
- integração com perfil local de Minha Conta;
- Max envia contexto e preferências para o pré-atendimento;
- mensagem final pode ser revisada e copiada antes de abrir o WhatsApp;
- armazenamento opcional de dados neste dispositivo;
- origem comercial registrada na mensagem;
- CTAs de WhatsApp passam a preparar atendimento;
- novas copys convidam para pedido remoto ou visita presencial;
- PWA e auditoria passam a contemplar o novo fluxo.

## 3.0.7 — revisão e correção do roteamento do Max

- revisão completa de sintaxe, JSON, referências locais, IDs, CSP e páginas de produto;
- correção do roteamento centralizado de intenções do Max;
- intenções de similares, busca anterior, redes, atendimento, entrega, preço, quiz, café da manhã e lanche passam pelo dispatcher modular;
- remoção de blocos regex duplicados que ainda permaneciam em `processarEntrada`;
- busca anterior agora responde corretamente mesmo quando ainda não existe histórico suficiente;
- cache da PWA atualizado para `qualimax-v3.0.7`;
- regressão white-label e auditoria automatizada mantidas.

## 3.0.6 — arquitetura modular do Max

- `chatbot.js` deixa de concentrar sozinho estado, entidades, intenção e recomendação;
- novo `max-core.js` para estado e memória curta;
- novo `max-entidades.js` para produtos e referências contextuais;
- novo `max-intencoes.js` para classificação e prioridades;
- novo `max-recomendacao.js` para ranking de similares;
- guardrail médico passa a ter prioridade sobre explicação genérica de produto;
- auditoria valida presença e ordem dos módulos do Max;
- auditoria valida os módulos no shell da PWA;
- documentação viva do Max atualizada.

## 3.0.5 — estabilização e contexto do Max

- correção da exibição dos comandos `/adm` e `/conta` no histórico visual;
- comparação passa a aproveitar produto já em contexto;
- reconhecimento de “qual a diferença” como intenção de comparação;
- ranking de produtos semelhantes agora é ponderado;
- tags, benefícios e características cadastradas participam da similaridade;
- intenção explícita para listar categorias;
- produto contextual atualizado após comparações;
- revisão estrutural, PWA e auditoria completa.

## 3.0.4 — motor de intenções e contexto do Max

- início da arquitetura centralizada de intenções;
- separação entre detecção de intenção e execução de ação;
- contexto explícito do produto em conversa;
- referências como “esse produto” e “ele” podem continuar a interação;
- descoberta guiada quando o cliente não sabe o que escolher;
- correção de regressão na expressão regular de saudação;
- restauração do avatar no launcher público do Max.

## 3.0.3 — Max evolui de chatbot para agente de navegação

- memória curta da conversa durante a sessão;
- retomada da busca anterior;
- respostas sobre endereço, telefone e e-mail a partir da configuração;
- horário não cadastrado deixa de ser presumido;
- reconhecimento direto de produtos por nome;
- explicação de produto baseada nos dados reais do catálogo;
- busca de produtos semelhantes;
- comparação entre dois produtos;
- novos comandos `/ajuda`, `/conta` e `/adm`;
- CTAs dos cards do Max mais naturais.

## 3.0.2 — Max mais humano e nova identidade

- novo avatar visual do Max;
- launcher do chat passa a usar o personagem e chamada “Posso ajudar?”;
- cabeçalho do Max ganha avatar, status e subtítulo;
- tom de voz revisado para ficar informal, amigável e objetivo;
- respostas naturais para cumprimentos, agradecimentos e pedidos de ajuda;
- microcopy do campo de conversa incentiva linguagem livre;
- resultado das buscas usa linguagem menos mecânica;
- Admin Studio passa a permitir editar nome, subtítulo e saudação do Max;
- avatar adicionado ao cache PWA.

## 3.0.1 — QA e estabilidade da Conta/Admin

- proteção contra perda silenciosa de alterações no editor de produtos;
- produto novo só entra no rascunho após Salvar;
- upload de imagem fica pendente até o produto ser salvo;
- geração automática de miniatura para `img/thumbs/`;
- exportação separada de imagem principal e miniatura;
- backup passa a incluir imagens e miniaturas;
- importação restaura também os arquivos de imagem locais;
- Conta trata bloqueio de armazenamento local;
- exclusão de dados locais atualiza a interface imediatamente;
- Minha Conta respeita o módulo de coleções;
- correção do pareamento de histórico com produtos removidos.

## 3.0 — Conta local e Admin Studio

- nova página Minha Conta com perfil local, favoritos, lista e histórico;
- consulta da lista pelo WhatsApp;
- exportação e exclusão de dados locais;
- Admin Studio local compatível com hospedagem estática;
- CRUD local de produtos;
- editor de copy, CTA, descrição, tags e características;
- upload e pré-visualização de imagens via IndexedDB;
- edição local de dados da loja e módulos;
- auditoria do rascunho;
- exportação de produtos, configuração, backup e imagens;
- atalhos `/conta` e `/adm` no Max;
- novas áreas mantêm o projeto sem backend e sem credenciais no frontend.

## 2.9.2 — Copywriting de produto e experiência

- reescrita das 32 copys de produto com identidade própria e CTAs contextuais;
- home reposicionada para descoberta, clareza e conversão sem promessas médicas;
- catálogo com microcopy mais orientada a busca, comparação e salvamento;
- páginas Sobre, Contato e Quiz com mensagens mais objetivas e humanas;
- SEO descriptions refinadas para intenção local e termos reais do catálogo;
- redução de repetição entre seções e melhor progressão narrativa da jornada.

## 2.9.1 — QA, correções e estabilidade modular

- Max deixa de sugerir Quiz em fluxos de fallback quando o módulo está desativado;
- Max e cards deixam de expor lista/favoritos quando coleções estão desativadas;
- bloco “Suas escolhas” do catálogo passa a respeitar corretamente `recursos.colecoes`;
- Quiz em acesso direto exibe estado indisponível quando o módulo está desligado;
- cards do catálogo deixam de criar controles de coleção quando o recurso está desativado;
- JSONs dinâmicos da PWA passam a usar network-first com fallback offline;
- imagens inválidas deixam de gerar requisições para diretórios;
- sincronizador e auditoria validam slugs e nomes de arquivo;
- auditoria passa a testar coerência de módulos opcionais.

## 2.9 — Módulos e auditoria comercial

- recursos passam a ser ativáveis por cliente via `data/config.json`;
- Quiz pode sair da navegação e do sitemap;
- jornada local e coleções podem ser ocultadas;
- PWA pode ser desativada e usa o nome real da empresa nos textos;
- página Contato ganha informações comerciais opcionais;
- sincronizador passa a refletir módulos e informações comerciais;
- nova ferramenta `tools/auditar_cliente.py` valida a entrega white-label.

## 2.8.1 — White-label e configuração comercial

- Instagram da página de contato deixa de ser hardcoded;
- mensagens de WhatsApp usam placeholders de empresa;
- localização e marca ganham hooks configuráveis em conteúdo visível;
- páginas individuais recebem hooks de marca consistentes;
- ferramenta `tools/sincronizar_cliente.py` sincroniza SEO, manifest, sitemap, security.txt e páginas de produto;
- fallback estático acompanha `config.json`, mesmo antes da execução do JavaScript;
- teste white-label realizado com uma segunda marca fictícia sem resíduos públicos da Qualimax.

## 2.7.2 — QA e correções

- revisão da jornada local;
- textos diferentes para histórico, favoritos e lista;
- re-render completo após limpar histórico;
- atualização do Service Worker realmente controlada;
- fallback offline para URLs com query;
- ações PWA em páginas de produto;
- validação adicional de caminhos de miniaturas.

## 2.7.1 — Jornada local

- seção “Continue de onde você parou”;
- retomada por favoritos, lista e histórico;
- inferência local de categoria de interesse;
- limpeza independente do histórico.

## 2.0.7 — Discovery Experience

- trilhas editoriais;
- rotação diária determinística;
- “Continue descobrindo” no catálogo;
- achados editoriais baseados somente em produtos reais.

## 2.0.6 — Copy Experience

- revisão editorial da Home, Catálogo, Quiz, Sobre e Contato;
- 32 copys individuais de produto;
- novas descrições de categorias;
- CTAs e microcopy mais variados.

## 2.0.5 — Max, SEO e produto

- Max contextual;
- refinamento progressivo;
- “Mostrar mais” e “Nova conversa”;
- guardrails médicos e comerciais;
- breadcrumbs;
- relacionados;
- navegação anterior/próximo;
- Product + BreadcrumbList;
- WebSite + SearchAction.

## 2.0.4 — Resiliência e PWA

- página offline;
- estado de conectividade;
- instalação da PWA;
- aviso de nova versão;
- `aria-current`;
- PWA nas páginas de produto.

## 2.0.3 — Segurança

- CSP;
- sanitização de conteúdo dinâmico;
- validação de URLs e caminhos;
- hardening do Service Worker;
- limites de entrada;
- política de referrer;
- `SECURITY.md` e `security.txt`.

## 2.0.2 — Repositório e estabilidade

- correção das URLs após renomeação do repositório;
- robots/sitemap;
- correção do CTA da lista de interesse;
- redes configuráveis no rodapé;
- `.gitattributes`.

## 2.0.1 — Revisão multipágina

- filtros por query string;
- correções de SEO por página;
- correções de filtros;
- dados estruturados das páginas individuais;
- invalidação do cache anterior.

## 2.0 — Plataforma

- migração de landing única para arquitetura multipágina;
- catálogo dedicado;
- Quiz dedicado;
- Sobre e Contato;
- 32 páginas individuais;
- IndexedDB;
- favoritos;
- lista de interesse;
- histórico;
- produtos relacionados;
- busca;
- compartilhamento;
- PWA inicial.

## 1.3–1.9 — Evolução comercial

Período de evolução da landing original com:

- vitrine premium;
- Assistente no Hero;
- copy de produto;
- melhorias de chatbot;
- performance de imagens;
- quiz e WhatsApp contextual;
- redes sociais;
- confiança comercial;
- revisões de acessibilidade e mobile.

## 1.0–1.2 — Fundação

- estrutura inicial da landing;
- configuração por JSON;
- catálogo inicial;
- integração de imagens;
- primeiras rodadas de acessibilidade, SEO e conversão.
